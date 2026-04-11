const User = require('../models/User');
const { sendEmail, adminMessageTemplate } = require('../utils/emailService');

// @desc    Send message to single student
// @route   POST /api/email/send-message
// @access  Admin, SuperAdmin
const sendMessageToStudent = async (req, res) => {
  try {
    const { studentUserId, message } = req.body;

    if (!studentUserId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Student and message are required.' });
    }

    const student = await User.findById(studentUserId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Can only send emails to students.' });
    }

    const template = adminMessageTemplate(student.name, message.trim(), req.user.name);

    const result = await sendEmail({
      to: student.email,
      subject: template.subject,
      html: template.html,
    });

    if (result.success) {
      return res.json({
        success: true,
        message: `Email sent successfully to ${student.email}`,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email: ' + result.error,
      });
    }
  } catch (error) {
    console.error('sendMessageToStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending email.' });
  }
};

// @desc    Send message to ALL students
// @route   POST /api/email/send-all
// @access  SuperAdmin only
const sendToAllStudents = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const students = await User.find({ role: 'student', isActive: true });

    if (!students.length) {
      return res.status(404).json({ success: false, message: 'No active students found.' });
    }

    let successCount = 0;
    let failCount = 0;
    const failed = [];

    for (const student of students) {
      const template = adminMessageTemplate(student.name, message.trim(), req.user.name);
      const result = await sendEmail({
        to: student.email,
        subject: template.subject,
        html: template.html,
      });
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        failed.push(student.email);
      }
    }

    res.json({
      success: true,
      message: `Broadcast complete! ✅ ${successCount} sent, ❌ ${failCount} failed`,
      details: { successCount, failCount, failed },
    });
  } catch (error) {
    console.error('sendToAllStudents error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending broadcast.' });
  }
};

module.exports = { sendMessageToStudent, sendToAllStudents };
