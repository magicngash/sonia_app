/**
 * Subtle acoustic chime for app action notifications using native Web Audio API
 */
export function playNotificationChime(type: 'success' | 'info' | 'warning' | 'error' = 'success') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    if (type === 'success') {
      // Cheerful ascending two-tone
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(349.23, ctx.currentTime + 0.15);
    } else if (type === 'error') {
      osc.frequency.setValueAtTime(329.63, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    }

    // Soft volume envelope
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.23);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 400);
  } catch {
    // Gracefully ignore audio errors (e.g. autoplay policies)
  }
}
