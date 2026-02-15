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
    You are an expert agronomist and precision agriculture specialist.
    Analyze the following vegetation index statistics for a farm field:

    ${Object.entries(allStats).map(([key, val]) => `
    - ${key.toUpperCase()}:
      Mean: ${val?.mean?.toFixed(3) || 'N/A'}
      Min: ${val?.min?.toFixed(3) || 'N/A'}
      Max: ${val?.max?.toFixed(3) || 'N/A'}
      StdDev: ${val?.stdDev?.toFixed(3) || 'N/A'}
      Healthy %: ${val?.healthyPercentage?.toFixed(1) || 'N/A'}%
    `).join('\n')}

    Provide a comprehensive status report in JSON format with the following structure:
    {
        "healthScore": 0-100 (Overall field health score based on all metrics),
        "summary": "2-3 sentences summarizing the field status, identifying key stress types (water vs nitrogen etc)",
        "recommendations": ["Actionable advice 1", "Actionable advice 2", "Actionable advice 3"],
        "indexAnalysis": {
            "ndvi": "Specific insight derived from NDVI...",
            "gndvi": "Specific insight derived from GNDVI (e.g., relating to chlorophyll/nitrogen)...",
            "ndre": "Insight on early stress detection...",
            "savi": "Insight on soil background influence...",
            "osavi": "Insight on canopy structures..."
        },
        "focusAreas": ["North-East sector for irrigation", "Central zone for pest check", etc (Infer from stats variance)],
        "detailedMarkdownReport": "A rich, human-readable, naturally written report in Markdown format. Things should be straight to the point without jargon. Include sections for: Executive Summary, Detailed Findings, Trend Analysis, Recommended Actions, and Urgency Levels. Make it engaging."
    }

    Return ONLY valid JSON. No markdown in the top-level response (the detailedMarkdownReport field itself should contain the markdown string).
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

module.exports = { generateFarmAnalysis };
