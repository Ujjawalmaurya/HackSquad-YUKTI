const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    content: String, // Markdown content
    mlResults: mongoose.Schema.Types.Mixed,
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
