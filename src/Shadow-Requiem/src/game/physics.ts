import { FighterEntity, SkeletalPose, CombatAction, AttackFrame, ParticleEffect } from './types';
import { BASE_IDLE_POSE, BLOCK_POSE, CROUCH_POSE, HIT_LIGHT_POSE, KNOCKDOWN_POSE, getMoveSetByWeaponType } from './weapons';

export const ARENA_WIDTH = 1000;
export const GROUND_Y = 380;
export const GRAVITY = 0.85;

// Interpolate between two angles smoothly avoiding 360 wrap issues
function lerpAngle(a: number, b: number, t: number): number {
  const diff = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
  return a + diff * t;
}

// Lerp between two skeletal poses
export function lerpPose(poseA: SkeletalPose, poseB: SkeletalPose, t: number): SkeletalPose {
  const clampedT = Math.max(0, Math.min(1, t));
  return {
    pelvis: {
      x: poseA.pelvis.x + (poseB.pelvis.x - poseA.pelvis.x) * clampedT,
      y: poseA.pelvis.y + (poseB.pelvis.y - poseA.pelvis.y) * clampedT,
      angle: lerpAngle(poseA.pelvis.angle, poseB.pelvis.angle, clampedT),
    },
    torso: { angle: lerpAngle(poseA.torso.angle, poseB.torso.angle, clampedT) },
    head: { angle: lerpAngle(poseA.head.angle, poseB.head.angle, clampedT) },
    leftUpperArm: { angle: lerpAngle(poseA.leftUpperArm.angle, poseB.leftUpperArm.angle, clampedT) },
    leftForearm: { angle: lerpAngle(poseA.leftForearm.angle, poseB.leftForearm.angle, clampedT) },
    rightUpperArm: { angle: lerpAngle(poseA.rightUpperArm.angle, poseB.rightUpperArm.angle, clampedT) },
    rightForearm: { angle: lerpAngle(poseA.rightForearm.angle, poseB.rightForearm.angle, clampedT) },
    leftThigh: { angle: lerpAngle(poseA.leftThigh.angle, poseB.leftThigh.angle, clampedT) },
    leftShin: { angle: lerpAngle(poseA.leftShin.angle, poseB.leftShin.angle, clampedT) },
    rightThigh: { angle: lerpAngle(poseA.rightThigh.angle, poseB.rightThigh.angle, clampedT) },
    rightShin: { angle: lerpAngle(poseA.rightShin.angle, poseB.rightShin.angle, clampedT) },
    weaponAngle: lerpAngle(poseA.weaponAngle, poseB.weaponAngle, clampedT),
    weaponOffsetX: poseA.weaponOffsetX + (poseB.weaponOffsetX - poseA.weaponOffsetX) * clampedT,
    weaponOffsetY: poseA.weaponOffsetY + (poseB.weaponOffsetY - poseA.weaponOffsetY) * clampedT,
  };
}

export function getMoveSetForFighter(fighter: FighterEntity) {
  return getMoveSetByWeaponType(fighter.equipment.weapon?.weaponType || 'katana');
}

