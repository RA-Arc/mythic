import { Hero } from "./Hero";
import { MythicEnemy } from "./Enemy";
import { GameState } from "./GameState";
import { ParticleSystem } from "./ParticleSystem";
import { soundEngine } from "./SoundEngine";
import { ERA_DATA } from "./data/eras";
import { ALL_ABILITIES } from "./data/skills";
import { MASTER_GEAR_CATALOG, COLOR_MAP } from "./data/gear";
import { RPGItem, AbilityDefinition } from "./types";

export class CombatEngine {
  hero: Hero;
  activeEnemy: MythicEnemy | null = null;
  gameState: GameState;
  particles: ParticleSystem;

  bossMode: boolean = false;
  bossDefeated: boolean = false;
  waveCounter: number = 0;
  heroRespawnTimer: number = 0;
  spawnDelayTimer: number = 0;

  // Auto-combat and auto-cast toggles
  autoCastAbilities: boolean = true;
  selectedActiveAbility: string = "auto_attack";

  constructor(hero: Hero, gameState: GameState, particles: ParticleSystem) {
    this.hero = hero;
    this.gameState = gameState;
    this.particles = particles;
  }

  public getAffinityMultiplier(heroForce: string, enemyAffinity: string): number {
    if (heroForce === "Architects" && enemyAffinity === "Wraithborn") return 1.35;
    if (heroForce === "Wraithborn" && enemyAffinity === "Echo") return 1.35;
    if (heroForce === "Echoes" && enemyAffinity === "Architect") return 1.35;
    if (heroForce === "Architects" && enemyAffinity === "Echo") return 0.85;
    return 1.0;
  }

  public spawnNextTarget(logger: any) {
    if (this.activeEnemy || this.hero.hp <= 0 || this.spawnDelayTimer > 0) return null;

    const eraId = this.gameState.currentEra;
    const shouldSpawnBoss = this.bossMode;

    this.activeEnemy = MythicEnemy.spawnForEra(eraId, shouldSpawnBoss, this.hero.level);

    if (shouldSpawnBoss) {
      soundEngine.playBossRoar();
      this.particles.addFloatingText("⚡ ERA BOSS AWAKENS! ⚡", 640, 180, "#ff3333", 28, true);
      logger.printLine(`*** The ${this.activeEnemy.name} emerges from the mythic veil! ***`, "#ff3333");
    } else {
      logger.printLine(`Engaged with ${this.activeEnemy.name} (${this.activeEnemy.affinity} affinity).`, "#aaaaaa");
    }

    this.activeEnemy.sprite.x = 900 + Math.random() * 150;
    this.activeEnemy.sprite.y = this.activeEnemy.isFlying ? 360 : 420;
    return this.activeEnemy;
  }

