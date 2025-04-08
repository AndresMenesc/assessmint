import { Question } from "@/types/assessment";

// Original list of questions
const questionsList: Question[] = [
  // Esteem section - Insecure subsection
  {
    id: "esteem-insecure-1",
    text: "I often doubt my own abilities",
    section: "ESTEEM",
    subSection: "INSECURE",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "esteem-insecure-2",
    text: "I fear being judged by others",
    section: "ESTEEM",
    subSection: "INSECURE",
    isReversed: false,
    negativeScore: false
  },
  // Esteem section - Pride subsection  
  {
    id: "esteem-pride-1",
    text: "I am confident in my decisions",
    section: "ESTEEM",
    subSection: "PRIDE",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "esteem-pride-2",
    text: "I believe in my abilities",
    section: "ESTEEM",
    subSection: "PRIDE",
    isReversed: false,
    negativeScore: false
  },
  // Trust section - Trusting subsection
  {
    id: "trust-trusting-1",
    text: "I trust others easily",
    section: "TRUST",
    subSection: "TRUSTING",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "trust-trusting-2",
    text: "I believe people have good intentions",
    section: "TRUST",
    subSection: "TRUSTING",
    isReversed: false,
    negativeScore: false
  },
  // Trust section - Cautious subsection
  {
    id: "trust-cautious-1",
    text: "I am careful about who I trust",
    section: "TRUST",
    subSection: "CAUTIOUS",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "trust-cautious-2",
    text: "I verify information before accepting it",
    section: "TRUST",
    subSection: "CAUTIOUS",
    isReversed: false,
    negativeScore: false
  },
  // Driver section - Hustle subsection
  {
    id: "driver-hustle-1",
    text: "I am driven to succeed",
    section: "DRIVER",
    subSection: "HUSTLE",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "driver-hustle-2",
    text: "I work hard to achieve my goals",
    section: "DRIVER",
    subSection: "HUSTLE",
    isReversed: false,
    negativeScore: false
  },
  // Driver section - Reserved subsection
  {
    id: "driver-reserved-1",
    text: "I prefer a balanced approach to work",
    section: "DRIVER",
    subSection: "RESERVED",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "driver-reserved-2",
    text: "I value quality over quantity",
    section: "DRIVER",
    subSection: "RESERVED",
    isReversed: false,
    negativeScore: false
  },
  // Adaptability section - Flexible subsection
  {
    id: "adaptability-flexible-1",
    text: "I adapt well to change",
    section: "ADAPTABILITY",
    subSection: "FLEXIBLE",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "adaptability-flexible-2",
    text: "I am comfortable with uncertainty",
    section: "ADAPTABILITY",
    subSection: "FLEXIBLE",
    isReversed: false,
    negativeScore: false
  },
  // Adaptability section - Precise subsection
  {
    id: "adaptability-precise-1",
    text: "I prefer established routines",
    section: "ADAPTABILITY",
    subSection: "PRECISE",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "adaptability-precise-2",
    text: "I like clear guidelines",
    section: "ADAPTABILITY",
    subSection: "PRECISE",
    isReversed: false,
    negativeScore: false
  },
  // Problem Resolution section - Direct subsection
  {
    id: "problem-direct-1",
    text: "I address problems head-on",
    section: "PROBLEM_RESOLUTION",
    subSection: "DIRECT",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "problem-direct-2",
    text: "I speak up when I see issues",
    section: "PROBLEM_RESOLUTION",
    subSection: "DIRECT",
    isReversed: false,
    negativeScore: false
  },
  // Problem Resolution section - Avoidant subsection
  {
    id: "problem-avoidant-1",
    text: "I sometimes avoid difficult conversations",
    section: "PROBLEM_RESOLUTION",
    subSection: "AVOIDANT",
    isReversed: false,
    negativeScore: true
  },
  {
    id: "problem-avoidant-2",
    text: "I hesitate to bring up problems",
    section: "PROBLEM_RESOLUTION",
    subSection: "AVOIDANT",
    isReversed: false,
    negativeScore: true
  },
  // Coachability section
  {
    id: "coachability-1",
    text: "I am open to feedback",
    section: "COACHABILITY",
    subSection: "COACHABILITY",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "coachability-2",
    text: "I see criticism as an opportunity to grow",
    section: "COACHABILITY",
    subSection: "COACHABILITY",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "coachability-3",
    text: "I actively seek ways to improve myself",
    section: "COACHABILITY",
    subSection: "COACHABILITY",
    isReversed: false,
    negativeScore: false
  },
  {
    id: "coachability-4",
    text: "I listen to others' suggestions",
    section: "COACHABILITY",
    subSection: "COACHABILITY",
    isReversed: false,
    negativeScore: false
  }
];

// Export the questions array
export const questions = questionsList;

// Function to get all questions
export function getQuestions() {
  return questions;
}

// Function to get a single question by ID
export function getQuestionById(id: string): Question | undefined {
  return questions.find(q => q.id === id);
}

// Function to get questions by section
export function getQuestionsBySection(section: string): Question[] {
  return questions.filter(q => q.section === section);
}

// Function to get questions by subsection
export function getQuestionsBySubsection(subsection: string): Question[] {
  return questions.filter(q => q.subSection === subsection);
}
