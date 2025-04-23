import mongoose, { Schema, model, models } from 'mongoose';

export interface ICompany {
  _id?: string;
  name: string;
  industry: string;
  description: string;
  logo?: string;
  website?: string;
  location: string;
  size?: string;
  founded?: number;
  status: 'active' | 'pending' | 'blacklisted';
  totalHired?: number;
  hiringTrend?: 'up' | 'down' | 'stable';
  rating?: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: [true, 'Please provide a company name'],
    unique: true,
    trim: true,
  },
  industry: {
    type: String,
    required: [true, 'Please provide the industry'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  logo: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
    required: [true, 'Please provide the company location'],
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  },
  founded: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'blacklisted'],
    default: 'pending',
  },
  totalHired: {
    type: Number,
    default: 0,
  },
  hiringTrend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const Company = models.Company || model<ICompany>('Company', companySchema);

export default Company; 