// Enterprise Data Model
const enterprises = [
  {
    id: 'ent-001',
    name: 'Quantum Innovations Inc.',
    industry: 'Technology',
    founded: 2015,
    employees: 245,
    revenue: '€45M',
    hq: 'Amsterdam, NL',
    status: 'Active',
    ceo: 'John Smith',
    website: 'https://quantum-innovations.example',
    description: 'Leading provider of quantum computing solutions for enterprise applications.'
  },
  // 9 more sample enterprises...
];

// CEOC Profiles
const ceocProfiles = [
  {
    id: 'ceoc-001',
    name: 'Maria Garcia',
    title: 'CEO & Founder',
    company: 'Quantum Innovations',
    industry: 'Technology',
    skills: ['Strategic Planning', 'AI/ML', 'Venture Capital'],
    experience: 15,
    location: 'Amsterdam, NL',
    availability: 'Available for consulting',
    contact: 'maria.g@quantum-innovations.example',
    bio: 'Serial entrepreneur with a passion for disruptive technologies.'
  },
  // 9 more CEOC profiles...
];

// Projects Data
const projects = [
  {
    id: 'proj-001',
    name: 'Enterprise AI Platform',
    description: 'Building an AI-powered platform for enterprise automation',
    status: 'In Progress',
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    budget: '€2.5M',
    team: ['ceoc-001', 'ceoc-003', 'ceoc-007'],
    progress: 45,
    milestones: [
      { name: 'Phase 1: Planning', completed: true, date: '2025-03-01' },
      { name: 'Phase 2: Development', completed: true, date: '2025-06-15' },
      { name: 'Phase 3: Testing', completed: false, date: '2025-09-30' },
      { name: 'Phase 4: Launch', completed: false, date: '2025-12-31' }
    ]
  },
  // 4 more sample projects...
];

export { enterprises, ceocProfiles, projects };
