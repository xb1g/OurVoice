import { BuildingStats, Issue, IssueStage, User, UserRole } from './types';

export const TOTAL_UNITS = 200;

export const BUILDING_STATS: BuildingStats = {
  activeResidentsPct: 85,
  issuesResolvedMonth: 12,
  moneySaved: 1200,
  totalUnits: TOTAL_UNITS
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Jane Doe',
    role: UserRole.RESIDENT,
    skills: ['Resident Accountant', 'Budget Analyst'],
    avatarUrl: 'https://picsum.photos/id/64/100/100'
  },
  {
    id: 'u2',
    name: 'Robert Fox',
    role: UserRole.RESIDENT,
    skills: ['Resident Architect'],
    avatarUrl: 'https://picsum.photos/id/91/100/100'
  },
  {
    id: 'u3',
    name: 'Admin Alice',
    role: UserRole.ADMIN,
    skills: ['Property Manager'],
    avatarUrl: 'https://picsum.photos/id/77/100/100'
  },
  {
    id: 'u4',
    name: 'John Smith',
    role: UserRole.RESIDENT,
    skills: [],
    avatarUrl: 'https://picsum.photos/id/103/100/100'
  },
  {
    id: 'u5',
    name: 'Emily Davis',
    role: UserRole.RESIDENT,
    skills: ['Legal Counsel'],
    avatarUrl: 'https://picsum.photos/id/234/100/100'
  },
  {
    id: 'u6',
    name: 'Michael Brown',
    role: UserRole.RESIDENT,
    skills: ['Plumber'],
    avatarUrl: 'https://picsum.photos/id/76/100/100'
  }
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'i1',
    title: 'Lobby Renovation',
    description: 'The lobby carpet is worn out and the lighting is too dim. We need a refresh to maintain property value.',
    category: 'Maintenance',
    stage: IssueStage.IDEATE,
    authorId: 'u4',
    authorName: 'John Smith',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    supporters: ['u1', 'u2', 'u3', 'u4', 'u5'],
    solutions: [
      {
        id: 's1',
        authorId: 'u2',
        authorName: 'Robert Fox',
        authorSkills: ['Resident Architect'],
        description: 'Modern minimalist design with LED track lighting and hardwood floors. Low maintenance in the long run.',
        estimatedCost: 15000,
        votes: []
      },
      {
        id: 's2',
        authorId: 'u1',
        authorName: 'Jane Doe',
        authorSkills: ['Resident Accountant', 'Budget Analyst'],
        description: 'Replace carpet with industrial tile and paint walls. Keep existing fixtures to save money.',
        estimatedCost: 5000,
        votes: []
      }
    ]
  },
  {
    id: 'i2',
    title: 'Gym Equipment Upgrade',
    description: 'The treadmill has been broken for 3 weeks. We need a service contract or a new machine.',
    category: 'Amenities',
    stage: IssueStage.VALIDATE,
    authorId: 'u1',
    authorName: 'Jane Doe',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    supporters: ['u1', 'u4', 'u5'],
    solutions: []
  },
  {
    id: 'i3',
    title: 'Roof Garden Access',
    description: 'Open the roof garden until 10 PM instead of 8 PM during summer months.',
    category: 'Amenities',
    stage: IssueStage.VOTE,
    authorId: 'u5',
    authorName: 'Emily Davis',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    supporters: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    solutions: [
      {
        id: 's_root_1',
        authorId: 'u3',
        authorName: 'Admin Alice',
        authorSkills: ['Property Manager'],
        description: 'Extend hours to 10 PM, requires extra security patrol hour.',
        estimatedCost: 2000,
        votes: ['u1', 'u2']
      },
      {
        id: 's_roof_2',
        authorId: 'u4',
        authorName: 'John Smith',
        authorSkills: [],
        description: 'Install automatic lock system, one time cost.',
        estimatedCost: 4500,
        votes: ['u5', 'u6']
      }
    ]
  }
];
