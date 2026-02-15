const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post('/', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the Sky Scouts AI, a precision agriculture assistant. 
    Your goal is to help farmers monitor crop health, analyze NDVI maps, and manage drone missions.
    Be helpful, technical yet accessible, and professional. 
    If asked about farm health, suggest checking NDVI maps.
    If asked about drones, mention flight stability and coverage.
    
    Keep responses concise and action-oriented.
    clearly tell in step by step instructions if needed.
    
    Language rules: 
    Use simple, human like natural language, butifully crafed for easy readibility and understadinig, dont throw robotic garbage.

    response in same language as aksed for example:
    question: update my profile.
    Answer: To update you profile, to this, this and this.

    if Question is: PRofile kaise update karen?
    then answer: Pahle apko yaha jana hai fir yaha fir yahan, aur apka kaam hogya!!!

    Use emojis to beutiful looking reponses.`;

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
