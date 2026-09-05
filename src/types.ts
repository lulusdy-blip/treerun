export interface StudentRecord {
  studentCode: string; // 관리코드 (문서 ID)
  nickname: string;
  currentStage: number; // 현재 단계
  totalScore: number; // 누적 점수
  earthTemp: number; // 지구 온도 (°C)
  forestArea: number; // 산림 면적 (시작: 50.0, 승리: 65.0)
  warmingGauge: number; // 지구 온난화 게이지 (100 -> 0)
  seeds: number; // 보유 씨앗
  maxHearts: number; // 최대 하트 (기본 2개, 승리 후 다시하기 시 +2씩 증가)
  gachaTickets: number; // 스킨/무기 뽑기권
  treesPlanted: number; // 심은 나무 총 개수
  equippedWeaponId: string;
  equippedSkinId: string;
  unlockedWeapons: string[];
  unlockedSkins: string[];
  lastPlayedAt: string; // 마지막 플레이 시간
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
}

export interface ClimateDataYear {
  year: number;
  forestAreaRatio: number; // % (산림면적 비율 64.2 -> 62.7)
  globalAvgTempAnomaly: number; // °C 편차
  globalTemp: number; // °C (지구 평균기온)
  co2Ppm: number; // ppm (394.9 -> 425.0)
}

export interface WeaponItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  power: number;
  seedCost: number;
  color: string;
}

export interface SkinItem {
  id: string;
  name: string;
  description: string;
  hatColor: string;
  bodyColor: string;
  badge: string;
  seedCost: number;
}
