/**
 * Violin Acoustic Pitch Generator & Metronome Audio Engine using Web Audio API
 */

let globalAudioCtx: AudioContext | null = null;
let currentDroneOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
let currentDroneGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        globalAudioCtx = new AudioCtx();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
}

export type ViolinStringName = 'G' | 'D' | 'A' | 'E';

export function getViolinStringFrequency(stringName: ViolinStringName, concertPitchA: number = 440): number {
  switch (stringName) {
    case 'G': // G3 is 14 semitones below A4
      return concertPitchA * Math.pow(2, -14 / 12);
    case 'D': // D4 is 7 semitones below A4
      return concertPitchA * Math.pow(2, -7 / 12);
    case 'A': // A4
      return concertPitchA;
    case 'E': // E5 is 7 semitones above A4
      return concertPitchA * Math.pow(2, 7 / 12);
  }
}

/**
 * Play a rich plucked or bowed violin string reference tone
 */
export function playViolinTone(stringName: ViolinStringName, concertPitchA: number = 440, durationSec: number = 2.0) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = getViolinStringFrequency(stringName, concertPitchA);
  const now = ctx.currentTime;

  // Create multi-oscillator harmonic blend for warm violin string resonance
  const harmonics = [
    { mult: 1, gain: 0.18 },   // Fundamental
    { mult: 2, gain: 0.10 },   // 2nd harmonic (octave)
    { mult: 3, gain: 0.06 },   // 3rd harmonic (fifth)
    { mult: 4, gain: 0.03 },   // 4th harmonic
  ];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  // Gentle attack like bow placement
  masterGain.gain.exponentialRampToValueAtTime(0.2, now + 0.08);
  // Sustained tone
  masterGain.gain.setValueAtTime(0.18, now + durationSec - 0.4);
  // Gentle decay
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
  masterGain.connect(ctx.destination);

  harmonics.forEach(h => {
    const osc = ctx.createOscillator();
    osc.type = h.mult % 2 === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq * h.mult, now);

    const hGain = ctx.createGain();
    hGain.gain.value = h.gain;

    osc.connect(hGain);
    hGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + durationSec + 0.05);
  });
}

/**
 * Continuous tuning drone for scale and intonation practice
 */
export function startViolinDrone(stringName: ViolinStringName, concertPitchA: number = 440) {
  stopViolinDrone();
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = getViolinStringFrequency(stringName, concertPitchA);
  const now = ctx.currentTime;

  currentDroneGain = ctx.createGain();
  currentDroneGain.gain.setValueAtTime(0.001, now);
  currentDroneGain.gain.exponentialRampToValueAtTime(0.15, now + 0.2);
  currentDroneGain.connect(ctx.destination);

  const harmonics = [
    { mult: 1, gain: 0.16, type: 'triangle' as OscillatorType },
    { mult: 2, gain: 0.07, type: 'sine' as OscillatorType },
    { mult: 3, gain: 0.03, type: 'sine' as OscillatorType },
  ];

  currentDroneOscs = harmonics.map(h => {
    const osc = ctx.createOscillator();
    osc.type = h.type;
    osc.frequency.setValueAtTime(baseFreq * h.mult, now);

    const gain = ctx.createGain();
    gain.gain.value = h.gain;

    osc.connect(gain);
    gain.connect(currentDroneGain!);

    osc.start(now);
    return { osc, gain };
  });
}

export function stopViolinDrone() {
  if (currentDroneGain && globalAudioCtx) {
    try {
      const now = globalAudioCtx.currentTime;
      currentDroneGain.gain.setValueAtTime(currentDroneGain.gain.value, now);
      currentDroneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      setTimeout(() => {
        currentDroneOscs.forEach(({ osc }) => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
        currentDroneOscs = [];
        currentDroneGain = null;
      }, 160);
    } catch {
      currentDroneOscs = [];
      currentDroneGain = null;
    }
  } else {
    currentDroneOscs = [];
    currentDroneGain = null;
  }
}

/**
 * Crisp woodblock / click for practice metronome
 */
export function playMetronomeClick(accent: boolean = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(accent ? 1400 : 900, now);
  osc.frequency.exponentialRampToValueAtTime(accent ? 500 : 300, now + 0.035);

  gain.gain.setValueAtTime(accent ? 0.35 : 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}
