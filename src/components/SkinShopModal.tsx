import React, { useState } from 'react';
import { X, Sparkles, Check, Sprout, Shirt } from 'lucide-react';
import type { StudentRecord } from '../types';
import { SKIN_ITEMS } from '../data/climateData';

interface SkinShopModalProps {
  record: StudentRecord;
  onUpdateRecord: (updated: StudentRecord) => void;
  onClose: () => void;
}

export const SkinShopModal: React.FC<SkinShopModalProps> = ({
  record,
  onUpdateRecord,
  onClose,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const equipSkin = (skinId: string) => {
    const updated: StudentRecord = {
      ...record,
      equippedSkinId: skinId,
    };
    onUpdateRecord(updated);
    setNotification('스킨을 변경했습니다!');
  };

  const buySkin = (skin: typeof SKIN_ITEMS[0]) => {
    if (record.seeds < skin.seedCost) {
      setNotification(`씨앗이 부족합니다! (필요: ${skin.seedCost}개)`);
      return;
    }

    const updated: StudentRecord = {
      ...record,
      seeds: record.seeds - skin.seedCost,
      unlockedSkins: [...record.unlockedSkins, skin.id],
      equippedSkinId: skin.id,
    };
    onUpdateRecord(updated);
    setNotification(`${skin.name} 스킨을 획득하고 착용했습니다!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-4 border-[#800020] overflow-hidden text-neutral-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800020] to-[#a30029] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-6 h-6 text-rose-200" />
            <h2 className="text-xl font-black">👕 상점 / 스킨 변경</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-950 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs sm:text-sm font-bold text-rose-950">
            <span>산소 모자를 쓴 귀여운 캐릭터의 의상과 모자를 교체해보세요!</span>
            <span className="flex items-center gap-1 text-emerald-800 shrink-0 ml-2">
              <Sprout className="w-4 h-4 text-emerald-600" /> {record.seeds}개
            </span>
          </div>

          {notification && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 text-center">
              {notification}
            </div>
          )}

          {/* Skin Grid */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {SKIN_ITEMS.map((skin) => {
              const isUnlocked = record.unlockedSkins.includes(skin.id);
              const isEquipped = record.equippedSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`p-3.5 rounded-xl border-2 transition flex items-center justify-between ${
                    isEquipped
                      ? 'border-[#800020] bg-rose-50/70'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual representation */}
                    <div
                      className="w-12 h-12 rounded-xl border-2 border-black flex flex-col items-center justify-center relative shadow-sm"
                      style={{ backgroundColor: skin.bodyColor }}
                    >
                      <div
                        className="w-6 h-3 rounded-t-full border border-black absolute top-1"
                        style={{ backgroundColor: skin.hatColor }}
                      />
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-neutral-900">
                          {skin.name}
                        </span>
                        {isEquipped && (
                          <span className="text-[10px] font-bold bg-[#800020] text-white px-2 py-0.5 rounded-full">
                            착용중
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{skin.description}</p>
                      <span className="text-[11px] font-bold text-[#800020]">
                        {skin.badge}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 착용완료
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => equipSkin(skin.id)}
                        className="py-1.5 px-3 rounded-lg bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold transition shadow"
                      >
                        입기
                      </button>
                    ) : (
                      <button
                        onClick={() => buySkin(skin)}
                        disabled={record.seeds < skin.seedCost}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition shadow flex items-center gap-1"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span>씨앗 {skin.seedCost}개로 교환</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
