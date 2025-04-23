import mongoose, { Schema, model, models } from 'mongoose';
import { IStudent } from './studentModel';

export interface IResume {
  _id?: string;
  student: IStudent | string;
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  version: number;
  isActive: boolean;
  score?: number;
  feedback?: string;
  parsedData?: {
    name?: string;
    email?: string;
    phone?: string;
    education?: {
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startDate: Date;
      endDate?: Date;
      gpa?: string;
    }[];
    experience?: {
      company: string;
      title: string;
      location?: string;
      description: string;
      startDate: Date;
      endDate?: Date;
      isCurrent: boolean;
    }[];
    skills?: string[];
    projects?: {
      name: string;
      description: string;
      technologies: string[];
      url?: string;
    }[];
    certifications?: {
      name: string;
      issuingOrganization: string;
      issueDate: Date;
      expirationDate?: Date;
      credentialId?: string;
    }[];
  };
  uploadedAt: Date;
  lastUpdated: Date;
}

const resumeSchema = new Schema<IResume>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Resume must belong to a student'],
    index: true
  },
  url: {
    type: String,
    required: [true, 'Resume URL is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  contentType: {
    type: String,
    required: [true, 'Content type is required']
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String
  },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
      gpa: String
    }],
    experience: [{
      company: String,
      title: String,
      location: String,
      description: String,
      startDate: Date,
      endDate: Date,
      isCurrent: Boolean
    }],
    skills: [String],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      url: String
    }],
    certifications: [{
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      expirationDate: Date,
      credentialId: String
    }]
  }
}, {
  timestamps: { 
    createdAt: 'uploadedAt', 
    updatedAt: 'lastUpdated' 
  }
});

// Create index on student and version for efficient querying
resumeSchema.index({ student: 1, version: -1 });

// Create index for full-text search within parsed data
resumeSchema.index({ 
  'parsedData.name': 'text',
  'parsedData.education.institution': 'text',
  'parsedData.education.degree': 'text',
  'parsedData.experience.company': 'text',
  'parsedData.experience.title': 'text',
  'parsedData.skills': 'text'
});

export const Resume = models.Resume || model<IResume>('Resume', resumeSchema);

export default Resume; 