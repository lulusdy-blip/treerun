import React, { useState } from 'react';
import { X, Sparkles, Ticket, Gift, Check, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { StudentRecord } from '../types';
import { SKIN_ITEMS, WEAPON_ITEMS } from '../data/climateData';
import { playAttackSound } from '../utils/audio';

interface GachaModalProps {
  record: StudentRecord;
  onUpdateRecord: (updated: StudentRecord) => void;
  onClose: () => void;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  record,
  onUpdateRecord,
  onClose,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [prize, setPrize] = useState<{ type: 'skin' | 'weapon'; item: any } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const drawGacha = () => {
    if (record.gachaTickets < 1 && record.seeds < 10) {
      setMessage('뽑기권 또는 씨앗(10개)이 부족합니다! 나무를 심어 온난화 게이지를 낮추면 뽑기권을 얻을 수 있습니다.');
      return;
    }

    setIsOpening(true);
    setPrize(null);
    setMessage(null);
    playAttackSound();

    setTimeout(() => {
      // Pick random skin or weapon
      const pool = [
        ...SKIN_ITEMS.map((s) => ({ type: 'skin' as const, item: s })),
        ...WEAPON_ITEMS.map((w) => ({ type: 'weapon' as const, item: w })),
      ];
      const selected = pool[Math.floor(Math.random() * pool.length)];

      const newUnlockedSkins = [...record.unlockedSkins];
      const newUnlockedWeapons = [...record.unlockedWeapons];

      if (selected.type === 'skin' && !newUnlockedSkins.includes(selected.item.id)) {
        newUnlockedSkins.push(selected.item.id);
      } else if (selected.type === 'weapon' && !newUnlockedWeapons.includes(selected.item.id)) {
        newUnlockedWeapons.push(selected.item.id);
      }

      // Deduct ticket first, else 10 seeds
      const newTickets = record.gachaTickets > 0 ? record.gachaTickets - 1 : 0;
      const newSeeds = record.gachaTickets > 0 ? record.seeds : Math.max(0, record.seeds - 10);

      const updated: StudentRecord = {
        ...record,
        gachaTickets: newTickets,
        seeds: newSeeds,
        unlockedSkins: newUnlockedSkins,
        unlockedWeapons: newUnlockedWeapons,
      };

      onUpdateRecord(updated);
      setPrize(selected);
      setIsOpening(false);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-4 border-red-800 overflow-hidden text-neutral-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-yellow-300 animate-bounce" />
            <h2 className="text-xl font-black">🎁 스킨 / 무기 뽑기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-red-800/60 hover:bg-red-800 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-xl border border-amber-300 font-bold text-sm">
            <Ticket className="w-5 h-5 text-amber-600" />
            <span>보유 뽑기권: {record.gachaTickets}장</span>
            <span className="text-neutral-400">|</span>
            <span className="text-emerald-700">보유 씨앗: {record.seeds}개</span>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed max-w-xs">
            나무를 심어 온난화 게이지(100)를 0까지 내리면 <strong>스킨 뽑기권 1회</strong>를 획득합니다! 귀여운 스킨과 정화 무기를 획득해보세요.
          </p>

          {/* Gacha Chest Stage */}
          <div className="w-44 h-44 bg-gradient-to-b from-amber-100 to-amber-200 rounded-2xl border-4 border-amber-800 flex flex-col items-center justify-center p-4 shadow-inner relative overflow-hidden">
            {isOpening ? (
              <div className="animate-spin text-5xl">🎁</div>
            ) : prize ? (
              <div className="animate-scale-up flex flex-col items-center">
                <span className="text-5xl mb-1">
                  {prize.type === 'skin' ? '✨' : prize.item.icon || '⚔️'}
                </span>
                <span className="text-xs font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded mb-1">
                  {prize.type === 'skin' ? '스킨 당첨!' : '무기 당첨!'}
                </span>
                <span className="font-black text-sm text-neutral-900">{prize.item.name}</span>
                <span className="text-[10px] text-neutral-600 mt-0.5">{prize.item.description}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Gift className="w-16 h-16 text-red-600 drop-shadow-md animate-pulse" />
                <span className="text-xs font-bold text-amber-950 mt-2">두근두근 보물 상자</span>
              </div>
            )}
          </div>

          {message && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-800">
              {message}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={drawGacha}
            disabled={isOpening || (record.gachaTickets < 1 && record.seeds < 10)}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white font-black text-base shadow-lg disabled:opacity-40 transition flex items-center justify-center gap-2 border-b-4 border-red-900"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>
              {record.gachaTickets > 0 ? '뽑기권 1장으로 뽑기' : '씨앗 10개로 뽑기'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
