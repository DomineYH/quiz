import { useState, useEffect } from 'react';
import { Settings, X, Check, AlertCircle, RefreshCw, Database, Link } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export default function SettingsPanel({ isOpen, onClose, settings, onSaveSettings }: SettingsPanelProps) {
  const [url, setUrl] = useState(settings.appsScriptUrl);
  const [useSheets, setUseSheets] = useState(settings.useSheetsData);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setUrl(settings.appsScriptUrl);
    setUseSheets(settings.useSheetsData);
  }, [settings]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url) {
      setTestStatus('error');
      setTestMessage('구글 Apps Script 웹앱 URL을 입력해 주세요.');
      return;
    }

    if (!url.startsWith('https://script.google.com/')) {
      setTestStatus('error');
      setTestMessage('올바른 구글 Apps Script URL 형식이 아닙니다.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('연동을 테스트하는 중...');

    try {
      // Apps Script doGet test call
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.status === 'success') {
        setTestStatus('success');
        setTestMessage(`성공! 스프레드시트와 정상 연결되었습니다. (불러온 문항 수: ${result.data?.length || 0}개)`);
      } else {
        setTestStatus('error');
        setTestMessage(`실패: ${result.message || '알 수 없는 응답 구조입니다.'}`);
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      // Mode 'no-cors' testing or standard fetch issue due to CORS redirect.
      // Often, because of Apps Script redirect, standard fetch might throw CORS if the script wasn't deployed with "Anyone".
      setTestStatus('error');
      setTestMessage('CORS 제한 또는 네트워크 요인으로 직접 조회가 제한될 수 있습니다. Apps Script의 배포 설정을 [모든 사용자(Anyone)]로 설정하셨는지 확인해 주세요.');
    }
  };

  const handleSave = () => {
    onSaveSettings({
      appsScriptUrl: url.trim(),
      useSheetsData: useSheets
    });
    onClose();
  };

  return (
    <div id="settings-backdrop" className="fixed inset-0 bg-brand-text/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="settings-container" 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-brand-secondary flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-secondary/60 flex items-center justify-between bg-brand-bg/50">
          <div className="flex items-center gap-2 text-brand-primary font-semibold">
            <Settings className="w-5 h-5" />
            <span className="text-lg font-bold font-serif italic">연동 설정</span>
          </div>
          <button 
            onClick={onClose}
            className="text-brand-text/40 hover:text-brand-text transition-colors p-1 rounded-lg hover:bg-brand-secondary/30"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[80vh]">
          <p className="text-sm text-brand-text/70 leading-relaxed">
            구글 스프레드시트와 연동하여 퀴즈 문제를 동적으로 다운로드하고, 학생들의 평가 결과를 자동으로 스프레드시트에 기록할 수 있습니다. 자세한 설정 가이드는 <code className="bg-brand-bg text-brand-primary px-1 py-0.5 rounded text-xs font-mono">appscript.md</code> 파일을 참고해 주세요.
          </p>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text/90 flex items-center gap-1.5">
              <Link className="w-4 h-4 text-brand-primary" />
              Apps Script 웹앱 URL
            </label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full text-xs px-3 py-2 border border-brand-secondary bg-brand-bg/30 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary font-mono"
            />
          </div>

          {/* Connect Test Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 text-xs font-medium text-brand-text bg-brand-bg hover:bg-brand-secondary/50 active:bg-brand-secondary rounded-lg border border-brand-secondary transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {testStatus === 'testing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-primary" />
              ) : (
                <Database className="w-3.5 h-3.5 text-brand-primary" />
              )}
              연동 상태 테스트
            </button>
            <div className="text-xs flex-1">
              {testStatus === 'success' && (
                <span className="text-[#5c6b41] flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  연동 정상
                </span>
              )}
              {testStatus === 'error' && (
                <span className="text-brand-accent flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  연동 오류
                </span>
              )}
            </div>
          </div>

          {/* Test Status Message block */}
          {testMessage && (
            <div className={`p-3 rounded-lg text-xs leading-relaxed ${
              testStatus === 'success' ? 'bg-[#eef2e7] text-[#5c6b41] border border-brand-primary/20' :
              testStatus === 'error' ? 'bg-[#fdfaf0] text-brand-accent border border-brand-accent/20' :
              'bg-[#eef2e7] text-[#5c6b41] border border-brand-primary/20'
            }`}>
              {testMessage}
            </div>
          )}

          <hr className="border-brand-secondary/60" />

          {/* Sheets Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-brand-text block">스프레드시트 퀴즈 동기화</span>
              <span className="text-xs text-brand-text/50 block leading-normal">
                비활성화 시 내장된 기본 문제 5개를 사용하고, 활성화 시 스프레드시트의 <code className="bg-brand-bg px-1 py-0.5 rounded text-xs text-brand-primary">quiz</code> 시트 데이터를 다운로드해 문제를 표시합니다.
              </span>
            </div>
            <button
              onClick={() => {
                if (!url) {
                  alert('웹앱 URL을 먼저 입력해 주세요.');
                  return;
                }
                setUseSheets(!useSheets);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                useSheets ? 'bg-brand-primary' : 'bg-brand-secondary'
              }`}
              role="switch"
              aria-checked={useSheets}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  useSheets ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-brand-bg/50 border-t border-brand-secondary/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-brand-text/80 hover:bg-brand-secondary/40 active:bg-brand-secondary rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-brand-primary hover:bg-[#7a8b4f] active:bg-[#6b7b43] rounded-lg font-semibold shadow-xs hover:shadow-md transition-all"
          >
            저장 후 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
