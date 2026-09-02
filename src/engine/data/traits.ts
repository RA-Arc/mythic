import { CosmicForce, TraitNode } from "../types";

export const COSMIC_TRAIT_TREE: Record<CosmicForce, TraitNode[]> = {
  Architects: [
    {
      id: "arch_1",
      name: "Geometric Fortification",
      force: "Architects",
      tier: 1,
      description: "+8% Max Health and +5 Flat Armor per rank.",
      maxRank: 10,
      currentRank: 0,
      costPerRank: 100,
      bonusPerRank: { hpBonus: 40, defenseBonus: 5 },
      icon: "🏛️"
    },
    {
      id: "arch_2",
      name: "Tectonic Anchor",
      force: "Architects",
      tier: 2,
      description: "+12% Damage Reduction and +10% Era-Energy Generation per rank.",
      maxRank: 8,
      currentRank: 0,
      costPerRank: 400,
      bonusPerRank: { defenseBonus: 15, eraEnergyBonus: 0.1 },
      icon: "🛡️"
    },
    {
      id: "arch_3",
      name: "Monolithic Sovereignty",
      force: "Architects",
      tier: 3,
      description: "+25% Max Health and +20% Bonus Damage against Chaos/Wraithborn foes per rank.",
      maxRank: 5,
      currentRank: 0,
      costPerRank: 1500,
      bonusPerRank: { hpBonus: 200, damageBonus: 25 },
      icon: "🏰"
    },
    {
      id: "arch_4",
      name: "Architect's Keystone Mandate",
      force: "Architects",
      tier: 4,
      description: "Ultimate Order Mastery: +50% All Defensive Stats and passive shield equal to 20% Max HP.",
      maxRank: 3,
      currentRank: 0,
      costPerRank: 5000,
      bonusPerRank: { hpBonus: 800, defenseBonus: 80 },
      icon: "👑"
    }
  ],
  Wraithborn: [
    {
      id: "wraith_1",
      name: "Primal Predation",
      force: "Wraithborn",
      tier: 1,
      description: "+6 Flat Base Damage and +2% Critical Strike Chance per rank.",
      maxRank: 10,
      currentRank: 0,
      costPerRank: 100,
      bonusPerRank: { damageBonus: 6, critRateBonus: 2 },
      icon: "🩸"
    },
    {
      id: "wraith_2",
      name: "Entropic Ferocity",
      force: "Wraithborn",
      tier: 2,
      description: "+15% Critical Damage and +10 Base Damage per rank.",
      maxRank: 8,
      currentRank: 0,
      costPerRank: 400,
      bonusPerRank: { critDmgBonus: 15, damageBonus: 10 },
      icon: "💀"
    },
    {
      id: "wraith_3",
      name: "Chaos Mutation",
      force: "Wraithborn",
      tier: 3,
      description: "+25% Total Damage and strikes apply bleed/burn per rank.",
      maxRank: 5,
      currentRank: 0,
      costPerRank: 1500,
      bonusPerRank: { damageBonus: 35, critRateBonus: 3 },
      icon: "🔥"
    },
    {
      id: "wraith_4",
      name: "Wraithborn Singularity",
      force: "Wraithborn",
      tier: 4,
      description: "Ultimate Chaos Mastery: +100% Critical Damage and +50% Execution Damage to low HP targets.",
      maxRank: 3,
      currentRank: 0,
      costPerRank: 5000,
      bonusPerRank: { damageBonus: 150, critDmgBonus: 50 },
      icon: "👁️"
    }
  ],
  Echoes: [
    {
      id: "echo_1",
      name: "Temporal Recursion",
      force: "Echoes",
      tier: 1,
      description: "+5% Attack Speed Haste and +15% Era-Energy Generation per rank.",
      maxRank: 10,
      currentRank: 0,
      costPerRank: 100,
      bonusPerRank: { hasteBonus: 2, eraEnergyBonus: 0.15 },
      icon: "⏳"
    },
    {
      id: "echo_2",
      name: "Ancestral Synchrony",
      force: "Echoes",
      tier: 2,
      description: "+20% Memory Passive Effectiveness and +10% Material drops per rank.",
      maxRank: 8,
      currentRank: 0,
      costPerRank: 400,
      bonusPerRank: { cosmicPowerBonus: 10, eraEnergyBonus: 0.2 },
      icon: "🌀"
    },
    {
      id: "echo_3",
      name: "Timeline Weaver",
      force: "Echoes",
      tier: 3,
      description: "Reduces all Ability Cooldowns by 10% and adds +20 Base Damage per rank.",
      maxRank: 5,
      currentRank: 0,
      costPerRank: 1500,
      bonusPerRank: { hasteBonus: 5, damageBonus: 20 },
      icon: "🌌"
    },
    {
      id: "echo_4",
      name: "Echoes of Eternity",
      force: "Echoes",
      tier: 4,
      description: "Ultimate Time Mastery: +100% Era-Energy generation from all sources and double loot rolls.",
      maxRank: 3,
      currentRank: 0,
      costPerRank: 5000,
      bonusPerRank: { eraEnergyBonus: 1.0, damageBonus: 100 },
      icon: "🪐"
    }
  ]
};
