export interface Metrics {
  confidence:     number;
  body_language:  number;
  knowledge:      number;
  fluency:        number;
  skill_relevance: number;
}

export interface StartResponse {
  session_id:    string;
  question:      string;
  question_number: number;
  ats_score:     number;
  skills_found:  string[];
}

export interface AnswerResponse {
  metrics:        Metrics;
  feedback:       string;
  next_question?: string;
  question_number?: number;
  completed:      boolean;
}

export interface QuestionDetail {
  number:       number;
  question:     string;
  answer:       string;
  metrics:      Metrics;
  strengths:    string[];
  improvements: string[];
  feedback:     string;
}

export interface ReportResponse {
  report_id:      string;
  generated_date: string;
  session_id:     string;
  overall: {
    total_score: number;
    max_score:   number;
    percentage:  number;
    grade:       string;
    grade_label: string;
    metrics:     Metrics;
  };
  ats_analysis: {
    ats_score:    number;
    improvements: string[];
  };
  strengths:        string[];
  areas_to_improve: string[];
  interview_tips:   string[];
  question_breakdown: QuestionDetail[];
}

export interface HistoryEntry {
  type:            'question' | 'answer' | 'metrics' | 'system';
  content:         string;
  metrics?:        Metrics;
  questionNumber?: number;
}