// Evaluate active pose and hitbox from attack frame sequence
export function sampleAttackFrames(
  frames: AttackFrame[], 
  progress: number
): { pose: SkeletalPose; isHitboxActive: boolean; damageMultiplier: number; hitBoxOffset?: { x: number; y: number; r: number }; unbreakable?: boolean } {
  if (frames.length === 0) {
    return { pose: BASE_IDLE_POSE, isHitboxActive: false, damageMultiplier: 1 };
  }
  if (progress <= frames[0].progress) {
    return {
      pose: frames[0].pose,
      isHitboxActive: !!frames[0].isHitboxActive,
      damageMultiplier: frames[0].damageMultiplier || 1,
      hitBoxOffset: frames[0].hitBoxOffset,
      unbreakable: frames[0].unbreakable,
    };
  }
  if (progress >= frames[frames.length - 1].progress) {
    return {
      pose: frames[frames.length - 1].pose,
      isHitboxActive: !!frames[frames.length - 1].isHitboxActive,
      damageMultiplier: frames[frames.length - 1].damageMultiplier || 1,
      hitBoxOffset: frames[frames.length - 1].hitBoxOffset,
      unbreakable: frames[frames.length - 1].unbreakable,
    };
  }

  for (let i = 0; i < frames.length - 1; i++) {
    const f0 = frames[i];
    const f1 = frames[i + 1];
    if (progress >= f0.progress && progress <= f1.progress) {
      const segT = (progress - f0.progress) / (f1.progress - f0.progress);
      return {
        pose: lerpPose(f0.pose, f1.pose, segT),
        isHitboxActive: !!(f0.isHitboxActive || f1.isHitboxActive),
        damageMultiplier: f1.damageMultiplier || f0.damageMultiplier || 1,
        hitBoxOffset: f1.hitBoxOffset || f0.hitBoxOffset,
        unbreakable: f0.unbreakable || f1.unbreakable,
      };
    }
  }

  return { pose: BASE_IDLE_POSE, isHitboxActive: false, damageMultiplier: 1 };
}

// Update physics, motions, attacks and collisions
export interface CombatFrameResult {
  hitLanded: boolean;
  hitCritical: boolean;
  hitBlocked: boolean;
  hitPos?: { x: number; y: number };
  damageDealt: number;
  attackerId: string;
  defenderId: string;
  shadowAbilityTriggered?: boolean;
}

