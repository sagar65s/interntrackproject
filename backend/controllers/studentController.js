const Student = require('../models/Student');
const Project = require('../models/Project');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Get student profile (own)
// @route   GET /api/students/profile
// @access  Student
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email createdAt');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Student
const updateProfile = async (req, res) => {
  try {
    const { phone, college, course } = req.body;
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (phone) student.phone = phone;
    if (college) student.college = college;
    if (course) student.course = course;

    await student.save();

    res.json({ success: true, message: 'Profile updated successfully', student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// @desc    Upload resume
// @route   POST /api/students/upload-resume
// @access  Student
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Delete old resume if exists
    if (student.resumeUrl) {
      const oldPath = path.join(__dirname, '..', student.resumeUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    student.resumeUrl = `${baseUrl}/uploads/resumes/${req.file.filename}`;
    student.resumeOriginalName = req.file.originalname;
    await student.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: student.resumeUrl,
      resumeOriginalName: student.resumeOriginalName
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload resume' });
  }
};

// @desc    Get my projects
// @route   GET /api/students/projects
// @access  Student
const getMyProjects = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const projects = await Project.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

// @desc    Submit project
// @route   POST /api/students/projects
// @access  Student
const submitProject = async (req, res) => {
  try {
    const { title, description, techStack, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const techArray = typeof techStack === 'string'
      ? techStack.split(',').map(t => t.trim()).filter(Boolean)
      : Array.isArray(techStack) ? techStack : [];

    const project = await Project.create({
      studentId: student._id,
      userId: req.user.id,
      title,
      description,
      techStack: techArray,
      status: status || 'ongoing'
    });

    res.status(201).json({ success: true, message: 'Project submitted successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit project' });
  }
};

// @desc    Update own project
// @route   PUT /api/students/projects/:id
// @access  Student
const updateProject = async (req, res) => {
  try {
    const { title, description, techStack, status } = req.body;
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (techStack) {
      project.techStack = typeof techStack === 'string'
        ? techStack.split(',').map(t => t.trim()).filter(Boolean)
        : techStack;
    }
    if (status) project.status = status;

    await project.save();
    res.json({ success: true, message: 'Project updated successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

module.exports = { getMyProfile, updateProfile, uploadResume, getMyProjects, submitProject, updateProject };
