import { PlayableCharacter, PlayerProfile } from './types';
import { WEAPON_CATALOG } from './weapons';
import { HELMET_CATALOG, ARMOR_CATALOG, RANGED_CATALOG } from './armor';

export const PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  {
    id: 'char_raven',
    name: 'Shadow Raven',
    title: 'Rift Walker',
    faction: 'heralds',
    avatarIcon: 'Zap',
    rarity: 'epic',
    level: 1,
    quote: 'The rift bends not to brute force, but to silence and lethal precision.',
    lore: 'An enigmatic herald trained in the temporal vortex. Armed with the Void Katana, Raven strikes across dimensional seams before an enemy blade can even be drawn.',
    signatureWeapon: WEAPON_CATALOG[0], // Void Katana
    defaultArmor: ARMOR_CATALOG[0],
    defaultHelm: HELMET_CATALOG[2],
    defaultRanged: RANGED_CATALOG[0],
    baseStats: {
      health: 560,
      maxHealth: 560,
      shadowEnergy: 0,
      maxShadowEnergy: 100,
      attackPower: 82,
      defense: 60,
      shadowPower: 110,
      critChance: 0.30,
      critMultiplier: 1.9,
      poise: 50,
    },
    signatureAbility: {
      name: 'Abyssal Blink Strike',
      description: 'Warps through spacetime directly into the enemy spine, executing a critical cross-slash that leaves a lingering shadow vacuum.',
      tag: 'Herald Void Execution',
    },
    unlockCondition: 'Unlocked by default as starter shadow duelist.',
    isUnlockedDefault: true,
  },
  {
    id: 'char_marcus',
    name: 'Vanguard Marcus',
    title: 'The Iron Sentinel',
    faction: 'legion',
    avatarIcon: 'Shield',
    rarity: 'rare',
    level: 2,
    quote: 'Steel knows no fear. Neither do the shock sentinels of the Iron Bastion.',
    lore: 'Frontline vanguard commander of the Iron Legion. Though scarred by the opening of the shadow rifts, his resolve and crushing war hammer technique remain impervious to doubt.',
    signatureWeapon: WEAPON_CATALOG[4], // War hammer
    defaultArmor: ARMOR_CATALOG[1],
    defaultHelm: HELMET_CATALOG[1],
    defaultRanged: RANGED_CATALOG[1],
    baseStats: {
      health: 640,
      maxHealth: 640,
      shadowEnergy: 0,
      maxShadowEnergy: 100,
      attackPower: 88,
      defense: 80,
      shadowPower: 45,
      critChance: 0.15,
      critMultiplier: 1.6,
      poise: 85,
    },
    signatureAbility: {
      name: 'Tectonic Quake Sunder',
      description: 'Slams the warhammer into the bedrock, sending shockwaves that blast through blocks and launch opponents into the air.',
      tag: 'Legion Hyper-Armor',
    },
    unlockCondition: 'Conquer Act I: Trial of the Heavy Gate, or achieve 12 Battle Victories (Level 3+, 1250 Rating).',
    isUnlockedDefault: false,
  },
  {
    id: 'char_ironclad',
    name: 'General Ironclad',
    title: 'The Unbreakable Champion',
    faction: 'legion',
    avatarIcon: 'ShieldAlert',
    rarity: 'legendary',
    level: 4,
    quote: 'Break upon my shield like frail waves upon adamantine granite!',
    lore: 'Supreme commander of the Legion armored vanguard. Clad in meteorite armor, Ironclad embodies relentless physical poise and unmatched two-handed claymore supremacy.',
    signatureWeapon: WEAPON_CATALOG[1], // Bastion Claymore
    defaultArmor: ARMOR_CATALOG[1],
    defaultHelm: HELMET_CATALOG[1],
    defaultRanged: RANGED_CATALOG[1],
    baseStats: {
      health: 780,
      maxHealth: 780,
      shadowEnergy: 20,
      maxShadowEnergy: 100,
      attackPower: 105,
      defense: 110,
      shadowPower: 60,
      critChance: 0.18,
      critMultiplier: 1.7,
      poise: 105,
    },
    signatureAbility: {
      name: 'Meteor Bastion Annihilation',
      description: 'Gains total invulnerability for 3 seconds while unleashing an unstoppable sweeping claymore arc that shatters enemy poise.',
      tag: 'Legion Unstoppable Force',
    },
    unlockCondition: 'Achieve a Flawless/Perfect Victory over General Ironclad in Act I (or 1400+ Rating), or win 25 Battles (Level 5+, 3 Perfects).',
    isUnlockedDefault: false,
  },
  {
    id: 'char_ling',
    name: 'Monk Ling',
    title: 'Grandmaster of the Gale',
    faction: 'dynasty',
    avatarIcon: 'Flame',
    rarity: 'epic',
    level: 3,
    quote: 'Let the wind guide your fist, and let the storm finish your prayer.',
    lore: 'The revered elder of the Jade Mountain monastery. His mastery of nunchaku flurries and dynamic aerial kicks allows him to flow through attacks without suffering a scratch.',
    signatureWeapon: WEAPON_CATALOG[2], // Nunchaku
    defaultArmor: ARMOR_CATALOG[2],
    defaultHelm: HELMET_CATALOG[2],
    defaultRanged: RANGED_CATALOG[0],
    baseStats: {
      health: 660,
      maxHealth: 660,
      shadowEnergy: 10,
      maxShadowEnergy: 100,
      attackPower: 98,
      defense: 65,
      shadowPower: 95,
      critChance: 0.28,
      critMultiplier: 1.85,
      poise: 55,
    },
    signatureAbility: {
      name: 'Dragon Gale Tempest',
      description: 'Leaps into a whirlwind nunchaku frenzy that pulls the enemy into an inescapable 12-hit aerial combo.',
      tag: 'Dynasty Aerial Surge',
    },
    unlockCondition: 'Defeat Grandmaster Monk Ling in Act II (The Bamboo Mist) at Level 4+, or win 45 Battles (Level 7+, 1950 Rating).',
    isUnlockedDefault: false,
  },
  {
    id: 'char_kibo',
    name: 'High Arbiter Kibo',
    title: 'Shadow Weaver Prime',
    faction: 'heralds',
    avatarIcon: 'Zap',
    rarity: 'legendary',
    level: 5,
    quote: 'Reality is an equation. Your defeat is the only logical solution.',
    lore: 'Chief architect of the Herald Cyber-Core. Kibo calculates combat trajectories in fractions of a nanosecond, weaponizing dimensional void strings that sever matter.',
    signatureWeapon: WEAPON_CATALOG[0], // Void Katana
    defaultArmor: ARMOR_CATALOG[0],
    defaultHelm: HELMET_CATALOG[0],
    defaultRanged: RANGED_CATALOG[0],
    baseStats: {
      health: 750,
      maxHealth: 750,
      shadowEnergy: 30,
      maxShadowEnergy: 100,
      attackPower: 122,
      defense: 80,
      shadowPower: 145,
      critChance: 0.38,
      critMultiplier: 2.1,
      poise: 65,
    },
    signatureAbility: {
      name: 'Singularity Spatial Rift',
      description: 'Creates a singularity rift on screen that gravitationally traps the foe before collapsing with catastrophic sonic void damage.',
      tag: 'Herald Dimensional Tear',
    },
    unlockCondition: 'Defeat High Arbiter Kibo in Act III (The Herald Singularity) at Level 6+, or win 70 Battles (Level 9+, 2400 Rating).',
    isUnlockedDefault: false,
  },
  {
    id: 'char_chronos',
    name: 'Void Titan Chronos',
    title: 'Harbinger of the Endless Night',
    faction: 'heralds',
    avatarIcon: 'Crown',
    rarity: 'mythic',
    level: 7,
    quote: 'MORTAL DREAMS FADE INTO THE ABYSS. I AM THE VOID THAT CONSUMES THE STARS.',
    lore: 'The primordial avatar born at the epicenter of the first cosmic rift. Wielding dark matter chains and catastrophic abyssal magic, Chronos is the ultimate terror of the Dark Realm.',
    signatureWeapon: WEAPON_CATALOG[3], // Bloodweaver Kusarigama
    defaultArmor: ARMOR_CATALOG[0],
    defaultHelm: HELMET_CATALOG[0],
    defaultRanged: RANGED_CATALOG[0],
    baseStats: {
      health: 980,
      maxHealth: 980,
      shadowEnergy: 50,
      maxShadowEnergy: 100,
      attackPower: 145,
      defense: 105,
      shadowPower: 185,
      critChance: 0.35,
      critMultiplier: 2.3,
      poise: 110,
    },
    signatureAbility: {
      name: 'Cosmic Eclipse Cataclysm',
      description: 'Blots out the sun and summons abyssal meteorites, turning the entire stage into a shadow storm that drains life continuously.',
      tag: 'Primordial God Form',
    },
    unlockCondition: 'Defeat the Primordial Final Boss Void Titan Chronos in Act IV at Level 8+, or achieve Void Legend (100 Wins, 3000 Rating).',
    isUnlockedDefault: false,
  },
];

