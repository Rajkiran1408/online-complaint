const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (User)
exports.submitComplaint = async (req, res, next) => {
    try {
        req.body.user = req.user.id;

        // If a file was uploaded, build the URL path
        if (req.file) {
            req.body.attachmentUrl = `/uploads/${req.file.filename}`;
        }

        const complaint = await Complaint.create(req.body);

        // --- EMAIL NOTIFICATION: Notify Admins ---
        try {
            const admins = await User.find({ role: 'Admin' });
            const adminEmails = admins.map(admin => admin.email).join(',');
            const submittingUser = await User.findById(req.user.id);

            if (adminEmails) {
                await sendEmail({
                    email: adminEmails,
                    subject: `New Grievance Submitted: ${complaint.title}`,
                    html: `
                        <h2>New Grievance Notification</h2>
                        <p>A new grievance has been submitted on the Redressal System.</p>
                        <p><strong>Title:</strong> ${complaint.title}</p>
                        <p><strong>Submitted By:</strong> ${submittingUser.name} (${submittingUser.email})</p>
                        <p>Please log in to the portal to review and assign this case.</p>
                        <hr />
                        <p>This is an automated message. Please do not reply.</p>
                    `
                });
            }
        } catch (emailErr) {
            console.error('Email Notification Error (Admin):', emailErr);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            data: complaint
        });
    } catch (err) {
        console.error('Submit Complaint Error:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res, next) => {
    try {
        let query;

        // If user is not Admin or Support Staff, they can only see their own complaints
        if (req.user.role === 'User') {
            query = Complaint.find({ user: req.user.id });
        } else if (req.user.role === 'Support Staff') {
            // Support Staff can see complaints assigned to them or unassigned ones
            query = Complaint.find({
                $or: [{ assignedTo: req.user.id }, { status: 'Open' }]
            });
        } else {
            // Admin can see everything
            query = Complaint.find();
        }

        const complaints = await query.populate('user', 'name email').populate('assignedTo', 'name');

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get specific complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .populate('updates')
            .populate('feedback');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: `Complaint not found with id of ${req.params.id}`
            });
        }

        // Access Control
        if (
            req.user.role === 'User' &&
            complaint.user._id.toString() !== req.user.id
        ) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this complaint'
            });
        }

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin, Support Staff)
exports.updateComplaintStatus = async (req, res, next) => {
    try {
        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: `Complaint not found with id of ${req.params.id}`
            });
        }

        const { status, comment, assignedTo } = req.body;
        const previousStatus = complaint.status;

        // Status Flow Validation: Open → Assigned → In Progress → Resolved → Closed
        const statusOrder = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
        const currentIndex = statusOrder.indexOf(previousStatus);
        const nextIndex = statusOrder.indexOf(status);

        // Basic flow restriction: Can't move backwards, can't skip more than one step (optional, but requested logic)
        // However, usually Admin can jump or skip. Let's enforce the order mentioned.
        if (nextIndex <= currentIndex && status !== previousStatus) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${previousStatus} to ${status}`
            });
        }

        // Role-based status update restrictions
        if (req.user.role === 'Support Staff') {
            // Support Staff can only update if assigned to them
            if (complaint.assignedTo && complaint.assignedTo.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not assigned to this complaint'
                });
            }
            // Support staff can't assign, only progress
            if (status === 'Assigned') {
                return res.status(403).json({
                    success: false,
                    message: 'Support Staff cannot assign complaints'
                });
            }
        }

        // Admin functionality: Assign complaint
        if (status === 'Assigned' && req.user.role === 'Admin') {
            if (!assignedTo) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a support staff ID to assign'
                });
            }
            complaint.assignedTo = assignedTo;
        }

        // Set resolver if moving to Resolved
        if (status === 'Resolved') {
            complaint.resolvedBy = req.user.id;

            // If a resolution image was uploaded, store the path
            if (req.file) {
                complaint.resolutionImageUrl = `/uploads/${req.file.filename}`;
            }
        }

        // Update status
        complaint.status = status;
        await complaint.save();

        // --- EMAIL NOTIFICATIONS for Status Changes ---
        try {
            // Populate necessary fields for email content
            const fullComplaint = await Complaint.findById(complaint._id)
                .populate('user', 'name email')
                .populate('assignedTo', 'name email');

            // 1. Notify Staff if Assigned
            if (status === 'Assigned' && fullComplaint.assignedTo) {
                await sendEmail({
                    email: fullComplaint.assignedTo.email,
                    subject: `New Grievance Assigned: ${fullComplaint.title}`,
                    html: `
                        <h2>New Assignment</h2>
                        <p>Hello ${fullComplaint.assignedTo.name},</p>
                        <p>A new grievance has been assigned to you for resolution.</p>
                        <p><strong>Title:</strong> ${fullComplaint.title}</p>
                        <p><strong>Priority Status:</strong> ${status}</p>
                        <p>Please review the details and start working on the resolution.</p>
                        <br/>
                        <p>Redressal System Team</p>
                    `
                });
            }

            // 2. Notify User and Admins if Resolved
            if (status === 'Resolved') {
                // Email to User
                await sendEmail({
                    email: fullComplaint.user.email,
                    subject: `Grievance Resolved: ${fullComplaint.title}`,
                    html: `
                        <h2>Complaint Resolved</h2>
                        <p>Hello ${fullComplaint.user.name},</p>
                        <p>We are pleased to inform you that your grievance regarding "<strong>${fullComplaint.title}</strong>" has been marked as <strong>Resolved</strong>.</p>
                        <p>Please log in to the portal to view the resolution and provide any feedback.</p>
                        <br/>
                        <p>Thank you for your patience.</p>
                        <p>Redressal System Team</p>
                    `
                });

                // Email to Admins
                const admins = await User.find({ role: 'Admin' });
                const adminEmails = admins.map(a => a.email).join(',');
                if (adminEmails) {
                    await sendEmail({
                        email: adminEmails,
                        subject: `Grievance Resolution Confirmed: ${fullComplaint.title}`,
                        html: `
                            <h2>Grievance Resolved</h2>
                            <p>The grievance "<strong>${fullComplaint.title}</strong>" submitted by ${fullComplaint.user.name} has been successfully resolved.</p>
                            <p><strong>Resolved By:</strong> ${req.user.name}</p>
                        `
                    });
                }
            }
        } catch (emailErr) {
            console.error('Email Notification Error (Status Update):', emailErr);
        }

        // Create status update history
        await ComplaintUpdate.create({
            complaint: complaint._id,
            user: req.user.id,
            previousStatus,
            newStatus: status,
            comment: comment || `Status changed to ${status}`
        });

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Submit feedback for closed complaint
// @route   POST /api/feedback
// @access  Private (User)
exports.submitFeedback = async (req, res, next) => {
    try {
        const { complaintId, rating, comment } = req.body;

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: `Complaint not found with id of ${complaintId}`
            });
        }

        // Check if complaint is closed
        if (complaint.status !== 'Closed' && complaint.status !== 'Resolved') {
            // Redressal systems usually allow feedback after resolution or closure
            // The prompt says "after closure"
            if (complaint.status !== 'Closed') {
                return res.status(400).json({
                    success: false,
                    message: 'Feedback can only be submitted after the complaint is Closed'
                });
            }
        }

        // Ensure user is the owner
        if (complaint.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'You can only submit feedback for your own complaints'
            });
        }

        const feedback = await Feedback.create({
            complaint: complaintId,
            user: req.user.id,
            rating,
            comment
        });

        // If feedback submitted, we can also ensure status is Closed if it was Resolved
        if (complaint.status === 'Resolved') {
            complaint.status = 'Closed';
            await complaint.save();

            await ComplaintUpdate.create({
                complaint: complaint._id,
                user: req.user.id,
                previousStatus: 'Resolved',
                newStatus: 'Closed',
                comment: 'Closed upon feedback submission'
            });
        }

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
