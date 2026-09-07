import { ChiSkillNode } from "../types";

export const CHI_SKILL_TREE: ChiSkillNode[] = [
  {
    id: "chi_flow_mastery",
    name: "Chi Energy Circulation",
    tier: 1,
    description: "Accelerates spiritual Chi accumulation by +25% per rank on every strike and monster kill.",
    maxRank: 5,
    currentRank: 1,
    costChiPoints: 1,
    icon: "🌀",
    bonus: { chiGainBonus: 0.25 }
  },
  {
    id: "seraph_duration_extension",
    name: "Archangel Chrono-Stasis",
    tier: 1,
    description: "Extends Arc Angel transformation duration by +4 seconds per rank.",
    maxRank: 5,
    currentRank: 0,
    costChiPoints: 2,
    icon: "⏳",
    bonus: { durationBonusSeconds: 4 }
  },
  {
    id: "holy_cleave_judgement",
    name: "Divine Judgement Cleave",
    tier: 2,
    description: "Empowers the Arc Angel's AOE attack, dealing +40% bonus holy damage across all nearby foes.",
    maxRank: 5,
    currentRank: 0,
    costChiPoints: 3,
    icon: "⚔️",
    bonus: { damageMultiplier: 0.4, aoeCleaveRadius: 50 }
  },
  {
    id: "divine_sanctuary_ward",
    name: "Sanctuary Aegis Ward",
    tier: 2,
    description: "Upon transforming, grants a radiant holy barrier absorbing damage equal to 40% of Max HP.",
    maxRank: 3,
    currentRank: 0,
    costChiPoints: 4,
    icon: "🛡️",
    bonus: { shieldMaxHpPercent: 0.4 }
  },
  {
    id: "lunar_bloodlust_leech",
    name: "Feral Moon Siphon",
    tier: 3,
    description: "Enhances Lunar Werewolf form with +15% Life Steal on every claw strike and +20% Critical Chance.",
    maxRank: 3,
    currentRank: 0,
    costChiPoints: 5,
    icon: "🐺",
    bonus: { leechPercent: 0.15 }
  },
  {
    id: "ascended_eternal_seraph",
    name: "Ascended Eternal Seraph",
    tier: 4,
    description: "The ultimate Chi Mastery. Grants the power to permanently sustain the Arc Angel form as an alter-state!",
    maxRank: 1,
    currentRank: 0,
    costChiPoints: 10,
    icon: "👑",
    bonus: { permanentSeraphUnlocked: true, damageMultiplier: 0.5 }
  }
];
