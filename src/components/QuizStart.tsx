import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Sparkles, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';

interface QuizStartProps {
  onStart: (alias: string) => void;
  questionsCount: number;
}

export default function QuizStart({ onStart, questionsCount }: QuizStartProps) {
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = alias.trim();
    if (!trimmed) {
      setError('퀴즈를 시작하기 위해 별명을 입력해 주세요.');
      return;
    }
    if (trimmed.length < 2) {
      setError('별명은 최소 2자 이상이어야 합니다.');
      return;
    }
    if (trimmed.length > 12) {
      setError('별명은 최대 12자까지 입력 가능합니다.');
      return;
    }
    setError('');
    onStart(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-3xl shadow-xs border border-brand-secondary p-8 md:p-12 space-y-8 max-w-2xl mx-auto"
    >
      {/* Upper Badge & Welcoming */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#eef2e7] text-[#5c6b41] text-xs font-semibold rounded-full border border-brand-primary/20 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          예비 교사를 위한 개념 자가진단
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-brand-primary tracking-tight leading-tight">
          Generative AI Essentials
        </h1>
        
        <p className="text-brand-text/80 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          예비 교원으로서 미래의 교실에서 직면할 생성형 AI의 기본 동작 원리부터 교육학적 가이드라인, 인공지능 윤리를 자가점검 해보세요.
        </p>
      </div>

      <hr className="border-brand-secondary/60" />

      {/* Core Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-brand-bg border border-brand-secondary flex gap-3">
          <BookOpen className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-brand-text">진단 구성</h3>
            <p className="text-xs text-brand-text/70 mt-1 leading-normal">
              총 {questionsCount}문항으로 구성되어 있으며, 기본 특징, 프롬프트 엔지니어링, 교육적 윤리 쟁점을 다룹니다.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-bg border border-brand-secondary flex gap-3">
          <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-brand-text">개인정보 보호</h3>
            <p className="text-xs text-brand-text/70 mt-1 leading-normal">
              학습 결과 누적 시 성명이나 아이디 대신 오직 별명(Alias)만을 사용하여 안심하고 학습에 참여하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Start Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label htmlFor="user-alias" className="block text-sm font-semibold text-brand-text/95">
            사용하실 닉네임 / 별명을 입력해 주세요
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-brand-primary/60" />
            </div>
            <input
              type="text"
              id="user-alias"
              value={alias}
              onChange={(e) => {
                setAlias(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder="예: 국어예비교사, 희망초등샘, AI러버"
              className="block w-full pl-11 pr-4 py-3 border border-brand-secondary bg-brand-bg/30 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm placeholder-brand-text/40 focus:outline-none transition-all"
            />
          </div>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-brand-accent font-medium flex items-center gap-1 pl-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </motion.p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-4 px-6 bg-brand-primary hover:bg-[#7a8b4f] active:bg-[#6b7b43] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
        >
          개념 퀴즈 시작하기
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* Quick notice */}
      <div className="text-center text-xs text-brand-text/50">
        풀이를 마치면 예비 교사 소감 및 성찰 일지(Reflection)를 작성할 수 있습니다.
      </div>
    </motion.div>
  );
}
