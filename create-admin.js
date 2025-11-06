import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const adminData = {
  login: 'asila',
  password: 'asila123'
};

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ login: adminData.login });
    
    if (existingAdmin) {
      console.log('⚠️  Admin allaqachon mavjud!');
      console.log('Login:', existingAdmin.login);
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin(adminData);
    await admin.save();
    
    console.log('✅ Admin muvaffaqiyatli yaratildi!');
    console.log('Login:', adminData.login);
    console.log('Password:', adminData.password);
    console.log('\n DIQQAT: Parolni xavfsiz joyda saqlang!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

createAdmin();