  public updateTick(delta: number, logger: any, onLootCallback?: (item: RPGItem) => void) {
    // 1. Tick down Hero cooldowns
    if (this.hero.attackCooldown > 0) this.hero.attackCooldown -= delta;
    if (this.hero.hurtTimer > 0) this.hero.hurtTimer -= delta;
    if (this.hero.castCooldown > 0) this.hero.castCooldown -= delta;

    // Tick transformation duration
    this.hero.updateFormTimer(delta / 60);

    // Rogue with the Dead Distance Pushing
    const marchSpeedRelic = 1 + (this.hero.getRelicBonus("marchSpeedPercent") / 100);
    this.hero.distanceMeters += (1.2 * marchSpeedRelic) * (delta / 60);
    if (this.hero.distanceMeters > this.hero.maxDistanceReached) {
      this.hero.maxDistanceReached = this.hero.distanceMeters;
      // Distance Milepost Checkpoints (every 250m grants Soul Diamonds & Relic Chest)
      if (Math.floor(this.hero.distanceMeters) % 250 === 0 && Math.floor(this.hero.distanceMeters) > 0) {
        this.hero.soulDiamonds += 3;
        this.particles.addFloatingText(`🚩 REACHED ${Math.floor(this.hero.distanceMeters)}m! +3 Soul Diamonds!`, 640, 220, "#ffd700", 24, true);
        logger.printLine(`*** Crossed ${Math.floor(this.hero.distanceMeters)}m milepost! Relic Chest opened (+3 Soul Diamonds)! ***`, "#ffd700");
      }
    }

    // Companion Troops Attack Loop
    if (this.activeEnemy && this.activeEnemy.hp > 0 && !this.activeEnemy.isPerishing && this.hero.hp > 0) {
      const troopDmgRelic = 1 + (this.hero.getRelicBonus("troopDamagePercent") / 100);
      this.hero.troops.forEach(troop => {
        if (troop.count > 0) {
          if (troop.attackCooldown > 0) {
            troop.attackCooldown -= delta;
          }
          if (troop.attackCooldown <= 0 && this.activeEnemy && this.activeEnemy.hp > 0 && !this.activeEnemy.isPerishing) {
            troop.attackCooldown = troop.attackInterval;
            (troop as any).attackTrigger = true;
            const troopDmg = Math.floor(troop.baseDmg * troop.count * troopDmgRelic * (0.85 + Math.random() * 0.3));
            const dealt = this.activeEnemy.takeDamage(troopDmg);
            this.particles.addFloatingText(`-${dealt}`, this.activeEnemy.sprite.x + (Math.random() * 30 - 15), this.activeEnemy.sprite.y - 30, `#${troop.color.toString(16)}`, 16);
            this.hero.gainChi(1);
          }
        }
      });
    }

    // Decrement specific ability cooldowns
    for (const key of Object.keys(this.hero.abilityCooldowns)) {
      if (this.hero.abilityCooldowns[key] > 0) {
        this.hero.abilityCooldowns[key] = Math.max(0, this.hero.abilityCooldowns[key] - delta);
      }
    }

    // 2. Handle dead hero respawn timer
    if (this.hero.hp <= 0) {
      this.heroRespawnTimer -= delta;
      if (this.heroRespawnTimer <= 0) {
        this.hero.hp = this.hero.getEffectiveMaxHp();
        this.hero.sprite.x = 260;
        this.hero.sprite.y = 420;
        this.hero.setState("idle");
        logger.printLine("Reconstituted at the ancestral node.", "#7ee787");
      }
      return;
    }

    // 3. Enemy defeat, perishing fade away, and clean pacing
    if (this.activeEnemy) {
      if (this.activeEnemy.hp <= 0 && !this.activeEnemy.isPerishing) {
        this.activeEnemy.startPerish();
        this.particles.spawnSoulDissolve(this.activeEnemy.sprite.x, this.activeEnemy.sprite.y);
        this.processVictory(logger, onLootCallback);
        this.spawnDelayTimer = 40; // Breather delay before next enemy to prevent clutter
      } else if (this.activeEnemy.isPerishing) {
        const finished = this.activeEnemy.updatePerish(delta);
        if (finished) {
          this.activeEnemy.sprite.parent?.removeChild(this.activeEnemy.sprite);
          this.activeEnemy.sprite.destroy();
          this.activeEnemy = null;
        }
      }
    }

    if (this.spawnDelayTimer > 0) {
      this.spawnDelayTimer -= delta;
    }

    if (!this.activeEnemy || this.activeEnemy.isPerishing || this.activeEnemy.hp <= 0) {
      return;
    }

    // 4. Enemy attack cooldown ticking
    if (this.activeEnemy.attackCooldown > 0) {
      this.activeEnemy.attackCooldown -= delta;
    }
  }

