import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  }, 
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Admin', adminSchema);