// Web Audio API retro sound synthesizer

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleAudioMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

export function getAudioMuted(): boolean {
  return isMuted;
}

export function playMoveSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playSeedCollectSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
    gain.gain.setValueAtTime(0.12, now + idx * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.04);
    osc.stop(now + idx * 0.04 + 0.12);
  });
}

export function playMonsterHitSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playAttackSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playQuizSuccessSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const melody = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
  melody.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.18, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.25);
  });
}

export function playQuizFailSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.setValueAtTime(196, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}

export function playPlantTreeSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const chords = [392.0, 493.88, 587.33, 783.99]; // G major
  chords.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  });
}

export function playVictorySound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const fanfare = [
    { f: 523.25, d: 0.15, t: 0 },
    { f: 523.25, d: 0.15, t: 0.15 },
    { f: 523.25, d: 0.15, t: 0.3 },
    { f: 659.25, d: 0.3, t: 0.45 },
    { f: 783.99, d: 0.3, t: 0.75 },
    { f: 1046.5, d: 0.6, t: 1.05 },
  ];
  fanfare.forEach((item) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(item.f, now + item.t);
    gain.gain.setValueAtTime(0.2, now + item.t);
    gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + item.t);
    osc.stop(now + item.t + item.d);
  });
}
