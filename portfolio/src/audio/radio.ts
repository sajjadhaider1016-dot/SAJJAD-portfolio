// Six generative "discs" synthesised with the Web Audio API. No streams or audio files, so they work offline.
export type Station = { id: string; name: string; desc: string; hue: string; bpm: number; root: number; scale: number[]; wave: OscillatorType; drums: 0 | 1 | 2; cutoff: number; pad: number };
export const STATIONS: Station[] = [
  { id: 'grooves', name: 'Green Loop', desc: 'Warm downtempo beats', hue: '#2DBE7E', bpm: 84, root: 50, scale: [0, 3, 5, 7, 10], wave: 'triangle', drums: 1, cutoff: 1800, pad: 0.06 },
  { id: 'flow', name: 'Blue Hour', desc: 'Mellow keys over soft drums', hue: '#2F7BFF', bpm: 76, root: 53, scale: [0, 2, 4, 7, 9], wave: 'sine', drums: 1, cutoff: 2400, pad: 0.07 },
  { id: 'sun', name: 'Orange Walk', desc: 'Light, bouncy off-beats', hue: '#FF8A00', bpm: 104, root: 55, scale: [0, 2, 4, 7, 9], wave: 'triangle', drums: 2, cutoff: 3200, pad: 0.04 },
  { id: 'blooms', name: 'Soft Bloom', desc: 'Airy arpeggios', hue: '#FF3D8B', bpm: 92, root: 57, scale: [0, 2, 3, 7, 8], wave: 'sine', drums: 0, cutoff: 2800, pad: 0.08 },
  { id: 'planet', name: 'Orbit', desc: 'Slow electronic pulses', hue: '#7A5CFF', bpm: 68, root: 45, scale: [0, 3, 5, 7, 10], wave: 'sawtooth', drums: 0, cutoff: 900, pad: 0.07 },
  { id: 'haze', name: 'Night Drone', desc: 'Atmosphere, no beats', hue: '#3B57C4', bpm: 54, root: 41, scale: [0, 5, 7, 12], wave: 'sine', drums: 0, cutoff: 1200, pad: 0.12 },
];
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class Radio {
  private ctx: AudioContext | null = null;
  private master!: GainNode; private bus: GainNode | null = null; private filter!: BiquadFilterNode; analyser: AnalyserNode | null = null;
  private timer = 0; private step = 0; private next = 0; private noise!: AudioBuffer; private seed = 1;
  playing = false; station: Station | null = null; volume = 0.6;
  private rand() { this.seed = (this.seed * 16807) % 2147483647; return this.seed / 2147483647; }
  private init() {
    if (this.ctx) return this.ctx;
    const c = (this.ctx = new AudioContext());
    this.master = c.createGain(); this.analyser = c.createAnalyser(); this.analyser.fftSize = 128;
    this.master.connect(this.analyser); this.analyser.connect(c.destination);
    this.noise = c.createBuffer(1, c.sampleRate / 4, c.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return c;
  }
  private tone(midi: number, at: number, dur: number, gain: number, type: OscillatorType, attack = 0.02) {
    const c = this.ctx!, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = hz(midi); o.detune.value = (this.rand() - 0.5) * 8;
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(gain, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(this.filter); o.start(at); o.stop(at + dur + 0.05);
  }
  private hit(at: number, kind: 'kick' | 'hat') {
    const c = this.ctx!, g = c.createGain(); g.connect(this.bus!);
    if (kind === 'kick') {
      const o = c.createOscillator(); o.frequency.setValueAtTime(120, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.18);
      g.gain.setValueAtTime(0.4, at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.25); o.connect(g); o.start(at); o.stop(at + 0.3);
    } else {
      const s = c.createBufferSource(), hp = c.createBiquadFilter(); s.buffer = this.noise; hp.type = 'highpass'; hp.frequency.value = 7000;
      g.gain.setValueAtTime(0.07, at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.07); s.connect(hp); hp.connect(g); s.start(at); s.stop(at + 0.1);
    }
  }
  private schedule = () => {
    const s = this.station!, c = this.ctx!, eighth = 30 / s.bpm;
    while (this.next < c.currentTime + 0.25) {
      const i = this.step % 32, at = this.next, bar = Math.floor(this.step / 8) % 4, shift = [0, -4, 3, -2][bar];
      if (i % 8 === 0) { [0, 2, 4].forEach((n) => this.tone(s.root + shift + s.scale[n % s.scale.length], at, eighth * 9, s.pad, s.wave, eighth * 2)); this.tone(s.root + shift - 12, at, eighth * 6, 0.16, 'sine'); }
      if (this.rand() > (s.drums ? 0.45 : 0.7)) this.tone(s.root + 12 + s.scale[Math.floor(this.rand() * s.scale.length)], at, eighth * 3, 0.07, s.wave);
      if (s.drums === 1) { if (i % 8 === 0 || i % 8 === 5) this.hit(at, 'kick'); if (i % 2 === 1) this.hit(at, 'hat'); }
      if (s.drums === 2) { if (i % 4 === 0) this.hit(at, 'kick'); if (i % 4 === 2) this.hit(at, 'hat'); }
      this.step++; this.next += eighth;
    }
  };
  async play(station: Station) {
    const c = this.init(); await c.resume(); this.halt(0.15);
    this.station = station; this.playing = true; this.seed = station.root * 97;
    this.bus = c.createGain(); this.filter = c.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = station.cutoff;
    this.filter.connect(this.bus); this.bus.connect(this.master);
    this.master.gain.value = this.volume * 2;
    this.bus.gain.setValueAtTime(0, c.currentTime); this.bus.gain.linearRampToValueAtTime(1, c.currentTime + 1.2);
    this.step = 0; this.next = c.currentTime + 0.05; this.schedule(); this.timer = window.setInterval(this.schedule, 80);
  }
  private halt(fade: number) {
    clearInterval(this.timer);
    const bus = this.bus, c = this.ctx;
    if (bus && c) { bus.gain.cancelScheduledValues(c.currentTime); bus.gain.setValueAtTime(bus.gain.value, c.currentTime); bus.gain.linearRampToValueAtTime(0, c.currentTime + fade); setTimeout(() => bus.disconnect(), fade * 1000 + 80); }
    this.bus = null;
  }
  stop() { if (!this.playing) return; this.playing = false; this.halt(0.45); }
  setVolume(v: number) { this.volume = v; if (this.ctx) this.master.gain.setTargetAtTime(v * 2, this.ctx.currentTime, 0.02); }
  get contextState() { return this.ctx?.state ?? 'none'; }
}
export const radio = new Radio();