export function getCharacterById(id: string): PlayableCharacter {
  const found = PLAYABLE_CHARACTERS.find((c) => c.id === id);
  return found || PLAYABLE_CHARACTERS[0];
}

export function checkDefeatedBossUnlock(
  bossName: string,
  profile: PlayerProfile,
  isPerfect: boolean = false
): PlayableCharacter | null {
  const lower = bossName.toLowerCase();
  let candidateId: string | null = null;

  // Marcus: Unlocked by conquering Act I (Trial of the Heavy Gate) or defeating Ironclad
  if (lower.includes('ironclad')) {
    if (!profile.unlockedCharacterIds.includes('char_marcus')) {
      return getCharacterById('char_marcus');
    }
    // Ironclad recruitment requires flawless combat, or Level 4+ with 1400+ rating
    if (isPerfect || (profile.level >= 4 && profile.rating >= 1400)) {
      candidateId = 'char_ironclad';
    }
  } else if (lower.includes('ling')) {
    // Monk Ling requires defeating Ling and Level 4+
    if (profile.level >= 4 || profile.rating >= 1600) {
      candidateId = 'char_ling';
    }
  } else if (lower.includes('kibo')) {
    // High Arbiter Kibo requires defeating Kibo and Level 6+
    if (profile.level >= 6 || profile.rating >= 2100) {
      candidateId = 'char_kibo';
    }
  } else if (lower.includes('chronos') || lower.includes('titan')) {
    // Void Titan Chronos requires defeating Chronos and Level 8+
    if (profile.level >= 8 || profile.rating >= 2600) {
      candidateId = 'char_chronos';
    }
  }

  if (candidateId && !profile.unlockedCharacterIds.includes(candidateId)) {
    return getCharacterById(candidateId);
  }

  return null;
}

