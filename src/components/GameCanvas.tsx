import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Sprout, ShieldAlert, Sparkles, Pause, ArrowLeft, Flag, Timer, Trophy } from 'lucide-react';
import type { StudentRecord, QuizQuestion } from '../types';
import { QUIZ_QUESTIONS, WEAPON_ITEMS, SKIN_ITEMS } from '../data/climateData';
import {
  playMoveSound,
  playSeedCollectSound,
  playMonsterHitSound,
  playAttackSound,
  playVictorySound,
} from '../utils/audio';

interface GameCanvasProps {
  record: StudentRecord;
  onGameOver: (runStats: { seedsCollected: number; monstersDefeated: number; distance: number }) => void;
  onReturnToVillage: (runStats: { seedsCollected: number; monstersDefeated: number; distance: number }) => void;
  onRequestQuiz: (question: QuizQuestion, onResult: (correct: boolean) => void) => void;
}

interface Obstacle {
  id: number;
  type: 'monster' | 'seed';
  x: number; // normalized -1 (left) to 1 (right)
  y: number; // 0 (horizon) to 1 (near player)
  speed: number;
  destroyed?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  record,
  onGameOver,
  onReturnToVillage,
  onRequestQuiz,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game state
  const [currentHearts, setCurrentHearts] = useState(record.maxHearts);
  const [runSeeds, setRunSeeds] = useState(0);
  const MAX_ATTACKS_PER_RUN = 5;
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [attacksLeft, setAttacksLeft] = useState(MAX_ATTACKS_PER_RUN);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isGoalReached, setIsGoalReached] = useState(false);

  // Active weapon & skin
  const currentWeapon = WEAPON_ITEMS.find((w) => w.id === record.equippedWeaponId) || WEAPON_ITEMS[0];
  const currentSkin = SKIN_ITEMS.find((s) => s.id === record.equippedSkinId) || SKIN_ITEMS[0];

  // Refs for animation loop
  const gameStateRef = useRef({
    playerX: 0, // -1 to 1
    targetPlayerX: 0,
    isDragging: false,
    invulnerableTime: 0,
    attackTime: 0,
    attacksLeft: MAX_ATTACKS_PER_RUN,
    elapsedTimeMs: 0,
    goalPost: null as { y: number; speed: number } | null,
    goalPostSpawned: false,
    reachedGoal: false,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    nextObstacleId: 1,
    spawnTimer: 0,
    distanceRun: 0,
    runSeedsCount: 0,
    defeatedCount: 0,
    heartsLeft: record.maxHearts,
    isGameOverTriggered: false,
    pausedForQuiz: false,
  });

  // Handle attack action (max 5 times per run)
  const performAttack = useCallback(() => {
    if (gameStateRef.current.attackTime > 0 || gameStateRef.current.pausedForQuiz) return;

    // Check attack limit
    if (gameStateRef.current.attacksLeft <= 0) {
      if (canvasRef.current) {
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        const pScreenX = w / 2 + (gameStateRef.current.playerX * (w * 0.38) * 0.85);
        const pScreenY = h * 0.82;
        if (!gameStateRef.current.floatingTexts.some((ft) => ft.text.includes('소진'))) {
          gameStateRef.current.floatingTexts.push({
            id: Math.random(),
            x: pScreenX,
            y: pScreenY - 30,
            text: '공격 횟수 소진 (최대 5회)!',
            color: '#f87171',
            life: 30,
          });
        }
      }
      return;
    }

    gameStateRef.current.attacksLeft -= 1;
    setAttacksLeft(gameStateRef.current.attacksLeft);
    gameStateRef.current.attackTime = 18; // ~0.3s attack animation
    playAttackSound();

    // Check if monster in range
    const rangeY = [0.65, 0.95];
    const playerX = gameStateRef.current.playerX;

    gameStateRef.current.obstacles.forEach((ob) => {
      if (ob.type === 'monster' && !ob.destroyed && ob.y >= rangeY[0] && ob.y <= rangeY[1]) {
        const diffX = Math.abs(ob.x - playerX);
        if (diffX < 0.35) {
          // Hit monster!
          ob.destroyed = true;
          gameStateRef.current.defeatedCount += 1;
          setMonstersDefeated(gameStateRef.current.defeatedCount);

          // Add burst particles
          if (canvasRef.current) {
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            const screenX = w / 2 + (ob.x * (w * 0.38) * ob.y);
            const screenY = h * 0.2 + ob.y * (h * 0.72);
            for (let i = 0; i < 16; i++) {
              gameStateRef.current.particles.push({
                x: screenX,
                y: screenY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: currentWeapon.color || '#38bdf8',
                size: Math.random() * 5 + 3,
                life: 30,
                maxLife: 30,
              });
            }
            gameStateRef.current.floatingTexts.push({
              id: Math.random(),
              x: screenX,
              y: screenY - 20,
              text: '정화 완료! +50점',
              color: '#38bdf8',
              life: 40,
            });
          }
        }
      }
    });
  }, [currentWeapon]);

  // Handle mouse / touch drag controls
  const handlePointerDown = (e: React.PointerEvent) => {
    gameStateRef.current.isDragging = true;
    updatePlayerPosition(e.clientX);
    playMoveSound();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameStateRef.current.isDragging) {
      updatePlayerPosition(e.clientX);
    }
  };

  const handlePointerUp = () => {
    gameStateRef.current.isDragging = false;
  };

  const updatePlayerPosition = (clientX: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const normalized = (relativeX / rect.width) * 2 - 1; // -1 to 1
    // Clamp to track bounds
    gameStateRef.current.targetPlayerX = Math.max(-0.75, Math.min(0.75, normalized));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameStateRef.current.targetPlayerX = Math.max(-0.75, gameStateRef.current.targetPlayerX - 0.25);
        playMoveSound();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameStateRef.current.targetPlayerX = Math.min(0.75, gameStateRef.current.targetPlayerX + 0.25);
        playMoveSound();
      } else if (e.key === ' ' || e.key === 'Enter') {
        performAttack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performAttack]);

  // Main game loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!containerRef.current || !canvas) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      const state = gameStateRef.current;

      if (!isPaused && !state.pausedForQuiz && !state.isGameOverTriggered && !state.reachedGoal) {
        // Track elapsed running time (ms)
        state.elapsedTimeMs += dt;
        const currentSec = Math.floor(state.elapsedTimeMs / 1000);
        if (currentSec !== elapsedSeconds) {
          setElapsedSeconds(currentSec);
        }

        // Trigger goal post after 60 seconds (60,000ms)
        if (state.elapsedTimeMs >= 60000 && !state.goalPostSpawned) {
          state.goalPostSpawned = true;
          state.goalPost = {
            y: 0.0, // starts at horizon
            speed: 0.0075,
          };
          state.floatingTexts.push({
            id: Math.random(),
            x: canvas.width / 2,
            y: canvas.height * 0.35,
            text: '🏁 60초 달성! 저 앞에 결승 골대가 나타났습니다! 🏁',
            color: '#facc15',
            life: 110,
          });
        }

        // Update goal post movement and collision
        if (state.goalPost) {
          const perspectiveSpeed = state.goalPost.speed * (0.35 + state.goalPost.y * 1.50);
          state.goalPost.y += perspectiveSpeed;

          // Touch/reach goal post near player position (y >= 0.82)
          if (state.goalPost.y >= 0.82 && !state.reachedGoal) {
            state.reachedGoal = true;
            setIsGoalReached(true);
            playVictorySound();

            // Burst victory celebration confetti particles
            const w = canvas.width;
            const h = canvas.height;
            for (let i = 0; i < 75; i++) {
              state.particles.push({
                x: w / 2 + (Math.random() - 0.5) * w * 0.7,
                y: h * 0.45 + (Math.random() - 0.5) * 140,
                vx: (Math.random() - 0.5) * 14,
                vy: -Math.random() * 10 - 3,
                color: ['#10b981', '#fbbf24', '#38bdf8', '#f43f5e', '#a855f7', '#ffffff'][i % 6],
                size: Math.random() * 6 + 4,
                life: 90,
                maxLife: 90,
              });
            }

            state.floatingTexts.push({
              id: Math.random(),
              x: w / 2,
              y: h * 0.4,
              text: '🎉 60초 완주 성공! 메인 화면으로 돌아갑니다!',
              color: '#34d399',
              life: 120,
            });

            // Smooth transition back to village after celebratory moment
            setTimeout(() => {
              onReturnToVillage({
                seedsCollected: state.runSeedsCount,
                monstersDefeated: state.defeatedCount,
                distance: Math.floor(state.distanceRun),
              });
            }, 1800);
          }
        }

        // Smooth and responsive player movement towards target
        state.playerX += (state.targetPlayerX - state.playerX) * 0.28;

        // Attack animation countdown
        if (state.attackTime > 0) state.attackTime -= 1;

        // Invulnerability countdown
        if (state.invulnerableTime > 0) state.invulnerableTime -= 1;

        // Advance distance & run score - increased running speed!
        state.distanceRun += 0.58;
        setDistance(Math.floor(state.distanceRun));

        // Footstep dust puffs when running fast
        if (Math.floor(state.distanceRun * 2) % 5 === 0) {
          const pScreenX = canvas.width / 2 + (state.playerX * (canvas.width * 0.38) * 0.85);
          const pScreenY = canvas.height * 0.85;
          state.particles.push({
            x: pScreenX + (Math.random() - 0.5) * 16,
            y: pScreenY + 16,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1.5 + Math.random() * 2,
            color: 'rgba(255, 255, 255, 0.45)',
            size: Math.random() * 3 + 2,
            life: 14,
            maxLife: 14,
          });
        }

        // Spawn obstacles & seed bags frequently and abundantly (only before goal post arrives)
        if (!state.goalPostSpawned) {
          state.spawnTimer += 1;
          if (state.spawnTimer > 22) {
            state.spawnTimer = 0;

            // Spawn 1 or 2 items (40% chance of multi-lane spawn for intense action)
            const countToSpawn = Math.random() < 0.4 ? 2 : 1;

            if (countToSpawn === 2) {
              // Left lane
              const spawnX1 = -0.55 + Math.random() * 0.4;
              const isSeed1 = Math.random() < 0.5;
              state.obstacles.push({
                id: state.nextObstacleId++,
                type: isSeed1 ? 'seed' : 'monster',
                x: spawnX1,
                y: 0.0,
                speed: 0.009 + Math.random() * 0.0035,
              });

              // Right lane
              const spawnX2 = 0.15 + Math.random() * 0.4;
              const isSeed2 = isSeed1 ? Math.random() < 0.35 : Math.random() < 0.75;
              state.obstacles.push({
                id: state.nextObstacleId++,
                type: isSeed2 ? 'seed' : 'monster',
                x: spawnX2,
                y: 0.0,
                speed: 0.009 + Math.random() * 0.0035,
              });
            } else {
              // Single spawn
              const isSeed = Math.random() < 0.48;
              const spawnX = (Math.random() - 0.5) * 1.35;
              state.obstacles.push({
                id: state.nextObstacleId++,
                type: isSeed ? 'seed' : 'monster',
                x: spawnX,
                y: 0.0,
                speed: 0.009 + Math.random() * 0.0035,
              });
            }
          }
        }

        // Update obstacles with perspective acceleration
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const ob = state.obstacles[i];
          // Perspective velocity: distant objects move gently, smoothly speeding up towards camera
          const perspectiveSpeed = ob.speed * (0.40 + ob.y * 1.60);
          ob.y += perspectiveSpeed;

          // Check collision near player (y: 0.74 ~ 0.94)
          if (!ob.destroyed && ob.y >= 0.74 && ob.y <= 0.94) {
            const diffX = Math.abs(ob.x - state.playerX);
            if (diffX < 0.25) {
              if (ob.type === 'monster') {
                // Check if currently attacking
                if (state.attackTime > 0) {
                  ob.destroyed = true;
                  state.defeatedCount += 1;
                  setMonstersDefeated(state.defeatedCount);
                  // Particle effect at exact perspective location
                  const w = canvas.width;
                  const h = canvas.height;
                  const roadW = (w * 0.12) + (w * 0.82 - w * 0.12) * ob.y;
                  const screenX = w * 0.5 + (ob.x * roadW * 0.45);
                  const screenY = (h * 0.22) + ob.y * (h * 0.78);
                  for (let p = 0; p < 12; p++) {
                    state.particles.push({
                      x: screenX,
                      y: screenY,
                      vx: (Math.random() - 0.5) * 6,
                      vy: (Math.random() - 0.5) * 6,
                      color: '#22c55e',
                      size: 4,
                      life: 25,
                      maxLife: 25,
                    });
                  }
                  state.floatingTexts.push({
                    id: Math.random(),
                    x: screenX,
                    y: screenY - 20,
                    text: '격퇴! +50점',
                    color: '#22c55e',
                    life: 35,
                  });
                } else if (state.invulnerableTime <= 0) {
                  // Hit player!
                  state.heartsLeft -= 1;
                  state.invulnerableTime = 60; // ~1 sec invulnerability
                  setCurrentHearts(state.heartsLeft);
                  playMonsterHitSound();

                  state.floatingTexts.push({
                    id: Math.random(),
                    x: canvas.width / 2 + (state.playerX * (canvas.width * 0.38) * 0.85),
                    y: canvas.height * 0.8,
                    text: '하트 -1!',
                    color: '#ef4444',
                    life: 45,
                  });

                  // Check game over
                  if (state.heartsLeft <= 0) {
                    state.isGameOverTriggered = true;
                    setTimeout(() => {
                      onGameOver({
                        seedsCollected: state.runSeedsCount,
                        monstersDefeated: state.defeatedCount,
                        distance: Math.floor(state.distanceRun),
                      });
                    }, 600);
                  }
                }
              } else if (ob.type === 'seed') {
                // Collected seed bag!
                ob.destroyed = true;

                // 10% chance of Climate Quiz trigger as requested
                const triggerQuiz = Math.random() < 0.10;

                if (triggerQuiz) {
                  state.pausedForQuiz = true;
                  const randomQ = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
                  onRequestQuiz(randomQ, (correct) => {
                    state.pausedForQuiz = false;
                    if (correct) {
                      // 3x seeds!
                      state.runSeedsCount += 3;
                      setRunSeeds(state.runSeedsCount);
                      state.floatingTexts.push({
                        id: Math.random(),
                        x: canvas.width / 2,
                        y: canvas.height * 0.5,
                        text: '퀴즈 정답! 씨앗 3배 획득! (+3)',
                        color: '#10b981',
                        life: 60,
                      });
                    } else {
                      state.floatingTexts.push({
                        id: Math.random(),
                        x: canvas.width / 2,
                        y: canvas.height * 0.5,
                        text: '퀴즈 오답! 씨앗을 얻지 못했습니다.',
                        color: '#f97316',
                        life: 50,
                      });
                    }
                  });
                } else {
                  // Normal 1x seed
                  state.runSeedsCount += 1;
                  setRunSeeds(state.runSeedsCount);
                  playSeedCollectSound();

                  const w = canvas.width;
                  const h = canvas.height;
                  const roadW = (w * 0.12) + (w * 0.82 - w * 0.12) * ob.y;
                  const screenX = w * 0.5 + (ob.x * roadW * 0.45);
                  const screenY = (h * 0.22) + ob.y * (h * 0.78);

                  for (let p = 0; p < 8; p++) {
                    state.particles.push({
                      x: screenX,
                      y: screenY,
                      vx: (Math.random() - 0.5) * 5,
                      vy: (Math.random() - 0.5) * 5,
                      color: '#4ade80',
                      size: 3,
                      life: 20,
                      maxLife: 20,
                    });
                  }

                  state.floatingTexts.push({
                    id: Math.random(),
                    x: screenX,
                    y: screenY - 20,
                    text: '+1 씨앗!',
                    color: '#22c55e',
                    life: 35,
                  });
                }
              }
            }
          }

          // Remove off-screen obstacles
          if (ob.y > 1.1 || ob.destroyed) {
            state.obstacles.splice(i, 1);
          }
        }

        // Update particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;
          if (p.life <= 0) state.particles.splice(i, 1);
        }

        // Update floating texts
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const ft = state.floatingTexts[i];
          ft.y -= 1.2;
          ft.life -= 1;
          if (ft.life <= 0) state.floatingTexts.splice(i, 1);
        }
      }

      // ================= DRAWING =================
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Sky background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.25);
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.25);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(w * 0.25, h * 0.08, 24, 0, Math.PI * 2);
      ctx.arc(w * 0.28, h * 0.07, 30, 0, Math.PI * 2);
      ctx.arc(w * 0.32, h * 0.08, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.12, 20, 0, Math.PI * 2);
      ctx.arc(w * 0.78, h * 0.11, 26, 0, Math.PI * 2);
      ctx.arc(w * 0.82, h * 0.12, 18, 0, Math.PI * 2);
      ctx.fill();

      // Horizon line
      const horizonY = h * 0.22;

      // 2. Forest sides (Left & Right) with Dynamic Perspective Scrolling Trees
      const forestGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      forestGrad.addColorStop(0, '#15803d');
      forestGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = forestGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Dynamically scrolling 3D pine trees on left and right sides
      const numTrees = 8;
      for (let i = 0; i < numTrees; i++) {
        // Continuous high-speed downward scrolling with perspective mapping
        const progress = (state.distanceRun * 0.042 + i / numTrees) % 1.0;
        const pY = Math.pow(progress, 1.7);
        const ty = horizonY + pY * (h - horizonY);
        const treeScale = 0.15 + Math.pow(progress, 1.6) * 2.2;
        const treeAlpha = Math.min(1.0, progress * 4.0);

        ctx.save();
        ctx.globalAlpha = treeAlpha;

        // Left tree
        const leftX = (w * 0.08) - (pY * w * 0.03);
        ctx.fillStyle = i % 2 === 0 ? '#166534' : '#14532d';
        ctx.beginPath();
        ctx.moveTo(leftX, ty);
        ctx.lineTo(leftX - 35 * treeScale, ty + 42 * treeScale);
        ctx.lineTo(leftX + 25 * treeScale, ty + 42 * treeScale);
        ctx.closePath();
        ctx.fill();

        // Right tree
        const rightX = (w * 0.92) + (pY * w * 0.03);
        ctx.beginPath();
        ctx.moveTo(rightX, ty);
        ctx.lineTo(rightX - 25 * treeScale, ty + 42 * treeScale);
        ctx.lineTo(rightX + 35 * treeScale, ty + 42 * treeScale);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 3. Perspective Green Running Path (Triangular road)
      const topWidth = w * 0.12;
      const bottomWidth = w * 0.82;
      const topCenterX = w * 0.5;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(topCenterX - topWidth / 2, horizonY);
      ctx.lineTo(topCenterX + topWidth / 2, horizonY);
      ctx.lineTo(topCenterX + bottomWidth / 2, h);
      ctx.lineTo(topCenterX - bottomWidth / 2, h);
      ctx.closePath();

      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      roadGrad.addColorStop(0, '#22c55e');
      roadGrad.addColorStop(0.5, '#16a34a');
      roadGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Road side borders
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Fast-scrolling track edge curb strips (alternating white / amber curb bars)
      const curbSegments = 14;
      for (let c = 0; c < curbSegments; c++) {
        const p1 = (state.distanceRun * 0.06 + c / curbSegments) % 1.0;
        const p2 = Math.min(1.0, p1 + 0.045);
        if (p1 > p2) continue;

        const y1 = horizonY + Math.pow(p1, 1.3) * (h - horizonY);
        const y2 = horizonY + Math.pow(p2, 1.3) * (h - horizonY);
        const rw1 = topWidth + (bottomWidth - topWidth) * p1;
        const rw2 = topWidth + (bottomWidth - topWidth) * p2;
        const curbWidth1 = 3 + p1 * 14;
        const curbWidth2 = 3 + p2 * 14;

        ctx.fillStyle = c % 2 === 0 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(245, 158, 11, 0.45)';

        // Left curb segment
        ctx.beginPath();
        ctx.moveTo(topCenterX - rw1 / 2, y1);
        ctx.lineTo(topCenterX - rw1 / 2 + curbWidth1, y1);
        ctx.lineTo(topCenterX - rw2 / 2 + curbWidth2, y2);
        ctx.lineTo(topCenterX - rw2 / 2, y2);
        ctx.closePath();
        ctx.fill();

        // Right curb segment
        ctx.beginPath();
        ctx.moveTo(topCenterX + rw1 / 2, y1);
        ctx.lineTo(topCenterX + rw1 / 2 - curbWidth1, y1);
        ctx.lineTo(topCenterX + rw2 / 2 - curbWidth2, y2);
        ctx.lineTo(topCenterX + rw2 / 2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // Fast perspective road center dashed lines
      const centerDashCount = 10;
      for (let d = 0; d < centerDashCount; d++) {
        const dp1 = (state.distanceRun * 0.075 + d / centerDashCount) % 1.0;
        const dp2 = Math.min(1.0, dp1 + 0.05);
        if (dp1 > dp2) continue;

        const dy1 = horizonY + Math.pow(dp1, 1.4) * (h - horizonY);
        const dy2 = horizonY + Math.pow(dp2, 1.4) * (h - horizonY);
        const dashThickness = 2 + dp1 * 6;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = dashThickness;
        ctx.beginPath();
        ctx.moveTo(topCenterX, dy1);
        ctx.lineTo(topCenterX, dy2);
        ctx.stroke();
      }

      // High-speed wind motion streaks rushing down the track
      for (let s = 0; s < 6; s++) {
        const streakProg = (state.distanceRun * 0.095 + s * 0.166) % 1.0;
        const sy1 = horizonY + Math.pow(streakProg, 1.6) * (h - horizonY);
        const sy2 = Math.min(h, sy1 + 18 + streakProg * 35);
        const sRoadW = topWidth + (bottomWidth - topWidth) * streakProg;
        const laneOffset = (s % 2 === 0 ? -0.28 : 0.28);
        const sx = topCenterX + (laneOffset * sRoadW);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.2 + streakProg * 2.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy1);
        ctx.lineTo(sx, sy2);
        ctx.stroke();
      }

      ctx.restore();

      // Helper function to project track coordinates to screen
      const projectCoords = (trackX: number, trackY: number) => {
        const roadW = topWidth + (bottomWidth - topWidth) * trackY;
        const screenX = topCenterX + (trackX * roadW * 0.45);
        const screenY = horizonY + trackY * (h - horizonY);
        // Realistic 3D perspective scale: starts tiny (0.05) at horizon, grows organically as it gets close
        const scale = 0.05 + Math.pow(Math.max(0, trackY), 1.45) * 1.15;
        return { screenX, screenY, scale };
      };

      // 4. Draw Obstacles (Sorted by Y for depth sorting)
      const sortedObstacles = [...state.obstacles].sort((a, b) => a.y - b.y);

      sortedObstacles.forEach((ob) => {
        const { screenX, screenY, scale } = projectCoords(ob.x, ob.y);
        // Smooth alpha fade-in from horizon (y=0 to y=0.20) - completely eliminates sudden pop-in!
        const fadeAlpha = Math.min(1.0, Math.max(0, ob.y / 0.20));

        if (ob.type === 'monster') {
          // Draw Carbon Monster "C" with horns & legs
          ctx.save();
          ctx.globalAlpha = fadeAlpha;
          ctx.translate(screenX, screenY);
          ctx.scale(scale, scale);

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(0, 16, 16, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Red Horns
          ctx.fillStyle = '#dc2626';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(-8, -12);
          ctx.lineTo(-12, -26);
          ctx.lineTo(-4, -14);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(8, -12);
          ctx.lineTo(12, -26);
          ctx.lineTo(4, -14);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Black/brown circular body
          ctx.fillStyle = '#261204';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Arms
          ctx.beginPath();
          ctx.moveTo(-16, 0);
          ctx.lineTo(-24, -4);
          ctx.moveTo(16, 0);
          ctx.lineTo(24, -4);
          ctx.stroke();

          // Legs
          ctx.beginPath();
          ctx.moveTo(-6, 16);
          ctx.lineTo(-6, 22);
          ctx.moveTo(6, 16);
          ctx.lineTo(6, 22);
          ctx.stroke();

          // White letter "C"
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('C', 0, 1);

          ctx.restore();
        } else if (ob.type === 'seed') {
          // Draw Seed Bag "씨" packet
          ctx.save();
          ctx.globalAlpha = fadeAlpha;
          ctx.translate(screenX, screenY);
          ctx.scale(scale, scale);

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.ellipse(0, 14, 14, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Green Pouch
          ctx.fillStyle = '#065f46';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.fillRect(-12, -14, 24, 28);
          ctx.strokeRect(-12, -14, 24, 28);

          // Inner gold leaf trim
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-9, -11, 18, 22);

          // "씨" label
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('씨', 0, 0);

          ctx.restore();
        }
      });

      // 4.5 Draw Goal Post (골대 & 결승 아치) if spawned
      if (state.goalPost) {
        const gy = state.goalPost.y;
        const roadW = topWidth + (bottomWidth - topWidth) * gy;
        const screenY = horizonY + gy * (h - horizonY);
        const fadeAlpha = Math.min(1.0, Math.max(0, gy / 0.12));
        const postScale = 0.06 + Math.pow(Math.max(0, gy), 1.4) * 1.15;
        const postHeight = Math.max(18, 80 * postScale);
        const pillarWidth = Math.max(4, 11 * postScale);

        ctx.save();
        ctx.globalAlpha = fadeAlpha;

        // 1. Checkered Finish Line ribbon across the track ground
        const ribbonY = screenY;
        const ribbonWidth = roadW * 0.96;
        const ribbonHeight = Math.max(4, 16 * postScale);
        const numChecks = 16;
        const checkWidth = ribbonWidth / numChecks;
        for (let c = 0; c < numChecks; c++) {
          ctx.fillStyle = c % 2 === 0 ? '#ffffff' : '#0f172a';
          ctx.fillRect(
            topCenterX - ribbonWidth / 2 + c * checkWidth,
            ribbonY - ribbonHeight / 2,
            checkWidth,
            ribbonHeight
          );
        }

        // Golden ground glow across finish line
        ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
        ctx.fillRect(topCenterX - ribbonWidth / 2, ribbonY - ribbonHeight, ribbonWidth, ribbonHeight * 2);

        // 2. Goal Posts (Left & Right vertical pillars)
        const leftPostX = topCenterX - ribbonWidth / 2;
        const rightPostX = topCenterX + ribbonWidth / 2;

        // Post Shadows
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(leftPostX, screenY, pillarWidth * 1.6, pillarWidth * 0.8, 0, 0, Math.PI * 2);
        ctx.ellipse(rightPostX, screenY, pillarWidth * 1.6, pillarWidth * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pillar Gradient
        const postGrad = ctx.createLinearGradient(0, screenY - postHeight, 0, screenY);
        postGrad.addColorStop(0, '#fde047');
        postGrad.addColorStop(0.5, '#eab308');
        postGrad.addColorStop(1, '#a16207');

        ctx.fillStyle = postGrad;
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = Math.max(1, 2.5 * postScale);

        // Left pillar
        ctx.fillRect(leftPostX - pillarWidth / 2, screenY - postHeight, pillarWidth, postHeight);
        ctx.strokeRect(leftPostX - pillarWidth / 2, screenY - postHeight, pillarWidth, postHeight);

        // Right pillar
        ctx.fillRect(rightPostX - pillarWidth / 2, screenY - postHeight, pillarWidth, postHeight);
        ctx.strokeRect(rightPostX - pillarWidth / 2, screenY - postHeight, pillarWidth, postHeight);

        // Top Crossbar (골대 상단 가로대)
        const barThickness = Math.max(3, 10 * postScale);
        ctx.fillRect(leftPostX - pillarWidth / 2, screenY - postHeight, ribbonWidth + pillarWidth, barThickness);
        ctx.strokeRect(leftPostX - pillarWidth / 2, screenY - postHeight, ribbonWidth + pillarWidth, barThickness);

        // Goal Net Mesh (골망)
        if (postScale > 0.22) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          const netCols = 14;
          for (let nc = 1; nc < netCols; nc++) {
            const nx = leftPostX + (ribbonWidth / netCols) * nc;
            ctx.beginPath();
            ctx.moveTo(nx, screenY - postHeight + barThickness);
            ctx.lineTo(nx, screenY);
            ctx.stroke();
          }
          const netRows = 4;
          for (let nr = 1; nr < netRows; nr++) {
            const ny = screenY - postHeight + barThickness + ((postHeight - barThickness) / netRows) * nr;
            ctx.beginPath();
            ctx.moveTo(leftPostX, ny);
            ctx.lineTo(rightPostX, ny);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Top Victory Banner
        const bannerH = Math.max(12, 28 * postScale);
        const bannerW = Math.min(ribbonWidth * 0.85, 240 * postScale);
        const bannerY = screenY - postHeight - bannerH * 0.6;

        ctx.fillStyle = '#166534';
        ctx.fillRect(topCenterX - bannerW / 2, bannerY, bannerW, bannerH);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = Math.max(1.5, 3 * postScale);
        ctx.strokeRect(topCenterX - bannerW / 2, bannerY, bannerW, bannerH);

        // Banner text
        if (postScale > 0.18) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `900 ${Math.max(8, 14 * postScale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏁 GOAL! 60초 완주 🏁', topCenterX, bannerY + bannerH / 2);
        }

        // Triangular pennant flags on top of left and right posts
        const flagH = Math.max(6, 16 * postScale);
        const flagW = Math.max(8, 20 * postScale);
        ctx.fillStyle = '#ef4444';
        // Left flag
        ctx.beginPath();
        ctx.moveTo(leftPostX, screenY - postHeight);
        ctx.lineTo(leftPostX - flagW, screenY - postHeight + flagH * 0.5);
        ctx.lineTo(leftPostX, screenY - postHeight + flagH);
        ctx.closePath();
        ctx.fill();
        // Right flag
        ctx.beginPath();
        ctx.moveTo(rightPostX, screenY - postHeight);
        ctx.lineTo(rightPostX + flagW, screenY - postHeight + flagH * 0.5);
        ctx.lineTo(rightPostX, screenY - postHeight + flagH);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 5. Draw Player Character at bottom (y = 0.84)
      const playerPos = projectCoords(state.playerX, 0.84);
      ctx.save();
      ctx.translate(playerPos.screenX, playerPos.screenY);

      // If invulnerable, flicker
      if (state.invulnerableTime > 0 && Math.floor(state.invulnerableTime / 4) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Player Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 24, 20, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Attack aura effect when attacking
      if (state.attackTime > 0) {
        ctx.save();
        ctx.strokeStyle = currentWeapon.color || '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -5, 38, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fill();
        ctx.restore();
      }

      // Legs (running bob animation with fast cadence)
      const legBob = Math.sin(state.distanceRun * 1.3) * 5;
      ctx.fillStyle = currentSkin.bodyColor || '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;

      ctx.fillRect(-8, 6 + legBob, 6, 16);
      ctx.strokeRect(-8, 6 + legBob, 6, 16);

      ctx.fillRect(2, 6 - legBob, 6, 16);
      ctx.strokeRect(2, 6 - legBob, 6, 16);

      // Torso
      ctx.fillStyle = currentSkin.bodyColor || '#ffffff';
      ctx.fillRect(-9, -12, 18, 20);
      ctx.strokeRect(-9, -12, 18, 20);

      // Arms (holding weapon if attacking)
      const armBob = Math.cos(state.distanceRun * 1.3) * 5;
      ctx.fillRect(-16, -10 + armBob, 6, 16);
      ctx.strokeRect(-16, -10 + armBob, 6, 16);

      ctx.fillRect(10, -10 - armBob, 6, 16);
      ctx.strokeRect(10, -10 - armBob, 6, 16);

      // Equipped Weapon icon in hand
      if (currentWeapon.icon && currentWeapon.id !== 'fist') {
        ctx.font = '16px sans-serif';
        ctx.fillText(currentWeapon.icon, 14, -10 - armBob);
      }

      // Head: White smiling circle
      ctx.beginPath();
      ctx.arc(0, -22, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Eyes and smile
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-4, -24, 1.8, 0, Math.PI * 2);
      ctx.arc(4, -24, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -20, 5, 0, Math.PI);
      ctx.stroke();

      // Oxygen Hat (Cute cap with O2, styled with skin's hat color)
      ctx.fillStyle = currentSkin.hatColor || '#bae6fd';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -32, 11, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hat label "O2"
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('O₂', 0, -33);

      ctx.restore();

      // 6. Draw Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Draw Floating Texts
      state.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.min(1, ft.life / 20);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPaused, currentWeapon, onRequestQuiz, onGameOver]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-neutral-900 overflow-hidden select-none font-sans"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-ew-resize" />

      {/* In-Game Top HUD Overlay */}
      <div className="absolute top-2 left-2 right-2 z-20 pointer-events-none flex flex-col gap-2">
        <div className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-xl p-2.5 shadow-lg border-2 border-amber-900 flex items-center justify-between pointer-events-auto">
          {/* Hearts */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-neutral-600 hidden sm:inline">체력:</span>
            <div className="flex gap-1">
              {Array.from({ length: record.maxHearts }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${
                    i < currentHearts ? 'text-rose-500 fill-rose-500' : 'text-neutral-300 fill-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 60s Timer / Goal Progress Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border transition ${
              elapsedSeconds >= 60
                ? 'bg-amber-400 text-amber-950 border-amber-500 animate-pulse shadow-md'
                : 'bg-sky-100 text-sky-900 border-sky-300'
            }`}
          >
            {elapsedSeconds >= 60 ? (
              <>
                <Flag className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
                <span>🏁 골대 진입!</span>
              </>
            ) : (
              <>
                <Timer className="w-3.5 h-3.5 text-sky-700" />
                <span>골대까지: {Math.max(0, 60 - elapsedSeconds)}초</span>
              </>
            )}
          </div>

          {/* Seed Count */}
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 font-extrabold px-3 py-1 rounded-lg text-sm border border-emerald-300">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>씨앗 +{runSeeds}</span>
          </div>

          {/* Run Score / Distance */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block">달린 거리</span>
              <span className="font-mono font-black text-sm text-neutral-800">{distance}m</span>
            </div>

            {/* Back to village button */}
            <button
              onClick={() =>
                onReturnToVillage({
                  seedsCollected: runSeeds,
                  monstersDefeated,
                  distance,
                })
              }
              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg border border-amber-300 transition"
              title="마을로 돌아가기"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Climate Gauges on top as required */}
        <div className="w-full max-w-2xl mx-auto grid grid-cols-2 gap-2 pointer-events-auto">
          {/* 산림면적 */}
          <div className="bg-emerald-950/85 backdrop-blur-sm rounded-lg p-1.5 text-white border border-emerald-500">
            <div className="flex justify-between text-[11px] font-bold">
              <span>🌲 산림면적</span>
              <span className="text-emerald-300 font-mono">{record.forestArea.toFixed(1)}% / 65%</span>
            </div>
          </div>
          {/* 지구온난화 */}
          <div className="bg-rose-950/85 backdrop-blur-sm rounded-lg p-1.5 text-white border border-rose-500">
            <div className="flex justify-between text-[11px] font-bold">
              <span>🔥 온난화 게이지</span>
              <span className="text-rose-300 font-mono">{record.warmingGauge} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls / Attack & Move prompt */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Helper guide */}
        <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20">
          👆 좌우 드래그 이동 (A/D) | 💥 정화 공격 (남은 {attacksLeft}/5회, 스페이스바)
        </div>

        {/* Attack Button (Mobile & Click friendly, with 5-limit indicator) */}
        <button
          onClick={performAttack}
          disabled={attacksLeft <= 0}
          className={`pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 shadow-2xl flex flex-col items-center justify-center text-white transition transform ${
            attacksLeft > 0
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 border-white active:scale-90 shadow-orange-500/50 cursor-pointer'
              : 'bg-neutral-700 border-neutral-500 opacity-60 cursor-not-allowed'
          }`}
          title={attacksLeft > 0 ? `정화 공격 (${attacksLeft}/5회 남음)` : '공격 횟수 모두 소진'}
        >
          <span className="text-2xl leading-none">{currentWeapon.icon || '👊'}</span>
          <span className="text-[10px] font-black tracking-tighter mt-0.5">
            {attacksLeft > 0 ? '정화 공격' : '소진됨'}
          </span>
          <span
            className={`text-[9px] font-black px-1.5 py-0.2 rounded-full mt-0.5 ${
              attacksLeft > 0 ? 'bg-black/40 text-amber-200' : 'bg-red-900 text-red-200'
            }`}
          >
            {attacksLeft}/5
          </span>
        </button>
      </div>

      {/* 60s Goal Reached Modal */}
      {isGoalReached && (
        <div className="absolute inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-amber-300">
              🏆
            </div>
            <div>
              <h2 className="text-2xl font-black text-amber-900 tracking-tight">60초 완주 성공!</h2>
              <p className="text-sm font-bold text-neutral-600 mt-1">골대에 안전하게 도달했습니다!</p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs font-bold text-neutral-700 space-y-2">
              <div className="flex justify-between items-center">
                <span>획득한 씨앗</span>
                <span className="text-emerald-600 font-extrabold text-sm">+{runSeeds}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span>정화한 몬스터</span>
                <span className="text-blue-600 font-extrabold text-sm">{monstersDefeated}마리</span>
              </div>
              <div className="flex justify-between items-center">
                <span>달린 거리</span>
                <span className="text-neutral-900 font-extrabold text-sm">{distance}m</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 font-medium">잠시 후 메인 화면으로 돌아갑니다...</p>

            <button
              onClick={() =>
                onReturnToVillage({
                  seedsCollected: runSeeds,
                  monstersDefeated,
                  distance,
                })
              }
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition"
            >
              메인 화면으로 바로 가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
