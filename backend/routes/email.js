const express = require('express');
const router = express.Router();
const { sendMessageToStudent, sendToAllStudents } = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Send to single student
router.post('/send-message', sendMessageToStudent);

// Send to all students (superadmin only)
router.post('/send-all', authorize('superadmin'), sendToAllStudents);

module.exports = router;
