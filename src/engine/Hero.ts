import { AnimatedSprite, Texture } from "pixi.js";
import { RPGItem } from "./Items";
import { SkillEngine, BASE_RACE_STATS } from "./Skills";

export type HeroState = "idle" | "run" | "attack" | "jump" | "swim" | "hurt" | "death" | "dash" | "charge";

export class Hero {
  sprite: AnimatedSprite;
  state: HeroState = "idle";
  animations: Record<HeroState, Texture[]> = { idle: [], run: [], attack: [], jump: [], swim: [], hurt: [], death: [], dash: [], charge: [] };

  level: number = 1; xp: number = 0; maxXp: number = 100;
  hp: number = 120; maxHp: number = 120; baseDmg: number = 12; speed: number = 2.4;
  attackCooldown: number = 0; hurtTimer: number = 0;
  unlockedSkills: string[] = ["Auto Attack"];
  inventory: string[] = [];

  // Integrated proficiency skill progression module
  skillsManager = new SkillEngine();

  // The complete expanded 14-slot EverQuest equipment matrix
  equipment: Record<"head" | "face" | "neck" | "shoulder" | "chest" | "back" | "wrist" | "hands" | "waist" | "legs" | "finger1" | "finger2" | "ear1" | "ear2" | "primaryWpn" | "offHandWpn", RPGItem | null> = {
    head: null, face: null, neck: null, shoulder: null, chest: null, back: null, wrist: null, hands: null, waist: null, legs: null,
    finger1: null, finger2: null, ear1: null, ear2: null, primaryWpn: null, offHandWpn: null
  };

  constructor() {
    this.loadAnimations();
    this.sprite = new AnimatedSprite(this.animations["idle"]);
    this.sprite.animationSpeed = 0.15; this.sprite.anchor.set(0.5); this.sprite.play();
  }

  private loadAnimations() {
    this.animations.idle = this.loadFrames("idle", 4); this.animations.run = this.loadFrames("run", 6);
    this.animations.attack = this.loadFrames("attack", 3); this.animations.jump = this.loadFrames("jump", 4);
    this.animations.swim = this.loadFrames("swim", 6); this.animations.hurt = this.loadFrames("x", 4);
    this.animations.death = this.loadFrames("x", 4); this.animations.dash = this.loadFrames("x", 4);
    this.animations.charge = this.loadFrames("x", 4);
  }

  private loadFrames(prefix: string, count: number): Texture[] {
    const frames: Texture[] = [];
    for (let i = 0; i < count; i++) frames.push(Texture.from(`assets/sprites/hero/${prefix}_${i}.png`));
    return frames;
  }

  setState(newState: HeroState) {
    if (this.state === newState) return;
    this.state = newState; this.sprite.textures = this.animations[newState]; this.sprite.play();
  }

  gainXp(amount: number): string | null {
    if (this.hp <= 0) return null;
    this.xp += amount;
    if (this.xp >= this.maxXp) {
      this.xp -= this.maxXp; this.level++; this.maxXp = Math.floor(this.maxXp * 1.6);
      this.maxHp = Math.floor(this.maxHp * 1.25); this.hp = this.maxHp; this.baseDmg += 5; this.speed += 0.15;
      return "LEVEL_UP";
    }
    return null;
  }

  takeDamage(amount: number) {
    // Dynamic defense mitigation derived directly from active block/parry skill leveling
    const mitigatedAmount = Math.max(1, amount - this.skillsManager.getSkillDefenseBonus());
    this.hp = Math.max(0, this.hp - mitigatedAmount);
    if (this.hp <= 0) this.setState("death"); else { this.hurtTimer = 18; this.setState("hurt"); }
  }

  getEffectiveDamage(): number {
    let bonus = this.skillsManager.getSkillDamageBonus();
    const raceStats = BASE_RACE_STATS[this.skillsManager.selectedRace];
    if (raceStats) bonus += Math.floor(raceStats.Strength * 0.1); // Scaled Strength bonus

    Object.values(this.equipment).forEach(item => { if (item?.damageBonus) bonus += item.damageBonus; });
    return this.baseDmg + bonus;
  }

  getEffectiveMaxHp(): number {
    let bonus = 0;
    const raceStats = BASE_RACE_STATS[this.skillsManager.selectedRace];
    if (raceStats) bonus += raceStats.Stamina * 1.5; // Scaled Stamina bonus

    Object.values(this.equipment).forEach(item => { if (item?.hpBonus) bonus += item.hpBonus; });
    return this.maxHp + bonus;
  }

  getAttackInterval(): number {
    let hasHaste = false;
    Object.values(this.equipment).forEach(item => { if (item?.haste) hasHaste = true; });
    return hasHaste ? 32 : 45; // 32 frames with high speed haste, 45 normally
  }
}