  public executeHeroAttack(logger: any) {
    if (!this.activeEnemy || this.activeEnemy.hp <= 0 || this.hero.hp <= 0) return;

    // Determine which ability to use based on cooldowns, costs, and priority
    let abilityToUse: AbilityDefinition = ALL_ABILITIES["auto_attack"];

    if (this.autoCastAbilities && this.hero.castCooldown <= 0) {
      for (const abId of this.hero.equippedAbilities) {
        if (abId !== "auto_attack") {
          const ab = ALL_ABILITIES[abId];
          const cd = this.hero.abilityCooldowns[abId] || 0;
          if (ab && cd <= 0 && this.gameState.currencies.eraEnergy >= (ab.costEnergy || 0)) {
            abilityToUse = ab;
            break;
          }
        }
      }
    }

    const traitBonus = this.gameState.getTraitBonus();
    const memoryDmgMult = this.gameState.getMemoryBonusMultiplier("damagePercent");
    const affinityMult = this.getAffinityMultiplier(this.hero.cosmicAlignment, this.activeEnemy.affinity);

    let rawDmg = this.hero.getEffectiveDamage(traitBonus.damageBonus || 0, memoryDmgMult);
    rawDmg = Math.floor(rawDmg * abilityToUse.damageMultiplier * affinityMult);

    // Roll for critical strike
    const critRate = this.hero.getCritRate(traitBonus.critRateBonus || 0, this.gameState.getMemoryFlatBonus("critRate"));
    const isCrit = Math.random() * 100 < critRate;
    if (isCrit) {
      const critMult = this.hero.getCritDamageMultiplier(traitBonus.critDmgBonus || 0);
      rawDmg = Math.floor(rawDmg * critMult);
      this.hero.gainChi(4);
    } else {
      this.hero.gainChi(2);
    }

    // Arc Angel animation states
    if (this.hero.activeForm === "arc_angel") {
      const isSpecial = Math.random() < 0.4;
      this.hero.setState(isSpecial ? "s_attack" : "aoe_attack");
      this.particles.spawnSpellEffect(this.activeEnemy.sprite.x, this.activeEnemy.sprite.y, 0xffd700, 20);
    } else {
      this.hero.setState("attack");
    }

    // Ability energy cost and individual ability cooldown registration
    if (abilityToUse.costEnergy > 0) {
      this.gameState.currencies.eraEnergy = Math.max(0, this.gameState.currencies.eraEnergy - abilityToUse.costEnergy);
      this.hero.castCooldown = 30; // Global cast recovery frames
      this.hero.abilityCooldowns[abilityToUse.id] = abilityToUse.cooldownFrames;
      soundEngine.playSpell(abilityToUse.id);

      // Spawn visual particle fx
      this.particles.spawnSpellEffect(
        this.activeEnemy.sprite.x,
        this.activeEnemy.sprite.y,
        parseInt(abilityToUse.particleColor.replace("#", "0x"), 16),
        30
      );

      if (abilityToUse.effectType === "heal") {
        const healAmt = Math.floor(this.hero.getEffectiveMaxHp() * 0.15);
        this.hero.heal(healAmt);
        this.particles.addFloatingText(`+${healAmt} HP`, this.hero.sprite.x, this.hero.sprite.y - 60, "#33ff99", 22);
      }
    } else {
      if (isCrit) soundEngine.playCrit();
      else soundEngine.playHit();
    }

    // Apply damage with target defense mitigation
    const actualDmg = this.activeEnemy.takeDamage(rawDmg);

    // Werewolf Life Leech
    if (this.hero.activeForm === "werewolf") {
      const leechAmt = Math.floor(actualDmg * 0.25);
      this.hero.heal(leechAmt);
      this.particles.addFloatingText(`+${leechAmt} Leech`, this.hero.sprite.x, this.hero.sprite.y - 50, "#ff4444", 18);
    }

    // Shadow Requiem Weapon Dynamics Triggers
    const shadowWpn = this.hero.equippedShadowWeapon;
    if (shadowWpn) {
      // Kusarigama / Lifesteal Perk: restores health
      if (shadowWpn.weaponType === 'kusarigama' || shadowWpn.perks?.includes('perk_lifesteal') || this.hero.unlockedPerks?.includes('perk_lifesteal')) {
        const stealHp = Math.max(1, Math.floor(actualDmg * 0.12));
        this.hero.heal(stealHp);
        this.particles.addFloatingText(`+${stealHp} HP Vampiric`, this.hero.sprite.x, this.hero.sprite.y - 65, "#34d399", 16);
      }

      // Warhammer: Tectonic Sunder
      if (shadowWpn.weaponType === 'warhammer') {
        this.particles.spawnSpellEffect(this.activeEnemy.sprite.x, this.activeEnemy.sprite.y, 0xf97316, 15);
        this.particles.addFloatingText("SUNDER -30% DEF", this.activeEnemy.sprite.x, this.activeEnemy.sprite.y - 65, "#fb923c", 16);
      }

      // Katana: Iaido Execution
      if (shadowWpn.weaponType === 'katana' && isCrit) {
        this.particles.spawnSpellEffect(this.activeEnemy.sprite.x, this.activeEnemy.sprite.y, 0xa855f7, 20);
        this.particles.addFloatingText("⚡ IAIDO EXECUTION", this.hero.sprite.x, this.hero.sprite.y - 75, "#c084fc", 18, true);
      }

      // Nunchaku: Combo Chi Surge
      if (shadowWpn.weaponType === 'nunchaku') {
        this.gameState.currencies.eraEnergy += 4;
        if (Math.random() < 0.3) {
          this.particles.addFloatingText("CHI FLURRY +4", this.hero.sprite.x, this.hero.sprite.y - 55, "#38bdf8", 16);
        }
      }

      // Greatsword: Unbreakable Cleave
      if (shadowWpn.weaponType === 'greatsword' && Math.random() < 0.25) {
        this.particles.addFloatingText("POISE CLEAVE", this.hero.sprite.x, this.hero.sprite.y - 55, "#facc15", 16);
      }
    }

    this.particles.addFloatingText(
      isCrit ? `CRIT -${actualDmg}!` : `-${actualDmg}`,
      this.activeEnemy.sprite.x,
      this.activeEnemy.sprite.y - 45,
      isCrit ? "#ffcc00" : abilityToUse.particleColor,
      isCrit ? 26 : 20,
      isCrit
    );

    logger.printLine(
      `Hero casts [${abilityToUse.name}] on ${this.activeEnemy.name} for ${actualDmg} ${isCrit ? "(CRITICAL!)" : ""}`,
      isCrit ? "#ffcc00" : "#ffffff"
    );

    this.hero.attackCooldown = this.hero.getAttackInterval();
    return { isCrit, ability: abilityToUse, actualDmg };
  }

