const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.ObjectId,
        ref: 'Complaint',
        required: true,
        unique: true // One feedback per complaint
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment']
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
