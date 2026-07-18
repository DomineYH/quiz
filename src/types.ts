export interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  answer: 'a' | 'b' | 'c';
  feedback: string;
}

export interface QuizResult {
  timestamp: string;
  user_alias: string;
  score: number;
  result_level: string;
  reflection: string;
}

export interface AppSettings {
  appsScriptUrl: string;
  useSheetsData: boolean;
}
