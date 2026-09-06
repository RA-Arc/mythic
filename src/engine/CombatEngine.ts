import { Hero } from "./Hero";
import { MythicEnemy } from "./Enemy";
import { GameState } from "./GameState";
import { ParticleSystem } from "./ParticleSystem";
import { ERA_DATA } from "./data/eras";
import { ALL_ABILITIES } from "./data/skills";
import { MASTER_GEAR_CATALOG, COLOR_MAP } from "./data/gear";
import { RPGItem, AbilityDefinition } from "./types";

export class CombatEngine {
  hero: Hero;
  enemies: MythicEnemy[] = [];
  gameState: GameState;
  particles: ParticleSystem;

  bossMode: boolean = false;
  bossDefeated: boolean = false;
  waveCounter: number = 0;
  heroRespawnTimer: number = 0;
  spawnDelayTimer: number = 0;
  hordeSpawnTimer: number = 0;
  maxHordeSize: number = 8;

  // Auto-combat and auto-cast toggles
  autoCastAbilities: boolean = true;
  selectedActiveAbility: string = "auto_attack";

  constructor(hero: Hero, gameState: GameState, particles: ParticleSystem) {
    this.hero = hero;
    this.gameState = gameState;
    this.particles = particles;
  }

  public get activeEnemy(): MythicEnemy | null {
    // Primary active target is the closest living enemy in front of hero
    const living = this.enemies.filter(e => e.hp > 0 && !e.isPerishing);
    if (living.length === 0) return null;
    living.sort((a, b) => a.sprite.x - b.sprite.x);
    return living[0];
  }

  public set activeEnemy(enemy: MythicEnemy | null) {
    if (enemy && !this.enemies.includes(enemy)) {
      this.enemies.push(enemy);
    }
  }

  public getAffinityMultiplier(heroForce: string, enemyAffinity: string): number {
    if (heroForce === "Architects" && enemyAffinity === "Wraithborn") return 1.35;
    if (heroForce === "Wraithborn" && enemyAffinity === "Echo") return 1.35;
    if (heroForce === "Echoes" && enemyAffinity === "Architect") return 1.35;
    if (heroForce === "Architects" && enemyAffinity === "Echo") return 0.85;
    return 1.0;
  }

  public clearEnemies() {
    for (const enemy of this.enemies) {
      enemy.sprite.parent?.removeChild(enemy.sprite);
      enemy.sprite.destroy();
    }
    this.enemies = [];
  }

  public spawnNextTarget(logger: any): MythicEnemy | null {
    if (this.hero.hp <= 0) return null;

    const livingCount = this.enemies.filter(e => e.hp > 0 && !e.isPerishing).length;
    if (livingCount >= this.maxHordeSize) return null;

    const eraId = this.gameState.currentEra;
    const shouldSpawnBoss = this.bossMode && !this.enemies.some(e => e.isBoss);

    const newEnemy = MythicEnemy.spawnForEra(eraId, shouldSpawnBoss, this.hero.level);

    if (shouldSpawnBoss) {
      this.particles.addFloatingText("⚡ ERA BOSS AWAKENS! ⚡", 640, 180, "#ff3333", 28, true);
      logger.printLine(`*** The ${newEnemy.name} emerges from the mythic veil! ***`, "#ff3333");
    } else {
      if (livingCount === 0) {
        logger.printLine(`Creatures approach: ${newEnemy.name} (${newEnemy.affinity} affinity).`, "#aaaaaa");
      }
    }

    // Creature spawns at right edge of the screen and marches towards the hero
    newEnemy.sprite.x = 1150 + Math.random() * 120;
    newEnemy.sprite.y = newEnemy.isFlying ? 360 : 425 + (Math.random() * 24 - 12);
    newEnemy.setState("run");

    this.enemies.push(newEnemy);
    return newEnemy;
  }

