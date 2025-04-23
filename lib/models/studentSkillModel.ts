import mongoose, { Schema, model, models } from 'mongoose';
import { IStudent } from './studentModel';
import { ISkill } from './skillModel';

export interface IStudentSkill {
  _id?: string;
  student: IStudent | string;
  skill: ISkill | string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  verified: boolean;
  projectsApplied?: number;
  endorsements?: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentSkillSchema = new Schema<IStudentSkill>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student skill must belong to a student'],
    index: true
  },
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: [true, 'Student skill must reference a skill'],
    index: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  projectsApplied: {
    type: Number,
    default: 0
  },
  endorsements: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index to ensure a student can only have one entry per skill
studentSkillSchema.index({ student: 1, skill: 1 }, { unique: true });

export const StudentSkill = models.StudentSkill || model<IStudentSkill>('StudentSkill', studentSkillSchema);

export default StudentSkill; 