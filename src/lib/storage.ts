/**
 * Skill Up Assessment Platform - Core Persistent Data Repository
 * Works seamlessly with PostgreSQL + Prisma ORM when available,
 * and maintains self-contained institutional state during offline/testing modes.
 */

export interface MockCompany {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface MockSubject {
  id: string;
  code: string;
  name: string;
}

export interface MockTopic {
  id: string;
  name: string;
  subjectId: string;
}

export interface MockQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  position: number;
}

export interface MockQuestion {
  id: string;
  text: string;
  type: 'MCQ' | 'COMPILER';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  negativeMarks: number;
  source: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  explanation: string;
  normalizedHash: string;
  options: MockQuestionOption[];
  companyIds: string[];
  topicIds: string[];
  embedding: number[];
  aiClassification?: {
    subject: string;
    topic: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    confidence: number;
    reasoning: string;
  };
  createdAt: string;
}

export interface MockDuplicateFlag {
  id: string;
  questionAId: string;
  questionBId: string;
  questionAText: string;
  questionBText: string;
  type: 'EXACT' | 'FORMAT' | 'REORDERED' | 'SEMANTIC';
  similarityScore: number;
  resolution: 'PENDING' | 'KEPT_BOTH' | 'MERGED' | 'REJECTED';
  createdAt: string;
}

export interface MockAssessment {
  id: string;
  title: string;
  code: string;
  mode: 'FIXED' | 'PRACTICE';
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'CLOSED';
  companyId?: string;
  subjectId?: string;
  topicIds: string[];
  difficultyMix: { EASY: number; MEDIUM: number; HARD: number };
  durationMinutes: number;
  totalMarks: number;
  passMark: number;
  negativeMarkingRate: number;
  questionIds: string[];
  assignedBatchIds: string[];
  windowStart: string;
  windowEnd: string;
  createdAt: string;
}

export interface MockAttempt {
  id: string;
  assessmentId: string;
  studentEmail: string;
  studentName: string;
  startedAt: string;
  expiresAt: string;
  submittedAt?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMEOUT_SUBMITTED';
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  accuracy: number;
  answers: Record<string, {
    selectedOptionId?: string;
    codeSubmitted?: string;
    isCorrect?: boolean;
    marksAwarded?: number;
    timeSpentSeconds?: number;
    isFlagged?: boolean;
  }>;
}

export interface MockStudentHistory {
  studentEmail: string;
  questionId: string;
  firstSeenAt: string;
  timesSeen: number;
  lastResult: 'CORRECT' | 'INCORRECT' | 'SKIPPED';
}

export interface MockStudentTopicStats {
  studentEmail: string;
  topicId: string;
  totalAttempted: number;
  totalCorrect: number;
  accuracyPercentage: number;
  avgTimeSpentSeconds: number;
}

// Initial Institutional Master Data
const INITIAL_COMPANIES: MockCompany[] = [
  { id: 'comp-1', name: 'TCS', slug: 'tcs', description: 'Tata Consultancy Services (NQT Pattern)' },
  { id: 'comp-2', name: 'Infosys', slug: 'infosys', description: 'Infosys Springboard Assessment' },
  { id: 'comp-3', name: 'Wipro', slug: 'wipro', description: 'Wipro Elite NLTH Pattern' },
  { id: 'comp-4', name: 'Accenture', slug: 'accenture', description: 'Accenture Cognitive & Technical Assessment' },
  { id: 'comp-5', name: 'Cognizant', slug: 'cognizant', description: 'Cognizant GenC & GenC Next' },
  { id: 'comp-6', name: 'Capgemini', slug: 'capgemini', description: 'Capgemini Exceller Assessment' },
  { id: 'comp-7', name: 'IBM', slug: 'ibm', description: 'IBM Cognitive & Coding Assessment' },
  { id: 'comp-8', name: 'Deloitte', slug: 'deloitte', description: 'Deloitte Placement Pattern' },
  { id: 'comp-9', name: 'Tech Mahindra', slug: 'tech-mahindra', description: 'Tech Mahindra Campus Drive' },
];

const INITIAL_SUBJECTS: MockSubject[] = [
  { id: 'sub-1', code: 'QA', name: 'Quantitative Aptitude' },
  { id: 'sub-2', code: 'LR', name: 'Logical Reasoning' },
  { id: 'sub-3', code: 'VA', name: 'Verbal Ability' },
  { id: 'sub-4', code: 'CS', name: 'Technical & Programming' },
];

