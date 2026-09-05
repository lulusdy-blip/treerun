import React, { useState } from 'react';
import { Sparkles, Trees, CloudSun, Database, ArrowRight, UserCheck } from 'lucide-react';
import { loadStudentRecord, saveStudentRecord, DEFAULT_INITIAL_RECORD } from '../firebase';
import type { StudentRecord } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (record: StudentRecord) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [studentCode, setStudentCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleStart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = studentCode.trim();
    if (!cleanCode) {
      setMessage('관리코드를 입력해 주세요! (예: 5학년1반-07, ECO-2026)');
      return;
    }

    setIsLoading(true);
    setMessage('Firebase 클라우드에서 학생 기록을 불러오는 중...');

    try {
      const existing = await loadStudentRecord(cleanCode);
      if (existing) {
        // Update nickname if provided, or use existing
        const finalNickname = nickname.trim() || existing.nickname || '숲지킴이';
        const updatedRecord: StudentRecord = {
          ...existing,
          nickname: finalNickname,
          lastPlayedAt: new Date().toISOString(),
        };
        await saveStudentRecord(updatedRecord);
        setMessage(`반가워요, ${finalNickname} 학생! 이전 기록(산림 ${existing.forestArea}%, ${existing.currentStage}단계)을 불러왔습니다.`);
        setTimeout(() => {
          onLoginSuccess(updatedRecord);
        }, 500);
      } else {
        // Create brand new record
        const finalNickname = nickname.trim() || '숲지킴이';
        const newRecord: StudentRecord = {
          studentCode: cleanCode,
          nickname: finalNickname,
          ...DEFAULT_INITIAL_RECORD,
          lastPlayedAt: new Date().toISOString(),
        };
        await saveStudentRecord(newRecord);
        setMessage(`새로운 탐험가 등록 완료! 환영합니다, ${finalNickname} 학생!`);
        setTimeout(() => {
          onLoginSuccess(newRecord);
        }, 500);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const finalNickname = nickname.trim() || '숲지킴이';
      const fallbackRecord: StudentRecord = {
        studentCode: cleanCode,
        nickname: finalNickname,
        ...DEFAULT_INITIAL_RECORD,
        lastPlayedAt: new Date().toISOString(),
      };
      onLoginSuccess(fallbackRecord);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (code: string, name: string) => {
    setStudentCode(code);
    setNickname(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-emerald-300 to-green-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-amber-900 p-6 sm:p-8 text-neutral-800 relative overflow-hidden">
        {/* Decorative Top Banner */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trees className="w-7 h-7 text-emerald-600 animate-bounce" />
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
            기후 데이터 교육용 러닝 게임
          </span>
          <CloudSun className="w-7 h-7 text-amber-500" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-amber-950 tracking-tight mb-1">
          🌲 나무런
        </h1>
        <p className="text-center text-neutral-600 text-sm mb-6">
          산림을 늘리고 탄소 괴물을 정화하여 지구를 지켜라!
        </p>

        {/* Login Form */}
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">
              🏷️ 관리코드 (학생 고유 코드) <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-student-code"
              type="text"
              placeholder="예: 5학년1반-15, ECO-2026"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:border-amber-600 focus:outline-none font-mono text-base font-semibold bg-amber-50/50"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              * 동일한 관리코드를 입력하면 다른 기기에서도 기록이 그대로 이어집니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">
              😊 학생 닉네임 (선택)
            </label>
            <input
              id="input-nickname"
              type="text"
              placeholder="예: 산소히어로, 초록이"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-emerald-500 focus:outline-none text-base"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-1">
            <span className="text-xs font-semibold text-neutral-500 block mb-1.5">
              빠른 예시 코드 선택:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSelect('숲지킴이-01', '맑은산소')}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 transition"
              >
                숲지킴이-01
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('기후탐험-05', '푸른나무')}
                className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold px-2.5 py-1 rounded-lg border border-sky-200 transition"
              >
                기후탐험-05
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('초등5반-12', '새싹이')}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-lg border border-amber-200 transition"
              >
                초등5반-12
              </button>
            </div>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-medium animate-fade-in flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            id="btn-login-start"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 border-b-4 border-amber-800 disabled:opacity-50"
          >
            {isLoading ? (
              <span>접속 및 데이터 확인 중...</span>
            ) : (
              <>
                <span>탐험 시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Real Data Highlight */}
        <div className="mt-6 pt-4 border-t border-neutral-200 text-xs text-neutral-600 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-700 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>우리가 분석한 Orange3 기후 데이터 반영</span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            • 2010~2022 산림면적(64%→63%) vs CO2 농도(394.9→425ppm)<br />
            • 숲은 그대로인데 탄소는 계속 늘고 있는 현실을 나무 심기로 해결해보세요!
          </p>
        </div>
      </div>
    </div>
  );
};
