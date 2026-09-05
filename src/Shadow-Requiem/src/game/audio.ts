// Procedural Web Audio engine for realistic martial arts sound FX and dark fantasy ambiance

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Initialized as MUTED by default
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private isAmbientPlaying: boolean = false;
  private muteListeners: Set<(muted: boolean) => void> = new Set();

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribeMute(listener: (muted: boolean) => void): () => void {
    this.muteListeners.add(listener);
    listener(this.isMuted);
    return () => this.muteListeners.delete(listener);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.value = muted ? 0 : 0.08;
    }
    this.muteListeners.forEach((fn) => {
      try {
        fn(muted);
      } catch {}
    });
  }

  public toggleMute(): boolean {
    const nextState = !this.isMuted;
    this.setMuted(nextState);
    if (!nextState) {
      this.initContext();
      this.playEquip(); // Auditory confirmation ping
    }
    return nextState;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Weapon swing whoosh sound (frequency drops to simulate Doppler air displacement)
  public playSwing(weight: 'light' | 'medium' | 'heavy' = 'medium') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    const baseFreq = weight === 'light' ? 440 : weight === 'medium' ? 320 : 200;
    const duration = weight === 'light' ? 0.14 : weight === 'medium' ? 0.22 : 0.32;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.5, t);
    filter.frequency.exponentialRampToValueAtTime(140, t + duration);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);

    // Add subtle noise blast for realistic swish
    this.playNoiseSwish(duration, weight === 'heavy' ? 0.2 : 0.12);
  }

  private playNoiseSwish(duration: number, volume: number) {
    if (!this.ctx || this.isMuted) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Metal blade clashing / parry / block sound
  public playMetalParry() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1860, t);
    osc1.frequency.exponentialRampToValueAtTime(940, t + 0.35);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2450, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.3);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  // Flesh / Armor hit impact
  public playHitImpact(isCrit: boolean = false, isHeavy: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isHeavy ? 'sawtooth' : 'sine';
    const startFreq = isCrit ? 220 : isHeavy ? 150 : 180;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + (isHeavy ? 0.28 : 0.15));

    const vol = isCrit ? 0.5 : isHeavy ? 0.4 : 0.28;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isHeavy ? 0.3 : 0.18));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);

    if (isCrit) {
      this.playCritChime();
    }
  }

  // Light hit / UI tap sound
  public playHitLight() {
    this.playHitImpact(false, false);
  }

  // Gear / character equip chime
  public playEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(1040, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  private playCritChime() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, t);
    osc.frequency.exponentialRampToValueAtTime(740, t + 0.5);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  // Shadow Energy Transformation (Sub-bass explosion and eerie ethereal spectral resonance)
  public playShadowBurst() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Sub-bass rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.6);
    subGain.gain.setValueAtTime(0.6, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.7);

    // Spectral harmonic sweep
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(300, t);
    sweepOsc.frequency.exponentialRampToValueAtTime(800, t + 0.4);
    sweepOsc.frequency.exponentialRampToValueAtTime(200, t + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 4;

    sweepGain.gain.setValueAtTime(0.25, t);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    sweepOsc.connect(filter);
    filter.connect(sweepGain);
    sweepGain.connect(this.ctx.destination);

    sweepOsc.start(t);
    sweepOsc.stop(t + 0.8);
  }

  // Shadow Ability Strike (explosive void impact)
  public playShadowAbilityImpact() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.55);
  }

  // Knockdown ground thud
  public playKnockdown() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Dark fantasy martial arts ambient drone
  public startAmbientCombatMusic() {
    if (this.isAmbientPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = this.isMuted ? 0 : 0.08;
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc = this.ctx.createOscillator();
      this.ambientOsc.type = 'triangle';
      this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.ambientOsc.connect(filter);
      filter.connect(this.ambientGain);

      this.ambientOsc.start();
      this.isAmbientPlaying = true;
    } catch {
      // Audio context may require user interaction first
    }
  }

  public stopAmbientCombatMusic() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {}
      this.ambientOsc = null;
    }
    this.isAmbientPlaying = false;
  }
}

export const sound = new SoundEngine();
