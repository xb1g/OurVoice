export enum IssueStage {
  RAISE = 'RAISE',
  VALIDATE = 'VALIDATE',
  IDEATE = 'IDEATE',
  VOTE = 'VOTE',
  CLOSED = 'CLOSED'
}

export enum UserRole {
  RESIDENT = 'RESIDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  skills?: string[]; // Changed from expertise string to skills array
  avatarUrl?: string;
}

export interface Solution {
  id: string;
  authorId: string;
  authorName: string;
  authorSkills?: string[]; // Changed from authorExpertise string to authorSkills array
  description: string;
  estimatedCost: number;
  votes: string[]; // Array of User IDs
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'Maintenance' | 'Amenities' | 'Budget';
  stage: IssueStage;
  authorId: string;
  authorName: string;
  createdAt: string;
  supporters: string[]; // Array of User IDs (for Validation stage)
  solutions: Solution[];
}

export interface BuildingStats {
  activeResidentsPct: number;
  issuesResolvedMonth: number;
  moneySaved: number;
  totalUnits: number;
}