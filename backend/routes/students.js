const express = require('express');
const router = express.Router();
const { getMyProfile, updateProfile, uploadResume, getMyProjects, submitProject, updateProject } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('student'));

router.get('/profile', getMyProfile);
router.put('/profile', updateProfile);
router.post('/upload-resume', upload.single('resume'), uploadResume);
router.get('/projects', getMyProjects);
router.post('/projects', submitProject);
router.put('/projects/:id', updateProject);

module.exports = router;
