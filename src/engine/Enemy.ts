import { AnimatedSprite, Texture } from "pixi.js";
import { MythicAffinity, EraId } from "./types";
import { ERA_DATA } from "./data/eras";
import { getSafeTextures } from "./safeTexture";

export class MythicEnemy {
  sprite: AnimatedSprite;
  name: string;
  era: EraId;
  isBoss: boolean;
  affinity: MythicAffinity;
  spriteName: string;
  isFlying: boolean = false;

  hp: number;
  maxHp: number;
  baseDmg: number;
  defense: number = 0;
  attackInterval: number = 60;
  attackCooldown: number = 0;

  // Boss specific mechanics
  bossStage: number = 1;
  enraged: boolean = false;
  castTimer: number = 0;

  baseScale: number;
  facing: number = -1;
  state: "idle" | "run" | "attack" | "hurt" | "death" = "idle";

  // Perishing / fading away state
  isPerishing: boolean = false;
  perishTimer: number = 0;
  maxPerishTime: number = 65;
  perished: boolean = false;

  animations: Record<string, Texture[]> = {
    idle: [],
    run: [],
    attack: [],
    hurt: [],
    death: []
  };

  constructor(
    name: string,
    era: EraId,
    isBoss: boolean = false,
    hp: number = 100,
    dmg: number = 10,
    affinity: MythicAffinity = "Neutral",
    tint: number = 0xffffff,
    defense: number = 0,
    spriteName: string = "sprGoblin1"
  ) {
    this.name = name;
    this.era = era;
    this.isBoss = isBoss;
    this.hp = hp;
    this.maxHp = hp;
    this.baseDmg = dmg;
    this.affinity = affinity;
    this.defense = defense;
    this.spriteName = spriteName;

    // Detect flying or floating characteristics
    if (
      spriteName.includes("Batilisk") ||
      spriteName.includes("Ghost") ||
      spriteName.includes("Dragon")
    ) {
      this.isFlying = true;
    }

    // Determine scale based on sprite resolution
    if (spriteName === "sprDragon") {
      this.baseScale = isBoss ? 2.8 : 2.0;
    } else if (spriteName.includes("Minotaur")) {
      this.baseScale = isBoss ? 3.0 : 2.4;
    } else if (spriteName.includes("Batilisk")) {
      this.baseScale = isBoss ? 3.0 : 2.2;
    } else {
      // 16x16 sprites (Goblin, Skeleton, Bogslium, Lizard, Archer, Ghost)
      this.baseScale = isBoss ? 3.6 : 2.9;
    }

    this.loadAnimations();

    const initialTextures = getSafeTextures(this.animations.idle);
    this.sprite = new AnimatedSprite(initialTextures);
    this.sprite.animationSpeed = isBoss ? 0.14 : 0.13;
    this.sprite.scale.set(this.baseScale);
    if (!isBoss && tint !== 0xffffff) {
      this.sprite.tint = tint;
    }
    if (spriteName.includes("Ghost")) {
      this.sprite.alpha = 0.85;
    }
    this.sprite.anchor.set(0.5);
    this.sprite.play();
  }

  private loadAnimations() {
    const sName = this.spriteName;
    const depthsTextures: Texture[] = [];

    // Check how many frames exist (Dragon has 6 frames, others typically have 4)
    const frameCount = sName === "sprDragon" ? 6 : 4;
    for (let i = 0; i < frameCount; i++) {
      try {
        const tex = Texture.from(`assets/depths/sprites/${sName}/frame_${i}.png`);
        if (tex instanceof Texture) {
          depthsTextures.push(tex);
        }
      } catch {
        // Fallback
      }
    }

    if (depthsTextures.length > 0) {
      this.animations.idle = depthsTextures;
      this.animations.run = depthsTextures;

      // Attack animations - try loading dedicated attack swings or loop frames faster
      const attackSwingTextures: Texture[] = [];
      const attackType = sName === "sprDragon" || sName.includes("Minotaur") ? "sprAttackLarge" : "sprAttackSwing";
      const atkFrames = attackType === "sprAttackLarge" ? 4 : 3;
      for (let i = 0; i < atkFrames; i++) {
        try {
          const tex = Texture.from(`assets/depths/sprites/${attackType}/frame_${i}.png`);
          if (tex instanceof Texture) {
            attackSwingTextures.push(tex);
          }
        } catch {}
      }

      this.animations.attack = attackSwingTextures.length > 0 ? attackSwingTextures : depthsTextures;
      this.animations.hurt = depthsTextures;
      this.animations.death = depthsTextures;
    } else {
      // Fallback to hero1 textures if depths asset fails
      const heroIdle = [0, 1, 2, 3].map(i => {
        try {
          const t = Texture.from(`assets/sprites/hero1/idle_${i}.png`);
          return t instanceof Texture ? t : null;
        } catch { return null; }
      }).filter((t): t is Texture => t !== null);

      const heroRun = [0, 1, 2, 3, 4, 5].map(i => {
        try {
          const t = Texture.from(`assets/sprites/hero1/run_${i}.png`);
          return t instanceof Texture ? t : null;
        } catch { return null; }
      }).filter((t): t is Texture => t !== null);

      const heroAttack = [0, 1, 2].map(i => {
        try {
          const t = Texture.from(`assets/sprites/hero1/attack_${i}.png`);
          return t instanceof Texture ? t : null;
        } catch { return null; }
      }).filter((t): t is Texture => t !== null);

      const heroX = [0, 1, 2, 3].map(i => {
        try {
          const t = Texture.from(`assets/sprites/hero1/x_${i}.png`);
          return t instanceof Texture ? t : null;
        } catch { return null; }
      }).filter((t): t is Texture => t !== null);

      this.animations.idle = getSafeTextures(heroIdle);
      this.animations.run = getSafeTextures(heroRun);
      this.animations.attack = getSafeTextures(heroAttack);
      this.animations.hurt = getSafeTextures(heroX);
      this.animations.death = getSafeTextures(heroX);
    }
  }

