const express = require('express');
const router = express.Router();
const { register, login, getMe, createAdmin } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-admin', protect, authorize('superadmin'), createAdmin);

module.exports = router;
