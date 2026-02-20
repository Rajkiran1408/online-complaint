const mongoose = require('mongoose');

const complaintUpdateSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.ObjectId,
        ref: 'Complaint',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    previousStatus: {
        type: String,
        enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed']
    },
    newStatus: {
        type: String,
        enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
        required: true
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment for the status update']
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('ComplaintUpdate', complaintUpdateSchema);
