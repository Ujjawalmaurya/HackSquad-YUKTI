const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



/**
 * Generates regular farm analysis insights based on all vegetation indices.
 * 
 * @param {Object} allStats - Object containing stats for all indices { ndvi, gndvi, ... }
 * @returns {Promise<Object>} - The analysis object matching the schema
 */
async function generateFarmAnalysis(allStats) {
    const prompt = `
    You are a helpful neighbor who knows alot about farming. Talk to the farmer in very simple words that anyone can understand. DO NOT use big words or computer-talk.

    Look at these numbers from the farm scan:
    ${Object.entries(allStats).map(([key, val]) => `
    - ${key.toUpperCase()}:
      Average: ${val?.mean?.toFixed(3) || 'N/A'}
      Health %: ${val?.healthyPercentage?.toFixed(1) || 'N/A'}%
    `).join('\n')}

    Write a simple report in JSON format:
    {
        "healthScore": 0-100,
        "summary": "1-2 very simple sentences. Like 'Your plants look hungry' or 'The field is very dry'.",
        "recommendations": [
            "Clear advice like: Give 50kg Urea to this field",
            "Clear advice like: Water the field for 2 hours today",
            "Clear advice like: Spray medicine for bugs tomorrow"
        ],
        "indexAnalysis": {
            "ndvi": "Simple growth update...",
            "gndvi": "Simple color/food update...",
            "ndre": "Simple health check...",
            "savi": "Simple soil update...",
            "osavi": "Simple plant check..."
        },
        "focusAreas": ["The corner near the tree needs more water", "The middle part needs Urea"],
        "detailedMarkdownReport": "# Farm Update Today \\n\\n## What we found \\nUse very simple words. No jargon. \\n\\n## What to do \\n- Give Urea: How much \\n- Give Water: How long \\n- Give Medicine: Which one"
    }
    
    Return ONLY valid JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error('Error generating farm analysis:', error);
        return {
            healthScore: 50,
            summary: "AI Analysis unavailable. Please review raw indices.",
            recommendations: ["Check field manually"],
            indexAnalysis: {},
            focusAreas: []
        };
    }
}

// Fallback for missing Gemini API Key or other init errors
if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found. AI features will be disabled.");
}

module.exports = { generateFarmAnalysis };
