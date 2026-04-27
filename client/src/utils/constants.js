const API_BASE_URL = 'http://localhost:5000/api';

export const HELPLINES = [
  { name: 'iCall', number: '9152987821', timing: 'Mon-Sat, 8am-10pm' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', timing: '24/7' },
  { name: 'NIMHANS', number: '1800-599-0019', timing: '24/7' },
  { name: 'KIRAN (Govt)', number: '1800-599-0011', timing: '24/7' }
];

export const MOOD_LABELS = {
  1: { label: 'Terrible', emoji: '😢', color: 'text-red-500' },
  2: { label: 'Bad', emoji: '😔', color: 'text-orange-500' },
  3: { label: 'Okay', emoji: '😐', color: 'text-yellow-500' },
  4: { label: 'Good', emoji: '🙂', color: 'text-green-400' },
  5: { label: 'Great', emoji: '😄', color: 'text-green-500' }
};

export const MOOD_REASONS = [
  'academic', 'relationship', 'family', 'health', 'financial', 'career', 'social', 'sleep', 'other'
];

export const QUIZ_TYPES = [
  {
    type: 'PHQ-9',
    name: 'Patient Health Questionnaire',
    description: 'Depression screening tool',
    questions: 9,
    maxScore: 27,
    icon: '📋'
  },
  {
    type: 'GAD-7',
    name: 'Generalized Anxiety Disorder',
    description: 'Anxiety screening tool',
    questions: 7,
    maxScore: 21,
    icon: '😰'
  },
  {
    type: 'PSS-10',
    name: 'Perceived Stress Scale',
    description: 'Stress measurement tool',
    questions: 10,
    maxScore: 40,
    icon: '📊'
  },
  {
    type: 'ISI',
    name: 'Insomnia Severity Index',
    description: 'Sleep quality assessment',
    questions: 7,
    maxScore: 28,
    icon: '😴'
  },
  {
    type: 'GHQ-12',
    name: 'General Health Questionnaire',
    description: 'General mental health check',
    questions: 12,
    maxScore: 36,
    icon: '🏥'
  }
];

export const SEVERITY_COLORS = {
  minimal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  mild: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  severe: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  extremely_severe: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  very_high: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-400',
  none: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  subthreshold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  good: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  concern: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-400'
};