export function updateFighterPhysics(
  fighter: FighterEntity,
  opponent: FighterEntity,
  dt: number,
  events: CombatFrameResult[],
  particles: ParticleEffect[]
) {
  // Update action timer
  fighter.actionTimer += dt;
  const progress = Math.min(1, fighter.actionTimer / Math.max(0.01, fighter.actionDuration));

  // Natural shadow form timer
  if (fighter.isShadowForm) {
    fighter.shadowFormDuration -= dt;
    if (fighter.shadowFormDuration <= 0) {
      fighter.isShadowForm = false;
      fighter.currentShadowEnergy = 0;
    }
    // Spawn dark shadow aura smoke particles
    if (Math.random() < 0.35) {
      particles.push({
        x: fighter.x + (Math.random() * 40 - 20),
        y: fighter.y - Math.random() * 80,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 1,
        size: Math.random() * 12 + 8,
        color: '#818cf8',
        alpha: 0.6,
        life: 0,
        maxLife: 24,
        type: 'shadow_smoke',
      });
    }
  }

  // Turn to face opponent when in idle or walking
  if (fighter.action === 'idle' || fighter.action === 'walk_fwd' || fighter.action === 'walk_bwd') {
    fighter.direction = fighter.x < opponent.x ? 1 : -1;
  }

  // Handle Gravity & Movement
  fighter.vy += GRAVITY;
  fighter.y += fighter.vy;
  fighter.x += fighter.vx;

  // Ground collision
  if (fighter.y >= GROUND_Y) {
    fighter.y = GROUND_Y;
    fighter.vy = 0;
  }

  // Horizontal boundaries
  const margin = 80;
  if (fighter.x < margin) {
    fighter.x = margin;
    fighter.vx = 0;
  }
  if (fighter.x > ARENA_WIDTH - margin) {
    fighter.x = ARENA_WIDTH - margin;
    fighter.vx = 0;
  }

  // Apply friction
  fighter.vx *= 0.82;

  // Update Pose based on action
  const moves = getMoveSetForFighter(fighter);
  fighter.hitbox = undefined;
  fighter.isBlocking = false;

  // Hurtboxes are located at head, torso and legs
  fighter.hurtboxes = [
    { x: fighter.x, y: fighter.y - 85, r: 18, part: 'head' },
    { x: fighter.x, y: fighter.y - 50, r: 24, part: 'body' },
    { x: fighter.x, y: fighter.y - 18, r: 20, part: 'legs' },
  ];

  switch (fighter.action) {
    case 'idle': {
      // Natural idle breathing cycle
      const breath = Math.sin(fighter.actionTimer * 3.5) * 0.05;
      fighter.currentPose = {
        ...BASE_IDLE_POSE,
        torso: { angle: BASE_IDLE_POSE.torso.angle + breath },
        head: { angle: BASE_IDLE_POSE.head.angle - breath * 0.5 },
      };
      break;
    }
    case 'walk_fwd': {
      const step = Math.sin(fighter.actionTimer * 8);
      fighter.vx = fighter.direction * 3.2;
      fighter.currentPose = {
        ...BASE_IDLE_POSE,
        leftThigh: { angle: step * 0.7 },
        rightThigh: { angle: -step * 0.7 },
        torso: { angle: 0.15 },
      };
      break;
    }
    case 'walk_bwd': {
      const step = Math.sin(fighter.actionTimer * 7);
      fighter.vx = -fighter.direction * 2.5;
      fighter.isBlocking = true;
      fighter.currentPose = {
        ...BLOCK_POSE,
        leftThigh: { angle: step * 0.5 },
        rightThigh: { angle: -step * 0.5 },
      };
      break;
    }
    case 'dash_fwd': {
      fighter.vx = fighter.direction * 7.5;
      fighter.currentPose = {
        ...BASE_IDLE_POSE,
        pelvis: { x: 15, y: 8, angle: 0.2 },
        torso: { angle: 0.5 },
      };
      if (progress >= 1) fighter.action = 'idle';
      break;
    }
    case 'dash_bwd': {
      fighter.vx = -fighter.direction * 6.5;
      fighter.currentPose = {
        ...BLOCK_POSE,
        pelvis: { x: -12, y: 5, angle: -0.2 },
        torso: { angle: -0.3 },
      };
      if (progress >= 1) fighter.action = 'idle';
      break;
    }
    case 'crouch': {
      fighter.currentPose = CROUCH_POSE;
      break;
    }
    case 'block': {
      fighter.isBlocking = true;
      fighter.currentPose = BLOCK_POSE;
      break;
    }
    case 'hit_light': {
      fighter.currentPose = HIT_LIGHT_POSE;
      if (progress >= 1) fighter.action = 'idle';
      break;
    }
    case 'hit_heavy': {
      fighter.currentPose = HIT_LIGHT_POSE;
      fighter.vx = -fighter.direction * 4.0;
      if (progress >= 1) fighter.action = 'idle';
      break;
    }
    case 'knockdown': {
      fighter.currentPose = KNOCKDOWN_POSE;
      fighter.isInvulnerable = true;
      if (progress >= 1) {
        fighter.action = 'get_up';
        fighter.actionTimer = 0;
        fighter.actionDuration = 0.5;
      }
      break;
    }
    case 'get_up': {
      const t = progress;
      fighter.currentPose = lerpPose(KNOCKDOWN_POSE, BASE_IDLE_POSE, t);
      if (progress >= 1) {
        fighter.isInvulnerable = false;
        fighter.action = 'idle';
      }
      break;
    }
    case 'attack_neutral_1':
    case 'attack_neutral_2':
    case 'attack_neutral_3': {
      const stepIdx = fighter.action === 'attack_neutral_1' ? 0 : fighter.action === 'attack_neutral_2' ? 1 : 2;
      const attackSeq = moves.neutralCombo[stepIdx] || moves.neutralCombo[0];
      const sample = sampleAttackFrames(attackSeq, progress);
      fighter.currentPose = sample.pose;

      if (sample.isHitboxActive && sample.hitBoxOffset) {
        fighter.hitbox = {
          x: fighter.x + sample.hitBoxOffset.x * fighter.direction,
          y: fighter.y + sample.hitBoxOffset.y,
          r: sample.hitBoxOffset.r,
        };
        // Check collision against opponent
        checkHitCollision(fighter, opponent, sample.damageMultiplier, events, particles);
      }

      if (progress >= 1) {
        fighter.action = 'idle';
        fighter.hasHitCurrentAction = false;
      }
      break;
    }
    case 'attack_forward': {
      const sample = sampleAttackFrames(moves.forwardAttack, progress);
      fighter.currentPose = sample.pose;
      if (sample.isHitboxActive && sample.hitBoxOffset) {
        fighter.hitbox = {
          x: fighter.x + sample.hitBoxOffset.x * fighter.direction,
          y: fighter.y + sample.hitBoxOffset.y,
          r: sample.hitBoxOffset.r,
        };
        checkHitCollision(fighter, opponent, sample.damageMultiplier, events, particles);
      }
      if (progress >= 1) {
        fighter.action = 'idle';
        fighter.hasHitCurrentAction = false;
      }
      break;
    }
    case 'attack_up': {
      const sample = sampleAttackFrames(moves.upAttack, progress);
      fighter.currentPose = sample.pose;
      if (sample.isHitboxActive && sample.hitBoxOffset) {
        fighter.hitbox = {
          x: fighter.x + sample.hitBoxOffset.x * fighter.direction,
          y: fighter.y + sample.hitBoxOffset.y,
          r: sample.hitBoxOffset.r,
        };
        checkHitCollision(fighter, opponent, sample.damageMultiplier, events, particles);
      }
      if (progress >= 1) {
        fighter.action = 'idle';
        fighter.hasHitCurrentAction = false;
      }
      break;
    }
    case 'attack_down': {
      const sample = sampleAttackFrames(moves.downAttack, progress);
      fighter.currentPose = sample.pose;
      if (sample.isHitboxActive && sample.hitBoxOffset) {
        fighter.hitbox = {
          x: fighter.x + sample.hitBoxOffset.x * fighter.direction,
          y: fighter.y + sample.hitBoxOffset.y,
          r: sample.hitBoxOffset.r,
        };
        checkHitCollision(fighter, opponent, sample.damageMultiplier, events, particles);
      }
      if (progress >= 1) {
        fighter.action = 'idle';
        fighter.hasHitCurrentAction = false;
      }
      break;
    }
    case 'attack_heavy': {
      const sample = sampleAttackFrames(moves.heavyAttack, progress);
      fighter.currentPose = sample.pose;
      if (sample.isHitboxActive && sample.hitBoxOffset) {
        fighter.hitbox = {
          x: fighter.x + sample.hitBoxOffset.x * fighter.direction,
          y: fighter.y + sample.hitBoxOffset.y,
          r: sample.hitBoxOffset.r,
        };
        checkHitCollision(fighter, opponent, sample.damageMultiplier, events, particles, true);
      }
      if (progress >= 1) {
        fighter.action = 'idle';
        fighter.hasHitCurrentAction = false;
      }
      break;
    }
    case 'shadow_ability': {
      const sample = sampleAttackFrames(moves.shadowAbility, progress);
      fighter.currentPose = sample.pose;
      if (sample.isHitboxActive && sample.hitBoxOffset) {
        fighter.hitbox = {
          x: fighter.x + sample.hitBoxOffset.x * fighter.direction,
          y: fighter.y + sample.hitBoxOffset.y,
          r: sample.hitBoxOffset.r,
        };
        checkHitCollision(fighter, opponent, sample.damageMultiplier, events, particles, true, true);
      }
      if (progress >= 1) {
        fighter.action = 'idle';
        fighter.hasHitCurrentAction = false;
      }
      break;
    }
    default:
      fighter.currentPose = BASE_IDLE_POSE;
      break;
  }
}