export interface CharacterMilestoneRequirement {
  charId: string;
  requiredWins: number;
  requiredLevel: number;
  requiredRating: number;
  requiredPerfects: number;
}

export const CHARACTER_UNLOCK_MILESTONES: CharacterMilestoneRequirement[] = [
  { charId: 'char_marcus', requiredWins: 12, requiredLevel: 3, requiredRating: 1250, requiredPerfects: 1 },
  { charId: 'char_ironclad', requiredWins: 25, requiredLevel: 5, requiredRating: 1550, requiredPerfects: 3 },
  { charId: 'char_ling', requiredWins: 45, requiredLevel: 7, requiredRating: 1950, requiredPerfects: 5 },
  { charId: 'char_kibo', requiredWins: 70, requiredLevel: 9, requiredRating: 2400, requiredPerfects: 8 },
  { charId: 'char_chronos', requiredWins: 100, requiredLevel: 12, requiredRating: 3000, requiredPerfects: 12 },
];

export function checkBattleMilestoneUnlock(
  totalWins: number,
  profile: PlayerProfile
): PlayableCharacter | null {
  for (const m of CHARACTER_UNLOCK_MILESTONES) {
    if (
      totalWins >= m.requiredWins &&
      profile.level >= m.requiredLevel &&
      profile.rating >= m.requiredRating &&
      profile.battleStats.perfectVictories >= m.requiredPerfects &&
      !profile.unlockedCharacterIds.includes(m.charId)
    ) {
      return getCharacterById(m.charId);
    }
  }

  return null;
}
