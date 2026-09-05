import { PlayerProfile, GearItem } from './types';
import { WEAPON_CATALOG } from './weapons';
import { HELMET_CATALOG, ARMOR_CATALOG, RANGED_CATALOG } from './armor';

const STORAGE_KEY = 'shadow_requiem_rpg_save_v1';

export const INITIAL_PLAYER_PROFILE: PlayerProfile = {
  name: 'Shadow Raven',
  title: 'Rift Walker',
  level: 1,
  xp: 0,
  xpToNextLevel: 300,
  gold: 850,
  shadowCores: 80,
  gems: 50,
  rating: 1200,
  rankTier: 'Shadow Initiate',
  storyProgress: 0, // stage index completed
  factionAffinity: 'heralds',
  equipped: {
    weapon: WEAPON_CATALOG[0], // Void Katana
    helm: HELMET_CATALOG[2], // Dragon Spirit Mask
    armor: ARMOR_CATALOG[2], // Windwalker Gi
    ranged: RANGED_CATALOG[0], // Kunai
  },
  inventory: [
    ...WEAPON_CATALOG,
    ...HELMET_CATALOG,
    ...ARMOR_CATALOG,
    ...RANGED_CATALOG,
  ],
  unlockedPerks: ['perk_crit_damage', 'perk_shadow_generation'],
  activeCharacterId: 'char_raven',
  unlockedCharacterIds: ['char_raven'],
  battleStats: {
    fightsWon: 0,
    fightsLost: 0,
    perfectVictories: 0,
    shadowKills: 0,
    highestCombo: 0,
  },
};

export function loadPlayerProfile(): PlayerProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_PLAYER_PROFILE,
        ...parsed,
        activeCharacterId: parsed.activeCharacterId || 'char_raven',
        unlockedCharacterIds: Array.isArray(parsed.unlockedCharacterIds) && parsed.unlockedCharacterIds.length > 0
          ? parsed.unlockedCharacterIds
          : ['char_raven'],
        equipped: {
          ...INITIAL_PLAYER_PROFILE.equipped,
          ...parsed.equipped,
        },
      };
    }
  } catch (e) {
    console.error('Failed to load profile from storage:', e);
  }
  return INITIAL_PLAYER_PROFILE;
}

export function savePlayerProfile(profile: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to storage:', e);
  }
}

export function calculateFighterStats(profile: PlayerProfile) {
  const { weapon, helm, armor, ranged } = profile.equipped;
  const baseHp = 500 + profile.level * 40;
  const baseAtk = 40 + profile.level * 8;
  const baseDef = 30 + profile.level * 6;

  const totalAtk = baseAtk + (weapon.attackBonus || 0) + (ranged.attackBonus || 0);
  const totalDef = baseDef + (helm.defenseBonus || 0) + (armor.defenseBonus || 0) + (weapon.defenseBonus || 0);
  const totalShadow = (weapon.shadowBonus || 0) + (helm.shadowBonus || 0) + (armor.shadowBonus || 0);
  const totalCrit = Math.min(0.65, (weapon.critChance || 0.1) + (helm.critChance || 0) + (ranged.critChance || 0));

  return {
    health: baseHp + (armor.basePower || 0) * 0.4,
    maxHealth: baseHp + (armor.basePower || 0) * 0.4,
    shadowEnergy: 0,
    maxShadowEnergy: 100,
    attackPower: totalAtk,
    defense: totalDef,
    shadowPower: totalShadow,
    critChance: totalCrit,
    critMultiplier: 1.85,
    poise: 50 + (armor.faction === 'legion' ? 35 : 0),
  };
}

export function upgradeGearItem(item: GearItem): GearItem {
  return {
    ...item,
    level: item.level + 1,
    basePower: Math.round(item.basePower * 1.15),
    attackBonus: item.attackBonus ? Math.round(item.attackBonus * 1.15) : undefined,
    defenseBonus: item.defenseBonus ? Math.round(item.defenseBonus * 1.15) : undefined,
    shadowBonus: item.shadowBonus ? Math.round(item.shadowBonus * 1.15) : undefined,
  };
}