// Circle to Circle intersection test
function circlesIntersect(c1: { x: number; y: number; r: number }, c2: { x: number; y: number; r: number }): boolean {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const distSq = dx * dx + dy * dy;
  const radSum = c1.r + c2.r;
  return distSq <= radSum * radSum;
}

// Collision resolution between attacker weapon hitbox and defender hurtboxes
function checkHitCollision(
  attacker: FighterEntity,
  defender: FighterEntity,
  damageMultiplier: number,
  events: CombatFrameResult[],
  particles: ParticleEffect[],
  isHeavyAttack: boolean = false,
  isShadowAttack: boolean = false
) {
  if (!attacker.hitbox || defender.isInvulnerable || defender.currentHealth <= 0) return;
  if (attacker.hasHitCurrentAction) return;

  for (const hurtbox of defender.hurtboxes) {
    if (circlesIntersect(attacker.hitbox, hurtbox)) {
      // Hit connected!
      const isCritical = !isShadowAttack && Math.random() < attacker.stats.critChance;
      let rawDamage = attacker.stats.attackPower * damageMultiplier;

      if (attacker.isShadowForm || isShadowAttack) {
        rawDamage *= 1.35 + (attacker.stats.shadowPower / 300);
      }

      if (isCritical) {
        rawDamage *= attacker.stats.critMultiplier;
      }

      // Check blocking
      const isBlocked = defender.isBlocking && !isShadowAttack;
      // Balanced combat damage formula preventing instant kills
      const finalDamage = Math.max(
        8,
        Math.round(
          isBlocked
            ? rawDamage * 0.08
            : (rawDamage * 82) / (100 + defender.stats.defense * 0.72)
        )
      );

      defender.currentHealth = Math.max(0, defender.currentHealth - finalDamage);

      // Award shadow energy
      attacker.currentShadowEnergy = Math.min(
        attacker.stats.maxShadowEnergy,
        attacker.currentShadowEnergy + (isCritical ? 30 : 18)
      );
      defender.currentShadowEnergy = Math.min(
        defender.stats.maxShadowEnergy,
        defender.currentShadowEnergy + 12
      );

      // Hit sparks & particle burst
      const hitX = (attacker.hitbox.x + hurtbox.x) / 2;
      const hitY = (attacker.hitbox.y + hurtbox.y) / 2;

      if (isBlocked) {
        // Metallic spark splash
        for (let i = 0; i < 14; i++) {
          particles.push({
            x: hitX,
            y: hitY,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 10 - 2,
            size: Math.random() * 4 + 2,
            color: '#facc15',
            alpha: 1,
            life: 0,
            maxLife: 15,
            type: 'spark',
          });
        }
      } else {
        // Critical or flesh impact particles
        const particleCount = isCritical || isShadowAttack ? 25 : 12;
        const mainColor = isShadowAttack ? '#a855f7' : isCritical ? '#f43f5e' : '#fb923c';

        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: hitX,
            y: hitY,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 14 - 3,
            size: Math.random() * 5 + 3,
            color: mainColor,
            alpha: 1,
            life: 0,
            maxLife: 20,
            type: isShadowAttack ? 'shadow_smoke' : 'blood',
          });
        }
      }

      // Hit reaction, Hyper-Armor & Knockdown logic
      if (!isBlocked) {
        attacker.comboCount += 1;
        if (isHeavyAttack || isShadowAttack || isCritical) {
          defender.action = 'knockdown';
          defender.actionTimer = 0;
          defender.actionDuration = 0.85;
          defender.vx = attacker.direction * 7.0;
          defender.vy = -5.0;
        } else {
          // Check for Legion / Boss Poise Hyper-Armor
          const hasHyperArmor = (
            defender.action === 'shadow_ability' ||
            (defender.stats.poise >= 85 && defender.action.startsWith('attack_')) ||
            (defender.isBoss && Math.random() < 0.40)
          );

          if (hasHyperArmor) {
            // Poise absorbs light hit without interruption
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: hitX,
                y: hitY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 3 + 2,
                color: '#eab308',
                alpha: 0.9,
                life: 0,
                maxLife: 12,
                type: 'spark',
              });
            }
          } else {
            defender.action = 'hit_light';
            defender.actionTimer = 0;
            // High poise reduces light hit stun duration (prevents endless player mashing)
            const stunReduc = Math.min(0.15, (defender.stats.poise / 250));
            defender.actionDuration = Math.max(0.18, 0.32 - stunReduc);
            defender.vx = attacker.direction * 3.0;
          }
        }
      }

      // Log event
      events.push({
        hitLanded: true,
        hitCritical: isCritical,
        hitBlocked: isBlocked,
        hitPos: { x: hitX, y: hitY },
        damageDealt: finalDamage,
        attackerId: attacker.id,
        defenderId: defender.id,
        shadowAbilityTriggered: isShadowAttack,
      });

      // Register hit and clear hitbox to prevent multi-hit on single swing
      attacker.hasHitCurrentAction = true;
      attacker.hitbox = undefined;
      break;
    }
  }
}

