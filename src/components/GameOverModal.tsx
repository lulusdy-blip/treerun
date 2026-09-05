import React from 'react';
import { Skull, RotateCcw, Sprout, ShieldAlert, Home } from 'lucide-react';
import type { StudentRecord } from '../types';

interface GameOverModalProps {
  record: StudentRecord;
  runStats: {
    seedsCollected: number;
    monstersDefeated: number;
    distance: number;
  };
  onRetryRun: () => void;
  onReturnToVillage: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  record,
  runStats,
  onRetryRun,
  onReturnToVillage,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-sm bg-neutral-900 rounded-3xl shadow-2xl border-4 border-rose-600 overflow-hidden text-white text-center p-6">
        <div className="w-16 h-16 mx-auto mb-3 bg-rose-950/80 rounded-full flex items-center justify-center border-2 border-rose-500">
          <Skull className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-rose-500 mb-1">
          게임 오버
        </h1>
        <p className="text-xs text-neutral-400 mb-4">
          탄소 괴물과 부딪혀 모든 하트를 소모했습니다!
        </p>

        {/* Run Stats */}
        <div className="bg-neutral-800 rounded-2xl p-3.5 mb-5 space-y-2 text-xs text-left border border-neutral-700">
          <div className="flex justify-between items-center text-neutral-300">
            <span>달린 거리:</span>
            <span className="font-mono font-bold text-white text-sm">{runStats.distance}m</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span>획득한 씨앗:</span>
            <span className="font-mono font-bold text-sm">+{runStats.seedsCollected}개</span>
          </div>
          <div className="flex justify-between items-center text-sky-400">
            <span>정화한 탄소 괴물:</span>
            <span className="font-mono font-bold text-sm">{runStats.monstersDefeated}마리</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRetryRun}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 active:scale-95 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2 border-b-4 border-rose-900"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 달리기</span>
          </button>

          <button
            onClick={onReturnToVillage}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-neutral-700"
          >
            <Home className="w-4 h-4" />
            <span>마을로 가기 (씨앗 심기)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
