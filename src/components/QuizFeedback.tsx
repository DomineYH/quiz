import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, CheckCircle, XCircle, ArrowLeft, Send, Sparkles, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { QuizQuestion, QuizResult } from '../types';

interface QuizFeedbackProps {
  questions: QuizQuestion[];
  userAlias: string;
  userAnswers: Record<string, 'a' | 'b' | 'c'>;
  appsScriptUrl: string;
  onRestart: () => void;
}

export default function QuizFeedback({ questions, userAlias, userAnswers, appsScriptUrl, onRestart }: QuizFeedbackProps) {
  const [reflection, setReflection] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Calculate score
  let correctCount = 0;
  questions.forEach(q => {
    if (userAnswers[q.id] === q.answer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);

  // Determine Level & Description
  let resultLevel = '';
  let levelSubtitle = '';
  let levelColor = '';
  let levelCardColor = '';

  if (correctCount === questions.length) {
    resultLevel = '인공지능 교육 전문가 교사 (AI Expert)';
    levelSubtitle = '생성형 AI의 기술적 기제와 한계를 완벽히 이해하고 주체적으로 미래의 디지털 교실을 개척할 수 있는 최우수 역량을 증명하셨습니다.';
    levelColor = 'text-[#5c6b41]';
    levelCardColor = 'bg-[#eef2e7] border-brand-primary/20';
  } else if (correctCount >= 3) {
    resultLevel = '실천형 디지털 활용 교사 (AI Practitioner)';
    levelSubtitle = 'AI 도구의 원리와 프롬프트 엔지니어링 지식을 안정적으로 이해하고 있으며, 실무에서 비판적으로 가공해 사용할 역량을 충분히 갖추셨습니다.';
    levelColor = 'text-brand-accent';
    levelCardColor = 'bg-[#fdfaf0] border-brand-accent/20';
  } else {
    resultLevel = '성장하는 미래 지망 교사 (AI Learner)';
    levelSubtitle = '생성형 AI의 내부 동작 구조와 할루시네이션 및 윤리적 쟁점에 대해 추가 보완이 필요합니다. 훌륭한 교사로 성장할 수 있는 디딤돌 단계입니다.';
    levelColor = 'text-brand-text';
    levelCardColor = 'bg-brand-secondary/40 border-brand-secondary';
  }

  // Handle Sheet submission
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveStatus === 'saved') return;

    const payload: QuizResult = {
      timestamp: new Date().toISOString(),
      user_alias: userAlias,
      score: percentage,
      result_level: resultLevel,
      reflection: reflection.trim() || '미제출'
    };

    if (!appsScriptUrl) {
      setSaveStatus('error');
      setStatusMessage('설정(⚙️)에 구글 Apps Script 웹앱 URL이 등록되어 있지 않습니다. 로컬 환경에서 결과를 저장했습니다. (우측 상단 톱니바퀴에서 스프레드시트 주소를 입력하면 실시간 누적이 진행됩니다!)');
      
      // Save locally to simulate
      const stored = localStorage.getItem('local_quiz_results');
      const list = stored ? JSON.parse(stored) : [];
      list.push(payload);
      localStorage.setItem('local_quiz_results', JSON.stringify(list));
      return;
    }

    setSaveStatus('saving');
    setStatusMessage('구글 스프레드시트에 자가진단 결과를 제출하고 있습니다...');

    try {
      // Send result as POST to Apps Script Web App
      // Using 'no-cors' mode is extremely safe in the browser to avoid CORS redirects pre-flight errors, 
      // but Apps Script will still successfully execute doPost and write to spreadsheet!
      await fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors', // standard Apps Script POST safety pattern
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Since 'no-cors' returns opaque response (status 0), we assume success because the network request completed successfully
      setSaveStatus('saved');
      setStatusMessage('축하합니다! 구글 스프레드시트 results 시트에 결과가 안전하게 영구 저장되었습니다. 📊');
      
      // Also sync locally
      const stored = localStorage.getItem('local_quiz_results');
      const list = stored ? JSON.parse(stored) : [];
      list.push(payload);
      localStorage.setItem('local_quiz_results', JSON.stringify(list));

    } catch (err: any) {
      console.error('Submit result error:', err);
      setSaveStatus('error');
      setStatusMessage('전송 중 통신 장치 오류가 발생했습니다. Apps Script 주소 및 CORS 권한이 [모든 사용자(Anyone)]로 세팅되었는지 점검해 주세요.');
    }
  };

  const getOptionLabel = (q: QuizQuestion, option: 'a' | 'b' | 'c') => {
    if (option === 'a') return q.option_a;
    if (option === 'b') return q.option_b;
    return q.option_c;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Upper score card with Award badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xs border border-brand-secondary p-8 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-[#eef2e7] text-brand-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Award className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-brand-accent text-xs font-bold tracking-widest uppercase block">DIAGNOSTIC REPORT</span>
          <h2 className="text-2xl font-bold font-serif italic text-brand-primary">
            개념 자가진단 채점 결과
          </h2>
          <div className="flex items-baseline justify-center gap-1.5 mt-2">
            <span className="text-5xl font-black font-serif text-brand-primary">{percentage}</span>
            <span className="text-brand-text/50 font-bold">/ 100 점</span>
          </div>
          <p className="text-brand-text/70 text-sm">
            전체 {questions.length}개 평가 문항 중 <strong className="text-brand-text font-bold">{correctCount}개</strong>를 올바르게 풀이하셨습니다.
          </p>
        </div>

        {/* Level badge */}
        <div className={`p-6 rounded-2xl border text-left space-y-2 ${levelCardColor}`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
            <span className="text-xs font-bold text-brand-accent tracking-wider uppercase">현재 교직 역량 등급</span>
          </div>
          <h4 className={`text-lg font-bold ${levelColor}`}>{resultLevel}</h4>
          <p className="text-xs md:text-sm text-brand-text/80 leading-relaxed font-medium">
            {levelSubtitle}
          </p>
        </div>
      </motion.div>

      {/* Reflection & Sheets storage card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-3xl border border-brand-secondary p-8 shadow-xs space-y-6"
      >
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-primary" />
            성찰 일지 및 자가진단 전송 (Reflection Log)
          </h3>
          <p className="text-sm text-brand-text/70 leading-normal">
            단순히 정답을 맞히는 것을 넘어, 예비 교사로서 인공지능 시대를 마주하며 느낀 <strong>성찰, 교육 지도 방향, 다짐 한마디</strong>를 적어주세요. 작성 후 제출하면 구글 스프레드시트에 영구 저장됩니다.
          </p>
        </div>

        <form onSubmit={handleSaveResult} className="space-y-4">
          <div className="space-y-1.5">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="예: 학생들이 생성형 AI의 환각(할루시네이션) 현상을 명확히 비판적으로 수용하도록, 교육 설계 시 교차 검증을 포함한 디지털 시민성 수업을 적극 구성하겠다는 다짐을 하게 되었습니다."
              rows={4}
              className="w-full px-4 py-3 border border-brand-secondary bg-brand-bg/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl text-sm focus:outline-none leading-relaxed transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
            <div className="text-xs text-brand-text/60 text-left flex-1 leading-snug">
              {!appsScriptUrl ? (
                <span className="text-brand-accent flex items-start gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  스프레드시트 연동 URL이 꺼져있어 로컬 브라우저에 임시 전송됩니다. 우측 상단 ⚙️ 아이콘에서 연동 주소를 등록해 보세요!
                </span>
              ) : (
                <span className="text-[#5c6b41] flex items-start gap-1 font-medium">
                  <FileSpreadsheet className="w-4 h-4 shrink-0 mt-0.5" />
                  연동된 스프레드시트로 결과가 저장됩니다.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-xs flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
                saveStatus === 'saved' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs' 
                  : saveStatus === 'saving'
                  ? 'bg-brand-secondary text-brand-text/40 cursor-wait'
                  : 'bg-brand-primary hover:bg-[#7a8b4f] active:bg-[#6b7b43]'
              }`}
            >
              <Send className="w-4 h-4" />
              {saveStatus === 'saving' ? '제출 전송 중...' : saveStatus === 'saved' ? '결과 전송 완료!' : '결과 및 성찰일지 제출'}
            </button>
          </div>

          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                saveStatus === 'saved' ? 'bg-[#eef2e7] text-[#5c6b41] border border-brand-primary/20' :
                saveStatus === 'error' ? 'bg-[#fdfaf0] text-brand-accent border border-brand-accent/20' :
                'bg-[#eef2e7] text-[#5c6b41] border border-brand-primary/20'
              }`}
            >
              {statusMessage}
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Review Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-brand-text">
          문항별 정오답 분석 및 피드백 개요
        </h3>

        <div className="space-y-5">
          {questions.map((q, idx) => {
            const userAnswer = userAnswers[q.id];
            const isCorrect = userAnswer === q.answer;

            return (
              <div 
                key={q.id}
                className={`p-6 bg-white rounded-3xl border ${
                  isCorrect ? 'border-brand-primary/30 shadow-xs' : 'border-brand-accent/30 bg-[#fdfaf0]/40 shadow-xs'
                } space-y-4`}
              >
                {/* Review Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif italic font-bold text-brand-accent">QUESTION {idx + 1}</span>
                  <div className="flex items-center gap-1 text-sm font-bold">
                    {isCorrect ? (
                      <span className="text-[#5c6b41] flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        정답
                      </span>
                    ) : (
                      <span className="text-brand-accent flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        오답
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <h4 className="text-base font-bold text-brand-text leading-snug">
                  {q.question}
                </h4>

                {/* Selected Answers block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
                  <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-secondary">
                    <span className="text-brand-text/40 block text-[10px] uppercase font-bold tracking-wide">선생님의 선택</span>
                    <span className={`font-semibold block mt-1 ${isCorrect ? 'text-[#5c6b41]' : 'text-brand-accent'}`}>
                      [{userAnswer.toUpperCase()}] {getOptionLabel(q, userAnswer)}
                    </span>
                  </div>

                  {!isCorrect && (
                    <div className="p-3.5 rounded-xl bg-[#eef2e7]/60 border border-brand-primary/20">
                      <span className="text-[#5c6b41] block text-[10px] uppercase font-bold tracking-wide">정답 기준</span>
                      <span className="font-semibold block mt-1 text-[#5c6b41]">
                        [{q.answer.toUpperCase()}] {getOptionLabel(q, q.answer)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Feedback Box */}
                <div className="p-4 bg-[#eef2e7] rounded-2xl border border-brand-primary/20 text-xs md:text-sm leading-relaxed text-[#5c6b41] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#5c6b41] tracking-wider block">학습 피드백</span>
                  <p>{q.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onRestart}
          className="px-8 py-3.5 bg-brand-secondary/80 hover:bg-brand-secondary text-brand-text font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-brand-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          처음으로 돌아가기 (다시 풀기)
        </button>
      </div>
    </div>
  );
}
