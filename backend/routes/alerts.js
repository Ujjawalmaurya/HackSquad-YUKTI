const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const authenticateToken = require('../middleware/auth');
const Report = require('../models/Report');
const VegetationReport = require('../models/VegetationReport');
const { generateAlertsForAnalysis, generateAlertsForVegetation } = require('../services/alertService');

// ... existing code ...

router.post('/sync', authenticateToken, async (req, res) => {
    try {
        console.log("Starting manual alert sync from reports...");
        let totalGenerated = 0;

        // 1. Sync from Analysis Reports (Last 50)
        const reports = await Report.find().sort({ createdAt: -1 }).limit(50);
        for (const report of reports) {
            const count = await generateAlertsForAnalysis(report);
            totalGenerated += count;
        }

        // 2. Sync from Vegetation Reports (Last 50)
        const vegReports = await VegetationReport.find().sort({ createdAt: -1 }).limit(50);
        for (const report of vegReports) {
            const count = await generateAlertsForVegetation(report);
            totalGenerated += count;
        }

        console.log(`Manual sync complete. Generated ${totalGenerated} new alerts.`);
        res.json({ message: 'Sync complete', generatedAlerts: totalGenerated });

    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all alerts (with optional status filter)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }

        // Sort by date desc (newest first)
        const alerts = await Alert.find(filter).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        console.error("Error fetching alerts:", err);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Update alert status (e.g. mark as READ or RESOLVED)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['NEW', 'READ', 'RESOLVED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const alert = await Alert.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json(alert);
    } catch (err) {
        console.error("Error updating alert:", err);
        res.status(500).json({ error: 'Failed to update alert' });
    }
});

module.exports = router;
