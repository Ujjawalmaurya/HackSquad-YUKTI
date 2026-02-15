const mongoose = require('mongoose');

const vegetationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
    originalFile: String,
    processedDate: { type: Date, default: Date.now },

    // Calculated Raster Dimensions
    width: Number,
    height: Number,

    // Processing Results
    ndvi: {
        stats: {
            min: Number,
            max: Number,
            mean: Number,
            stdDev: Number,
            healthyPercentage: Number
        },
        rasterPath: String, // Path to PNG/Tiff output if saved
        grid: [Number] // 20x20 Grid for visualization
    },
    gndvi: {
        stats: {
            min: Number,
            max: Number,
            mean: Number,
            stdDev: Number,
            healthyPercentage: Number
        },
        rasterPath: String,
        grid: [Number]
    },
    ndre: {
        stats: {
            min: Number,
            max: Number,
            mean: Number,
            stdDev: Number,
            healthyPercentage: Number
        },
        grid: [Number]
    },
    savi: {
        stats: {
            min: Number,
            max: Number,
            mean: Number,
            stdDev: Number,
            healthyPercentage: Number
        },
        grid: [Number]
    },
    osavi: {
        stats: {
            min: Number,
            max: Number,
            mean: Number,
            stdDev: Number,
            healthyPercentage: Number
        },
        grid: [Number]
    },

    // Metadata from GeoTIFF
    metadata: {
        bbox: [Number], // [minX, minY, maxX, maxY]
        crs: String // Coordinate Reference System
    },

    // AI-Generated Insights
    aiInsights: {
        healthScore: Number, // 0-100
        summary: String,
        recommendations: [String],
        indexAnalysis: {
            ndvi: String,
            gndvi: String,
            ndre: String,
            savi: String,
            osavi: String
        },
        focusAreas: [String]
    },

    // Detailed Markdown Report
    detailedReport: String
});

module.exports = mongoose.model('VegetationReport', vegetationSchema);
