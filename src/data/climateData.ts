import type { ClimateDataYear, QuizQuestion, WeaponItem, SkinItem } from '../types';

/**
 * 2010년 ~ 2022년 기상청·산림청 공식 자료 및 Orange3 분석 데이터
 * - 산림면적은 10여 년간 64% -> 63% 수준으로 거의 정체/소폭 감소
 * - 반면 CO2 농도는 394.9ppm -> 425ppm으로 급증
 * - 산림면적 감소와 지구 평균기온 상승 간의 상관계수: 약 -0.824 (강한 음의 상관관계)
 */
export const CLIMATE_DATA_YEARS: ClimateDataYear[] = [
  { year: 2010, forestAreaRatio: 64.0, globalAvgTempAnomaly: 0.72, globalTemp: 14.72, co2Ppm: 394.9 },
  { year: 2011, forestAreaRatio: 63.9, globalAvgTempAnomaly: 0.61, globalTemp: 14.61, co2Ppm: 397.1 },
  { year: 2012, forestAreaRatio: 63.8, globalAvgTempAnomaly: 0.65, globalTemp: 14.65, co2Ppm: 399.5 },
  { year: 2013, forestAreaRatio: 63.7, globalAvgTempAnomaly: 0.68, globalTemp: 14.68, co2Ppm: 401.8 },
  { year: 2014, forestAreaRatio: 63.6, globalAvgTempAnomaly: 0.75, globalTemp: 14.75, co2Ppm: 404.2 },
  { year: 2015, forestAreaRatio: 63.5, globalAvgTempAnomaly: 0.90, globalTemp: 14.90, co2Ppm: 406.9 },
  { year: 2016, forestAreaRatio: 63.4, globalAvgTempAnomaly: 1.02, globalTemp: 15.02, co2Ppm: 409.8 },
  { year: 2017, forestAreaRatio: 63.3, globalAvgTempAnomaly: 0.93, globalTemp: 14.93, co2Ppm: 412.3 },
  { year: 2018, forestAreaRatio: 63.2, globalAvgTempAnomaly: 0.85, globalTemp: 14.85, co2Ppm: 415.1 },
  { year: 2019, forestAreaRatio: 63.1, globalAvgTempAnomaly: 0.98, globalTemp: 14.98, co2Ppm: 418.0 },
  { year: 2020, forestAreaRatio: 63.0, globalAvgTempAnomaly: 1.02, globalTemp: 15.02, co2Ppm: 420.5 },
  { year: 2021, forestAreaRatio: 62.9, globalAvgTempAnomaly: 0.84, globalTemp: 14.84, co2Ppm: 422.8 },
  { year: 2022, forestAreaRatio: 62.8, globalAvgTempAnomaly: 0.89, globalTemp: 14.89, co2Ppm: 425.0 },
];

