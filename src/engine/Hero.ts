import { AnimatedSprite, Texture } from "pixi.js";
import { RPGItem, EquipSlot, CosmicForce, EraId, TransformationType, CompanionTroop, RogueRelic } from "./types";
import { INITIAL_COMPANION_TROOPS } from "./data/troops";
import { INITIAL_ROGUE_RELICS } from "./data/relics";

export type HeroState =
  | "idle"
  | "run"
  | "attack"
  | "aoe_attack"
  | "s_attack"
  | "jump"
  | "swim"
  | "hurt"
  | "defend"
  | "death";

export class Hero {
  sprite: AnimatedSprite;
  state: HeroState = "idle";

  // Base Ninja Animations
  baseAnimations: Record<string, Texture[]> = {
    idle: [],
    run: [],
    attack: [],
    jump: [],
    swim: [],
    hurt: [],
    death: []
  };

  // Arc Angel (hero2) Animations
  arcAngelAnimations: Record<string, Texture[]> = {
    idle: [],
    run: [],
    attack: [],
    aoe_attack: [],
    s_attack: [],
    defend: [],
    hurt: [],
    death: [],
    levelup: []
  };

  level: number = 1;
  xp: number = 0;
  maxXp: number = 100;
  hp: number = 150;
  maxHp: number = 150;
  baseDmg: number = 15;
  speed: number = 2.6;

  attackCooldown: number = 0;
  hurtTimer: number = 0;
  castCooldown: number = 0;

  // Chi Force & Transformation State
  chi: number = 0;
  maxChi: number = 100;
  activeForm: TransformationType = "base";
  formTimer: number = 0; // Remaining seconds
  maxFormTimer: number = 20;
  isTransformed: boolean = false;
  holyShieldHp: number = 0;
  maxHolyShieldHp: number = 0;
  permanentSeraphEnabled: boolean = false;

  // Rogue with the Dead Distance & Relics Progression
  distanceMeters: number = 0;
  maxDistanceReached: number = 0;
  soulDiamonds: number = 0;
  chiSkillPoints: number = 2;
  troops: CompanionTroop[] = JSON.parse(JSON.stringify(INITIAL_COMPANION_TROOPS));
  relics: RogueRelic[] = JSON.parse(JSON.stringify(INITIAL_ROGUE_RELICS));

  // Cosmic & Era Meta
  cosmicAlignment: CosmicForce = "Echoes";
  activeEra: EraId = "dawn";
  activeSpecialization: string = "Primordial Shaman";
  reincarnationCount: number = 0;
  eraRank: number = 1;

  // Cooldown Tracking per ability ID
  abilityCooldowns: Record<string, number> = {};

  // Unlocked Abilities IDs
  equippedAbilities: string[] = ["auto_attack", "genesis_quake"];

  // 16-Slot EverQuest / Mythic Equipment Matrix
  equipment: Record<EquipSlot, RPGItem | null> = {
    head: null,
    face: null,
    neck: null,
    shoulder: null,
    chest: null,
    back: null,
    wrist: null,
    hands: null,
    waist: null,
    legs: null,
    finger1: null,
    finger2: null,
    ear1: null,
    ear2: null,
    primaryWpn: null,
    offHandWpn: null
  };

  // Bag items (names / ids)
  inventory: RPGItem[] = [];

  constructor() {
    this.loadBaseAnimations();
    this.loadArcAngelAnimations();
    const initialTextures = this.baseAnimations.idle.length > 0 ? this.baseAnimations.idle : [Texture.WHITE];
    this.sprite = new AnimatedSprite(initialTextures);
    this.sprite.animationSpeed = 0.15;
    this.sprite.anchor.set(0.5);
    this.sprite.play();
  }

  private loadBaseAnimations() {
    this.baseAnimations.idle = this.loadFrames("hero", "idle", 4);
    this.baseAnimations.run = this.loadFrames("hero", "run", 6);
    this.baseAnimations.attack = this.loadFrames("hero", "attack", 3);
    this.baseAnimations.jump = this.loadFrames("hero", "jump", 4);
    this.baseAnimations.swim = this.loadFrames("hero", "swim", 6);
    this.baseAnimations.hurt = this.loadFrames("hero", "x", 4);
    this.baseAnimations.death = this.loadFrames("hero", "x", 4);
  }

  private loadArcAngelAnimations() {
    // hero2 sprite frames
    this.arcAngelAnimations.idle = this.loadHero2NamedFrames("hero2-idle", 5);
    this.arcAngelAnimations.run = this.loadHero2NamedFrames("hero2-walk", 7);
    this.arcAngelAnimations.attack = this.loadHero2NamedFrames("hero2-attack", 6);
    this.arcAngelAnimations.aoe_attack = this.loadHero2NamedFrames("hero2-aoe-attack", 6);
    this.arcAngelAnimations.s_attack = this.loadHero2NamedFrames("hero2-s-attack", 6);
    this.arcAngelAnimations.defend = this.loadHero2NamedFrames("hero2-defend", 4);
    this.arcAngelAnimations.hurt = this.loadHero2NamedFrames("hero2-low-health", 6);
    this.arcAngelAnimations.death = this.loadHero2NamedFrames("hero2-perish", 6);
    this.arcAngelAnimations.levelup = this.loadHero2NamedFrames("hero2-levelup", 4);
  }

