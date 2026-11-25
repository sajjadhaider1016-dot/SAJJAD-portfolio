// Soft synthesised game sounds: bell-like notes through a short echo. No audio files.
let ctx: AudioContext | null = null;
let out: GainNode | null = null;

function ready() {
  if (!ctx) {
    ctx = new AudioContext();
    out = ctx.createGain(); out.gain.value = 0.5; out.connect(ctx.destination);
    const delay = ctx.createDelay(); delay.delayTime.value = 0.17;
    const feedback = ctx.createGain(); feedback.gain.value = 0.28;
    out.connect(delay); delay.connect(feedback); feedback.connect(delay); feedback.connect(ctx.destination);
  }
  void ctx.resume();
  return ctx;
}

function notes(freqs: number[], gap: number, length: number, level: number) {
  try {
    const c = ready();
    freqs.forEach((f, i) => {
      const at = c.currentTime + i * gap;
      [[1, level], [2.01, level * 0.22]].forEach(([mult, gain]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f * mult;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(gain, at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, at + length);
        o.connect(g); g.connect(out!); o.start(at); o.stop(at + length + 0.05);
      });
    });
  } catch { /* sound is optional */ }
}

export const sfx = {
  start: () => notes([392, 523.25, 783.99], 0.09, 0.7, 0.12),
  /** Each shard sounds a step higher than the last. */
  shard: (n: number) => notes([[659.25, 739.99, 830.61, 880, 987.77, 1108.73, 1174.66, 1318.51][Math.max(0, Math.min(7, n - 1))]], 0, 0.55, 0.16),
  scan: () => notes([440, 554.37, 659.25, 880], 0.065, 0.65, 0.11),
  complete: () => notes([523.25, 659.25, 783.99, 1046.5, 1318.51], 0.12, 1.3, 0.13),
};
