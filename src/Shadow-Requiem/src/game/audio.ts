// Procedural Web Audio engine completely silenced to conserve system resources

class SoundEngine {
  private isMuted: boolean = true;
  private muteListeners: Set<(muted: boolean) => void> = new Set();

  public subscribeMute(listener: (muted: boolean) => void): () => void {
    this.muteListeners.add(listener);
    listener(true);
    return () => this.muteListeners.delete(listener);
  }

  public setMuted(_muted: boolean) {}

  public toggleMute(): boolean {
    return true;
  }

  public getMuted(): boolean {
    return true;
  }

  public playSwing(_weight: 'light' | 'medium' | 'heavy' = 'medium') {}
  public playMetalParry() {}
  public playHitImpact(_isCrit: boolean = false, _isHeavy: boolean = false) {}
  public playFootstep() {}
  public playDodge() {}
  public playEquip() {}
  public playLevelUp() {}
  public playVictory() {}
  public playDefeat() {}
  public playSpecialActivation() {}
  public startAmbientCombatMusic() {}
  public playClick() {}
  public playWhoosh() {}
  public stopAmbientCombatMusic() {}
  public playShadowBurst() {}
  public playShadowAbilityImpact() {}
  public playKnockdown() {}
  public playHitLight() {}

  // Allow any other procedural sound calls to be safely absorbed without runtime error
  [key: string]: any;
}

export const sound = new SoundEngine();