  private loadFrames(folder: string, prefix: string, count: number): Texture[] {
    const frames: Texture[] = [];
    for (let i = 0; i < count; i++) {
      try {
        frames.push(Texture.from(`assets/sprites/${folder}/${prefix}_${i}.png`));
      } catch {
        // Safe texture fallback
      }
    }
    return frames;
  }

  private loadHero2NamedFrames(prefix: string, count: number): Texture[] {
    const frames: Texture[] = [];
    for (let i = 1; i <= count; i++) {
      try {
        frames.push(Texture.from(`assets/sprites/hero2/${prefix}${i}.png`));
      } catch {
        // Safe texture fallback
      }
    }
    return frames;
  }

  public gainChi(amount: number) {
    const relicChiMult = 1 + (this.getRelicBonus("chiGainPercent") / 100);
    this.chi = Math.min(this.maxChi, this.chi + (amount * relicChiMult));
  }

  public canTransform(form: TransformationType = "arc_angel"): boolean {
    if (this.permanentSeraphEnabled && form === "arc_angel") return true;
    if (form === "werewolf" && this.level < 8) return false;
    if (form === "mythic_drake" && this.level < 20) return false;
    return this.chi >= 50 || this.isTransformed;
  }

  public transform(form: TransformationType, durationSec: number = 20) {
    this.activeForm = form;
    this.isTransformed = true;
    this.formTimer = durationSec;
    this.maxFormTimer = durationSec;
    this.chi = 0;

    if (form === "arc_angel") {
      // Refresh current HP and bestow holy barrier
      const maxHp = this.getEffectiveMaxHp();
      this.hp = maxHp;
      this.maxHolyShieldHp = Math.floor(maxHp * 0.45);
      this.holyShieldHp = this.maxHolyShieldHp;
      this.sprite.tint = 0xffffff;
      this.sprite.scale.set(1.2);
    } else if (form === "werewolf") {
      this.sprite.tint = 0xba1a1a;
      this.sprite.scale.set(1.15);
    } else if (form === "mythic_drake") {
      this.sprite.tint = 0xffa500;
      this.sprite.scale.set(1.3);
    }

    this.setState("idle");
  }

  public revertTransform() {
    if (this.permanentSeraphEnabled && this.activeForm === "arc_angel") {
      return; // Capstone mastery holds permanent Seraph form
    }
    this.activeForm = "base";
    this.isTransformed = false;
    this.formTimer = 0;
    this.holyShieldHp = 0;
    this.sprite.tint = 0xffffff;
    this.sprite.scale.set(1.0);
    this.setState("idle");
  }

  public updateFormTimer(deltaSec: number) {
    if (this.isTransformed && !this.permanentSeraphEnabled) {
      this.formTimer -= deltaSec;
      if (this.formTimer <= 0) {
        this.revertTransform();
      }
    }
  }

  setState(newState: HeroState) {
    if (this.state === newState && this.sprite.textures.length > 0) return;
    this.state = newState;

    let targetTextures: Texture[] = [];
    if (this.activeForm === "arc_angel") {
      targetTextures =
        this.arcAngelAnimations[newState] && this.arcAngelAnimations[newState].length > 0
          ? this.arcAngelAnimations[newState]
          : this.arcAngelAnimations["idle"];
    } else {
      targetTextures =
        this.baseAnimations[newState] && this.baseAnimations[newState].length > 0
          ? this.baseAnimations[newState]
          : this.baseAnimations["idle"];
    }

    if (targetTextures && targetTextures.length > 0) {
      this.sprite.textures = targetTextures;
      this.sprite.animationSpeed = this.activeForm === "arc_angel" ? 0.22 : 0.15;
      this.sprite.play();
    }
  }

