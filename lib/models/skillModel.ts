import mongoose, { Schema, model, models } from 'mongoose';

export interface ISkill {
  _id?: string;
  name: string;
  category: string;
  popularityScore?: number;
  description?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Please provide a skill name'],
    trim: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a skill category'],
    enum: [
      'programming',
      'design',
      'marketing',
      'communication',
      'management',
      'data',
      'business',
      'other'
    ]
  },
  popularityScore: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create text indexes for search
skillSchema.index({ name: 'text', description: 'text' });

export const Skill = models.Skill || model<ISkill>('Skill', skillSchema);

export default Skill; 