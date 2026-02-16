const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['PEST', 'WEED', 'DISEASE', 'VEGETATION', 'GENERAL'],
        required: true
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: false // Optional for system-wide alerts
    },
    relatedReportId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Can be linked to Report or VegetationReport
    },
    status: {
        type: String,
        enum: ['NEW', 'READ', 'RESOLVED'],
        default: 'NEW'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', alertSchema);
