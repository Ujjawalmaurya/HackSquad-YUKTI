const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const farms = await Farm.find();
        res.json(farms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const farm = new Farm(req.body);
        await farm.save();
        res.status(201).json(farm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const count = await Farm.countDocuments();
        const farms = await Farm.find();

        let totalArea = 0;
        let avgNDVI = 0;
        let alertCount = 0;
        let analysisCount = 0;

        farms.forEach(f => {
            totalArea += f.size || 0;
            if (f.analysisHistory && f.analysisHistory.length > 0) {
                const latest = f.analysisHistory[f.analysisHistory.length - 1];
                avgNDVI += latest.ndvi || 0;
                analysisCount++;
                if (latest.diseaseDetected) alertCount++;
            }
        });

        res.json({
            totalFarms: count,
            totalArea: totalArea.toFixed(1),
            avgNDVI: analysisCount > 0 ? (avgNDVI / analysisCount).toFixed(2) : 0.75,
            activeAlerts: alertCount,
            recentAnalyses: analysisCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) return res.status(404).send('Farm not found');
        res.json(farm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