  public updateTick(delta: number, logger: any, onLootCallback?: (item: RPGItem) => void) {
    // 1. Tick down Hero cooldowns
    if (this.hero.attackCooldown > 0) this.hero.attackCooldown -= delta;
    if (this.hero.hurtTimer > 0) this.hero.hurtTimer -= delta;
    if (this.hero.castCooldown > 0) this.hero.castCooldown -= delta;

    // Tick transformation duration
    this.hero.updateFormTimer(delta / 60);

    // Distance progression (marching forward through the historical era)
    if (this.hero.hp > 0) {
      const marchSpeedRelic = 1 + (this.hero.getRelicBonus("marchSpeedPercent") / 100);
      this.hero.distanceMeters += (0.65 * marchSpeedRelic) * (delta / 60);
      if (this.hero.distanceMeters > this.hero.maxDistanceReached) {
        this.hero.maxDistanceReached = this.hero.distanceMeters;
        // Distance Milepost Checkpoints (every 250m grants Soul Diamonds & Relic Chest)
        if (Math.floor(this.hero.distanceMeters) % 250 === 0 && Math.floor(this.hero.distanceMeters) > 0) {
          this.hero.soulDiamonds += 3;
          this.particles.addFloatingText(`🚩 REACHED ${Math.floor(this.hero.distanceMeters)}m! +3 Soul Diamonds!`, 640, 220, "#ffd700", 24, true);
          logger.printLine(`*** Crossed ${Math.floor(this.hero.distanceMeters)}m milepost! Relic Chest opened (+3 Soul Diamonds)! ***`, "#ffd700");
        }
      }
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
        // Respawn at beginning meters: 1 meter!
        this.hero.distanceMeters = 1;
        this.hero.hp = this.hero.getEffectiveMaxHp();
        this.hero.sprite.x = 260;
        this.hero.sprite.y = 430;
        this.hero.setState("run");
        this.clearEnemies();
        logger.printLine("Reconstituted at the beginning (1 meter). Level up & equip gear to overcome the swarm!", "#7ee787");
        this.particles.addFloatingText("RESPAWNED AT 1 METER", this.hero.sprite.x, this.hero.sprite.y - 60, "#38bdf8", 26, true);
      }
      return;
    }

    // Companion Troops Attack Loop against active front enemy
    const target = this.activeEnemy;
    if (target && target.hp > 0 && !target.isPerishing && this.hero.hp > 0) {
      const troopDmgRelic = 1 + (this.hero.getRelicBonus("troopDamagePercent") / 100);
      this.hero.troops.forEach(troop => {
        if (troop.count > 0) {
          if (troop.attackCooldown > 0) {
            troop.attackCooldown -= delta;
          }
          if (troop.attackCooldown <= 0 && target && target.hp > 0 && !target.isPerishing) {
            troop.attackCooldown = troop.attackInterval;
            (troop as any).attackTrigger = true;
            const troopDmg = Math.floor(troop.baseDmg * troop.count * troopDmgRelic * (0.85 + Math.random() * 0.3));
            const dealt = target.takeDamage(troopDmg);
            this.particles.addFloatingText(`-${dealt}`, target.sprite.x + (Math.random() * 30 - 15), target.sprite.y - 30, `#${troop.color.toString(16)}`, 16);
            this.hero.gainChi(1);
          }
        }
      });
    }

