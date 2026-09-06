// Audio completely disabled to conserve system resources
export class SoundEngine {
  private muted: boolean = true;

  constructor() {
    this.muted = true;
  }

  public toggleMute(): boolean {
    return true;
  }

  public setMuted(_val: boolean): void {}

  public isMuted(): boolean {
    return true;
  }

  public async playDepthsSound(_soundName: string, _volScale: number = 1.0): Promise<boolean> {
    return false;
  }

  public startDepthsMusic() {}
  public stopDepthsMusic() {}
  public playHit() {}
  public playCrit() {}
  public playEnemyDeath() {}
  public playLevelUp() {}
  public playGoldPickup() {}
  public playLoot() {}
  public playSpell(_spellId?: string) {}
  public playExplosion(_isBoss?: boolean) {}
  public playEquip() {}
  public playVictoryFanfare() {}
  public playBatiliskWing() {}
  public playBossRoar() {}
  public playCraft() {}
  public playEraAdvance() {}
  public playBuy() {}
  public playSell() {}
  public playClick() {}
  public playSummon() {}

  // Allow any other sound calls to be safely absorbed without runtime error
  [key: string]: any;
}

export const soundEngine = new SoundEngine();
