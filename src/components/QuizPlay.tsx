import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizPlayProps {
  questions: QuizQuestion[];
  userAlias: string;
  onSubmitQuiz: (answers: Record<string, 'a' | 'b' | 'c'>) => void;
  onGoBack: () => void;
}

export default function QuizPlay({ questions, userAlias, onSubmitQuiz, onGoBack }: QuizPlayProps) {
  // Store selected answers as { "q1": "a", "q2": "b" }
  const [answers, setAnswers] = useState<Record<string, 'a' | 'b' | 'c'>>({});
  const [showValidationWarning, setShowValidationWarning] = useState(false);

  const handleSelectOption = (questionId: string, option: 'a' | 'b' | 'c') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
    setShowValidationWarning(false);
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === questions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered) {
      setShowValidationWarning(true);
      // Scroll to first unanswered question
      const firstUnanswered = questions.find(q => !answers[q.id]);
      if (firstUnanswered) {
        const el = document.getElementById(`q-card-${firstUnanswered.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    onSubmitQuiz(answers);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Quiz Progress Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-brand-secondary">
        <div className="space-y-1">
          <span className="text-brand-accent text-xs font-bold tracking-widest uppercase">DIAGNOSIS PROGRESS</span>
          <h2 className="text-xl font-bold tracking-tight text-brand-text">
            <span className="text-brand-primary font-serif italic pr-1">{userAlias}</span> 선생님의 기초 자가진단
          </h2>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-brand-text/50 block">자가진단 진행률</span>
            <span className="text-sm font-bold text-brand-primary">
              {answeredCount} / {questions.length} 문항 마킹
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-brand-secondary flex items-center justify-center relative overflow-hidden">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-brand-secondary"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-brand-primary transition-all duration-300"
                strokeDasharray={`${(answeredCount / questions.length) * 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-brand-primary">
              {Math.round((answeredCount / questions.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => {
          const isSelected = answers[q.id];
          return (
            <motion.div
              id={`q-card-${q.id}`}
              key={q.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`p-6 md:p-8 bg-white rounded-3xl border transition-all duration-200 ${
                isSelected 
                  ? 'border-brand-primary shadow-xs ring-1 ring-brand-primary/10' 
                  : 'border-brand-secondary shadow-xs'
              }`}
            >
              <div className="flex gap-4 items-start">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isSelected ? 'bg-[#eef2e7] text-brand-primary' : 'bg-brand-bg text-brand-text/50'
                }`}>
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="space-y-6 flex-1">
                  {/* Question Title & Statement */}
                  <div>
                    <span className="font-serif text-xs font-semibold text-brand-accent tracking-wider uppercase block mb-1">
                      QUESTION {idx + 1}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-brand-text leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {/* Options Stack */}
                  <div className="space-y-3">
                    {/* Option A */}
                    <button
                      type="button"
                      onClick={() => handleSelectOption(q.id, 'a')}
                      className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                        isSelected === 'a'
                          ? 'border-brand-accent bg-[#fdfaf0] text-brand-text shadow-xs'
                          : 'border-brand-secondary hover:border-brand-primary/40 bg-brand-bg/30 hover:bg-brand-bg/80 text-brand-text/90'
                      }`}
                    >
                      <span className="leading-relaxed flex-1 pr-4">{q.option_a}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected === 'a' ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-secondary'
                      }`}>
                        {isSelected === 'a' && <CheckCircle2 className="w-4 h-4" />}
                      </span>
                    </button>

                    {/* Option B */}
                    <button
                      type="button"
                      onClick={() => handleSelectOption(q.id, 'b')}
                      className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                        isSelected === 'b'
                          ? 'border-brand-accent bg-[#fdfaf0] text-brand-text shadow-xs'
                          : 'border-brand-secondary hover:border-brand-primary/40 bg-brand-bg/30 hover:bg-brand-bg/80 text-brand-text/90'
                      }`}
                    >
                      <span className="leading-relaxed flex-1 pr-4">{q.option_b}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected === 'b' ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-secondary'
                      }`}>
                        {isSelected === 'b' && <CheckCircle2 className="w-4 h-4" />}
                      </span>
                    </button>

                    {/* Option C */}
                    <button
                      type="button"
                      onClick={() => handleSelectOption(q.id, 'c')}
                      className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                        isSelected === 'c'
                          ? 'border-brand-accent bg-[#fdfaf0] text-brand-text shadow-xs'
                          : 'border-brand-secondary hover:border-brand-primary/40 bg-brand-bg/30 hover:bg-brand-bg/80 text-brand-text/90'
                      }`}
                    >
                      <span className="leading-relaxed flex-1 pr-4">{q.option_c}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected === 'c' ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-secondary'
                      }`}>
                        {isSelected === 'c' && <CheckCircle2 className="w-4 h-4" />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Validation block */}
        {showValidationWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-[#fdfaf0] border border-brand-accent/30 text-brand-text text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-brand-accent shrink-0" />
            아직 답변하지 않은 문항이 존재합니다. 모든 질문에 답하고 제출해 주세요.
          </motion.div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={onGoBack}
            className="w-full sm:w-auto px-6 py-3 border border-brand-secondary text-brand-text/80 hover:bg-brand-secondary/40 rounded-xl font-medium transition-colors cursor-pointer text-center"
          >
            별명 변경 / 처음으로
          </button>
          
          <button
            type="submit"
            className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 group transition-all duration-200 cursor-pointer ${
              isAllAnswered
                ? 'bg-brand-primary hover:bg-[#7a8b4f] active:bg-[#6b7b43] hover:shadow-lg'
                : 'bg-brand-secondary/80 text-brand-text/40 cursor-not-allowed'
            }`}
          >
            진단 제출 및 결과 확인하기
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