// AI Controller: intelligent spacing, combo execution, counter-attacks, whiff punishing, and shadow abilities
export function updateFighterAI(ai: FighterEntity, player: FighterEntity, dt: number) {
  if (ai.currentHealth <= 0 || ai.action === 'knockdown' || ai.action === 'get_up') return;

  const dist = Math.abs(player.x - ai.x);
  const targetDir = ai.x < player.x ? 1 : -1;
  const isBoss = !!ai.isBoss || ai.stats.maxHealth >= 800;

  // 1. Rapid Shadow Form Awakening when gauge is charged
  if (!ai.isShadowForm && ai.currentShadowEnergy >= ai.stats.maxShadowEnergy) {
    if (Math.random() < 0.25 || isBoss) {
      ai.isShadowForm = true;
      ai.shadowFormDuration = 10;
    }
  }

  // 2. Combo Chaining: if AI is already attacking, chain into the next hit of the combo!
  if (ai.action.startsWith('attack_')) {
    const atkProgress = ai.actionTimer / Math.max(0.01, ai.actionDuration);

    // From neutral 1 -> chain into neutral 2
    if (ai.action === 'attack_neutral_1' && atkProgress >= 0.65 && dist < 120) {
      ai.action = 'attack_neutral_2';
      ai.actionTimer = 0;
      ai.actionDuration = 0.48;
      ai.comboStep = 1;
      return;
    }

    // From neutral 2 -> chain into finisher (heavy or forward thrust)
    if (ai.action === 'attack_neutral_2' && atkProgress >= 0.65 && dist < 125) {
      ai.action = Math.random() < 0.55 ? 'attack_heavy' : 'attack_forward';
      ai.actionTimer = 0;
      ai.actionDuration = ai.action === 'attack_heavy' ? 0.75 : 0.55;
      ai.comboStep = 2;
      return;
    }

    // Still completing swing
    return;
  }

  // If executing shadow ability or reacting to hits, let animation play
  if (ai.action === 'shadow_ability' || ai.action.startsWith('hit_')) {
    return;
  }

  // 3. Shadow Form Aggression: unleash devastating shadow ability when in range
  if (ai.isShadowForm) {
    if (dist < 155 && Math.random() < 0.55) {
      ai.action = 'shadow_ability';
      ai.actionTimer = 0;
      ai.actionDuration = 0.95;
      return;
    }
    // In shadow form, close in aggressively
    if (dist > 95) {
      ai.action = 'dash_fwd';
      ai.actionTimer = 0;
      ai.actionDuration = 0.35;
      return;
    }
  }

  // 4. Proactive Defense & Evasion against Player Attacks
  if (player.action.startsWith('attack_') && dist < 135) {
    const isHeavyWindup = player.action === 'attack_heavy' || player.action === 'attack_forward';
    const playerProgress = player.actionTimer / Math.max(0.01, player.actionDuration);

    // If player is in late recovery of their attack -> WHIFF PUNISH!
    if (playerProgress >= 0.55 && dist < 115) {
      ai.action = Math.random() < 0.5 ? 'attack_neutral_1' : 'attack_forward';
      ai.actionTimer = 0;
      ai.actionDuration = 0.5;
      return;
    }

    // Reaction against active swing
    const blockChance = isBoss ? 0.88 : 0.76;
    if (Math.random() < blockChance) {
      if (isHeavyWindup && Math.random() < 0.45) {
        // Back dash to make heavy attack completely whiff!
        ai.action = 'dash_bwd';
        ai.actionTimer = 0;
        ai.actionDuration = 0.35;
      } else if (Math.random() < 0.15) {
        // Duck underneath high katana slashes
        ai.action = 'crouch';
        ai.actionTimer = 0;
        ai.actionDuration = 0.4;
      } else {
        // Solid block stance
        ai.action = 'block';
        ai.isBlocking = true;
        ai.actionTimer = 0;
        ai.actionDuration = 0.45;
      }
      return;
    }
  }

  // 5. Spacing and Movement Maneuvers
  const optimalStrikeRange = 85;

  if (dist > optimalStrikeRange + 45) {
    // Gap closing: mix between forward sprint and dash
    if (dist > 220 && Math.random() < 0.35) {
      ai.action = 'dash_fwd';
      ai.actionTimer = 0;
      ai.actionDuration = 0.35;
    } else {
      ai.action = 'walk_fwd';
      ai.actionDuration = 0.45;
    }
  } else if (dist < 40) {
    // Crowded close combat: defensive back-step, low sweep, or sudden throw
    const closeRoll = Math.random();
    if (closeRoll < 0.42) {
      ai.action = 'dash_bwd';
      ai.actionTimer = 0;
      ai.actionDuration = 0.35;
    } else if (closeRoll < 0.75) {
      ai.action = 'attack_down';
      ai.actionTimer = 0;
      ai.actionDuration = 0.48;
    } else {
      ai.action = 'attack_neutral_1';
      ai.actionTimer = 0;
      ai.actionDuration = 0.5;
    }
  } else {
    // In Prime Strike Range (40px - 130px)
    // Select strike based on archetype and situation
    const roll = Math.random();

    if (ai.aiPersonality === 'aggressive' || ai.faction === 'legion') {
      // Legion & Aggressive style: heavy strikes and lunging cleaves
      if (roll < 0.35) {
        ai.action = 'attack_forward';
        ai.actionTimer = 0;
        ai.actionDuration = 0.6;
      } else if (roll < 0.70) {
        ai.action = 'attack_heavy';
        ai.actionTimer = 0;
        ai.actionDuration = 0.8;
      } else {
        ai.action = 'attack_neutral_1';
        ai.actionTimer = 0;
        ai.actionDuration = 0.5;
      }
    } else if (ai.aiPersonality === 'counter_master' || ai.faction === 'dynasty') {
      // Dynasty style: low sweeps, rapid multi-hits and feints
      if (roll < 0.45) {
        ai.action = 'attack_neutral_1';
        ai.actionTimer = 0;
        ai.actionDuration = 0.5;
      } else if (roll < 0.75) {
        ai.action = 'attack_down';
        ai.actionTimer = 0;
        ai.actionDuration = 0.5;
      } else {
        ai.action = 'attack_up';
        ai.actionTimer = 0;
        ai.actionDuration = 0.55;
      }
    } else {
      // Tactical / Boss Titans: balanced deadly mix
      if (roll < 0.38) {
        ai.action = 'attack_neutral_1';
        ai.actionTimer = 0;
        ai.actionDuration = 0.5;
      } else if (roll < 0.62) {
        ai.action = 'attack_forward';
        ai.actionTimer = 0;
        ai.actionDuration = 0.6;
      } else if (roll < 0.84) {
        ai.action = 'attack_heavy';
        ai.actionTimer = 0;
        ai.actionDuration = 0.8;
      } else {
        ai.action = 'attack_down';
        ai.actionTimer = 0;
        ai.actionDuration = 0.5;
      }
    }
  }
}