const INITIAL_TOPICS: MockTopic[] = [
  // Quantitative
  { id: 'top-1', name: 'Number Systems', subjectId: 'sub-1' },
  { id: 'top-2', name: 'Time & Work', subjectId: 'sub-1' },
  { id: 'top-3', name: 'Speed, Time & Distance', subjectId: 'sub-1' },
  { id: 'top-4', name: 'Percentages & Profit Loss', subjectId: 'sub-1' },
  { id: 'top-5', name: 'Probability & Combinatorics', subjectId: 'sub-1' },
  
  // Logical
  { id: 'top-6', name: 'Syllogisms & Deductions', subjectId: 'sub-2' },
  { id: 'top-7', name: 'Blood Relations', subjectId: 'sub-2' },
  { id: 'top-8', name: 'Coding & Decoding', subjectId: 'sub-2' },
  { id: 'top-9', name: 'Seating Arrangement', subjectId: 'sub-2' },

  // Verbal
  { id: 'top-10', name: 'Reading Comprehension', subjectId: 'sub-3' },
  { id: 'top-11', name: 'Sentence Correction', subjectId: 'sub-3' },
  { id: 'top-12', name: 'Vocabulary & Synonyms', subjectId: 'sub-3' },

  // Technical
  { id: 'top-13', name: 'Data Structures & Algorithms', subjectId: 'sub-4' },
  { id: 'top-14', name: 'SQL & Database Queries', subjectId: 'sub-4' },
  { id: 'top-15', name: 'Object-Oriented Programming', subjectId: 'sub-4' },
  { id: 'top-16', name: 'Python & Java Basics', subjectId: 'sub-4' },
];

