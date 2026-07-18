import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Sparkles, Database, BookOpen, FileText } from 'lucide-react';
import { DEFAULT_QUESTIONS } from './data/defaultQuestions';
import { QuizQuestion, AppSettings } from './types';
import SettingsPanel from './components/SettingsPanel';
import QuizStart from './components/QuizStart';
import QuizPlay from './components/QuizPlay';
import QuizFeedback from './components/QuizFeedback';

export default function App() {
  // --- States ---
  const [alias, setAlias] = useState('');
  const [quizState, setQuizState] = useState<'start' | 'play' | 'feedback'>('start');
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_QUESTIONS);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'a' | 'b' | 'c'>>({});
  
  // App settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ai_quiz_settings');
    return saved 
      ? JSON.parse(saved) 
      : { appsScriptUrl: '', useSheetsData: false };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'fallback'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // --- Syncing questions from Google Sheets ---
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!settings.useSheetsData || !settings.appsScriptUrl) {
        setQuestions(DEFAULT_QUESTIONS);
        setSyncStatus('idle');
        return;
      }

      setIsLoading(true);
      setSyncStatus('idle');
      try {
        const response = await fetch(settings.appsScriptUrl, { method: 'GET' });
        if (!response.ok) {
          throw new Error('네트워크 응답 사양이 부적합합니다.');
        }
        const result = await response.json();
        
        if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
          // Format keys to lowercase just in case
          const formatted: QuizQuestion[] = result.data.map((item: any) => ({
            id: String(item.id || item.ID || ''),
            question: String(item.question || item.QUESTION || ''),
            option_a: String(item.option_a || item.OPTION_A || ''),
            option_b: String(item.option_b || item.OPTION_B || ''),
            option_c: String(item.option_c || item.OPTION_C || ''),
            answer: String(item.answer || item.ANSWER || 'a').toLowerCase() as 'a' | 'b' | 'c',
            feedback: String(item.feedback || item.FEEDBACK || '')
          }));
          
          setQuestions(formatted);
          setSyncStatus('success');
          setSyncMessage(`스프레드시트에서 ${formatted.length}개의 문제를 성공적으로 불러왔습니다!`);
        } else {
          throw new Error('데이터 형식이 다르거나 비어있습니다.');
        }
      } catch (err: any) {
        console.error('Failed to sync questions from sheet:', err);
        setQuestions(DEFAULT_QUESTIONS);
        setSyncStatus('fallback');
        setSyncMessage('스프레드시트 퀴즈 동기화에 실패하여 기본 퀴즈 데이터셋으로 안전하게 복구했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [settings.useSheetsData, settings.appsScriptUrl]);

  // --- Handlers ---
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ai_quiz_settings', JSON.stringify(newSettings));
  };

  const handleStartQuiz = (userAlias: string) => {
    setAlias(userAlias);
    setUserAnswers({});
    setQuizState('play');
  };

  const handleSubmitQuiz = (answers: Record<string, 'a' | 'b' | 'c'>) => {
    setUserAnswers(answers);
    setQuizState('feedback');
  };

  const handleRestart = () => {
    setUserAnswers({});
    setQuizState('start');
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col antialiased">
      {/* Top Navigation Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-brand-secondary/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-brand-primary text-white p-2.5 rounded-xl shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif italic font-bold text-lg md:text-xl text-brand-primary leading-tight tracking-tight">
                Generative AI Essentials
              </h1>
              <p className="text-[10px] text-brand-accent font-semibold uppercase tracking-wider">
                Educator Self-Diagnosis Tool
              </p>
            </div>
          </div>

          {/* Controls & Badges */}
          <div className="flex items-center gap-3">
            {/* Database Sync Status Badge */}
            {settings.useSheetsData && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#eef2e7] border border-brand-primary/20 rounded-lg text-xs font-semibold text-[#5c6b41] animate-fade-in">
                <Database className="w-3.5 h-3.5" />
                <span>스프레드시트 동기화 중</span>
              </div>
            )}

            {/* Settings Trigger Gear */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 hover:bg-brand-secondary/40 text-brand-text hover:text-brand-primary rounded-xl transition-all border border-brand-secondary cursor-pointer flex items-center gap-1 text-xs font-medium"
              title="Spreadsheet settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">연동 설정</span>
            </button>
          </div>
        </div>
      </header>

      {/* Synchronizer Status Notification banner */}
      {syncMessage && (
        <div className={`text-center py-2.5 px-4 text-xs font-medium border-b ${
          syncStatus === 'success' 
            ? 'bg-[#eef2e7] text-[#5c6b41] border-brand-primary/20' 
            : 'bg-[#fdfaf0] text-brand-accent border-brand-accent/20'
        }`}>
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{syncMessage}</span>
            <button 
              onClick={() => setSyncMessage('')} 
              className="ml-2 hover:underline text-[10px] uppercase font-bold text-neutral-400 hover:text-neutral-600"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Main Container Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col justify-center">
        {isLoading ? (
          <div className="text-center py-20 space-y-4">
            <RefreshCw className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-brand-text font-bold text-lg">스프레드시트 동기화 중</p>
              <p className="text-neutral-400 text-xs">최신 퀴즈 데이터를 다운로드하고 있습니다. 잠시만 기다려 주세요.</p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {quizState === 'start' && (
              <QuizStart 
                onStart={handleStartQuiz} 
                questionsCount={questions.length} 
              />
            )}

            {quizState === 'play' && (
              <QuizPlay
                questions={questions}
                userAlias={alias}
                onSubmitQuiz={handleSubmitQuiz}
                onGoBack={handleRestart}
              />
            )}

            {quizState === 'feedback' && (
              <QuizFeedback
                questions={questions}
                userAlias={alias}
                userAnswers={userAnswers}
                appsScriptUrl={settings.appsScriptUrl}
                onRestart={handleRestart}
              />
            )}
          </div>
        )}
      </main>

      {/* Educational branding footer */}
      <footer className="bg-white/80 border-t border-brand-secondary/60 py-6 text-center text-xs text-neutral-400 mt-auto">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-brand-text/80 flex items-center justify-center gap-1">
            <FileText className="w-3.5 h-3.5 text-brand-primary" />
            생성형 AI 기본 개념 교육 자가진단 (Pre-service Teacher Training Kit)
          </p>
          <p className="leading-relaxed text-neutral-400 max-w-xl mx-auto">
            이 도구는 구글 스프레드시트의 원격 연동을 통해 손쉽게 자가평가하고, 교사 성찰 일지를 보존할 수 있습니다.<br />
            개인정보는 보존되지 않으며, 누적 결과는 오직 지정된 구글 스프레드시트에만 보관됩니다.
          </p>
        </div>
      </footer>

      {/* Settings Modal overlay */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
