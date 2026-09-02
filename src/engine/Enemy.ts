import { AnimatedSprite, Texture } from "pixi.js";
import { MythicAffinity, EraId } from "./types";
import { ERA_DATA } from "./data/eras";

export class MythicEnemy {
  sprite: AnimatedSprite;
  name: string;
  era: EraId;
  isBoss: boolean;
  affinity: MythicAffinity;

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

  constructor(
    name: string,
    era: EraId,
    isBoss: boolean = false,
    hp: number = 100,
    dmg: number = 10,
    affinity: MythicAffinity = "Neutral",
    tint: number = 0xffffff,
    defense: number = 0
  ) {
    this.name = name;
    this.era = era;
    this.isBoss = isBoss;
    this.hp = hp;
    this.maxHp = hp;
    this.baseDmg = dmg;
    this.affinity = affinity;
    this.defense = defense;

    if (isBoss) {
      const bossFrames = [
        Texture.from("assets/sprites/boss/flying1.png"),
        Texture.from("assets/sprites/boss/flying2.png")
      ];
      this.sprite = new AnimatedSprite(bossFrames);
      this.sprite.animationSpeed = 0.15;
      this.sprite.scale.set(2.4);
    } else {
      const mobFrames = [
        Texture.from("assets/sprites/hero/idle_0.png"),
        Texture.from("assets/sprites/hero/idle_1.png"),
        Texture.from("assets/sprites/hero/idle_2.png"),
        Texture.from("assets/sprites/hero/idle_3.png")
      ];
      this.sprite = new AnimatedSprite(mobFrames);
      this.sprite.animationSpeed = 0.12;
      this.sprite.scale.set(1.1);
      this.sprite.tint = tint;
    }

    this.sprite.anchor.set(0.5);
    this.sprite.play();
  }

  takeDamage(amount: number): number {
    const mitigated = Math.max(1, Math.floor(amount * (100 / (100 + this.defense))));
    this.hp = Math.max(0, this.hp - mitigated);
    if (this.isBoss && this.hp < this.maxHp * 0.4 && !this.enraged) {
      this.enraged = true;
      this.baseDmg = Math.floor(this.baseDmg * 1.35);
      this.defense = Math.floor(this.defense * 1.25);
      this.sprite.tint = 0xff2222;
    }
    return mitigated;
  }

  setBossAttackState(isAttacking: boolean) {
    if (!this.isBoss) return;
    try {
      if (isAttacking) {
        this.sprite.textures = [
          Texture.from("assets/sprites/boss/attack1.png"),
          Texture.from("assets/sprites/boss/attack2.png")
        ];
      } else {
        this.sprite.textures = [
          Texture.from("assets/sprites/boss/flying1.png"),
          Texture.from("assets/sprites/boss/flying2.png")
        ];
      }
      this.sprite.play();
    } catch {
      // Safe fallback
    }
  }

  static spawnForEra(eraId: EraId, isBoss: boolean, heroLvl: number): MythicEnemy {
    const era = ERA_DATA[eraId] || ERA_DATA.dawn;
    if (isBoss) {
      const hp = Math.floor(era.bossHp * (1 + (heroLvl * 0.05)));
      const dmg = Math.floor(era.bossDamage * (1 + (heroLvl * 0.03)));
      return new MythicEnemy(
        era.bossName,
        eraId,
        true,
        hp,
        dmg,
        era.bossAffinity,
        0xffffff
      );
    }

    const enemyProto = era.enemies[Math.floor(Math.random() * era.enemies.length)];
    const baseHp = 50 * enemyProto.hpMultiplier * (1 + (heroLvl * 0.2));
    const baseDmg = 8 * enemyProto.dmgMultiplier * (1 + (heroLvl * 0.15));

    return new MythicEnemy(
      enemyProto.name,
      eraId,
      false,
      Math.floor(baseHp),
      Math.floor(baseDmg),
      enemyProto.affinity,
      enemyProto.tint
    );
  }
}
