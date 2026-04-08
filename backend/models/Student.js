const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number']
  },
  college: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    trim: true
  },
  resumeUrl: {
    type: String,
    default: null
  },
  resumeOriginalName: {
    type: String,
    default: null
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.phone && this.college && this.course) {
    this.profileCompleted = true;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
