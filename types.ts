
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export interface AnswerSegment {
  questionNumber: string;
  questionText: string;
  studentAnswer: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface TopicResult {
  topic: string; 
  score: number;
  maxScore: number;
  feedback: string;
  segments: AnswerSegment[]; // The segmented QA pairs for this topic
}

export interface ExamAnalysis {
  subject: string;
  studentName: string;
  studentId: string;
  examDate: string;
  overallScore: number;
  topics: TopicResult[];
  rawText?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  accessCode?: string;
}
