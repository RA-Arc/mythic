import { RogueRelic } from "../types";

export const INITIAL_ROGUE_RELICS: RogueRelic[] = [
  {
    id: "relic_chalice_life",
    name: "Chalice of Perpetual Life",
    icon: "🏆",
    rarity: "Legendary",
    description: "Increases Max HP for the Hero and all summoned troops by +15% per level.",
    level: 1,
    maxLevel: 25,
    upgradeCostSoulGems: 4,
    bonus: { hpPercent: 15 }
  },
  {
    id: "relic_war_horn",
    name: "War Horn of the Valkyrie",
    icon: "📯",
    rarity: "Epic",
    description: "Boosts Hero and Companion Troop attack damage by +18% per level.",
    level: 1,
    maxLevel: 25,
    upgradeCostSoulGems: 4,
    bonus: { damagePercent: 18, troopDamagePercent: 20 }
  },
  {
    id: "relic_golden_urn",
    name: "Golden Urn of Midas",
    icon: "🏺",
    rarity: "Rare",
    description: "Increases Era-Energy and Material yields from defeated enemies by +25% per level.",
    level: 1,
    maxLevel: 20,
    upgradeCostSoulGems: 3,
    bonus: { goldDropPercent: 25 }
  },
  {
    id: "relic_celestial_compass",
    name: "Celestial Soul Compass",
    icon: "🧭",
    rarity: "Mythic",
    description: "Accelerates Marching distance pushing speed and grants +20% Chi Force generation.",
    level: 1,
    maxLevel: 20,
    upgradeCostSoulGems: 5,
    bonus: { marchSpeedPercent: 20, chiGainPercent: 20 }
  },
  {
    id: "relic_aegis_rebirth",
    name: "Aegis of Immortal Rebirth",
    icon: "🛡️",
    rarity: "Epic",
    description: "Increases Total Armor by +12% and speeds up Hero reconstitution time by 25%.",
    level: 0,
    maxLevel: 15,
    upgradeCostSoulGems: 5,
    bonus: { defensePercent: 12, respawnSpeedPercent: 25 }
  },
  {
    id: "relic_bloodfang_talisman",
    name: "Bloodfang Wolf Talisman",
    icon: "🐺",
    rarity: "Legendary",
    description: "Empowers Lunar Werewolf form and increases Critical Strike Damage by +30% per level.",
    level: 0,
    maxLevel: 15,
    upgradeCostSoulGems: 6,
    bonus: { damagePercent: 15 }
  },
  {
    id: "relic_seraph_feather",
    name: "Seraphic Arc Angel Plume",
    icon: "🪶",
    rarity: "Cosmic",
    description: "Infuses the Arc Angel form with radiant light, extending transformation duration by +4s.",
    level: 0,
    maxLevel: 10,
    upgradeCostSoulGems: 8,
    bonus: { damagePercent: 25, chiGainPercent: 30 }
  },
  {
    id: "relic_dragon_heart",
    name: "Heart of the Mythic Drake",
    icon: "🐉",
    rarity: "Cosmic",
    description: "Ignites all Hero attacks with primordial fire, burning targets for 20% extra damage.",
    level: 0,
    maxLevel: 10,
    upgradeCostSoulGems: 10,
    bonus: { damagePercent: 35, hpPercent: 25 }
  }
];
