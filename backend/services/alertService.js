const Alert = require('../models/Alert');

const generateAlertsForAnalysis = async (report) => {
    const alerts = [];
    const mlData = report.mlResults;

    // Check if report has mlResults
    if (!mlData) return;

    // Disease Detection
    if (mlData.disease_detected) {
        alerts.push({
            type: 'DISEASE',
            severity: 'CRITICAL',
            title: 'Crop Disease Detected',
            description: `Disease detected in batch analysis ${mlData.batch_id || 'N/A'}. Immediate action required.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // Pest and Weed Counting
    let pestCount = 0;
    let weedCount = 0;

    if (mlData.results) {
        mlData.results.forEach(res => {
            if (res.detections) {
                res.detections.forEach(d => {
                    if (d.class_name) {
                        const cls = d.class_name.toLowerCase();
                        if (cls.includes('weevil') || cls.includes('pest')) {
                            pestCount++;
                        }
                        if (cls.includes('weed')) {
                            weedCount++;
                        }
                    }
                });
            }
        });
    }

    // Pest Alerts
    if (pestCount > 0) {
        alerts.push({
            type: 'PEST',
            severity: pestCount > 5 ? 'HIGH' : 'MEDIUM',
            title: 'Pest Infestation Alert',
            description: `Detected ${pestCount} pests in recent analysis. Check report for details.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // Weed Alerts
    if (weedCount > 0) {
        alerts.push({
            type: 'WEED',
            severity: weedCount > 10 ? 'HIGH' : 'MEDIUM',
            title: 'Weed Growth Alert',
            description: `Detected ${weedCount} weeds. Monitoring recommended.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // Smart Status Alert (User Requested Field)
    if (mlData.smartStatus === 'Critical') {
        alerts.push({
            type: 'GENERAL',
            severity: 'CRITICAL',
            title: 'Smart Status Critical',
            description: `Combined risk factors (NDVI < 0.4 & Disease) detected.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // Fallback / General Analysis Complete Alert
    // Only if no other high severity alerts were generated
    if (alerts.length === 0) {
        alerts.push({
            type: 'GENERAL',
            severity: 'LOW',
            title: 'Analysis Complete',
            description: `Analysis completed for batch ${mlData.batch_id || 'N/A'}. No critical pests or diseases detected.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // Insert Alerts if any
    if (alerts.length > 0) {
        try {
            // Optional: Check if alerts already exist for this report to prevent duplicates during sync
            const existingAlerts = await Alert.find({ relatedReportId: report._id });
            if (existingAlerts.length === 0) {
                await Alert.insertMany(alerts);
                console.log(`[AlertService] Generated ${alerts.length} alerts for report ${report._id}`);
                return alerts.length;
            } else {
                console.log(`[AlertService] Alerts already exist for report ${report._id}, skipping.`);
                return 0;
            }
        } catch (error) {
            console.error(`[AlertService] Error creating alerts: ${error.message}`);
        }
    }
    return 0;
};

const generateAlertsForVegetation = async (report) => {
    const alerts = [];
    const aiInsights = report.aiInsights || {};
    const ndviStats = report.ndviStats || {};

    // Low Health Score
    if (aiInsights.healthScore < 50) {
        alerts.push({
            type: 'VEGETATION',
            severity: aiInsights.healthScore < 30 ? 'CRITICAL' : 'HIGH',
            title: 'Low Crop Health Detected',
            description: `Vegetation analysis indicates low health score (${aiInsights.healthScore}). CHECK NDVI maps.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // Low NDVI
    if (ndviStats.mean < 0.3) {
        alerts.push({
            type: 'VEGETATION',
            severity: 'HIGH',
            title: 'Low Vegetation Index (NDVI)',
            description: `Average NDVI is dangerously low (${ndviStats.mean.toFixed(2)}). Possible water stress or soil issues.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // General Completion (if no issues)
    if (alerts.length === 0) {
        alerts.push({
            type: 'VEGETATION',
            severity: 'LOW',
            title: 'Vegetation Analysis Complete',
            description: `Vegetation report yielded normal results. Health Score: ${aiInsights.healthScore || 'N/A'}.`,
            relatedReportId: report._id,
            status: 'NEW'
        });
    }

    // Insert
    if (alerts.length > 0) {
        try {
            const existingAlerts = await Alert.find({ relatedReportId: report._id });
            if (existingAlerts.length === 0) {
                await Alert.insertMany(alerts);
                console.log(`[AlertService] Generated ${alerts.length} vegetation alerts for report ${report._id}`);
                return alerts.length;
            } else {
                console.log(`[AlertService] Alerts already exist for report ${report._id}, skipping.`);
                return 0;
            }
        } catch (error) {
            console.error(`[AlertService] Error creating vegetation alerts: ${error.message}`);
        }
    }
    return 0;
};

module.exports = {
    generateAlertsForAnalysis,
    generateAlertsForVegetation
};
