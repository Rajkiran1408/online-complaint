const express = require('express');
const {
    submitComplaint,
    getComplaints,
    getComplaint,
    updateComplaintStatus,
    submitFeedback
} = require('../controllers/complaintController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All routes protected

router
    .route('/')
    .get(getComplaints)
    .post(authorize('User'), upload.single('attachment'), submitComplaint);

router.route('/feedback').post(authorize('User'), submitFeedback);

router.route('/:id').get(getComplaint);

router.route('/:id/status').put(authorize('Admin', 'Support Staff'), upload.single('resolutionImage'), updateComplaintStatus);

module.exports = router;
