import React from 'react';
import { Volume2, VolumeX, BarChart3, LogOut, Heart, Sprout, Ticket, Award } from 'lucide-react';
import type { StudentRecord } from '../types';
import { toggleAudioMute, getAudioMuted } from '../utils/audio';

interface TitleScreenProps {
  record: StudentRecord;
  onStartRun: () => void;
  onOpenPlanting: () => void;
  onOpenGacha: () => void;
  onOpenWeapons: () => void;
  onOpenSkins: () => void;
  onOpenClimateData: () => void;
  onLogout: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  record,
  onStartRun,
  onOpenPlanting,
  onOpenGacha,
  onOpenWeapons,
  onOpenSkins,
  onOpenClimateData,
  onLogout,
}) => {
  const [muted, setMuted] = React.useState(getAudioMuted());

  const handleToggleAudio = () => {
    const isNowMuted = toggleAudioMute();
    setMuted(isNowMuted);
  };

  // Forest progress toward 65% target from base 50%
  const forestProgress = Math.min(100, Math.max(0, ((record.forestArea - 50) / (65 - 50)) * 100));

  return (
    <div className="relative w-full min-h-screen bg-sky-300 flex flex-col items-center justify-between select-none overflow-hidden font-sans">
      {/* Top HUD: Gauges, Stats, and Navigation Bar */}
      <header className="w-full max-w-4xl mx-auto z-20 px-3 pt-3">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border-2 border-amber-900 flex flex-col gap-2">
          {/* Top Row: User info & Utility buttons */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-neutral-800">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300 font-mono">
                {record.studentCode}
              </span>
              <span className="text-neutral-700">{record.nickname} 학생</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg text-xs">
                {record.currentStage}단계
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenClimateData}
                className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow transition active:scale-95"
                title="Orange3 데이터 분석 보기"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">기후 데이터</span>
              </button>

              <button
                onClick={handleToggleAudio}
                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg border border-neutral-300 transition"
                title="소리 켜기/끄기"
              >
                {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 rounded-lg border border-neutral-300 transition"
                title="관리코드 변경"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Climate Gauges (MANDATORY in user prompt) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-neutral-200">
            {/* 산림면적 게이지 (Forest Area Gauge) */}
            <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-300">
              <div className="flex justify-between items-center text-xs font-black text-emerald-950 mb-1">
                <span>🌲 산림면적 게이지 (목표: 65%)</span>
                <span className="text-emerald-700 font-mono">{record.forestArea.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-emerald-400">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${forestProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-emerald-800 mt-0.5 font-medium">
                <span>태초 마을 (50%)</span>
                <span>승리 조건 (65%)</span>
              </div>
            </div>

            {/* 지구 온난화 / 지구 온도 게이지 (Global Warming Gauge: 100 -> 0) */}
            <div className="bg-rose-50 rounded-xl p-2 border border-rose-300">
              <div className="flex justify-between items-center text-xs font-black text-rose-950 mb-1">
                <span>🔥 지구 온난화 게이지 (나무심기로 내리기)</span>
                <span className="text-rose-700 font-mono">{record.warmingGauge} / 100</span>
              </div>
              <div className="w-full bg-rose-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-rose-400">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${record.warmingGauge}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-rose-800 mt-0.5 font-medium">
                <span>0을 목표로 낮추기 (나무 심어 정화)</span>
                <span>지구 평균 {record.earthTemp.toFixed(1)}°C</span>
              </div>
            </div>
          </div>

          {/* Quick Item Bar: Hearts, Seeds, Gacha Tickets, Trees */}
          <div className="flex flex-wrap items-center justify-around gap-2 text-xs font-extrabold pt-1">
            <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span>하트 {record.maxHearts}개</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>씨앗 {record.seeds}개</span>
            </div>
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              <Ticket className="w-4 h-4 text-amber-500" />
              <span>뽑기권 {record.gachaTickets}장</span>
            </div>
            <div className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
              <Award className="w-4 h-4 text-sky-600" />
              <span>심은 나무 {record.treesPlanted}그루</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Perspective Visual (Faithfully styled like user's drawing) */}
      <main className="relative flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-center">
        {/* Big Stylized "나무런" Title matching drawing's wood log texture */}
        <div className="mt-2 text-center z-10">
          <div className="inline-block relative">
            <h1
              className="text-6xl sm:text-7xl font-black text-amber-800 tracking-wider drop-shadow-[0_4px_0_#451a03] select-none"
              style={{
                fontFamily: `'Impact', 'Jua', 'Arial Black', sans-serif`,
                WebkitTextStroke: '3px #271305',
                textShadow: '3px 3px 0px #b45309, 5px 5px 0px #78350f, 7px 7px 0px #271305',
                color: '#d97706',
              }}
            >
              나무런
            </h1>
            {/* Little wooden texture marks & sprout leaves on title */}
            <span className="absolute -top-3 -right-2 text-2xl animate-pulse">🌱</span>
            <span className="absolute top-2 -left-3 text-lg rotate-12">🍃</span>
          </div>
        </div>

        {/* Perspective Path & Scenery matching drawing */}
        <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center">
          {/* Forest Trees on Left and Right sides */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-28 flex flex-col justify-around pointer-events-none opacity-90">
            <div className="text-4xl text-emerald-700">🌲</div>
            <div className="text-5xl text-green-700 -ml-2">🌲</div>
            <div className="text-6xl text-emerald-800">🌲</div>
            <div className="text-5xl text-green-800">🌲</div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-28 flex flex-col justify-around items-end pointer-events-none opacity-90">
            <div className="text-4xl text-emerald-700">🌲</div>
            <div className="text-5xl text-green-700 -mr-2">🌲</div>
            <div className="text-6xl text-emerald-800">🌲</div>
            <div className="text-5xl text-green-800">🌲</div>
          </div>

          {/* Triangular Green Perspective Road (from drawing) */}
          <div
            className="w-full h-full relative flex items-center justify-center"
            style={{
              clipPath: 'polygon(50% 5%, 85% 100%, 15% 100%)',
              background: 'linear-gradient(to bottom, #16a34a 0%, #15803d 50%, #166534 100%)',
            }}
          >
            {/* Road guide lines */}
            <div className="absolute top-0 bottom-0 w-1 bg-green-300/30" />
            <div className="absolute top-0 bottom-0 w-0.5 -rotate-6 bg-green-200/20 origin-top" />
            <div className="absolute top-0 bottom-0 w-0.5 rotate-6 bg-green-200/20 origin-top" />
          </div>

          {/* On-Road Element 1: Carbon Monster with horns and "C" (from drawing) */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce duration-1000">
            <div className="relative w-12 h-12 bg-amber-950 rounded-full border-2 border-black flex items-center justify-center shadow-lg">
              {/* Horns */}
              <div className="absolute -top-3 left-1 w-2 h-3.5 bg-red-600 rounded-t-full border border-black rotate-[-15deg]" />
              <div className="absolute -top-3 right-1 w-2 h-3.5 bg-red-600 rounded-t-full border border-black rotate-[15deg]" />
              {/* Arms */}
              <div className="absolute -left-2 top-4 w-2 h-0.5 bg-black rotate-[-30deg]" />
              <div className="absolute -right-2 top-4 w-2 h-0.5 bg-black rotate-[30deg]" />
              {/* Legs */}
              <div className="absolute -bottom-2 left-3 w-0.5 h-2.5 bg-black" />
              <div className="absolute -bottom-2 right-3 w-0.5 h-2.5 bg-black" />
              {/* C Symbol */}
              <span className="text-white font-black text-xl font-mono">C</span>
            </div>
            <span className="text-[10px] font-bold text-amber-950 bg-amber-100/90 px-1 rounded mt-0.5">
              탄소 괴물
            </span>
          </div>

          {/* On-Road Element 2: Seed Bag "씨" (from drawing) */}
          <div className="absolute top-36 left-[38%] flex flex-col items-center animate-pulse">
            <div className="w-9 h-11 bg-emerald-800 border-2 border-black rounded-sm flex items-center justify-center shadow-md">
              <div className="border border-emerald-400 p-0.5 text-center">
                <span className="text-white font-black text-sm underline decoration-emerald-300">
                  씨
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-900 bg-emerald-100/90 px-1 rounded mt-0.5">
              씨앗 봉투
            </span>
          </div>

          {/* On-Road Element 3: Cute White Character with Oxygen Hat (from drawing) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
            {/* Oxygen Hat (Cute bubble/cap with O2) */}
            <div className="relative -mb-1 z-10">
              <div className="w-10 h-7 bg-sky-200/90 border-2 border-sky-600 rounded-t-full flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-black text-sky-800 tracking-tighter">O₂</span>
                {/* Bubble shine */}
                <div className="absolute top-1 left-2 w-2 h-1 bg-white rounded-full opacity-80" />
              </div>
            </div>

            {/* Head: White smiling circle */}
            <div className="w-11 h-11 bg-white rounded-full border-2 border-black flex items-center justify-center shadow-md relative">
              {/* Happy eyes and smile */}
              <div className="flex gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
              <div className="absolute bottom-2 w-4 h-2 border-b-2 border-black rounded-full" />
            </div>

            {/* Torso & Arms: White blocky character */}
            <div className="relative w-8 h-10 bg-white border-2 border-black mt-0.5 flex justify-center">
              {/* Left Arm */}
              <div className="absolute -left-3.5 top-0 w-3 h-9 bg-white border-2 border-black rounded-sm" />
              {/* Right Arm */}
              <div className="absolute -right-3.5 top-0 w-3 h-9 bg-white border-2 border-black rounded-sm" />
            </div>

            {/* Legs: White blocky legs */}
            <div className="flex gap-1 -mt-0.5">
              <div className="w-3.5 h-9 bg-white border-2 border-black rounded-b-sm" />
              <div className="w-3.5 h-9 bg-white border-2 border-black rounded-b-sm" />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Button Panel (Exact 5 Buttons from User's Drawing) */}
      <footer className="w-full max-w-md mx-auto z-20 px-4 pb-4">
        <div className="flex flex-col gap-2">
          {/* Upper row of 2 buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Orange Button: [무기 상자] */}
            <button
              id="btn-weapon-box"
              onClick={onOpenWeapons}
              className="py-3 px-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-black font-black text-base sm:text-lg rounded-md border-4 border-black shadow-[3px_3px_0px_#000] transition flex items-center justify-center gap-1.5"
            >
              <span>무기 상<u>자</u></span>
            </button>

            {/* Dark Red / Burgundy Button: [상점/스킨 변경] */}
            <button
              id="btn-skin-shop"
              onClick={onOpenSkins}
              className="py-3 px-2 bg-[#800020] hover:bg-[#660019] active:scale-95 text-white font-black text-sm sm:text-base rounded-md border-4 border-black shadow-[3px_3px_0px_#000] transition flex flex-col items-center justify-center leading-tight"
            >
              <span>상점/</span>
              <span>스킨 변경</span>
            </button>
          </div>

          {/* Lower row of 3 buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Green Button: [씨앗 심기] */}
            <button
              id="btn-plant-seeds"
              onClick={onOpenPlanting}
              className="py-3 px-1 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-sm sm:text-base rounded-md border-4 border-black shadow-[3px_3px_0px_#000] transition flex items-center justify-center"
            >
              <span>씨앗 심<u>기</u></span>
            </button>

            {/* Yellow Center Big Button: [달리기 시작] */}
            <button
              id="btn-start-running"
              onClick={onStartRun}
              className="py-3 px-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-base sm:text-xl rounded-md border-4 border-black shadow-[3px_3px_0px_#000] transition flex items-center justify-center animate-pulse"
            >
              <span>달리기 시작</span>
            </button>

            {/* Red Button: [스킨 뽑기] */}
            <button
              id="btn-gacha-draw"
              onClick={onOpenGacha}
              className="py-3 px-1 bg-red-600 hover:bg-red-700 active:scale-95 text-black font-black text-sm sm:text-base rounded-md border-4 border-black shadow-[3px_3px_0px_#000] transition flex items-center justify-center"
            >
              <span>스킨 뽑<u>기</u></span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
