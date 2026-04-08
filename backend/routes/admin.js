const express = require('express');
const router = express.Router();
const {
  getAllStudents, getStudent, updateProject, getAnalytics,
  deleteStudent, updateStudent, getAllAdmins, deleteAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/students', getAllStudents);
router.get('/students/:id', getStudent);
router.get('/analytics', getAnalytics);
router.put('/projects/:id', updateProject);

// SuperAdmin only
router.put('/students/:id', authorize('superadmin'), updateStudent);
router.delete('/students/:id', authorize('superadmin'), deleteStudent);
router.get('/admins', authorize('superadmin'), getAllAdmins);
router.delete('/admins/:id', authorize('superadmin'), deleteAdmin);

module.exports = router;
