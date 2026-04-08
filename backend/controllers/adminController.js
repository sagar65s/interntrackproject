const User = require('../models/User');
const Student = require('../models/Student');
const Project = require('../models/Project');

// @desc    Get all students with profiles
// @route   GET /api/admin/students
// @access  Admin, SuperAdmin
const getAllStudents = async (req, res) => {
  try {
    const { search, college, status, sort } = req.query;

    // Get all student users
    let userQuery = { role: 'student' };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(userQuery).select('-password');
    const userIds = users.map(u => u._id);

    let studentQuery = { userId: { $in: userIds } };
    if (college) studentQuery.college = { $regex: college, $options: 'i' };

    const students = await Student.find(studentQuery).populate('userId', 'name email createdAt isActive');

    // Get projects for each student
    const studentsWithProjects = await Promise.all(
      students.map(async (student) => {
        const projects = await Project.find({ studentId: student._id });
        return { ...student.toObject(), projects };
      })
    );

    // Filter by project status if provided
    let result = studentsWithProjects;
    if (status) {
      result = result.filter(s => s.projects.some(p => p.status === status));
    }

    // Sort
    if (sort === 'college') {
      result.sort((a, b) => (a.college || '').localeCompare(b.college || ''));
    } else if (sort === 'name') {
      result.sort((a, b) => (a.userId?.name || '').localeCompare(b.userId?.name || ''));
    } else {
      result.sort((a, b) => new Date(b.userId?.createdAt) - new Date(a.userId?.createdAt));
    }

    res.json({ success: true, count: result.length, students: result });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};

// @desc    Get single student
// @route   GET /api/admin/students/:id
// @access  Admin, SuperAdmin
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email createdAt isActive');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const projects = await Project.find({ studentId: student._id });
    res.json({ success: true, student: { ...student.toObject(), projects } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student' });
  }
};

// @desc    Update project (admin/superadmin)
// @route   PUT /api/admin/projects/:id
// @access  Admin, SuperAdmin
const updateProject = async (req, res) => {
  try {
    const { title, description, techStack, status } = req.body;
    const project = await Project.findById(req.params.id);

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

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Admin, SuperAdmin
const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeProjects = await Project.countDocuments({ status: 'ongoing' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const totalProjects = await Project.countDocuments();
    const profilesCompleted = await Student.countDocuments({ profileCompleted: true });
    const resumesUploaded = await Student.countDocuments({ resumeUrl: { $ne: null } });

    res.json({
      success: true,
      analytics: {
        totalStudents,
        totalAdmins,
        activeProjects,
        completedProjects,
        totalProjects,
        profilesCompleted,
        resumesUploaded
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

// @desc    Delete student (SuperAdmin only)
// @route   DELETE /api/admin/students/:id
// @access  SuperAdmin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Project.deleteMany({ studentId: student._id });
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(student._id);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
};

// @desc    Update student profile (SuperAdmin)
// @route   PUT /api/admin/students/:id
// @access  SuperAdmin
const updateStudent = async (req, res) => {
  try {
    const { name, phone, college, course, isActive } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (phone) student.phone = phone;
    if (college) student.college = college;
    if (course) student.course = course;
    await student.save();

    if (name || isActive !== undefined) {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (isActive !== undefined) updateFields.isActive = isActive;
      await User.findByIdAndUpdate(student.userId, updateFields);
    }

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
};

// @desc    Get all admins (SuperAdmin only)
// @route   GET /api/admin/admins
// @access  SuperAdmin
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admins' });
  }
};

// @desc    Delete admin (SuperAdmin only)
// @route   DELETE /api/admin/admins/:id
// @access  SuperAdmin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
};

module.exports = {
  getAllStudents, getStudent, updateProject, getAnalytics,
  deleteStudent, updateStudent, getAllAdmins, deleteAdmin
};
