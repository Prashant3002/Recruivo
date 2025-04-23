import mongoose, { Schema, model, models } from 'mongoose';
import { IUser } from './userModel';

export interface IStudent {
  _id?: string;
  user: IUser | string;
  university: string;
  degree: string;
  branch?: string;
  graduationYear: number;
  resumeUrl?: string;
  resumeScore?: number;
  skills: string[];
  experience?: {
    title: string;
    company: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }[];
  projects?: {
    title: string;
    description: string;
    url?: string;
    technologies: string[];
  }[];
  status: 'applying' | 'interviewing' | 'placed';
  matchScore?: number;
  phone?: string;
  bio?: string;
  rollNumber?: string;
  cgpa?: number;
  class10Percentage?: number;
  class12Percentage?: number;
  careerObjective?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student must belong to a user'],
  },
  university: {
    type: String,
    required: [true, 'Please provide your university name'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Please provide your degree'],
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  graduationYear: {
    type: Number,
    required: [true, 'Please provide your graduation year'],
    min: [2000, 'Graduation year must be valid'],
    max: [2100, 'Graduation year must be valid']
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  resumeScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: [
    {
      title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
      },
      company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      startDate: {
        type: Date,
        required: [true, 'Start date is required']
      },
      endDate: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false,
      },
    },
  ],
  projects: [
    {
      title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      url: {
        type: String,
        trim: true
      },
      technologies: {
        type: [String],
        default: []
      },
    },
  ],
  status: {
    type: String,
    enum: ['applying', 'interviewing', 'placed'],
    default: 'applying',
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s]+$/, 'Please provide a valid phone number']
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
  },
  class10Percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  class12Percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  careerObjective: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true,
    match: [/^https?:\/\/([a-z0-9-]+\.)+[a-z0-9]{2,}(\/.*)*$/i, 'Please provide a valid URL']
  },
  github: {
    type: String,
    trim: true,
    match: [/^https?:\/\/([a-z0-9-]+\.)+[a-z0-9]{2,}(\/.*)*$/i, 'Please provide a valid URL']
  },
  portfolio: {
    type: String,
    trim: true,
    match: [/^https?:\/\/([a-z0-9-]+\.)+[a-z0-9]{2,}(\/.*)*$/i, 'Please provide a valid URL']
  },
}, {
  timestamps: true,
  // This ensures any undefined fields are not saved to the database
  strict: true
});

// Create index for efficient querying by user
studentSchema.index({ user: 1 }, { unique: true });

// Create index for searching by skills
studentSchema.index({ skills: 1 });

export const Student = models.Student || model<IStudent>('Student', studentSchema);

export default Student; 