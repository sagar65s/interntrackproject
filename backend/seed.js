require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) {
      console.log('Super Admin already exists:', existing.email);
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: 'superadmin@interntrack.com',
      password: 'SuperAdmin@123',
      role: 'superadmin'
    });

    console.log('✅ Super Admin created successfully');
    console.log('Email: superadmin@interntrack.com');
    console.log('Password: SuperAdmin@123');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
