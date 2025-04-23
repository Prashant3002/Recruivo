import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './userModel';
import { IJob } from './jobModel';

export interface IApplication extends Document {
  _id: string;
  student: Schema.Types.ObjectId;
  job: Schema.Types.ObjectId;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interviewed' | 'offered' | 'accepted' | 'declined';
  appliedAt: Date;
  resume: string;
  coverLetter?: string;
  matchScore?: number;
  interviewDate?: Date;
  notes?: string;
  feedback?: string;
  studentName?: string;
  studentEmail?: string;
  studentUniversity?: string;
  studentDegree?: string;
  studentSkills?: string[];
}

const applicationSchema = new Schema<IApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'interviewed', 'offered', 'accepted', 'declined'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    resume: {
      type: String,
      required: true
    },
    coverLetter: {
      type: String
    },
    matchScore: {
      type: Number
    },
    interviewDate: {
      type: Date
    },
    notes: {
      type: String
    },
    feedback: {
      type: String
    },
    studentName: {
      type: String
    },
    studentEmail: {
      type: String
    },
    studentUniversity: {
      type: String,
    },
    studentDegree: {
      type: String,
    },
    studentSkills: {
      type: [String],
    }
  },
  {
    timestamps: true
  }
);

// Create a unique index on the combination of job and student
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema); 