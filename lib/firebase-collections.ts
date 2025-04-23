/**
 * This file defines the Firestore collection interfaces to replace
 * MongoDB models. It provides TypeScript types for the Firestore database.
 */

// User document
export interface UserData {
  id?: string;
  email: string;
  name?: string;
  role: 'student' | 'recruiter' | 'admin';
  emailVerified?: boolean;
  image?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Student document
export interface StudentData {
  id?: string;
  email: string;
  name?: string;
  university?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  resumeUrl?: string;
  resumeScore?: number;
  skills?: string[];
  experience?: {
    title: string;
    company: string;
    description: string;
    startDate: Date | string;
    endDate?: Date | string;
    current: boolean;
  }[];
  projects?: {
    title: string;
    description: string;
    url?: string;
    technologies: string[];
  }[];
  status?: 'applying' | 'interviewing' | 'placed';
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
  applicationsCount?: number;
  lastApplied?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Job document
export interface JobData {
  id?: string;
  title: string;
  companyId: string;
  companyName: string;
  recruiterId?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience?: string;
  skills: string[];
  status: 'open' | 'closed' | 'draft';
  applicationDeadline: Date | string;
  applicationsCount: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Application document
export interface ApplicationData {
  id?: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentUniversity?: string;
  studentDegree?: string;
  studentSkills?: string[];
  resumeUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interviewed' | 'offered' | 'accepted' | 'declined';
  matchScore?: number;
  interviewDate?: Date | string;
  notes?: string;
  feedback?: string;
  appliedAt: Date | string;
  updatedAt?: Date | string;
}

// Company document
export interface CompanyData {
  id?: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  recruiters?: string[]; // array of recruiter IDs
  jobCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Collection names constants
export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  JOBS: 'jobs', 
  APPLICATIONS: 'applications',
  COMPANIES: 'companies',
}; 