
export enum IssueStage {
  RAISE = 'RAISE',
  VALIDATE = 'VALIDATE',
  IDEATE = 'IDEATE',
  VOTE = 'VOTE',
  ONGOING = 'ONGOING',
  CLOSED = 'CLOSED'
}

export enum UserRole {
  RESIDENT = 'RESIDENT',
  ADMIN = 'ADMIN'
}

export const ISSUE_CATEGORIES = [
  'Maintenance & Facilities',
  'Noise & Disturbances',
  'Cleanliness & Hygiene',
  'Parking & Traffic',
  'Safety & Security',
  'Rules & Policy Proposals',
  'Community & Improvements',
  'General / Other'
] as const;

export type IssueCategory = typeof ISSUE_CATEGORIES[number];

export interface User {
  id: string;
  name: string;
  role: UserRole;
  skills?: string[];
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorSkills?: string[];
  text: string;
  createdAt: string;
}

export interface Solution {
  id: string;
  authorId: string;
  authorName: string;
  authorSkills?: string[];
  description: string;
  estimatedCost: number;
  votes: string[];
}

export interface AiContractor {
  name: string;
  specialty: string;
  website: string;
  phone: string;
  note: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  stage: IssueStage;
  authorId: string;
  authorName: string;
  createdAt: string;
  supporters: string[];
  solutions: Solution[];
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  views: number;
  rating?: number;
  // AI Cache fields
  aiAnalysis?: string;
  aiContractors?: AiContractor[];
  aiBudget?: string;
  aiSources?: { uri: string; title: string }[];
  aiLastSearched?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string;
  website?: string;
  rating: number;
  recommendedBy?: string;
}

export interface BuildingStats {
  activeResidentsPct: number;
  issuesResolvedMonth: number;
  moneySaved: number;
  totalUnits: number;
}

export interface FinancialData {
  reserveFund: number;
  operatingAccount: number;
  lastUpdated: string;
  monthlyAssessment: number;
  recurringPayments: {
    id: string;
    vendor: string;
    amount: number;
    frequency: 'Monthly' | 'Quarterly' | 'Annual';
    category: string;
  }[];
  recentExpenses: {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
  }[];
}

export interface CommunityInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  units: number;
  yearBuilt: number;
  amenities: string[];
  financials: FinancialData;
}