  gainXp(amount: number): boolean {
    if (this.hp <= 0) return false;
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.maxXp) {
      this.xp -= this.maxXp;
      this.level++;
      this.maxXp = Math.floor(this.maxXp * 1.55 + 20);
      this.maxHp = Math.floor(this.maxHp * 1.22 + 25);
      this.hp = this.getEffectiveMaxHp();
      this.baseDmg += 6;
      this.speed = Math.min(4.5, this.speed + 0.04);
      this.chiSkillPoints += 1;
      this.soulDiamonds += 1;
      leveled = true;
    }
    return leveled;
  }

  takeDamage(amount: number, incomingDefenseBonus: number = 0) {
    const totalDef = this.getEffectiveDefense() + incomingDefenseBonus;
    let mitigated = Math.max(1, Math.floor(amount * (100 / (100 + totalDef))));

    // Holy Shield absorption
    if (this.holyShieldHp > 0) {
      if (this.holyShieldHp >= mitigated) {
        this.holyShieldHp -= mitigated;
        mitigated = 0;
      } else {
        mitigated -= this.holyShieldHp;
        this.holyShieldHp = 0;
      }
    }

    if (mitigated > 0) {
      this.hp = Math.max(0, this.hp - mitigated);
    }

    if (this.hp <= 0) {
      this.setState("death");
    } else {
      this.hurtTimer = 16;
      this.setState(this.activeForm === "arc_angel" ? "defend" : "hurt");
    }
    return mitigated;
  }

  heal(amount: number) {
    const max = this.getEffectiveMaxHp();
    this.hp = Math.min(max, this.hp + amount);
  }

  public getRelicBonus(key: string): number {
    let total = 0;
    this.relics.forEach(r => {
      if (r.level > 0 && (r.bonus as any)[key]) {
        total += (r.bonus as any)[key] * r.level;
      }
    });
    return total;
  }

  getEffectiveDamage(traitBonus: number = 0, memoryMultiplier: number = 1): number {
    let bonus = 0;
    Object.values(this.equipment).forEach(item => {
      if (item?.damageBonus) {
        const infMult = 1 + ((item.infusionLevel || 0) * 0.15);
        bonus += Math.floor(item.damageBonus * infMult);
      }
    });

    const relicBonus = this.getRelicBonus("damagePercent") / 100;
    const totalRaw = (this.baseDmg + bonus + traitBonus) * (1 + relicBonus);
    let formMult = 1.0;

    if (this.activeForm === "arc_angel") formMult = 3.0;
    else if (this.activeForm === "werewolf") formMult = 2.2;
    else if (this.activeForm === "mythic_drake") formMult = 2.8;

    return Math.floor(totalRaw * memoryMultiplier * formMult);
  }

  getEffectiveMaxHp(traitBonus: number = 0, memoryMultiplier: number = 1): number {
    let bonus = 0;
    Object.values(this.equipment).forEach(item => {
      if (item?.hpBonus) {
        const infMult = 1 + ((item.infusionLevel || 0) * 0.15);
        bonus += Math.floor(item.hpBonus * infMult);
      }
    });

    const relicBonus = this.getRelicBonus("hpPercent") / 100;
    const totalRaw = (this.maxHp + bonus + traitBonus) * (1 + relicBonus);
    let formMult = 1.0;

    if (this.activeForm === "arc_angel") formMult = 2.5;
    else if (this.activeForm === "werewolf") formMult = 1.6;
    else if (this.activeForm === "mythic_drake") formMult = 2.2;

    return Math.floor(totalRaw * memoryMultiplier * formMult);
  }

  getEffectiveDefense(traitBonus: number = 0, memoryMultiplier: number = 1): number {
    let bonus = 0;
    Object.values(this.equipment).forEach(item => {
      if (item?.defenseBonus) {
        const infMult = 1 + ((item.infusionLevel || 0) * 0.15);
        bonus += Math.floor(item.defenseBonus * infMult);
      }
    });

    const relicDef = this.getRelicBonus("defensePercent") / 100;
    const formDefBonus = this.activeForm === "arc_angel" ? 100 : this.activeForm === "werewolf" ? 40 : 80;

    return Math.floor((bonus + traitBonus + formDefBonus) * (1 + relicDef) * memoryMultiplier);
  }

  getCritRate(traitBonus: number = 0, memoryBonus: number = 0): number {
    let rate = 5 + traitBonus + memoryBonus;
    Object.values(this.equipment).forEach(item => {
      if (item?.critRateBonus) rate += item.critRateBonus;
    });
    if (this.activeForm === "arc_angel") rate += 45;
    else if (this.activeForm === "werewolf") rate += 35;
    return Math.min(95, rate);
  }

  getCritDamageMultiplier(traitBonus: number = 0): number {
    let mult = 1.5 + (traitBonus / 100);
    Object.values(this.equipment).forEach(item => {
      if (item?.critDmgBonus) mult += item.critDmgBonus / 100;
    });
    if (this.activeForm === "arc_angel") mult += 1.5;
    return mult;
  }

  getAttackInterval(): number {
    let hasteBonus = 0;
    Object.values(this.equipment).forEach(item => {
      if (item?.hasteBonus) hasteBonus += item.hasteBonus;
    });

    let interval = Math.max(16, 45 - Math.floor(hasteBonus * 0.4));
    if (this.activeForm === "arc_angel") interval = Math.max(12, Math.floor(interval * 0.55));
    else if (this.activeForm === "werewolf") interval = Math.max(14, Math.floor(interval * 0.65));

    return interval;
  }

  getEraEnergyBonusMultiplier(): number {
    let bonus = 1.0;
    Object.values(this.equipment).forEach(item => {
      if (item?.eraEnergyBonus) bonus += item.eraEnergyBonus;
    });
    return bonus * (1 + (this.getRelicBonus("goldDropPercent") / 100));
  }
}

