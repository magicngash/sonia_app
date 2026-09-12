import React, { useState, useEffect, useRef } from 'react';
import { 
  playViolinTone, 
  startViolinDrone, 
  stopViolinDrone, 
  playMetronomeClick, 
  ViolinStringName, 
  getViolinStringFrequency 
} from '../../utils/violinAudio';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Activity, 
  Music, 
  Sliders, 
  Check, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Layers,
  Flame,
  Info
} from 'lucide-react';

interface ViolinPracticeToolkitProps {
  initialTab?: 'tuner' | 'metronome' | 'routine';
  compact?: boolean;
}

const TEMPO_PRESETS = [
  { label: 'Largo', bpm: 50 },
  { label: 'Adagio', bpm: 66 },
  { label: 'Andante', bpm: 78 },
  { label: 'Moderato', bpm: 104 },
  { label: 'Allegro', bpm: 128 },
  { label: 'Presto', bpm: 168 },
];

const VIOLIN_STRINGS: { name: ViolinStringName; note: string; octave: string; role: string; color: string }[] = [
  { name: 'G', note: 'G3', octave: 'Lowest string', role: 'Warm, deep resonant sonority', color: 'from-amber-700 to-amber-900' },
  { name: 'D', note: 'D4', octave: 'Middle string', role: 'Mellow singing voice', color: 'from-amber-600 to-amber-800' },
  { name: 'A', note: 'A4', octave: 'Tuning reference', role: 'Concert pitch foundation', color: 'from-blue-600 to-indigo-800' },
  { name: 'E', note: 'E5', octave: 'Highest string', role: 'Brilliant & soaring projection', color: 'from-emerald-600 to-teal-800' },
];