export const CORRELATION_COEFFICIENT = -0.824;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '우리가 분석한 2010~2022년 데이터에서 산림면적은 약 몇 %에서 몇 %로 변했을까요?',
    options: ['80% → 50%', '64% → 63% (거의 변화 없음)', '40% → 90%', '50% → 20%'],
    correctIndex: 1,
    explanation: '산림면적은 10여 년간 64%에서 63%로 거의 늘지 않고 정체되었습니다!',
    source: '기상청·산림청 공식 자료 (Orange3 분석)',
  },
  {
    id: 'q2',
    question: '2010년부터 2022년까지 대기 중 이산화탄소(CO2) 농도는 어떻게 변했을까요?',
    options: ['394.9ppm에서 425ppm까지 계속 증가', '500ppm에서 300ppm으로 감소', '전혀 변하지 않음', '100ppm에서 200ppm으로 증가'],
    correctIndex: 0,
    explanation: '숲은 그대로인데, CO2 농도는 394.9ppm에서 425ppm까지 꾸준히 상승했습니다.',
    source: '기상청 기후변화 감시 통계',
  },
  {
    id: 'q3',
    question: '산림면적과 지구 평균기온의 산점도 분석에서 확인된 관계(상관계수 약 0.82)는 무엇인가요?',
    options: [
      '산림면적이 줄어들 때 지구 평균기온이 올라가는 경향',
      '산림이 줄어들면 기온도 함께 떨어진다',
      '산림면적과 지구 기온은 전혀 상관이 없다',
      '숲이 많아질수록 북극곰이 춤을 춘다',
    ],
    correctIndex: 0,
    explanation: '산림면적이 줄어들수록 이산화탄소를 흡수하지 못해 지구 평균기온이 높아지는 강한 상관관계가 나타납니다.',
    source: 'Orange3 산점도 분석 결과',
  },
  {
    id: 'q4',
    question: '숲과 나무가 광합성 작용을 통해 대기 중에서 흡수하고 저장하는 주된 온실가스는 무엇일까요?',
    options: ['이산화탄소 (CO₂)', '산소 (O₂)', '질소 (N₂)', '헬륨 (He)'],
    correctIndex: 0,
    explanation: '나무는 광합성을 통해 이산화탄소를 흡수하고 산소를 방출하며, 흡수한 탄소를 목재 내에 격리 저장합니다.',
    source: '국립산림과학원 탄소흡수원 보고서',
  },
  {
    id: 'q5',
    question: '배출하는 온실가스 양과 숲 등이 흡수하는 양을 같게 하여 실질적 배출량을 "0"으로 만드는 개념은?',
    options: ['탄소중립 (Net-Zero)', '온실가스 증폭', '열섬현상', '생태계 파괴'],
    correctIndex: 0,
    explanation: '탄소중립(Net-Zero)은 배출량을 최대한 줄이고, 남은 탄소는 산림 등 흡수원으로 흡수하여 순 배출량을 0으로 만드는 것입니다.',
    source: '환경부 2050 탄소중립 포털',
  },
  {
    id: 'q6',
    question: '무분별한 벌목 등으로 산림 면적이 급격히 줄어들 때 발생하는 현상이 아닌 것은?',
    options: [
      '지구 온난화 및 기상이변 가속화',
      '토양 침식 및 홍수·산사태 위험 증가',
      '대기 중 산소 농도의 폭발적 증가',
      '야생동물 서식지 파괴 및 생물다양성 감소',
    ],
    correctIndex: 2,
    explanation: '산림이 파괴되면 탄소 흡수 능력이 급감하고 재해 위험이 커지지만, 대기 중 산소가 폭발적으로 늘어나지는 않습니다.',
    source: '유엔환경계획(UNEP) 산림보호 보고서',
  },
  {
    id: 'q7',
    question: '전 세계가 심각한 기후재앙을 막기 위해 합의한 산업화 이전 대비 지구 기온 상승 억제 목표치는?',
    options: ['1.5°C 이내', '5.0°C 이내', '10.0°C 이내', '0.01°C 이내'],
    correctIndex: 0,
    explanation: 'IPCC 보고서와 파리협정에서는 지구 평균기온 상승폭을 산업화 이전 대비 1.5°C 이내로 억제할 것을 권고하고 있습니다.',
    source: 'IPCC 제6차 기후변화 종합보고서',
  },
  {
    id: 'q8',
    question: '"숲은 그대로인데 탄소는 계속 늘고 있다"는 분석 결과를 바탕으로 한 가장 올바른 해결 방안은?',
    options: [
      '산림을 복원하여 탄소 흡수원을 늘리고 온실가스 배출을 적극 감축한다',
      '남아있는 숲의 나무를 모두 베어 건물만 짓는다',
      '화석연료 사용을 현재보다 2배 이상 늘린다',
      '일회용품을 무분별하게 더 많이 사용한다',
    ],
    correctIndex: 0,
    explanation: '흡수원인 숲을 복원·확장하고, 에너지 절약과 친환경 전환으로 탄소 배출을 줄이는 것이 지구를 지키는 핵심입니다!',
    source: '기후위기 교육 실천 가이드',
  },
];

export const WEAPON_ITEMS: WeaponItem[] = [
  {
    id: 'fist',
    name: '기본 손펀치',
    description: '작은 탄소 먼지를 밀어내는 기본 주먹',
    icon: '👊',
    power: 1,
    seedCost: 0,
    color: '#94a3b8',
  },
  {
    id: 'wooden_club',
    name: '단단한 나무 몽둥이',
    description: '숲의 나뭇가지로 만든 정화의 몽둥이',
    icon: '🪵',
    power: 2,
    seedCost: 10,
    color: '#b45309',
  },
  {
    id: 'oxygen_blaster',
    name: '산소 방울 블래스터',
    description: '맑은 산소 방울을 발사해 탄소 괴물을 정화합니다',
    icon: '🫧',
    power: 3,
    seedCost: 25,
    color: '#38bdf8',
  },
  {
    id: 'photo_laser',
    name: '광합성 썬더 레이저',
    description: '태양빛과 엽록소 에너지를 응축한 최첨단 정화 빔',
    icon: '⚡',
    power: 5,
    seedCost: 50,
    color: '#22c55e',
  },
];

export const SKIN_ITEMS: SkinItem[] = [
  {
    id: 'default',
    name: '산소모자 흰둥이',
    description: '신선한 O2 산소 캡을 쓴 귀여운 기본 러너',
    hatColor: '#38bdf8',
    bodyColor: '#ffffff',
    badge: '🫧 산소모자',
    seedCost: 0,
  },
  {
    id: 'sprout',
    name: '새싹 요정',
    description: '파릇파릇 귀여운 새싹 잎사귀 모자를 쓴 요정',
    hatColor: '#22c55e',
    bodyColor: '#ecfdf5',
    badge: '🌱 새싹모자',
    seedCost: 15,
  },
  {
    id: 'pinecone',
    name: '솔방울 가디언',
    description: '단단한 솔방울 투구를 쓰고 숲을 지키는 꼬마 수호자',
    hatColor: '#78350f',
    bodyColor: '#fef3c7',
    badge: '🌰 솔방울',
    seedCost: 30,
  },
  {
    id: 'gold_hero',
    name: '골든 옥시젠 히어로',
    description: '지구 온도를 낮춘 영웅에게 주어지는 황금빛 산소 캡',
    hatColor: '#f59e0b',
    bodyColor: '#fffbeb',
    badge: '👑 골든산소',
    seedCost: 60,
  },
];
