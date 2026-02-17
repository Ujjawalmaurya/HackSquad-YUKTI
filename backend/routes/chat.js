const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authenticateToken = require('../middleware/auth');
const VegetationReport = require('../models/VegetationReport');
const Alert = require('../models/Alert');
const Farm = require('../models/Farm');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post('/', authenticateToken, async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch Live Context
    let liveContext = "No specific farm data found yet.";
    try {
        // We fetch reports for the user, and all farms/alerts for now 
        // as farms don't have explicit owner field in schema yet
        const [latestReport, activeAlerts, userFarms] = await Promise.all([
            VegetationReport.findOne({ userId: req.user.id }).sort({ processedDate: -1 }),
            Alert.find({ status: 'NEW' }).sort({ createdAt: -1 }).limit(5),
            Farm.find().limit(5)
        ]);

        if (latestReport) {
            liveContext = `
            Latest Field Scan (${new Date(latestReport.processedDate).toLocaleDateString()}):
            - Health Score: ${latestReport.aiInsights?.healthScore}%
            - Overall Summary: ${latestReport.aiInsights?.summary}
            - Specific Zones to watch: ${latestReport.aiInsights?.focusAreas?.join(', ') || 'None'}
            - Top Recommendations: ${latestReport.aiInsights?.recommendations?.slice(0, 3).join('; ')}
            `;
        } else {
            liveContext = "No vegetation scans found for your account.";
        }

        if (activeAlerts && activeAlerts.length > 0) {
            liveContext += `\nRecent Alerts:\n${activeAlerts.map(a => `- ${a.severity}: ${a.title} (${a.description})`).join('\n')}`;
        }

        if (userFarms && userFarms.length > 0) {
            liveContext += `\nRegistered Farms: ${userFarms.map(f => f.name).join(', ')}`;
        }
    } catch (dataErr) {
        console.error("Error fetching live context for AI:", dataErr);
    }

    const systemPrompt = `You are the Sky Scouts AI, a precision agriculture assistant. 
    Your goal is to help farmers monitor crop health, analyze NDVI maps, and manage drone missions.
    Be helpful, technical yet accessible, and professional. 

    LIVE FARM DATA (STRICTLY use this to answer questions about the farm):
    ${liveContext}
    
    Keep responses concise and action-oriented.
    Clearly tell in step by step instructions if needed.
    If the user asks about "my farm" or "my health", refer to the LIVE FARM DATA above.
    If no data is present, politely ask the user to upload a scan.
    
    Language rules: 
    Use simple, human like natural language, beautifully crafted for easy readability and understanding, don't throw robotic garbage.

    Response in same language as asked (e.g., Hinglish if asked in Hinglish).
    Use emojis to make responses look beautiful.`;

    const prompt = `${systemPrompt}\n\nUser: ${message}\nSky Scout AI:`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const actions = [];
        if (responseText.toLowerCase().includes('ndvi') || responseText.toLowerCase().includes('map')) {
            actions.push({ label: 'View NDVI Map', value: 'Show me the latest NDVI map' });
        }
        if (responseText.toLowerCase().includes('drone') || responseText.toLowerCase().includes('fly')) {
            actions.push({ label: 'Launch Drone', value: 'Start a new drone mission' });
        }
        if (responseText.toLowerCase().includes('pest') || responseText.toLowerCase().includes('disease')) {
            actions.push({ label: 'Check Alerts', value: 'Show me pest alerts' });
        }

        res.json({
            response: responseText,
            actions: actions
        });
    } catch (err) {
        console.error('Gemini SDK Error, attempting fallback...', err.message);
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\nUser: ${message}\nSky Scout AI:`
                        }]
                    }]
                }
            );

            const responseText = response.data.candidates[0].content.parts[0].text;
            const actions = [];
            if (responseText.toLowerCase().includes('ndvi') || responseText.toLowerCase().includes('map')) {
                actions.push({ label: 'View NDVI Map', value: 'Show me the latest NDVI map' });
            }
            if (responseText.toLowerCase().includes('drone') || responseText.toLowerCase().includes('fly')) {
                actions.push({ label: 'Launch Drone', value: 'Start a new drone mission' });
            }
            if (responseText.toLowerCase().includes('pest') || responseText.toLowerCase().includes('disease')) {
                actions.push({ label: 'Check Alerts', value: 'Show me pest alerts' });
            }

            return res.json({
                response: responseText,
                actions: actions
            });
        } catch (fallbackErr) {
            console.error('Gemini Fallback Error:', fallbackErr.response?.data || fallbackErr.message);
            res.status(500).json({ error: 'AI failed to respond' });
        }
    }
});

module.exports = router;
