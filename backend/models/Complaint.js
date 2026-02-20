const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    attachmentUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    resolvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    resolutionImageUrl: {
        type: String,
        default: ''
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



// Cascade delete updates and feedback when a complaint is deleted
complaintSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await this.model('ComplaintUpdate').deleteMany({ complaint: this._id });
    await this.model('Feedback').deleteMany({ complaint: this._id });
});

// Virtual for updates
complaintSchema.virtual('updates', {
    ref: 'ComplaintUpdate',
    localField: '_id',
    foreignField: 'complaint',
    justOne: false
});

// Virtual for feedback
complaintSchema.virtual('feedback', {
    ref: 'Feedback',
    localField: '_id',
    foreignField: 'complaint',
    justOne: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
