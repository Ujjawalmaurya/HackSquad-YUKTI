const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    name: String,
    location: {
        lat: Number,
        lng: Number
    },
    size: Number,
    cropType: String,
    farmerName: String,
    analysisHistory: [{
        date: { type: Date, default: Date.now },
        ndvi: Number,
        healthStatus: String,
        diseaseDetected: Boolean,
        detections: [{
            label: String,
            confidence: Number,
            severity: String,
            box: [Number]
        }],
        yieldPrediction: Number,
        imageUrl: String,
        recommendations: [String],
        sprayPlan: {
            area: String,
            dosage: String,
            chemical: String,
            urgency: String
        },

        aiSummary: {
            healthScore: Number,
            summary: String
        },
        metadata: mongoose.Schema.Types.Mixed
    }]
});

module.exports = mongoose.model('Farm', farmSchema);
