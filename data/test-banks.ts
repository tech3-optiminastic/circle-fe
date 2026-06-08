/**
 * Question banks for the online recruitment tests.
 *
 * IQ test: 20 logical-reasoning MCQs, 20-minute limit. Raw correct count maps
 * to an IQ-scale score: IQ = 60 + correct * 4 (range 60–140); pass >= 100,
 * i.e. at least 10/20 correct.
 *
 * Assessments: one bank per department, 60-minute limit, pass >= 60%.
 * The bank is selected by the candidate's department (General as fallback).
 */

export interface TestQuestion {
  id: string;
  q: string;
  options: [string, string, string, string];
  /** Index (0-3) of the correct option. */
  answer: number;
}

export const IQ_DURATION_MIN = 20;
export const ASSESSMENT_DURATION_MIN = 60;
export const IQ_PASS_SCORE = 100; // IQ-scale
export const ASSESSMENT_PASS_PERCENT = 60;

export const iqScoreFromCorrect = (correct: number, total: number): number =>
  Math.round(60 + (correct / total) * 80);

export const IQ_QUESTIONS: TestQuestion[] = [
  {
    id: 'IQ01',
    q: 'What comes next in the series: 2, 6, 12, 20, 30, ... ?',
    options: ['36', '40', '42', '44'],
    answer: 2, // n(n+1): 42
  },
  {
    id: 'IQ02',
    q: 'Book is to Reading as Fork is to:',
    options: ['Drawing', 'Eating', 'Writing', 'Stirring'],
    answer: 1,
  },
  {
    id: 'IQ03',
    q: 'If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely:',
    options: ['Razzies only', 'Lazzies', 'Neither', 'Cannot be determined'],
    answer: 1,
  },
  {
    id: 'IQ04',
    q: 'Which number is the odd one out: 3, 5, 11, 14, 17, 21?',
    options: ['21', '17', '14', '11'],
    answer: 2, // only even
  },
  {
    id: 'IQ05',
    q: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
    options: ['0°', '7.5°', '15°', '30°'],
    answer: 1,
  },
  {
    id: 'IQ06',
    q: 'Complete the analogy — Flock : Sheep :: Swarm : ?',
    options: ['Cows', 'Bees', 'Wolves', 'Fish'],
    answer: 1,
  },
  {
    id: 'IQ07',
    q: 'What comes next: J, F, M, A, M, J, J, A, ... ?',
    options: ['S', 'O', 'N', 'A'],
    answer: 0, // months: September
  },
  {
    id: 'IQ08',
    q: 'If you rearrange the letters of "CIFAIPC", you get the name of a(n):',
    options: ['City', 'Animal', 'Ocean', 'Country'],
    answer: 2, // PACIFIC
  },
  {
    id: 'IQ09',
    q: 'A is taller than B. C is shorter than B. D is taller than A. Who is the shortest?',
    options: ['A', 'B', 'C', 'D'],
    answer: 2,
  },
  {
    id: 'IQ10',
    q: 'What comes next in the series: 1, 1, 2, 3, 5, 8, 13, ... ?',
    options: ['18', '20', '21', '26'],
    answer: 2, // Fibonacci
  },
  {
    id: 'IQ11',
    q: 'A farmer has 17 sheep. All but 9 die. How many are left?',
    options: ['8', '9', '17', '0'],
    answer: 1,
  },
  {
    id: 'IQ12',
    q: 'Which word does NOT belong: Apple, Mango, Carrot, Banana?',
    options: ['Apple', 'Mango', 'Carrot', 'Banana'],
    answer: 2,
  },
  {
    id: 'IQ13',
    q: 'If 5 machines make 5 widgets in 5 minutes, how long do 100 machines take to make 100 widgets?',
    options: ['100 minutes', '50 minutes', '20 minutes', '5 minutes'],
    answer: 3,
  },
  {
    id: 'IQ14',
    q: 'Mirror image: which is the mirror of the letter sequence "bpd"?',
    options: ['bpd', 'dqb', 'pdb', 'qdb'],
    answer: 1,
  },
  {
    id: 'IQ15',
    q: 'What comes next: 81, 27, 9, 3, ... ?',
    options: ['0', '1', '2', '1.5'],
    answer: 1, // ÷3
  },
  {
    id: 'IQ16',
    q: 'Tuesday is two days after the day before yesterday. What day is it today?',
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    answer: 2,
  },
  {
    id: 'IQ17',
    q: 'A cube has how many edges?',
    options: ['6', '8', '10', '12'],
    answer: 3,
  },
  {
    id: 'IQ18',
    q: 'If CAT = 24, DOG = 26, what does PIG equal? (A=1 … Z=26, sum of letters)',
    options: ['30', '32', '34', '36'],
    answer: 1, // 16+9+7=32
  },
  {
    id: 'IQ19',
    q: 'Two people are born at the same moment but have different birthdays. How is this possible?',
    options: [
      'Impossible',
      'They were born in different time zones',
      'One is adopted',
      'They are twins',
    ],
    answer: 1,
  },
  {
    id: 'IQ20',
    q: 'Which figure count: how many triangles are in a triangle divided by its three medians?',
    options: ['4', '6', '12', '16'],
    answer: 3,
  },
];