    // 3. Enemy defeat, perishing fade away, and clean removal
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.hp <= 0 && !enemy.isPerishing) {
        enemy.startPerish();
        this.particles.spawnSoulDissolve(enemy.sprite.x, enemy.sprite.y);
        this.processVictory(enemy, logger, onLootCallback);
      } else if (enemy.isPerishing) {
        const finished = enemy.updatePerish(delta);
        if (finished) {
          enemy.sprite.parent?.removeChild(enemy.sprite);
          enemy.sprite.destroy();
          this.enemies.splice(i, 1);
        }
      }
    }
  }

  public executeHeroAttack(logger: any) {
    const target = this.activeEnemy;
    if (!target || target.hp <= 0 || this.hero.hp <= 0) return null;

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
    const affinityMult = this.getAffinityMultiplier(this.hero.cosmicAlignment, target.affinity);

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
      this.particles.spawnSpellEffect(target.sprite.x, target.sprite.y, 0xffd700, 20);
    } else {
      this.hero.setState("attack");
    }

    // Ability energy cost and individual ability cooldown registration
    if (abilityToUse.costEnergy > 0) {
      this.gameState.currencies.eraEnergy = Math.max(0, this.gameState.currencies.eraEnergy - abilityToUse.costEnergy);
      this.hero.castCooldown = 30;
      this.hero.abilityCooldowns[abilityToUse.id] = abilityToUse.cooldownFrames;

      this.particles.spawnSpellEffect(
        target.sprite.x,
        target.sprite.y,
        parseInt(abilityToUse.particleColor.replace("#", "0x"), 16),
        30
      );

      if (abilityToUse.effectType === "heal") {
        const healAmt = Math.floor(this.hero.getEffectiveMaxHp() * 0.15);
        this.hero.heal(healAmt);
        this.particles.addFloatingText(`+${healAmt} HP`, this.hero.sprite.x, this.hero.sprite.y - 60, "#33ff99", 22);
      }
    }

    // Apply damage to primary target
    const actualDmg = target.takeDamage(rawDmg);

    // Multi-target cleave if using heavy weapons, spells, or Arc Angel form
    const hasCleave = this.hero.activeForm === "arc_angel" ||
      this.hero.equippedShadowWeapon?.weaponType === 'greatsword' ||
      this.hero.equippedShadowWeapon?.weaponType === 'warhammer' ||
      abilityToUse.id === 'genesis_quake' ||
      (this.hero.isNinja() && isCrit);

    if (hasCleave) {
      const secondaryEnemies = this.enemies.filter(e => e !== target && e.hp > 0 && !e.isPerishing && (e.sprite.x - this.hero.sprite.x) < 200);
      for (const sec of secondaryEnemies) {
        const secDmg = Math.max(1, Math.floor(rawDmg * 0.6));
        sec.takeDamage(secDmg);
        this.particles.addFloatingText(`-${secDmg}`, sec.sprite.x, sec.sprite.y - 35, "#facc15", 16);
      }
    }

    // Werewolf Life Leech
    if (this.hero.activeForm === "werewolf") {
      const leechAmt = Math.floor(actualDmg * 0.25);
      this.hero.heal(leechAmt);
      this.particles.addFloatingText(`+${leechAmt} Leech`, this.hero.sprite.x, this.hero.sprite.y - 50, "#ff4444", 18);
    }

    // Bloodweaver Sanguine Siphon
    if (this.hero.isBloodweaver()) {
      const siphonAmt = Math.max(3, Math.floor(actualDmg * 0.20));
      this.hero.heal(siphonAmt);
      this.particles.spawnSpellEffect(target.sprite.x, target.sprite.y, 0xff2b47, 20);
      this.particles.addFloatingText(`+${siphonAmt} 🩸 Sanguine Siphon`, this.hero.sprite.x, this.hero.sprite.y - 70, "#f43f5e", 17, true);
    }

    // Ninja Shinobi Flurry
    if (this.hero.isNinja()) {
      this.particles.spawnSpellEffect(target.sprite.x, target.sprite.y, 0xef4444, 14);
      if (isCrit || Math.random() < 0.4) {
        this.particles.addFloatingText("🥷 SHINOBI FLURRY", this.hero.sprite.x, this.hero.sprite.y - 70, "#f87171", 16, true);
        this.hero.gainChi(3);
      }
    }

    // Shadow Requiem Weapon Dynamic Perks
    const shadowWpn = this.hero.equippedShadowWeapon;
    if (shadowWpn) {
      if (shadowWpn.weaponType === 'kusarigama' || shadowWpn.perks?.includes('perk_lifesteal') || this.hero.unlockedPerks?.includes('perk_lifesteal')) {
        const stealHp = Math.max(1, Math.floor(actualDmg * 0.12));
        this.hero.heal(stealHp);
        this.particles.addFloatingText(`+${stealHp} HP Vampiric`, this.hero.sprite.x, this.hero.sprite.y - 65, "#34d399", 16);
      }
      if (shadowWpn.weaponType === 'warhammer') {
        this.particles.spawnSpellEffect(target.sprite.x, target.sprite.y, 0xf97316, 15);
        this.particles.addFloatingText("SUNDER -30% DEF", target.sprite.x, target.sprite.y - 65, "#fb923c", 16);
      }
      if (shadowWpn.weaponType === 'katana' && isCrit) {
        this.particles.spawnSpellEffect(target.sprite.x, target.sprite.y, 0xa855f7, 20);
        this.particles.addFloatingText("⚡ IAIDO EXECUTION", this.hero.sprite.x, this.hero.sprite.y - 75, "#c084fc", 18, true);
      }
      if (shadowWpn.weaponType === 'nunchaku') {
        this.gameState.currencies.eraEnergy += 4;
        if (Math.random() < 0.3) {
          this.particles.addFloatingText("CHI FLURRY +4", this.hero.sprite.x, this.hero.sprite.y - 55, "#38bdf8", 16);
        }
      }
      if (shadowWpn.weaponType === 'greatsword' && Math.random() < 0.25) {
        this.particles.addFloatingText("POISE CLEAVE", this.hero.sprite.x, this.hero.sprite.y - 55, "#facc15", 16);
      }
    }

    this.particles.addFloatingText(
      isCrit ? `CRIT -${actualDmg}!` : `-${actualDmg}`,
      target.sprite.x,
      target.sprite.y - 45,
      isCrit ? "#ffcc00" : abilityToUse.particleColor,
      isCrit ? 26 : 20,
      isCrit
    );

    logger.printLine(
      `Hero strikes [${abilityToUse.name}] on ${target.name} for ${actualDmg} ${isCrit ? "(CRITICAL!)" : ""}`,
      isCrit ? "#ffcc00" : "#ffffff"
    );

    this.hero.attackCooldown = this.hero.getAttackInterval();
    return { isCrit, ability: abilityToUse, actualDmg };
  }

  public executeCreatureAttacks(logger: any) {
    if (this.hero.hp <= 0) return;
    const traitBonus = this.gameState.getTraitBonus();

    // All living creatures within assault range (<= 210 distance) can attack when ready
    // This allows a pack of 5+ mobs piled together to strike in succession and shove the hero back!
    const inRange = this.enemies.filter(e => e.hp > 0 && !e.isPerishing && (e.sprite.x - this.hero.sprite.x) <= 210);
    for (const enemy of inRange) {
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = enemy.attackInterval + Math.floor(Math.random() * 14);
        const ed = Math.floor(enemy.baseDmg * (0.85 + Math.random() * 0.3));
        const mitigated = this.hero.takeDamage(ed, traitBonus.defenseBonus || 0);

        // Apply physical pushback to hero (different mobs have different pushback; bosses are strongest)
        const pushAmt = enemy.pushback || (enemy.isBoss ? 55 : 16);
        this.hero.applyPushback(pushAmt);

        this.particles.addFloatingText(`-${mitigated}`, this.hero.sprite.x + (Math.random() * 24 - 12), this.hero.sprite.y - 40, "#ff4444", 20);
        if (enemy.isBoss) {
          this.particles.addFloatingText(`💥 TITAN SMASH! -${pushAmt}px`, this.hero.sprite.x, this.hero.sprite.y - 68, "#ff3333", 22, true);
        }

        enemy.setBossAttackState(true);
        setTimeout(() => enemy?.setBossAttackState(false), 240);

        logger.printLine(`${enemy.name} strikes for ${mitigated} damage (shoved back -${pushAmt}px)!`, enemy.isBoss ? "#ff3333" : "#ff7777");

        if (this.hero.hp <= 0) {
          this.heroRespawnTimer = 120;
          this.hero.distanceMeters = 1; // Respawn at beginning meters: 1 meter!
          this.particles.addFloatingText("OVERWHELMED! (1m)", this.hero.sprite.x, this.hero.sprite.y - 60, "#ff0000", 32, true);
          logger.printLine("Overwhelmed by the swarm! Respawning at the beginning (1 meter)...", "#ff3333");
          break;
        }
      }
    }
  }

  public processVictory(enemy: MythicEnemy, logger: any, onLootCallback?: (item: RPGItem) => void) {
    const isBoss = enemy.isBoss;
    const eraId = this.gameState.currentEra;
    const eraInfo = ERA_DATA[eraId];

    this.gameState.stats.totalKills += 1;
    if (isBoss) this.gameState.stats.bossKills += 1;

    // Measured experience payout so hero levels up through steady, earned progression
    const xpGain = isBoss ? 160 + this.hero.level * 20 : 14 + Math.floor(this.hero.level * 2.5);
    const lvlUp = this.hero.gainXp(xpGain);
    logger.printLine(`Slew ${enemy.name}! Gained ${xpGain} XP.`, "#33ff99");
    if (lvlUp) {
      this.particles.triggerLevelUpEffect(this.hero.sprite.x, this.hero.sprite.y);
      this.particles.addFloatingText(`★ LEVEL UP: LVL ${this.hero.level}! (+DMG, +HP, +DEF) ★`, this.hero.sprite.x, this.hero.sprite.y - 80, "#ffff00", 28, true);
      logger.printLine(`*** REINCARNATION LEVEL UP: LEVEL ${this.hero.level}! Naturally stronger (+DMG, +HP, +Armor)! ***`, "#ffff00");
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
      this.bossMode = false;
    }

    // Gear Drop calculation
    const dropRoll = Math.random();
    const dropThreshold = isBoss ? 0.75 : 0.16;
    if (dropRoll < dropThreshold) {
      const eraItems = MASTER_GEAR_CATALOG.filter(i => i.era === eraId);
      if (eraItems.length > 0) {
        const rolledItem = eraItems[Math.floor(Math.random() * eraItems.length)];
        if (this.hero.inventory.length < 24) {
          this.hero.inventory.push({ ...rolledItem });
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
