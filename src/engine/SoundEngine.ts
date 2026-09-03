export class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.35;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private pendingLoads: Map<string, Promise<AudioBuffer | null>> = new Map();
  private bgMusicAudio: HTMLAudioElement | null = null;
  private musicPlaying: boolean = false;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.bgMusicAudio) {
      this.bgMusicAudio.muted = this.muted;
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public async playDepthsSound(soundName: string, volScale: number = 1.0): Promise<boolean> {
    if (this.muted) return false;
    this.initCtx();
    if (!this.ctx) return false;

    const url = `assets/depths/sounds/${soundName}.wav`;
    try {
      let buffer = this.audioBufferCache.get(url);
      if (!buffer) {
        if (!this.pendingLoads.has(url)) {
          const loadPromise = fetch(url)
            .then(res => res.arrayBuffer())
            .then(arr => this.ctx!.decodeAudioData(arr))
            .catch(() => null);
          this.pendingLoads.set(url, loadPromise);
        }
        buffer = (await this.pendingLoads.get(url)) || undefined;
        if (buffer) {
          this.audioBufferCache.set(url, buffer);
        }
      }

      if (buffer && this.ctx) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(this.volume * volScale, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return true;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  public startDepthsMusic() {
    if (this.musicPlaying || this.muted) return;
    try {
      if (!this.bgMusicAudio) {
        this.bgMusicAudio = new Audio("assets/depths/sounds/depths2_low.wav");
        this.bgMusicAudio.loop = true;
        this.bgMusicAudio.volume = 0.22;
      }
      this.bgMusicAudio.play().then(() => {
        this.musicPlaying = true;
      }).catch(() => {
        // Autoplay policy waiting for user click
      });
    } catch {
      // Ignore
    }
  }

  public toggleMusic(): boolean {
    if (!this.bgMusicAudio) {
      this.startDepthsMusic();
      return true;
    }
    if (this.bgMusicAudio.paused) {
      this.bgMusicAudio.play().catch(() => {});
      this.musicPlaying = true;
      return true;
    } else {
      this.bgMusicAudio.pause();
      this.musicPlaying = false;
      return false;
    }
  }

  public isMusicPlaying(): boolean {
    return this.musicPlaying && !!this.bgMusicAudio && !this.bgMusicAudio.paused;
  }

  public playHit() {
    if (this.muted) return;
    this.playDepthsSound("sndAttack", 0.9).then(played => {
      if (played) return;
      this.synthHit();
    });
  }

  public playStab() {
    if (this.muted) return;
    this.playDepthsSound("sndAttackStab", 0.9).then(played => {
      if (played) return;
      this.synthHit();
    });
  }

  public playCrit() {
    if (this.muted) return;
    this.playDepthsSound("sndLargeAttack", 1.2).then(played => {
      if (played) return;
      this.synthCrit();
    });
  }

  public playEnemyDeath() {
    if (this.muted) return;
    this.playDepthsSound("sndDeath", 1.0);
  }

  public playPlayerHurt() {
    if (this.muted) return;
    this.playDepthsSound("sndPlayerHurt", 1.0);
  }

  public playGoldPickup() {
    if (this.muted) return;
    this.playDepthsSound("sndPickupGold", 1.1);
  }

  public playBuy() {
    if (this.muted) return;
    this.playDepthsSound("sndBuy", 1.0);
  }

  public playExplosion(large: boolean = false) {
    if (this.muted) return;
    this.playDepthsSound(large ? "sndExplosion" : "sndSmallExplosion", 1.0).then(played => {
      if (played) return;
      this.synthHit();
    });
  }

  public playShockwave() {
    if (this.muted) return;
    this.playDepthsSound("sndShockwave", 1.0);
  }

  public playArrow() {
    if (this.muted) return;
    this.playDepthsSound("sndArrow", 0.85);
  }

  public playAcidShot() {
    if (this.muted) return;
    this.playDepthsSound("sndAcidShot", 0.85);
  }

  private synthHit() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  private synthCrit() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = "square";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
      gain.gain.setValueAtTime(this.volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playSpell(type: string = "fire") {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === "holy" || type === "heal") {
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.linearRampToValueAtTime(1046.5, now + 0.3);

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(659.25, now);
        osc2.frequency.linearRampToValueAtTime(1318.5, now + 0.3);
      } else if (type === "atomic" || type === "cosmic") {
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(120, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.linearRampToValueAtTime(220, now + 0.35);
      } else {
        // Elemental / Arcane / Steam
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(660, now + 0.25);

        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(110, now);
        osc2.frequency.linearRampToValueAtTime(330, now + 0.25);
      }

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Safe audio fallback
    }
  }

  public playLevelUp() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.07;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(this.volume * 0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      // Safe audio fallback
    }
  }

  public playLoot() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880.0, now + 0.08);
      osc.frequency.setValueAtTime(1174.66, now + 0.16);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Safe audio fallback
    }
  }

  public playCraft() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Safe audio fallback
    }
  }

  public playEraAdvance() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        [220, 277.18, 329.63],
        [277.18, 329.63, 440],
        [329.63, 415.3, 493.88],
        [440, 554.37, 659.25, 880]
      ];

      chords.forEach((chord, cIdx) => {
        const time = now + cIdx * 0.22;
        chord.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, time);

          gain.gain.setValueAtTime(this.volume * 0.25, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(time);
          osc.stop(time + 0.4);
        });
      });
    } catch {
      // Safe audio fallback
    }
  }

  public playVictoryFanfare() {
    this.playDepthsSound("sndVictoryFanfare");
  }

  public playBatiliskWing() {
    this.playDepthsSound("sndBatiliskWing");
  }

  public playBossRoar() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.6);

      gain.gain.setValueAtTime(this.volume * 0.8, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Safe audio fallback
    }
  }
}

export const soundEngine = new SoundEngine();
