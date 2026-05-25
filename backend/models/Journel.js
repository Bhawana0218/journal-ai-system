const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    ambience: {
        type: String,
        enum: ['forest', 'ocean', 'mountain'],
        required: true
    },

    text: {
        type: String,
        required: true
    },

    emotion: {
        type: String,
    },

    sentimentScore: {
        type: Number,
        default: 0
    },

    keywords: [String],

    summary: {
        type: String
    },

    insight: {
        type: String
    }

}, {
    timestamps: true
}
);

module.exports = mongoose.model('Journal', journalSchema);