/** Role-specific assessment banks, keyed by department. */
export const ASSESSMENT_BANKS: Record<string, TestQuestion[]> = {
  Engineering: [
    {
      id: 'EN01',
      q: 'What is the time complexity of binary search on a sorted array of n elements?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      answer: 1,
    },
    {
      id: 'EN02',
      q: 'Which HTTP status code means "resource created successfully"?',
      options: ['200', '201', '204', '301'],
      answer: 1,
    },
    {
      id: 'EN03',
      q: 'In Git, which command combines fetching remote changes and merging them?',
      options: ['git push', 'git clone', 'git pull', 'git rebase'],
      answer: 2,
    },
    {
      id: 'EN04',
      q: 'Which data structure uses FIFO (first in, first out) ordering?',
      options: ['Stack', 'Queue', 'Tree', 'Hash map'],
      answer: 1,
    },
    {
      id: 'EN05',
      q: 'What does an SQL LEFT JOIN return?',
      options: [
        'Only rows that match in both tables',
        'All rows from the left table plus matches from the right',
        'All rows from the right table plus matches from the left',
        'The cartesian product of both tables',
      ],
      answer: 1,
    },
    {
      id: 'EN06',
      q: 'Which of these is NOT a principle of SOLID?',
      options: [
        'Single Responsibility',
        'Open/Closed',
        'Dependency Inversion',
        'Rapid Iteration',
      ],
      answer: 3,
    },
    {
      id: 'EN07',
      q: 'An index on a database column primarily speeds up:',
      options: ['Inserts', 'Reads/lookups', 'Deletes', 'Schema migrations'],
      answer: 1,
    },
    {
      id: 'EN08',
      q: 'What does idempotent mean for an API endpoint?',
      options: [
        'It requires authentication',
        'Calling it multiple times has the same effect as calling it once',
        'It responds in under 100ms',
        'It can only be called once',
      ],
      answer: 1,
    },
    {
      id: 'EN09',
      q: 'Which protocol underpins HTTPS encryption?',
      options: ['SSH', 'TLS', 'FTP', 'SMTP'],
      answer: 1,
    },
    {
      id: 'EN10',
      q: 'A race condition occurs when:',
      options: [
        'Code runs slower than expected',
        'Two processes access shared state concurrently with unpredictable ordering',
        'A loop never terminates',
        'Memory is leaked over time',
      ],
      answer: 1,
    },
  ],
  Product: [
    {
      id: 'PR01',
      q: 'An MVP (Minimum Viable Product) is primarily for:',
      options: [
        'Maximizing initial revenue',
        'Learning from real users with the least effort',
        'Impressing investors',
        'Replacing user research',
      ],
      answer: 1,
    },
    {
      id: 'PR02',
      q: 'Which metric best measures user retention?',
      options: [
        'Total downloads',
        'Day-30 returning-user rate',
        'Page views per session',
        'Net Promoter Score',
      ],
      answer: 1,
    },
    {
      id: 'PR03',
      q: 'In RICE prioritization, the letters stand for:',
      options: [
        'Reach, Impact, Confidence, Effort',
        'Revenue, Innovation, Cost, Efficiency',
        'Research, Ideate, Create, Evaluate',
        'Risk, Impact, Customers, Engineering',
      ],
      answer: 0,
    },
    {
      id: 'PR04',
      q: 'An A/B test should be stopped when:',
      options: [
        'One variant looks better after a day',
        'The predetermined sample size / significance threshold is reached',
        'Stakeholders ask for results',
        'Traffic drops',
      ],
      answer: 1,
    },
    {
      id: 'PR05',
      q: 'A user story is best written as:',
      options: [
        'A technical spec',
        '"As a [user], I want [goal] so that [benefit]"',
        'A list of UI screens',
        'A Gantt chart entry',
      ],
      answer: 1,
    },
    {
      id: 'PR06',
      q: 'Churn rate measures:',
      options: [
        'New users per month',
        'The percentage of customers who stop using the product',
        'Revenue growth rate',
        'Feature adoption speed',
      ],
      answer: 1,
    },
    {
      id: 'PR07',
      q: 'The North Star metric of a product should:',
      options: [
        'Be revenue, always',
        'Capture the core value users get from the product',
        'Change every sprint',
        'Be set by engineering',
      ],
      answer: 1,
    },
    {
      id: 'PR08',
      q: 'Which is a leading (not lagging) indicator for a subscription product?',
      options: ['Annual revenue', 'Weekly active usage of the core feature', 'Churned accounts last quarter', 'Total lifetime signups'],
      answer: 1,
    },
    {
      id: 'PR09',
      q: 'Jobs-to-be-Done framework focuses on:',
      options: [
        'User demographics',
        'The progress a user is trying to make in a circumstance',
        'Competitor feature lists',
        'Internal OKRs',
      ],
      answer: 1,
    },
    {
      id: 'PR10',
      q: 'When usage data and user interviews conflict, the best first step is to:',
      options: [
        'Trust the data, always',
        'Trust the interviews, always',
        'Dig into segmentation/instrumentation to reconcile the two',
        'Run the feature anyway',
      ],
      answer: 2,
    },
  ],
  Design: [
    {
      id: 'DS01',
      q: 'Which Gestalt principle explains why nearby elements are perceived as grouped?',
      options: ['Similarity', 'Proximity', 'Closure', 'Continuity'],
      answer: 1,
    },
    {
      id: 'DS02',
      q: 'The minimum recommended contrast ratio for normal body text (WCAG AA) is:',
      options: ['2:1', '3:1', '4.5:1', '7:1'],
      answer: 2,
    },
    {
      id: 'DS03',
      q: "Fitts's law states that the time to acquire a target depends on:",
      options: [
        'Color and font of the target',
        'Distance to and size of the target',
        'Number of pixels on screen',
        'User age',
      ],
      answer: 1,
    },
    {
      id: 'DS04',
      q: 'A design system primarily provides:',
      options: [
        'Marketing assets',
        'Reusable components and shared standards across products',
        'Wireframes for every screen',
        'A replacement for user testing',
      ],
      answer: 1,
    },
    {
      id: 'DS05',
      q: 'Which fidelity is most appropriate for early concept validation?',
      options: ['Pixel-perfect mockups', 'Low-fidelity wireframes', 'Production code', 'Motion prototypes'],
      answer: 1,
    },
    {
      id: 'DS06',
      q: 'Serif fonts are generally characterized by:',
      options: [
        'Uniform stroke width',
        'Small finishing strokes at the ends of letters',
        'Being unsuitable for print',
        'Always being decorative',
      ],
      answer: 1,
    },
    {
      id: 'DS07',
      q: 'In usability testing, 5 users typically uncover roughly what share of usability problems?',
      options: ['~10%', '~30%', '~80%', '100%'],
      answer: 2,
    },
    {
      id: 'DS08',
      q: 'Whitespace in UI design:',
      options: [
        'Is wasted space to be minimized',
        'Improves scanability and hierarchy',
        'Only matters in print',
        'Slows users down',
      ],
      answer: 1,
    },
    {
      id: 'DS09',
      q: 'A "dark pattern" is:',
      options: [
        'A dark-mode color scheme',
        'A UI deliberately designed to trick users into unintended actions',
        'A low-contrast layout',
        'An accessibility feature',
      ],
      answer: 1,
    },
    {
      id: 'DS10',
      q: 'The 60-30-10 rule in visual design refers to:',
      options: [
        'Spacing scale',
        'Color proportion balance',
        'Grid columns',
        'Type scale ratios',
      ],
      answer: 1,
    },
  ],
  Sales: [
    {
      id: 'SL01',
      q: 'BANT qualification stands for:',
      options: [
        'Budget, Authority, Need, Timeline',
        'Brand, Audience, Numbers, Targets',
        'Buyer, Account, Negotiation, Terms',
        'Budget, Account, Network, Trust',
      ],
      answer: 0,
    },
    {
      id: 'SL02',
      q: 'The best response to "your product is too expensive" is to:',
      options: [
        'Immediately offer a discount',
        'Reframe the conversation around value and ROI',
        'End the call',
        'Compare competitor prices',
      ],
      answer: 1,
    },
    {
      id: 'SL03',
      q: 'A sales pipeline "conversion rate" measures:',
      options: [
        'Calls made per day',
        'The share of opportunities that advance between stages',
        'Total revenue',
        'Emails opened',
      ],
      answer: 1,
    },
    {
      id: 'SL04',
      q: 'Active listening in a discovery call means:',
      options: [
        'Pitching while the prospect talks',
        'Asking open questions and reflecting back what you heard',
        'Reading from a script',
        'Taking no notes',
      ],
      answer: 1,
    },
    {
      id: 'SL05',
      q: 'Churn risk in an account is best detected early through:',
      options: [
        'Waiting for the renewal date',
        'Monitoring product usage and engagement signals',
        'Quarterly invoices',
        'Cold outreach',
      ],
      answer: 1,
    },
    {
      id: 'SL06',
      q: 'An ideal customer profile (ICP) describes:',
      options: [
        'Any company with budget',
        'The type of account that gets the most value and retains best',
        'The largest enterprise logos',
        'Existing customers only',
      ],
      answer: 1,
    },
    {
      id: 'SL07',
      q: 'The primary goal of a discovery call is to:',
      options: [
        'Close the deal',
        'Understand the prospect’s problem, impact, and buying process',
        'Demo every feature',
        'Send pricing',
      ],
      answer: 1,
    },
    {
      id: 'SL08',
      q: 'MRR stands for:',
      options: [
        'Maximum Revenue Reached',
        'Monthly Recurring Revenue',
        'Marginal Rate of Return',
        'Monthly Retention Rate',
      ],
      answer: 1,
    },
    {
      id: 'SL09',
      q: 'When a deal stalls, the most effective next step is to:',
      options: [
        'Send daily follow-ups',
        'Re-engage the champion and re-confirm the business case and timeline',
        'Drop the price immediately',
        'Mark it closed-lost',
      ],
      answer: 1,
    },
    {
      id: 'SL10',
      q: 'Cross-selling means:',
      options: [
        'Selling to a competitor’s customer',
        'Offering complementary products to an existing customer',
        'Lowering price for volume',
        'Selling through partners',
      ],
      answer: 1,
    },
  ],
  'Human Resources': [
    {
      id: 'HR01',
      q: 'A structured interview is one where:',
      options: [
        'Questions vary per candidate',
        'All candidates get the same predetermined questions scored on a rubric',
        'Only the hiring manager attends',
        'No notes are taken',
      ],
      answer: 1,
    },
    {
      id: 'HR02',
      q: 'Time-to-fill measures:',
      options: [
        'Hours interviewers spend per week',
        'Days from opening a requisition to an accepted offer',
        'Length of onboarding',
        'Notice period of a new hire',
      ],
      answer: 1,
    },
    {
      id: 'HR03',
      q: 'Halo bias in interviews means:',
      options: [
        'Preferring internal candidates',
        'Letting one positive trait color the whole evaluation',
        'Scoring late candidates lower',
        'Favoring referred candidates',
      ],
      answer: 1,
    },
    {
      id: 'HR04',
      q: 'An offer acceptance rate that is dropping most likely signals:',
      options: [
        'Too many applicants',
        'Misalignment in compensation, speed, or candidate experience',
        'A strong employer brand',
        'Low attrition',
      ],
      answer: 1,
    },
    {
      id: 'HR05',
      q: 'BGV in hiring refers to:',
      options: [
        'Background verification',
        'Base grade variance',
        'Benefits and grants validation',
        'Behavioral group evaluation',
      ],
      answer: 0,
    },
    {
      id: 'HR06',
      q: 'The primary purpose of a probation period is to:',
      options: [
        'Delay benefits',
        'Mutually evaluate fit with a defined review point',
        'Reduce salary costs',
        'Extend notice periods',
      ],
      answer: 1,
    },
    {
      id: 'HR07',
      q: 'eNPS measures:',
      options: [
        'Employee likelihood to recommend the company as a place to work',
        'Net profit share',
        'New position openings',
        'Engineering productivity',
      ],
      answer: 0,
    },
    {
      id: 'HR08',
      q: 'Which is a leading indicator of attrition risk?',
      options: [
        'Exit interviews',
        'Sustained drops in engagement and 1:1 frequency',
        'Last year’s turnover rate',
        'Headcount reports',
      ],
      answer: 1,
    },
    {
      id: 'HR09',
      q: 'A competency matrix maps:',
      options: [
        'Salaries to grades',
        'Skills and proficiency levels across roles',
        'Office seating',
        'Reporting lines',
      ],
      answer: 1,
    },
    {
      id: 'HR10',
      q: 'Inclusive job descriptions should:',
      options: [
        'List 15+ mandatory requirements',
        'Use gender-neutral language and focus on must-have outcomes',
        'Require photos',
        'Specify age ranges',
      ],
      answer: 1,
    },
  ],
};

