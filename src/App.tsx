/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { StudentRecord, QuizQuestion } from './types';
import { saveStudentRecord, subscribeStudentRecord } from './firebase';
import { LoginScreen } from './components/LoginScreen';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { PlantTreeModal } from './components/PlantTreeModal';
import { GachaModal } from './components/GachaModal';
import { WeaponShopModal } from './components/WeaponShopModal';
import { SkinShopModal } from './components/SkinShopModal';
import { ClimateDataModal } from './components/ClimateDataModal';
import { QuizModal } from './components/QuizModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [activeScreen, setActiveScreen] = useState<'login' | 'title' | 'game'>('login');
  const [runSessionId, setRunSessionId] = useState(1);

  // Modal states
  const [showPlanting, setShowPlanting] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [showWeapons, setShowWeapons] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [showClimateData, setShowClimateData] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  // In-game modal states
  const [activeQuiz, setActiveQuiz] = useState<{
    question: QuizQuestion;
    callback: (correct: boolean) => void;
  } | null>(null);

  const [gameOverStats, setGameOverStats] = useState<{
    seedsCollected: number;
    monstersDefeated: number;
    distance: number;
  } | null>(null);

  // Firestore Real-Time subscription when logged in
  useEffect(() => {
    if (!record?.studentCode) return;

    const unsubscribe = subscribeStudentRecord(record.studentCode, (updated) => {
      setRecord((prev) => {
        if (!prev) return updated;
        // Merge smoothly
        return { ...prev, ...updated };
      });
    });

    return () => unsubscribe();
  }, [record?.studentCode]);

  // Save changes to Firestore
  const handleUpdateRecord = async (updated: StudentRecord) => {
    setRecord(updated);
    await saveStudentRecord(updated);
  };

  // Login handler
  const handleLoginSuccess = (userRecord: StudentRecord) => {
    setRecord(userRecord);
    setActiveScreen('title');
  };

  // Logout handler
  const handleLogout = () => {
    setRecord(null);
    setActiveScreen('login');
  };

  // Start running
  const handleStartRun = () => {
    setRunSessionId((prev) => prev + 1);
    setActiveScreen('game');
  };

  // Handle Game Over
  const handleGameOver = (stats: { seedsCollected: number; monstersDefeated: number; distance: number }) => {
    if (!record) return;
    const newSeeds = record.seeds + stats.seedsCollected;
    const newScore = record.totalScore + stats.distance + stats.monstersDefeated * 50;

    const updated: StudentRecord = {
      ...record,
      seeds: newSeeds,
      totalScore: newScore,
    };
    handleUpdateRecord(updated);
    setGameOverStats(stats);
  };

  // Return to village from run
  const handleReturnToVillage = (stats: { seedsCollected: number; monstersDefeated: number; distance: number }) => {
    if (!record) return;
    const newSeeds = record.seeds + stats.seedsCollected;
    const newScore = record.totalScore + stats.distance + stats.monstersDefeated * 50;

    const updated: StudentRecord = {
      ...record,
      seeds: newSeeds,
      totalScore: newScore,
    };
    handleUpdateRecord(updated);
    setGameOverStats(null);
    setActiveScreen('title');
  };

  // Retry run after game over
  const handleRetryRun = () => {
    setGameOverStats(null);
    setRunSessionId((prev) => prev + 1);
    setActiveScreen('game');
  };

  // Trigger Victory Screen
  const handleTriggerVictory = () => {
    setShowPlanting(false);
    setShowVictory(true);
  };

  // Restart with +2 hearts on Victory
  // User Prompt: "산림 면적이 65가 되면, '이겼습니다' 라는 멘트가 뜨고, '다시 하기' 라는 버튼을 누르면, 기존에 있던 하트 2개에서 하트가 2개씩 늘어나고,(항상 다시 할때 마다 2개씩 늘어남)"
  const handleRestartWithMoreHearts = () => {
    if (!record) return;
    const updated: StudentRecord = {
      ...record,
      maxHearts: record.maxHearts + 2, // Always +2 hearts per restart
      currentStage: record.currentStage + 1,
      forestArea: 50.0, // 태초 마을 산림면적 50으로 다음 스테이지 시작
      warmingGauge: 100,
      seeds: record.seeds + 10, // 보너스 씨앗 10개 선물
      gachaTickets: record.gachaTickets + 2, // 보너스 뽑기권 2개 선물
    };

    handleUpdateRecord(updated);
    setShowVictory(false);
    setActiveScreen('title');
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 select-none">
      {/* 1. Login / Management Code Entry Screen */}
      {activeScreen === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}

      {/* 2. Main Title Screen (Matching Uploaded Drawing) */}
      {activeScreen === 'title' && record && (
        <TitleScreen
          record={record}
          onStartRun={handleStartRun}
          onOpenPlanting={() => setShowPlanting(true)}
          onOpenGacha={() => setShowGacha(true)}
          onOpenWeapons={() => setShowWeapons(true)}
          onOpenSkins={() => setShowSkins(true)}
          onOpenClimateData={() => setShowClimateData(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 3. Runner Game Screen (Yako Run Style) */}
      {activeScreen === 'game' && record && (
        <GameCanvas
          key={runSessionId}
          record={record}
          onGameOver={handleGameOver}
          onReturnToVillage={handleReturnToVillage}
          onRequestQuiz={(question, callback) => {
            setActiveQuiz({ question, callback });
          }}
        />
      )}

      {/* Modals */}
      {showPlanting && record && (
        <PlantTreeModal
          record={record}
          onUpdateRecord={handleUpdateRecord}
          onTriggerVictory={handleTriggerVictory}
          onClose={() => setShowPlanting(false)}
        />
      )}

      {showGacha && record && (
        <GachaModal
          record={record}
          onUpdateRecord={handleUpdateRecord}
          onClose={() => setShowGacha(false)}
        />
      )}

      {showWeapons && record && (
        <WeaponShopModal
          record={record}
          onUpdateRecord={handleUpdateRecord}
          onClose={() => setShowWeapons(false)}
        />
      )}

      {showSkins && record && (
        <SkinShopModal
          record={record}
          onUpdateRecord={handleUpdateRecord}
          onClose={() => setShowSkins(false)}
        />
      )}

      {showClimateData && (
        <ClimateDataModal onClose={() => setShowClimateData(false)} />
      )}

      {activeQuiz && (
        <QuizModal
          question={activeQuiz.question}
          onFinish={(correct) => {
            const cb = activeQuiz.callback;
            setActiveQuiz(null);
            cb(correct);
          }}
        />
      )}

      {gameOverStats && record && (
        <GameOverModal
          record={record}
          runStats={gameOverStats}
          onRetryRun={handleRetryRun}
          onReturnToVillage={() => {
            setGameOverStats(null);
            setActiveScreen('title');
          }}
        />
      )}

      {showVictory && record && (
        <VictoryModal
          record={record}
          onRestartWithMoreHearts={handleRestartWithMoreHearts}
        />
      )}
    </div>
  );
}