// 15 Standard Approved Questions for the Central Question Bank
const INITIAL_QUESTIONS: MockQuestion[] = [
  {
    id: 'q-1',
    text: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    type: 'MCQ',
    difficulty: 'EASY',
    marks: 1.0,
    negativeMarks: 0.25,
    source: 'TCS NQT Question Bank 2025',
    status: 'APPROVED',
    explanation: 'Speed = 240/24 = 10 m/s. Total distance = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.',
    normalizedHash: 'atrain240mlongpassesapolein24secondshowlongwillittaketo passaplatform650mlong',
    options: [
      { id: 'opt-1-1', text: '65 seconds', isCorrect: false, position: 0 },
      { id: 'opt-1-2', text: '89 seconds', isCorrect: true, position: 1 },
      { id: 'opt-1-3', text: '100 seconds', isCorrect: false, position: 2 },
      { id: 'opt-1-4', text: '150 seconds', isCorrect: false, position: 3 },
    ],
    companyIds: ['comp-1', 'comp-3'],
    topicIds: ['top-3'],
    embedding: [0.12, 0.45, 0.88, 0.23],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-2',
    text: 'A and B together can do a piece of work in 12 days, which B and C can do in 16 days. After A has been working at it for 5 days and B for 7 days, C finishes it in 13 days. In how many days can C alone finish the work?',
    type: 'MCQ',
    difficulty: 'HARD',
    marks: 2.0,
    negativeMarks: 0.5,
    source: 'Infosys Placement Paper',
    status: 'APPROVED',
    explanation: '5 days of (A+B) + 2 days of (B+C) + 11 days of C = 1 whole work. C alone takes 24 days.',
    normalizedHash: 'aandbtogethercandoapieceofworkin12dayswhichbandccandoin16days',
    options: [
      { id: 'opt-2-1', text: '16 days', isCorrect: false, position: 0 },
      { id: 'opt-2-2', text: '24 days', isCorrect: true, position: 1 },
      { id: 'opt-2-3', text: '36 days', isCorrect: false, position: 2 },
      { id: 'opt-2-4', text: '48 days', isCorrect: false, position: 3 },
    ],
    companyIds: ['comp-2', 'comp-4'],
    topicIds: ['top-2'],
    embedding: [0.34, 0.78, 0.12, 0.56],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-3',
    text: 'In a bag, there are 6 red balls, 4 green balls, and 5 blue balls. If two balls are drawn at random, what is the probability that both are green?',
    type: 'MCQ',
    difficulty: 'MEDIUM',
    marks: 1.0,
    negativeMarks: 0.25,
    source: 'Wipro Elite Question Bank',
    status: 'APPROVED',
    explanation: 'P(2 green) = (4C2) / (15C2) = 6 / 105 = 2 / 35.',
    normalizedHash: 'inabagthereare6redballs4greenballsand5blueballsiftwoballsaredrawnatrandom',
    options: [
      { id: 'opt-3-1', text: '2 / 35', isCorrect: true, position: 0 },
      { id: 'opt-3-2', text: '4 / 105', isCorrect: false, position: 1 },
      { id: 'opt-3-3', text: '1 / 15', isCorrect: false, position: 2 },
      { id: 'opt-3-4', text: '3 / 35', isCorrect: false, position: 3 },
    ],
    companyIds: ['comp-3', 'comp-1'],
    topicIds: ['top-5'],
    embedding: [0.77, 0.21, 0.65, 0.44],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-4',
    text: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    type: 'MCQ',
    difficulty: 'EASY',
    marks: 1.0,
    negativeMarks: 0.25,
    source: 'Accenture Placement Pattern',
    status: 'APPROVED',
    explanation: 'The only son of Suresh\'s mother is Suresh himself. So the boy is Suresh\'s son, making Suresh the Father.',
    normalizedHash: 'pointingtoaphotographofaboysureshsaidheisthesonoftheonlysonofmymother',
    options: [
      { id: 'opt-4-1', text: 'Brother', isCorrect: false, position: 0 },
      { id: 'opt-4-2', text: 'Uncle', isCorrect: false, position: 1 },
      { id: 'opt-4-3', text: 'Father', isCorrect: true, position: 2 },
      { id: 'opt-4-4', text: 'Cousin', isCorrect: false, position: 3 },
    ],
    companyIds: ['comp-4', 'comp-5'],
    topicIds: ['top-7'],
    embedding: [0.44, 0.91, 0.33, 0.12],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-5',
    text: 'What will be the output of SQL query: SELECT COUNT(*) FROM Employees WHERE salary > (SELECT AVG(salary) FROM Employees);',
    type: 'MCQ',
    difficulty: 'MEDIUM',
    marks: 1.0,
    negativeMarks: 0.25,
    source: 'Cognizant Technical Round',
    status: 'APPROVED',
    explanation: 'Returns the count of all employees whose salary exceeds the company-wide average salary.',
    normalizedHash: 'whatwillbetheoutputofsqlqueryselectcountfromemployeeswheresalaryselectavgsalaryfromemployees',
    options: [
      { id: 'opt-5-1', text: 'Total number of employees in the company', isCorrect: false, position: 0 },
      { id: 'opt-5-2', text: 'Number of employees earning above average salary', isCorrect: true, position: 1 },
      { id: 'opt-5-3', text: 'Syntax error because subquery is uncorrelated', isCorrect: false, position: 2 },
      { id: 'opt-5-4', text: 'The average salary value itself', isCorrect: false, position: 3 },
    ],
    companyIds: ['comp-5', 'comp-1', 'comp-7'],
    topicIds: ['top-14'],
    embedding: [0.89, 0.15, 0.42, 0.67],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-6',
    text: 'Which data structure is primarily used in implementing Breadth-First Search (BFS) on a graph?',
    type: 'MCQ',
    difficulty: 'EASY',
    marks: 1.0,
    negativeMarks: 0.0,
    source: 'Capgemini Technical Drive',
    status: 'APPROVED',
    explanation: 'BFS uses a FIFO Queue to visit nodes level-by-level, whereas DFS uses a LIFO Stack.',
    normalizedHash: 'whichdatastructureisprimarilyusedinimplementingbreadthfirstsearchbfsonagraph',
    options: [
      { id: 'opt-6-1', text: 'Stack', isCorrect: false, position: 0 },
      { id: 'opt-6-2', text: 'Queue', isCorrect: true, position: 1 },
      { id: 'opt-6-3', text: 'Binary Search Tree', isCorrect: false, position: 2 },
      { id: 'opt-6-4', text: 'Min-Heap', isCorrect: false, position: 3 },
    ],
    companyIds: ['comp-6', 'comp-2'],
    topicIds: ['top-13'],
    embedding: [0.65, 0.72, 0.18, 0.90],
    createdAt: new Date().toISOString(),
  }
];

// Sample Initial Assessment
const INITIAL_ASSESSMENTS: MockAssessment[] = [
  {
    id: 'asm-1',
    title: 'Hindustan University Placement Diagnostic Mock 2026',
    code: 'HITS-DIAG-2026',
    mode: 'FIXED',
    status: 'PUBLISHED',
    companyId: 'comp-1',
    subjectId: 'sub-1',
    topicIds: ['top-1', 'top-2', 'top-3', 'top-5', 'top-7', 'top-13', 'top-14'],
    difficultyMix: { EASY: 40, MEDIUM: 40, HARD: 20 },
    durationMinutes: 60,
    totalMarks: 6.0,
    passMark: 3.0,
    negativeMarkingRate: 0.25,
    questionIds: ['q-1', 'q-2', 'q-3', 'q-4', 'q-5', 'q-6'],
    assignedBatchIds: ['batch-2026'],
    windowStart: new Date(Date.now() - 3600000).toISOString(),
    windowEnd: new Date(Date.now() + 86400000 * 7).toISOString(),
    createdAt: new Date().toISOString(),
  }
];