  public executeEnemyAttack(logger: any) {
    if (!this.activeEnemy || this.activeEnemy.hp <= 0 || this.hero.hp <= 0) return null;

    const traitBonus = this.gameState.getTraitBonus();
    const ed = Math.floor(this.activeEnemy.baseDmg * (0.85 + Math.random() * 0.3));

    const mitigated = this.hero.takeDamage(ed, traitBonus.defenseBonus || 0);
    this.particles.addFloatingText(`-${mitigated}`, this.hero.sprite.x, this.hero.sprite.y - 40, "#ff4444", 20);

    this.activeEnemy.setBossAttackState(true);
    setTimeout(() => this.activeEnemy?.setBossAttackState(false), 300);

    logger.printLine(`${this.activeEnemy.name} strikes you for ${mitigated} damage.`, "#ff6666");

    if (this.hero.hp <= 0) {
      soundEngine.playBossRoar();
      this.heroRespawnTimer = 180;
      this.particles.addFloatingText("YOU DIED...", this.hero.sprite.x, this.hero.sprite.y - 60, "#ff0000", 32, true);
      logger.printLine("You have been defeated! Reconstituting at ancestral nexus...", "#ff3333");
    }
  }

  public processVictory(logger: any, onLootCallback?: (item: RPGItem) => void) {
    if (!this.activeEnemy) return;

    const enemy = this.activeEnemy;
    const isBoss = enemy.isBoss;
    const eraId = this.gameState.currentEra;
    const eraInfo = ERA_DATA[eraId];

    if (isBoss) {
      soundEngine.playExplosion(true);
    } else {
      soundEngine.playEnemyDeath();
    }
    soundEngine.playGoldPickup();

    this.gameState.stats.totalKills += 1;
    if (isBoss) this.gameState.stats.bossKills += 1;

    // Experience payout
    const xpGain = isBoss ? 600 + this.hero.level * 40 : 45 + this.hero.level * 10;
    const lvlUp = this.hero.gainXp(xpGain);
    logger.printLine(`Slew ${enemy.name}! Gained ${xpGain} XP.`, "#33ff99");
    if (lvlUp) {
      soundEngine.playLevelUp();
      this.particles.triggerLevelUpEffect(this.hero.sprite.x, this.hero.sprite.y);
      this.particles.addFloatingText("LEVEL UP!", this.hero.sprite.x, this.hero.sprite.y - 80, "#ffff00", 32, true);
      logger.printLine(`*** REINCARNATION LEVEL UP: LEVEL ${this.hero.level}! ***`, "#ffff00");
    }

    // Currency payouts
    const chiGain = isBoss ? 25 : 6;
    this.hero.gainChi(chiGain);
    this.particles.addFloatingText(`+${chiGain} Chi`, this.hero.sprite.x + 30, this.hero.sprite.y - 80, "#ffd700", 18);

    const energyMult = this.hero.getEraEnergyBonusMultiplier() * this.gameState.getMemoryBonusMultiplier("energyGenMultiplier");
    const baseEnergyPayout = isBoss ? 150 : 25;
    const energyGain = Math.floor(baseEnergyPayout * (1 + this.hero.level * 0.1) * energyMult);

    this.gameState.currencies.eraEnergy += energyGain;
    this.gameState.stats.totalEraEnergyEarned += energyGain;
    this.particles.addFloatingText(`+${energyGain} Energy`, this.hero.sprite.x, this.hero.sprite.y - 100, "#00e5ff", 18);

    // Material payout
    const matPayout = isBoss ? 8 : 2 + Math.floor(Math.random() * 3);
    this.gameState.currencies.materials[eraInfo.primaryMaterial] =
      (this.gameState.currencies.materials[eraInfo.primaryMaterial] || 0) + matPayout;

    // Echo Fragments & Mythic Shards
    if (Math.random() < (isBoss ? 0.9 : 0.25)) {
      const echoes = isBoss ? 3 + Math.floor(Math.random() * 4) : 1;
      this.gameState.currencies.echoFragments += echoes;
      logger.printLine(`Found ${echoes} Echo Fragment(s)!`, "#bb86fc");
    }

    if (Math.random() < (isBoss ? 0.6 : 0.08)) {
      const shards = isBoss ? 2 : 1;
      this.gameState.currencies.mythicShards += shards;
      logger.printLine(`Found ${shards} Mythic Shard(s)!`, "#ff4081");
    }

    if (isBoss) {
      this.gameState.currencies.titanCores += 1;
      logger.printLine(`*** OBTAINED 1 TITAN CORE! ***`, "#ffd700");
      this.particles.addFloatingText("+1 TITAN CORE!", 640, 240, "#ffd700", 26, true);
      this.bossMode = false; // Reset to regular waves after boss kill
    }

    // Gear Drop calculation
    const dropRoll = Math.random();
    const dropThreshold = isBoss ? 0.75 : 0.15;
    if (dropRoll < dropThreshold) {
      const eraItems = MASTER_GEAR_CATALOG.filter(i => i.era === eraId);
      if (eraItems.length > 0) {
        const rolledItem = eraItems[Math.floor(Math.random() * eraItems.length)];
        if (this.hero.inventory.length < 24) {
          this.hero.inventory.push({ ...rolledItem });
          soundEngine.playLoot();
          const col = COLOR_MAP[rolledItem.rarity];
          this.particles.addFloatingText(`Loot: [${rolledItem.name}]`, this.hero.sprite.x, this.hero.sprite.y - 120, col, 20);
          logger.printLine(`Looted: [${rolledItem.name}] (${rolledItem.rarity})`, col);
          if (onLootCallback) onLootCallback(rolledItem);
        } else {
          logger.printLine("Inventory is full! Dropped item decomposed into raw essence.", "#ff4444");
        }
      }
    }

    this.gameState.save();
  }
}
