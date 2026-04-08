const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Projects are managed through student and admin routes
router.get('/health', protect, (req, res) => {
  res.json({ success: true, message: 'Projects API OK' });
});

module.exports = router;
