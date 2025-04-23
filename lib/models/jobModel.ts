import mongoose, { Schema, model, models } from 'mongoose';
import { ICompany } from './companyModel';
import { IUser } from './userModel';

export interface IJob {
  _id?: string;
  title: string;
  company: ICompany | string;
  recruiter: IUser | string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience: string;
  skills: string[];
  status: 'open' | 'closed' | 'draft';
  applicationDeadline: Date;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Job must belong to a company'],
  },
  recruiter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Job must be posted by a recruiter'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description'],
  },
  requirements: {
    type: [String],
    required: [true, 'Please provide job requirements'],
  },
  responsibilities: {
    type: [String],
    required: [true, 'Please provide job responsibilities'],
  },
  location: {
    type: String,
    required: [true, 'Please provide the job location'],
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR',
    },
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: [true, 'Please provide the job type'],
  },
  experience: {
    type: String,
    required: [true, 'Please provide the required experience'],
  },
  skills: {
    type: [String],
    required: [true, 'Please provide the required skills'],
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'draft'],
    default: 'draft',
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Please provide an application deadline'],
  },
  applicationCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for full-text search
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

export const Job = models.Job || model<IJob>('Job', jobSchema);

export default Job; 