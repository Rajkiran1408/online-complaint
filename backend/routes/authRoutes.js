const express = require('express');
const { register, login, getStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/staff', protect, authorize('Admin'), getStaff);

module.exports = router;
