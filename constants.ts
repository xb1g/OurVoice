import { BuildingStats, CommunityInfo, Issue, IssueStage, User, UserRole, Vendor } from './types';

export const TOTAL_UNITS = 200;

export const COMMUNITY_INFO: CommunityInfo = {
  name: "Sunset Heights Condos",
  address: "450 Sierra Blvd",
  city: "San Diego",
  state: "CA",
  zipCode: "92103",
  units: TOTAL_UNITS,
  yearBuilt: 1998,
  amenities: ["Pool", "Gym", "Roof Garden", "Underground Parking", "24/7 Security"],
  financials: {
    reserveFund: 425000.00,
    operatingAccount: 68200.50,
    lastUpdated: new Date().toLocaleDateString(),
    monthlyAssessment: 450.00,
    recurringPayments: [
      { id: 'r1', vendor: 'ProTec Security', amount: 8500, frequency: 'Monthly', category: 'Safety' },
      { id: 'r2', vendor: 'City Water & Power', amount: 4200, frequency: 'Monthly', category: 'Utilities' },
      { id: 'r3', vendor: 'OurVoice Platform', amount: 150, frequency: 'Monthly', category: 'Software' },
      { id: 'r4', vendor: 'Waste Management', amount: 1800, frequency: 'Monthly', category: 'Services' },
      { id: 'r5', vendor: 'Landscaping Master', amount: 3500, frequency: 'Monthly', category: 'Maintenance' }
    ],
    recentExpenses: [
      { id: 'e1', description: 'Emergency Plumbing Repair (Unit 304)', amount: 1250, date: '2023-10-15', category: 'Maintenance' },
      { id: 'e2', description: 'Monthly Landscaping', amount: 3200, date: '2023-10-01', category: 'Service' },
      { id: 'e3', description: 'Elevator Safety Inspection', amount: 850, date: '2023-09-28', category: 'Compliance' },
      { id: 'e4', description: 'Pool Pump Replacement', amount: 4500, date: '2023-09-15', category: 'Amenities' }
    ]
  }
};

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

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'ProTec Building Services',
    category: 'Maintenance & Facilities',
    phone: '(800) 585-8015',
    website: 'https://protec.com',
    rating: 4.8,
    recommendedBy: 'Admin Alice'
  },
  {
    id: 'v2',
    name: 'San Diego Green Gardens',
    category: 'Cleanliness & Hygiene',
    phone: '(619) 555-0199',
    rating: 4.5,
    recommendedBy: 'Robert Fox'
  },
  {
    id: 'v3',
    name: 'Elite Pool Care',
    category: 'Maintenance & Facilities',
    phone: '(858) 555-0123',
    website: 'https://elitepoolssd.com',
    rating: 4.9,
    recommendedBy: 'Jane Doe'
  }
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'i1',
    title: 'Lobby Renovation',
    description: 'The lobby carpet is worn out and the lighting is too dim. We need a refresh to maintain property value.',
    category: 'Maintenance & Facilities',
    stage: IssueStage.IDEATE,
    authorId: 'u4',
    authorName: 'John Smith',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    supporters: ['u1', 'u2', 'u3', 'u4', 'u5'],
    upvotes: ['u1', 'u2', 'u3'],
    downvotes: [],
    comments: [
      { 
        id: 'c1', 
        authorId: 'u2', 
        authorName: 'Robert Fox', 
        authorSkills: ['Resident Architect'], 
        text: 'I agree, the lighting is very 1990s.', 
        createdAt: new Date(Date.now() - 86400000).toISOString() 
      }
    ],
    views: 142,
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
    category: 'Community & Improvements',
    stage: IssueStage.VALIDATE,
    authorId: 'u1',
    authorName: 'Jane Doe',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    supporters: ['u1', 'u4', 'u5'],
    upvotes: ['u1', 'u4', 'u5', 'u6'],
    downvotes: ['u2'],
    comments: [],
    views: 89,
    solutions: []
  },
  {
    id: 'i3',
    title: 'Roof Garden Access',
    description: 'Open the roof garden until 10 PM instead of 8 PM during summer months.',
    category: 'Rules & Policy Proposals',
    stage: IssueStage.VOTE,
    authorId: 'u5',
    authorName: 'Emily Davis',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    supporters: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    upvotes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    downvotes: [],
    comments: [
        { 
          id: 'c2', 
          authorId: 'u3', 
          authorName: 'Admin Alice', 
          authorSkills: ['Property Manager'],
          text: 'We need to consider noise levels for top floor units.', 
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString() 
        }
    ],
    views: 185,
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
  },
  {
    id: 'i4',
    title: 'Visitor Parking Fees',
    description: 'Implement a small fee for overnight visitor parking to prevent abuse.',
    category: 'Parking & Traffic',
    stage: IssueStage.CLOSED,
    authorId: 'u3',
    authorName: 'Admin Alice',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    supporters: [],
    upvotes: ['u3'],
    downvotes: ['u1', 'u4', 'u5'],
    comments: [],
    views: 210,
    rating: 4.2,
    solutions: []
  },
  {
    id: 'i5',
    title: 'Pool Deck Resurfacing',
    description: 'The concrete was cracked and slippery. Successfully resurfaced with non-slip coating.',
    category: 'Maintenance & Facilities',
    stage: IssueStage.CLOSED,
    authorId: 'u2',
    authorName: 'Robert Fox',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    supporters: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    upvotes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    downvotes: [],
    comments: [],
    views: 342,
    rating: 4.9,
    solutions: []
  }
];