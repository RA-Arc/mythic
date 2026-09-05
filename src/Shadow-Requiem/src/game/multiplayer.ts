import { RankedOpponent, Faction } from './types';
import { WEAPON_CATALOG } from './weapons';
import { HELMET_CATALOG, ARMOR_CATALOG, RANGED_CATALOG } from './armor';

export const LEADERBOARD_PRESETS: RankedOpponent[] = [
  {
    id: 'rank_1',
    name: 'Kenshiro The Void Blade',
    rankTitle: 'Void Legend (Rank 1)',
    rating: 3450,
    avatarIcon: 'Crown',
    faction: 'heralds',
    level: 12,
    weaponName: 'Void Piercer Katana',
    equipment: {
      weapon: WEAPON_CATALOG[0],
      armor: ARMOR_CATALOG[0],
      helm: HELMET_CATALOG[0],
      ranged: RANGED_CATALOG[0],
    },
    stats: {
      health: 14500,
      maxHealth: 14500,
      shadowEnergy: 30,
      maxShadowEnergy: 100,
      attackPower: 155,
      defense: 165,
      shadowPower: 180,
      critChance: 0.32,
      critMultiplier: 2.2,
      poise: 130,
    },
    winRatio: '94.2%',
  },
  {
    id: 'rank_2',
    name: 'Warlord Reinhardt',
    rankTitle: 'Grandmaster (Rank 2)',
    rating: 3210,
    avatarIcon: 'ShieldAlert',
    faction: 'legion',
    level: 11,
    weaponName: 'Bastion Colossus Claymore',
    equipment: {
      weapon: WEAPON_CATALOG[1],
      armor: ARMOR_CATALOG[1],
      helm: HELMET_CATALOG[1],
      ranged: RANGED_CATALOG[1],
    },
    stats: {
      health: 16800,
      maxHealth: 16800,
      shadowEnergy: 20,
      maxShadowEnergy: 100,
      attackPower: 145,
      defense: 185,
      shadowPower: 90,
      critChance: 0.18,
      critMultiplier: 1.7,
      poise: 160,
    },
    winRatio: '89.6%',
  },
  {
    id: 'rank_3',
    name: 'Jade Serpent Mei',
    rankTitle: 'Grandmaster (Rank 3)',
    rating: 3080,
    avatarIcon: 'Flame',
    faction: 'dynasty',
    level: 10,
    weaponName: 'Dragon Wind Nunchaku',
    equipment: {
      weapon: WEAPON_CATALOG[2],
      armor: ARMOR_CATALOG[2],
      helm: HELMET_CATALOG[2],
      ranged: RANGED_CATALOG[0],
    },
    stats: {
      health: 13800,
      maxHealth: 13800,
      shadowEnergy: 25,
      maxShadowEnergy: 100,
      attackPower: 140,
      defense: 150,
      shadowPower: 140,
      critChance: 0.28,
      critMultiplier: 1.95,
      poise: 115,
    },
    winRatio: '86.1%',
  },
  {
    id: 'rank_4',
    name: 'Blood Reaper Valen',
    rankTitle: 'Shadow Master (Rank 4)',
    rating: 2840,
    avatarIcon: 'Zap',
    faction: 'heralds',
    level: 9,
    weaponName: 'Bloodweaver Kusarigama',
    equipment: {
      weapon: WEAPON_CATALOG[3],
      armor: ARMOR_CATALOG[0],
      helm: HELMET_CATALOG[0],
      ranged: RANGED_CATALOG[0],
    },
    stats: {
      health: 12800,
      maxHealth: 12800,
      shadowEnergy: 20,
      maxShadowEnergy: 100,
      attackPower: 130,
      defense: 145,
      shadowPower: 150,
      critChance: 0.29,
      critMultiplier: 2.0,
      poise: 110,
    },
    winRatio: '81.4%',
  },
  {
    id: 'rank_5',
    name: 'Ironclad Aegis',
    rankTitle: 'Shadow Master (Rank 5)',
    rating: 2690,
    avatarIcon: 'Hammer',
    faction: 'legion',
    level: 8,
    weaponName: 'Titanbreaker War Hammer',
    equipment: {
      weapon: WEAPON_CATALOG[4],
      armor: ARMOR_CATALOG[1],
      helm: HELMET_CATALOG[1],
      ranged: RANGED_CATALOG[1],
    },
    stats: {
      health: 14200,
      maxHealth: 14200,
      shadowEnergy: 10,
      maxShadowEnergy: 100,
      attackPower: 125,
      defense: 175,
      shadowPower: 80,
      critChance: 0.14,
      critMultiplier: 1.6,
      poise: 140,
    },
    winRatio: '78.2%',
  },
];

// Generate dynamic ranked match opponent matching player's current rating
export function generateRankedOpponent(playerRating: number): RankedOpponent {
  const factions: Faction[] = ['heralds', 'legion', 'dynasty'];
  const chosenFaction = factions[Math.floor(Math.random() * factions.length)];

  const firstNames = ['Shadow', 'Kael', 'Ronin', 'Gideon', 'Anya', 'Vex', 'Kenshi', 'Tatsu', 'Soren', 'Raven'];
  const titles = ['the Merciless', 'the Ironbound', 'the Silent Blade', 'the Windchaser', 'the Voidborne', 'the Eclipse'];
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${titles[Math.floor(Math.random() * titles.length)]}`;

  const ratingDelta = Math.floor((Math.random() - 0.45) * 120);
  const targetRating = Math.max(1000, playerRating + ratingDelta);

  const matchedWeapon = WEAPON_CATALOG.find((w) => w.faction === chosenFaction) || WEAPON_CATALOG[0];
  const matchedArmor = ARMOR_CATALOG.find((a) => a.faction === chosenFaction) || ARMOR_CATALOG[0];
  const matchedHelm = HELMET_CATALOG.find((h) => h.faction === chosenFaction) || HELMET_CATALOG[0];
  const matchedRanged = RANGED_CATALOG[0];

  // Scale stats proportionally for challenging ranked combat (prevents two-tapping)
  const powerScale = Math.max(0.9, targetRating / 1400);
  const hp = Math.max(9500, Math.round(9500 * powerScale));
  const atk = Math.round(110 * powerScale);
  const def = Math.round(145 * powerScale);

  let rankTitle = 'Shadow Initiate';
  if (targetRating >= 3000) rankTitle = 'Void Legend';
  else if (targetRating >= 2500) rankTitle = 'Grandmaster';
  else if (targetRating >= 2000) rankTitle = 'Shadow Master';
  else if (targetRating >= 1500) rankTitle = 'Veteran Duelist';

  return {
    id: `opp_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    name,
    rankTitle,
    rating: targetRating,
    avatarIcon: chosenFaction === 'legion' ? 'Shield' : chosenFaction === 'dynasty' ? 'Flame' : 'Sword',
    faction: chosenFaction,
    level: Math.max(1, Math.floor(targetRating / 280)),
    weaponName: matchedWeapon.name,
    equipment: {
      weapon: matchedWeapon,
      armor: matchedArmor,
      helm: matchedHelm,
      ranged: matchedRanged,
    },
    stats: {
      health: hp,
      maxHealth: hp,
      shadowEnergy: 15,
      maxShadowEnergy: 100,
      attackPower: atk,
      defense: def,
      shadowPower: Math.round(85 * powerScale),
      critChance: 0.22,
      critMultiplier: 1.8,
      poise: Math.round(85 * powerScale),
    },
    winRatio: `${(65 + Math.random() * 25).toFixed(1)}%`,
  };
}
