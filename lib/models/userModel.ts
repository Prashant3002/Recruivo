import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'recruiter' | 'admin';
  avatar?: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'admin'],
    default: 'student',
  },
  avatar: {
    type: String,
  },
  phone: {
    type: String,
  },
  company: {
    type: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    // Ensure password exists in model (should be selected with '+password')
    if (!this.password) {
      console.error('Password comparison failed: Password field not selected');
      throw new Error('Password field not available for comparison');
    }
    
    // Ensure candidate password is a string
    if (typeof candidatePassword !== 'string') {
      console.error('Password comparison failed: Invalid candidate password type', typeof candidatePassword);
      throw new Error('Invalid password format');
    }
    
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Authentication error');
  }
};

export const User = models.User || model<IUser>('User', userSchema);

export default User; 