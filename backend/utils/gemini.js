const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



/**
 * Generates regular farm analysis insights based on all vegetation indices.
 * 
 * @param {Object} allStats - Object containing stats for all indices { ndvi, gndvi, ... }
 * @param {Array} ndviGrid - The 20x20 grid of NDVI values
 * @returns {Promise<Object>} - The analysis object matching the schema
 */
async function generateFarmAnalysis(allStats, ndviGrid = []) {
    // Process grid into 4x4 zones (A1-D4)
    let zoneSummaries = "No specific zone data available.";
    if (ndviGrid && ndviGrid.length === 400) {
        const zones = [];
        const gridSize = 20;
        const regionSize = 5; // 20/4 = 5

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                let sum = 0;
                let count = 0;
                for (let r = row * regionSize; r < (row + 1) * regionSize; r++) {
                    for (let c = col * regionSize; c < (col + 1) * regionSize; c++) {
                        const val = ndviGrid[r * gridSize + c];
                        if (val !== null) {
                            sum += val;
                            count++;
                        }
                    }
                }
                const avg = count > 0 ? (sum / count).toFixed(2) : "N/A";
                const rowLabel = String.fromCharCode(65 + row); // A, B, C, D
                const colLabel = col + 1;
                zones.push(`${rowLabel}${colLabel}: ${avg}`);
            }
        }
        zoneSummaries = zones.join(", ");
    }

    const prompt = `
    You are a helpful neighbor who knows alot about farming. Talk to the farmer in very simple words that anyone can understand. DO NOT use big words or computer-talk.

    Look at these numbers from the farm scan:
    ${Object.entries(allStats).map(([key, val]) => `
    - ${key.toUpperCase()}:
      Average: ${val?.mean?.toFixed(3) || 'N/A'}
      Health %: ${val?.healthyPercentage?.toFixed(1) || 'N/A'}%
    `).join('\n')}

    Here is the field divided into a 4x4 grid (A1 to D4). A is top, D is bottom. 1 is left, 4 is right.
    Numbers are health (0.0 to 1.0):
    ${zoneSummaries}

    Write a simple report in JSON format:
    {
        "healthScore": 0-100,
        "summary": "1-2 very simple sentences explaining the overall state.",
        "recommendations": [
            "Combine similar needs into one sentence. Example: 'Zones A1, A2, and B1 need 2 hours of water because they look dry.'",
            "Example: 'Zones C3 and C4 have pests, so spray medicine there tomorrow.'",
            "Example: 'The rest of the field looks good, just keep an eye on it.'"
        ],
        "indexAnalysis": {
            "ndvi": "Simple growth update...",
            "gndvi": "Simple color/food update...",
            "ndre": "Simple health check...",
            "savi": "Simple soil update...",
            "osavi": "Simple plant check..."
        },
        "focusAreas": ["Zone A1 needs water", "Zone D4 needs Urea"],
        "detailedMarkdownReport": "# Farm Update Today \\n\\n## What we found \\nUse very simple words. Mention specific zones like A1 or B2. \\n\\n## What to do \\n- Specific Zone Advice: Talk about which zones need what."
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