/** Generic bank used when a department has no specific assessment. */
export const GENERAL_ASSESSMENT: TestQuestion[] = [
  {
    id: 'GN01',
    q: 'You receive two urgent tasks with the same deadline. The best first step is to:',
    options: [
      'Do the easier one first',
      'Clarify priority and impact with the stakeholders',
      'Work overtime silently',
      'Delegate both',
    ],
    answer: 1,
  },
  {
    id: 'GN02',
    q: 'A teammate disagrees with your approach in a meeting. You should:',
    options: [
      'Defend your idea until they concede',
      'Understand their reasoning and evaluate both options on merits',
      'Escalate to a manager immediately',
      'Withdraw your proposal',
    ],
    answer: 1,
  },
  {
    id: 'GN03',
    q: 'Which is the clearest professional email subject line?',
    options: [
      'Hello',
      'Quick thing',
      'Q3 budget review — approval needed by Friday',
      'IMPORTANT!!!',
    ],
    answer: 2,
  },
  {
    id: 'GN04',
    q: 'If a project is going to miss its deadline, the right time to inform stakeholders is:',
    options: [
      'After the deadline passes',
      'As soon as the risk is identified, with a revised plan',
      'Only if they ask',
      'Never — work weekends instead',
    ],
    answer: 1,
  },
  {
    id: 'GN05',
    q: '15% of 240 is:',
    options: ['24', '32', '36', '40'],
    answer: 2,
  },
  {
    id: 'GN06',
    q: 'A process you follow daily seems inefficient. The best action is to:',
    options: [
      'Keep following it — it’s the process',
      'Quietly stop doing it',
      'Document the issue and propose an improvement to the owner',
      'Complain to colleagues',
    ],
    answer: 2,
  },
  {
    id: 'GN07',
    q: 'When you make a mistake that affects others, you should first:',
    options: [
      'Wait to see if anyone notices',
      'Own it, inform those affected, and fix or contain the impact',
      'Find who else contributed',
      'Update your resume',
    ],
    answer: 1,
  },
  {
    id: 'GN08',
    q: 'A meeting could have been an email when:',
    options: [
      'It has an agenda and decisions to make',
      'It is purely one-way status sharing with no discussion needed',
      'Stakeholders disagree',
      'It involves brainstorming',
    ],
    answer: 1,
  },
  {
    id: 'GN09',
    q: 'If revenue grew from ₹80 lakh to ₹1 crore, the growth percentage is:',
    options: ['20%', '25%', '30%', '125%'],
    answer: 1,
  },
  {
    id: 'GN10',
    q: 'The most reliable way to handle multiple recurring responsibilities is to:',
    options: [
      'Memory',
      'A prioritized system you review regularly (lists/calendar)',
      'Doing whatever is asked last',
      'Working longer hours',
    ],
    answer: 1,
  },
];

export function assessmentBankFor(department: string): TestQuestion[] {
  return ASSESSMENT_BANKS[department] ?? GENERAL_ASSESSMENT;
}