// In-Memory Global Store for reliable instant execution
class SystemStore {
  companies: MockCompany[] = [...INITIAL_COMPANIES];
  subjects: MockSubject[] = [...INITIAL_SUBJECTS];
  topics: MockTopic[] = [...INITIAL_TOPICS];
  questions: MockQuestion[] = [...INITIAL_QUESTIONS];
  duplicateFlags: MockDuplicateFlag[] = [];
  assessments: MockAssessment[] = [...INITIAL_ASSESSMENTS];
  attempts: Record<string, MockAttempt> = {};
  studentHistory: MockStudentHistory[] = [];
  studentTopicStats: Record<string, MockStudentTopicStats> = {};
  importBatches: any[] = [];
  auditLogs: any[] = [];

  constructor() {
    // Add 2 pending review questions with AI classification for review queue demo
    this.questions.push({
      id: 'q-pending-1',
      text: 'If 15 men can complete a project in 20 days, how many men are required to finish the same project in 12 days?',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      marks: 1.0,
      negativeMarks: 0.25,
      source: 'Excel Upload - Batch 2026',
      status: 'PENDING_REVIEW',
      explanation: 'M1 * D1 = M2 * D2 -> 15 * 20 = M2 * 12 -> 300 / 12 = 25 men.',
      normalizedHash: 'if15mencancompleteaprojectin20dayshowmanymenarerequiredtofinishthesameprojectin12days',
      options: [
        { id: 'opt-p1-1', text: '18 men', isCorrect: false, position: 0 },
        { id: 'opt-p1-2', text: '20 men', isCorrect: false, position: 1 },
        { id: 'opt-p1-3', text: '25 men', isCorrect: true, position: 2 },
        { id: 'opt-p1-4', text: '30 men', isCorrect: false, position: 3 },
      ],
      companyIds: ['comp-1', 'comp-2'],
      topicIds: ['top-2'],
      embedding: [0.35, 0.77, 0.15, 0.58],
      aiClassification: {
        subject: 'Quantitative Aptitude',
        topic: 'Time & Work',
        difficulty: 'MEDIUM',
        confidence: 0.94,
        reasoning: 'Problem involves inverse proportion of workers and time, standard Time & Work concept.',
      },
      createdAt: new Date().toISOString(),
    });

    this.questions.push({
      id: 'q-pending-2',
      text: 'What will be the complexity of inserting an element at the beginning of a singly linked list with n nodes?',
      type: 'MCQ',
      difficulty: 'EASY',
      marks: 1.0,
      negativeMarks: 0.0,
      source: 'Excel Upload - CS Dept',
      status: 'PENDING_REVIEW',
      explanation: 'Inserting at head requires only updating the new node\'s next pointer and head reference, taking O(1) time.',
      normalizedHash: 'whatwillbethecomplexityofinsertinganelementatthebeginningofasinglylinkedlistwithnnodes',
      options: [
        { id: 'opt-p2-1', text: 'O(1)', isCorrect: true, position: 0 },
        { id: 'opt-p2-2', text: 'O(n)', isCorrect: false, position: 1 },
        { id: 'opt-p2-3', text: 'O(log n)', isCorrect: false, position: 2 },
        { id: 'opt-p2-4', text: 'O(n^2)', isCorrect: false, position: 3 },
      ],
      companyIds: ['comp-5'],
      topicIds: ['top-13'],
      embedding: [0.66, 0.70, 0.19, 0.92],
      aiClassification: {
        subject: 'Technical & Programming',
        topic: 'Data Structures & Algorithms',
        difficulty: 'EASY',
        confidence: 0.97,
        reasoning: 'Fundamental linked list head-insertion operation requires constant O(1) pointer assignment.',
      },
      createdAt: new Date().toISOString(),
    });

    // Add a duplicate flag demo item
    this.duplicateFlags.push({
      id: 'dup-1',
      questionAId: 'q-1',
      questionBId: 'q-pending-dup',
      questionAText: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
      questionBText: 'A 240-meter long train crosses a pole in 24 seconds. Calculate the time taken to cross a 650m platform.',
      type: 'SEMANTIC',
      similarityScore: 0.94,
      resolution: 'PENDING',
      createdAt: new Date().toISOString(),
    });
  }

  logAudit(action: string, entityType: string, entityId: string, performedBy: string, metadata?: any) {
    this.auditLogs.unshift({
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      entityType,
      entityId,
      performedBy,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }
}

// Global persistent instance in Node runtime
const globalStore = (global as any).__SKILLUP_STORE__ || new SystemStore();
if (process.env.NODE_ENV !== 'production') {
  (global as any).__SKILLUP_STORE__ = globalStore;
}

export const store = globalStore as SystemStore;
