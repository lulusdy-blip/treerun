import React, { useState } from 'react';
import { X, Sprout, Trees, Sparkles, Award, Ticket, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { StudentRecord } from '../types';
import { playPlantTreeSound } from '../utils/audio';

interface PlantTreeModalProps {
  record: StudentRecord;
  onUpdateRecord: (updated: StudentRecord) => void;
  onTriggerVictory: () => void;
  onClose: () => void;
}

export const PlantTreeModal: React.FC<PlantTreeModalProps> = ({
  record,
  onUpdateRecord,
  onTriggerVictory,
  onClose,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const plantOneTree = () => {
    if (record.seeds < 1) {
      setNotification('씨앗이 부족합니다! 달리기를 통해 씨앗 봉투를 모아보세요.');
      return;
    }

    playPlantTreeSound();

    let newWarmingGauge = Math.max(0, record.warmingGauge - 10);
    let newForestArea = Number(Math.min(65.0, record.forestArea + 0.1).toFixed(1));
    let newGachaTickets = record.gachaTickets;
    let newTotalTrees = record.treesPlanted + 1;
    let newSeeds = record.seeds - 1;
    let newScore = record.totalScore + 25;
    let notice = `나무 1그루를 심었습니다! 지구 온난화 게이지가 내려가고(${newWarmingGauge}/100) 산림 면적이 늘어났습니다(${newForestArea}%).`;

    // Reward gacha ticket when warming gauge reaches 0 or every 5 trees
    if ((newWarmingGauge === 0 && record.warmingGauge > 0) || newTotalTrees % 5 === 0) {
      newGachaTickets += 1;
      notice = newWarmingGauge === 0 && record.warmingGauge > 0
        ? '🎉 온난화 게이지 완전 정화(0) 달성! 스킨 뽑기권 1장 획득! 숲을 계속 푸르게 가꿔보세요!'
        : `🎉 나무 5그루 누적 식재 기념! 스킨 뽑기권 1장 획득! (총 ${newTotalTrees}그루)`;

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Dynamic temperature based on correlation (-0.824)
    // As forest area increases from 50 towards 65, temperature cools towards safe levels
    const newEarthTemp = Math.max(14.0, Number((15.2 - (newForestArea - 50) * 0.08).toFixed(2)));

    const updated: StudentRecord = {
      ...record,
      warmingGauge: newWarmingGauge,
      forestArea: newForestArea,
      gachaTickets: newGachaTickets,
      treesPlanted: newTotalTrees,
      seeds: newSeeds,
      totalScore: newScore,
      earthTemp: newEarthTemp,
    };

    onUpdateRecord(updated);
    setNotification(notice);

    // Rule: "산림 면적이 65가 되면, '이겼습니다' 라는 멘트가 뜨고..."
    if (newForestArea >= 65.0) {
      setTimeout(() => {
        onTriggerVictory();
      }, 600);
    }
  };

  const plantAllTrees = () => {
    if (record.seeds < 1) {
      setNotification('씨앗이 부족합니다!');
      return;
    }

    playPlantTreeSound();

    let gauge = record.warmingGauge;
    let forest = record.forestArea;
    let tickets = record.gachaTickets;
    let trees = record.treesPlanted;
    const count = record.seeds;

    for (let i = 0; i < count; i++) {
      gauge = Math.max(0, gauge - 10);
      trees += 1;
      forest = Number(Math.min(65.0, forest + 0.1).toFixed(1));
      if (trees % 5 === 0) {
        tickets += 1;
      }
    }

    const newEarthTemp = Math.max(14.0, Number((15.2 - (forest - 50) * 0.08).toFixed(2)));

    const updated: StudentRecord = {
      ...record,
      warmingGauge: gauge,
      forestArea: forest,
      gachaTickets: tickets,
      treesPlanted: trees,
      seeds: 0,
      totalScore: record.totalScore + count * 25,
      earthTemp: newEarthTemp,
    };

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
    });

    onUpdateRecord(updated);
    setNotification(
      `나무 ${count}그루를 모두 심었습니다! 온난화 게이지가 ${gauge}/100으로 완화되고 산림면적이 ${forest}%로 확장되었습니다.`
    );

    if (forest >= 65.0) {
      setTimeout(() => {
        onTriggerVictory();
      }, 600);
    }
  };

  const progressToTarget = Math.min(100, Math.max(0, ((record.forestArea - 50) / (65 - 50)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-4 border-emerald-800 overflow-hidden text-neutral-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees className="w-6 h-6 text-emerald-200 animate-bounce" />
            <h2 className="text-xl font-black">🌱 씨앗 심기 및 숲 가꾸기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Rule Card */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-300 text-xs sm:text-sm text-emerald-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>기후 과학 반영 규칙</span>
            </div>
            <p>• 나무 1그루를 심을 때마다 <strong>지구 온난화 게이지가 10씩 내려가고</strong>(-10), <strong>산림 면적이 +0.1%</strong> 늘어납니다.</p>
            <p>• 나무를 심을수록 온난화 게이지는 0을 향해 지속적으로 감소하며 <strong>절대 다시 올라가지 않습니다!</strong></p>
            <p>• 나무를 <strong>5그루 심을 때마다</strong> 스킨/무기 <strong>뽑기권 1장</strong>이 지급됩니다.</p>
            <p>• 산림 면적이 <strong>65%</strong>에 도달하면 대승리를 거둡니다! (태초 마을 50%)</p>
          </div>

          {/* Current Status Display */}
          <div className="grid grid-cols-2 gap-3">
            {/* 산림 면적 */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 text-center">
              <span className="text-xs font-bold text-amber-800 block">현재 산림 면적</span>
              <span className="text-2xl font-black text-amber-950 font-mono">
                {record.forestArea.toFixed(1)}%
              </span>
              <div className="w-full bg-amber-200 h-2 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressToTarget}%` }}
                />
              </div>
              <span className="text-[10px] text-amber-700 mt-1 block">목표 65.0%까지 {(65 - record.forestArea).toFixed(1)}% 남음</span>
            </div>

            {/* 온난화 게이지 */}
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-300 text-center">
              <span className="text-xs font-bold text-rose-800 block">지구 온난화 게이지</span>
              <span className="text-2xl font-black text-rose-950 font-mono">
                {record.warmingGauge} / 100
              </span>
              <div className="w-full bg-rose-200 h-2 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${record.warmingGauge}%` }}
                />
              </div>
              <span className="text-[10px] text-rose-700 mt-1 block flex items-center justify-center gap-0.5">
                <ArrowDown className="w-3 h-3" /> 나무를 심어 0으로 냉각 (0 유지)
              </span>
            </div>
          </div>

          {/* Inventory bar */}
          <div className="flex items-center justify-between bg-neutral-100 p-3 rounded-xl border border-neutral-200 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>보유 씨앗: {record.seeds}개</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-800">
              <Ticket className="w-5 h-5 text-amber-600" />
              <span>보유 뽑기권: {record.gachaTickets}장</span>
            </div>
          </div>

          {/* Notification feedback */}
          {notification && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 animate-fade-in text-center">
              {notification}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={plantOneTree}
              disabled={record.seeds < 1}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm sm:text-base shadow-md disabled:opacity-40 transition flex items-center justify-center gap-1.5"
            >
              <Sprout className="w-5 h-5" />
              <span>나무 1그루 심기 (씨앗 1개)</span>
            </button>

            <button
              onClick={plantAllTrees}
              disabled={record.seeds < 1}
              className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm sm:text-base shadow-md disabled:opacity-40 transition flex items-center justify-center gap-1.5"
            >
              <Trees className="w-5 h-5" />
              <span>모두 심기 ({record.seeds}그루)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