  setState(newState: "idle" | "run" | "attack" | "hurt" | "death") {
    if (this.state === newState && this.sprite.textures.length > 0) return;
    this.state = newState;
    const textures = getSafeTextures(this.animations[newState]);
    this.sprite.textures = textures;
    this.sprite.animationSpeed = this.isBoss ? 0.12 : newState === "attack" ? 0.18 : 0.12;
    this.sprite.play();
  }

  startPerish() {
    if (this.isPerishing) return;
    this.isPerishing = true;
    this.hp = 0;
    this.setState("death");
    if (this.isBoss) {
      this.sprite.tint = 0x888888;
    }
  }

  updatePerish(delta: number): boolean {
    if (!this.isPerishing) return false;
    this.perishTimer += delta;
    // Fades away gracefully so screen does not get busy
    const progress = Math.min(1, this.perishTimer / this.maxPerishTime);
    this.sprite.alpha = Math.max(0, 1 - progress);
    this.sprite.y -= 0.35 * delta;

    if (this.perishTimer >= this.maxPerishTime) {
      this.perished = true;
      return true;
    }
    return false;
  }

  takeDamage(amount: number): number {
    const mitigated = Math.max(1, Math.floor(amount * (100 / (100 + this.defense))));
    this.hp = Math.max(0, this.hp - mitigated);
    if (this.isBoss && this.hp < this.maxHp * 0.4 && !this.enraged) {
      this.enraged = true;
      this.baseDmg = Math.floor(this.baseDmg * 1.35);
      this.defense = Math.floor(this.defense * 1.25);
      this.sprite.tint = 0xff2222;
    } else if (!this.isBoss) {
      this.setState("hurt");
      setTimeout(() => {
        if (this.hp > 0 && this.state === "hurt") {
          this.setState("idle");
        }
      }, 200);
    }
    return mitigated;
  }

  setBossAttackState(isAttacking: boolean) {
    if (this.isBoss) {
      this.setState(isAttacking ? "attack" : "idle");
    } else {
      this.setState(isAttacking ? "attack" : "idle");
    }
  }

  static spawnForEra(eraId: EraId, isBoss: boolean, heroLvl: number): MythicEnemy {
    const era = ERA_DATA[eraId] || ERA_DATA.dawn;
    const eraTierBonus = 1 + (era.order - 1) * 0.35; // Each historical era is 35% more challenging

    if (isBoss) {
      const hp = Math.floor(era.bossHp * (1 + (heroLvl * 0.08)) * eraTierBonus);
      const dmg = Math.floor(era.bossDamage * (1 + (heroLvl * 0.05)) * eraTierBonus);
      return new MythicEnemy(
        era.bossName,
        eraId,
        true,
        hp,
        dmg,
        era.bossAffinity,
        0xffffff,
        Math.floor(dmg * 0.4),
        era.bossSpriteName || "sprDragon"
      );
    }

    const enemyProto = era.enemies[Math.floor(Math.random() * era.enemies.length)];
    const baseHp = 50 * enemyProto.hpMultiplier * (1 + (heroLvl * 0.22)) * eraTierBonus;
    const baseDmg = 8 * enemyProto.dmgMultiplier * (1 + (heroLvl * 0.16)) * eraTierBonus;

    return new MythicEnemy(
      enemyProto.name,
      eraId,
      false,
      Math.floor(baseHp),
      Math.floor(baseDmg),
      enemyProto.affinity,
      enemyProto.tint,
      0,
      enemyProto.spriteName || "sprGoblin1"
    );
  }
}