export const ViolinPracticeToolkit: React.FC<ViolinPracticeToolkitProps> = ({
  initialTab = 'tuner',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'tuner' | 'metronome' | 'routine'>(initialTab);

  // Tuner State
  const [concertPitch, setConcertPitch] = useState<440 | 442 | 415>(440);
  const [activeDroneString, setActiveDroneString] = useState<ViolinStringName | null>(null);
  const [activePluck, setActivePluck] = useState<ViolinStringName | null>(null);

  // Metronome State
  const [bpm, setBpm] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  // Practice Routine Checklist (stored locally for practice session)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    'warmup-drone': true,
    'scale-arpeggio': false,
    'shifting-drills': false,
    'etude-kreutzer': false,
    'concerto-passage': false,
    'cadenza-slow': false,
  });

  const metronomeIntervalRef = useRef<number | null>(null);

  // Handle Drone Toggle
  const handleToggleDrone = (str: ViolinStringName) => {
    if (activeDroneString === str) {
      stopViolinDrone();
      setActiveDroneString(null);
    } else {
      startViolinDrone(str, concertPitch);
      setActiveDroneString(str);
    }
  };

  // Play single string tone
  const handlePlayStringTone = (str: ViolinStringName) => {
    setActivePluck(str);
    playViolinTone(str, concertPitch, 2.0);
    setTimeout(() => setActivePluck(null), 1000);
  };

  // Stop drone on unmount
  useEffect(() => {
    return () => {
      stopViolinDrone();
    };
  }, []);

  // Update drone frequency if concert pitch changes while drone is active
  useEffect(() => {
    if (activeDroneString) {
      startViolinDrone(activeDroneString, concertPitch);
    }
  }, [concertPitch]);

  // Metronome Sound & Beat Loop
  useEffect(() => {
    if (!isPlaying) {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      setCurrentBeat(1);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    
    // Play immediate first beat
    playMetronomeClick(true);
    setCurrentBeat(1);

    let nextBeat = 2;
    metronomeIntervalRef.current = window.setInterval(() => {
      const isAccent = nextBeat === 1;
      playMetronomeClick(isAccent);
      setCurrentBeat(nextBeat);
      nextBeat = nextBeat >= beatsPerMeasure ? 1 : nextBeat + 1;
    }, intervalMs);

    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
    };
  }, [isPlaying, bpm, beatsPerMeasure]);

  // Tap Tempo Logic
  const handleTapTempo = () => {
    const now = performance.now();
    const newTapTimes = [...tapTimes.slice(-4), now];
    setTapTimes(newTapTimes);

    if (newTapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 260) {
        setBpm(calculatedBpm);
      }
    }
  };

  const toggleChecklist = (id: string) => {
    setCompletedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-900/15 shadow-sm overflow-hidden">
      {/* Header with warm classical wood tone accent */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">Violinist Practice Toolkit</h3>
            <p className="text-[11px] text-amber-200/80">Concert Tuner, Intonation Drones &amp; Studio Metronome</p>
          </div>
        </div>

        {/* Toolkit Sub-tabs */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('tuner')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'tuner' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Violin Tuner &amp; Drones
          </button>
          <button
            onClick={() => setActiveTab('metronome')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'metronome' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Practice Metronome
          </button>
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'routine' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Daily Routine
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* ===================== TAB 1: VIOLIN TUNER & DRONES ===================== */}
        {activeTab === 'tuner' && (
          <div className="space-y-4">
            {/* Calibration bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-bold text-amber-950">Concert Pitch Calibration:</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {[
                  { pitch: 440, label: 'A=440 Hz (Standard)' },
                  { pitch: 442, label: 'A=442 Hz (Orchestral)' },
                  { pitch: 415, label: 'A=415 Hz (Baroque)' },
                ].map(({ pitch, label }) => (
                  <button
                    key={pitch}
                    onClick={() => setConcertPitch(pitch as 440 | 442 | 415)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      concertPitch === pitch
                        ? 'bg-amber-800 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* The 4 Violin Strings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {VIOLIN_STRINGS.map((s) => {
                const freq = getViolinStringFrequency(s.name, concertPitch).toFixed(1);
                const isDroneActive = activeDroneString === s.name;
                const isPluckActive = activePluck === s.name;

                return (
                  <div 
                    key={s.name}
                    className={`relative rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                      isDroneActive 
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900 font-serif">
                          {s.name}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {s.note} • {freq} Hz
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.octave}</p>
                      <p className="text-[11px] text-slate-600 mt-1 italic">{s.role}</p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                      <button
                        onClick={() => handlePlayStringTone(s.name)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                          isPluckActive
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                        title="Play reference pitch"
                      >
                        <Volume2 className="w-3.5 h-3.5 mr-1" />
                        Tone
                      </button>

                      <button
                        onClick={() => handleToggleDrone(s.name)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          isDroneActive
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                        title={isDroneActive ? 'Stop continuous intonation drone' : 'Start continuous intonation drone'}
                      >
                        {isDroneActive ? (
                          <>
                            <Square className="w-3 h-3 mr-1" />
                            Stop Drone
                          </>
                        ) : (
                          <>
                            <Activity className="w-3.5 h-3.5 mr-1" />
                            Hold Drone
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pedagogical Drone Intonation Note */}
            <div className="flex items-start space-x-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-900">Violin Pedagogy Tip:</strong> Use the <em>Hold Drone</em> feature while practicing two-octave scales and shifting into 3rd, 5th, and 7th positions. Listen for sympathetic string vibrations and pure intervals without beats.
              </p>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: METRONOME ===================== */}
        {activeTab === 'metronome' && (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Left: BPM Display & Pendulum Visualizer */}
              <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black tracking-tight font-mono text-amber-400">
                    {bpm}
                  </span>
                  <span className="text-sm uppercase tracking-widest text-slate-400 font-bold">
                    BPM
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium mt-1">
                  {TEMPO_PRESETS.slice().reverse().find(p => bpm >= p.bpm)?.label || 'Largo'}
                </p>

                {/* Beat visualizer indicator dots */}
                <div className="flex items-center space-x-2 mt-4">
                  {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
                    const beatNumber = idx + 1;
                    const isCurrent = isPlaying && currentBeat === beatNumber;
                    const isFirstBeat = beatNumber === 1;

                    return (
                      <div
                        key={idx}
                        className={`transition-all duration-75 flex items-center justify-center font-mono text-[11px] font-bold rounded-lg ${
                          isCurrent
                            ? isFirstBeat
                              ? 'w-9 h-9 bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/50 ring-2 ring-white'
                              : 'w-8 h-8 bg-blue-400 text-slate-950 scale-105 shadow-md shadow-blue-400/40'
                            : 'w-7 h-7 bg-white/10 text-slate-400 border border-white/10'
                        }`}
                      >
                        {beatNumber}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center: BPM Slider */}
              <div className="flex-1 w-full max-w-sm px-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Largo (40)</span>
                  <span>Presto (220)</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={220}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                {/* Meter Selector */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-300 font-medium">Meter / Time Sig:</span>
                  <div className="flex space-x-1">
                    {[2, 3, 4, 6].map((meter) => (
                      <button
                        key={meter}
                        onClick={() => setBeatsPerMeasure(meter)}
                        className={`px-2 py-0.5 rounded text-xs font-bold font-mono transition-colors ${
                          beatsPerMeasure === meter
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {meter}/4
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Controls & Tap Tempo */}
              <div className="flex flex-col sm:flex-row md:flex-col items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-full sm:w-auto md:w-36 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-4 h-4 mr-1.5 fill-current" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1.5 fill-current" />
                      Start
                    </>
                  )}
                </button>

                <button
                  onClick={handleTapTempo}
                  className="w-full sm:w-auto md:w-36 py-2 px-4 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer"
                  title="Tap repeatedly along with music to detect BPM"
                >
                  Tap Tempo
                </button>
              </div>
            </div>

            {/* Tempo Presets Bar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-500 mr-2">Italian Tempo Markings:</span>
              {TEMPO_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setBpm(p.bpm)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    bpm === p.bpm
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.label} ({p.bpm})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: DAILY VIOLIN ROUTINE ===================== */}
        {activeTab === 'routine' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Recommended Daily Violin Practice Structure
                </h4>
                <p className="text-xs text-slate-500">Essential string pedagogy pillars to complete between lessons</p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {Object.values(completedItems).filter(Boolean).length} of 6 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'warmup-drone',
                  title: '1. Open Strings & Intonation Drone (10 mins)',
                  desc: 'Long bows (Son File) at 60 BPM with A=440 drone. Focus on straight bow path and even sound envelope.',
                },
                {
                  id: 'scale-arpeggio',
                  title: '2. 3-Octave Scales & Arpeggios (15 mins)',
                  desc: 'Carl Flesch / Galamian scale system. 2, 4, 8, 16 notes slurred per bow.',
                },
                {
                  id: 'shifting-drills',
                  title: '3. Shifting & Finger Independence (10 mins)',
                  desc: 'Sevcik Op. 8 shifting and Sevcik Op. 1 double stop preparations without wrist collapse.',
                },
                {
                  id: 'etude-kreutzer',
                  title: '4. Etude Study (15 mins)',
                  desc: 'Kreutzer, Fiorillo, or Wohlfahrt. Focus on target bowing (spiccato, martelé, or string crossing).',
                },
                {
                  id: 'concerto-passage',
                  title: '5. Solo Repertoire / Concerto (25 mins)',
                  desc: 'Isolate technical hurdles. Practice difficult measures with metronome dotted rhythms.',
                },
                {
                  id: 'cadenza-slow',
                  title: '6. Cadenza & Musical Run-Through (15 mins)',
                  desc: 'Perform full movement or piece without stopping. Record and critique tone projection.',
                },
              ].map((task) => {
                const isChecked = !!completedItems[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleChecklist(task.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isChecked 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {task.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
