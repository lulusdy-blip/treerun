import React, { useState } from 'react';
import { X, Sword, Shield, Check, Sprout } from 'lucide-react';
import type { StudentRecord } from '../types';
import { WEAPON_ITEMS } from '../data/climateData';

interface WeaponShopModalProps {
  record: StudentRecord;
  onUpdateRecord: (updated: StudentRecord) => void;
  onClose: () => void;
}

export const WeaponShopModal: React.FC<WeaponShopModalProps> = ({
  record,
  onUpdateRecord,
  onClose,
}) => {
  const [notification, setNotification] = useState<string | null>(null);

  const equipWeapon = (weaponId: string) => {
    const updated: StudentRecord = {
      ...record,
      equippedWeaponId: weaponId,
    };
    onUpdateRecord(updated);
    setNotification('무기를 장착했습니다!');
  };

  const buyWeapon = (weapon: typeof WEAPON_ITEMS[0]) => {
    if (record.seeds < weapon.seedCost) {
      setNotification(`씨앗이 부족합니다! (필요: ${weapon.seedCost}개)`);
      return;
    }

    const updated: StudentRecord = {
      ...record,
      seeds: record.seeds - weapon.seedCost,
      unlockedWeapons: [...record.unlockedWeapons, weapon.id],
      equippedWeaponId: weapon.id,
    };
    onUpdateRecord(updated);
    setNotification(`${weapon.name}을(를) 제작 및 장착했습니다!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-4 border-orange-800 overflow-hidden text-neutral-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="w-6 h-6 text-yellow-200" />
            <h2 className="text-xl font-black">📦 무기 상자 (탄소 정화 장비)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-orange-800/60 hover:bg-orange-800 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-300 text-xs sm:text-sm font-bold text-amber-950">
            <span>달리면서 탄소 괴물을 만나면 공격 버튼(또는 스페이스바)으로 정화할 수 있습니다!</span>
            <span className="flex items-center gap-1 text-emerald-800 shrink-0 ml-2">
              <Sprout className="w-4 h-4 text-emerald-600" /> {record.seeds}개
            </span>
          </div>

          {notification && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 text-center">
              {notification}
            </div>
          )}

          {/* Weapon List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {WEAPON_ITEMS.map((w) => {
              const isUnlocked = record.unlockedWeapons.includes(w.id);
              const isEquipped = record.equippedWeaponId === w.id;

              return (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-xl border-2 transition flex items-center justify-between ${
                    isEquipped
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{w.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-neutral-900">
                          {w.name}
                        </span>
                        {isEquipped && (
                          <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                            장착중
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{w.description}</p>
                      <span className="text-[11px] font-bold text-orange-700">
                        정화 파워: ★ {w.power}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 사용중
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => equipWeapon(w.id)}
                        className="py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow"
                      >
                        장착하기
                      </button>
                    ) : (
                      <button
                        onClick={() => buyWeapon(w)}
                        disabled={record.seeds < w.seedCost}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition shadow flex items-center gap-1"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span>씨앗 {w.seedCost}개로 제작</span>
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
