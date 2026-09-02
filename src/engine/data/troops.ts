import { CompanionTroop } from "../types";

export const INITIAL_COMPANION_TROOPS: CompanionTroop[] = [
  {
    id: "troop_spectral_samurai",
    name: "Spectral Bushido Shinobi",
    role: "melee",
    count: 2,
    level: 1,
    hireCostEnergy: 60,
    upgradeCostSoulGems: 2,
    baseDmg: 12,
    attackInterval: 48,
    attackCooldown: 0,
    xOffset: -50,
    yOffset: -25,
    icon: "🥷",
    color: 0x58a6ff
  },
  {
    id: "troop_moonshadow_archer",
    name: "Moonshadow Ranger",
    role: "ranged",
    count: 1,
    level: 1,
    hireCostEnergy: 100,
    upgradeCostSoulGems: 3,
    baseDmg: 18,
    attackInterval: 55,
    attackCooldown: 0,
    xOffset: -85,
    yOffset: 30,
    icon: "🏹",
    color: 0x7ee787
  },
  {
    id: "troop_arcane_sorceress",
    name: "Past-Life Astromancer",
    role: "caster",
    count: 0,
    level: 0,
    hireCostEnergy: 250,
    upgradeCostSoulGems: 5,
    baseDmg: 35,
    attackInterval: 70,
    attackCooldown: 0,
    xOffset: -110,
    yOffset: -15,
    icon: "🔮",
    color: 0xd2a8ff
  },
  {
    id: "troop_valkyrie_seraph",
    name: "Valkyrie Crusader",
    role: "support",
    count: 0,
    level: 0,
    hireCostEnergy: 500,
    upgradeCostSoulGems: 8,
    baseDmg: 60,
    attackInterval: 45,
    attackCooldown: 0,
    xOffset: -70,
    yOffset: -45,
    icon: "🛡️",
    color: 0xffd700
  }
];
