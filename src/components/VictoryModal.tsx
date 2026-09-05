import React, { useEffect } from 'react';
import { Trophy, Trees, Heart, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { StudentRecord } from '../types';
import { playVictorySound } from '../utils/audio';

interface VictoryModalProps {
  record: StudentRecord;
  onRestartWithMoreHearts: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  record,
  onRestartWithMoreHearts,
}) => {
  useEffect(() => {
    playVictorySound();
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const nextMaxHearts = record.maxHearts + 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-yellow-500 overflow-hidden text-neutral-800 text-center p-6 sm:p-8">
        {/* Trophy icon */}
        <div className="w-20 h-20 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-md">
          <Trophy className="w-12 h-12 text-yellow-600 animate-bounce" />
        </div>

        {/* Victory Message as mandated */}
        <h1 className="text-3xl sm:text-4xl font-black text-amber-950 mb-2">
          🎉 이겼습니다!
        </h1>

        <p className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full inline-block mb-4 border border-emerald-300">
          목표 산림 면적 65% 달성 완료!
        </p>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
          축하합니다, <strong>{record.nickname}</strong> 숲지킴이님!<br />
          정성껏 나무를 심어 황폐해진 지구의 숲을 다시 푸르게 되살려냈습니다.
        </p>

        {/* Reward & Heart Increase Card */}
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center gap-2 font-black text-rose-950 text-sm mb-1.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>다음 라운드 보너스 하트 증가!</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            규칙에 따라 <strong>'다시 하기'</strong>를 누르면 기존 하트 {record.maxHearts}개에서{' '}
            <strong>2개가 늘어나 총 {nextMaxHearts}개의 하트</strong>로 더 든든하게 시작합니다!
          </p>
        </div>

        {/* '다시 하기' button as mandated */}
        <button
          onClick={onRestartWithMoreHearts}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 active:scale-95 text-black font-black text-lg shadow-xl transition flex items-center justify-center gap-2 border-b-4 border-amber-800"
        >
          <span>다시 하기 (하트 +2개 지급!)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
