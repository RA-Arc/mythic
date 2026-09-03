export type CosmicForce = "Architects" | "Wraithborn" | "Echoes";
export type MythicAffinity = "Architect" | "Wraithborn" | "Echo" | "Elemental" | "Neutral";

export type EraId =
  | "dawn"
  | "fire"
  | "stone"
  | "bronze"
  | "iron"
  | "faith"
  | "discovery"
  | "steam"
  | "atom"
  | "stars";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Cosmic";

export type EquipSlot =
  | "head"
  | "face"
  | "neck"
  | "shoulder"
  | "chest"
  | "back"
  | "wrist"
  | "hands"
  | "waist"
  | "legs"
  | "finger1"
  | "finger2"
  | "ear1"
  | "ear2"
  | "primaryWpn"
  | "offHandWpn";

export interface ItemStats {
  hpBonus?: number;
  damageBonus?: number;
  defenseBonus?: number;
  critRateBonus?: number;
  critDmgBonus?: number;
  hasteBonus?: number;
  eraEnergyBonus?: number;
  cosmicPowerBonus?: number;
}

export interface RPGItem extends ItemStats {
  id: string;
  name: string;
  slot: EquipSlot;
  era: EraId;
  rarity: Rarity;
  wpnType?: "sword" | "hammer" | "axe" | "bow" | "staff" | "relic" | "armor" | "gun" | "energy";
  flavor: string;
  infusionLevel?: number;
  cost?: {
    eraEnergy: number;
    materials: Record<string, number>;
    mythicShards?: number;
    echoFragments?: number;
    titanCores?: number;
  };
}

export interface AbilityDefinition {
  id: string;
  name: string;
  era: EraId;
  description: string;
  cooldownFrames: number;
  damageMultiplier: number;
  costEnergy: number;
  affinity: MythicAffinity;
  effectType: "strike" | "aoe" | "heal" | "buff" | "execute" | "cosmic";
  particleColor: string;
  icon: string;
}

export interface AncestralMemory {
  id: string;
  name: string;
  era: EraId;
  description: string;
  loreSnippet: string;
  cost: {
    eraEnergy: number;
    echoFragments: number;
  };
  requiredHeroLevel: number;
  unlocked: boolean;
  bonus: {
    damagePercent?: number;
    hpPercent?: number;
    defensePercent?: number;
    critRate?: number;
    energyGenMultiplier?: number;
    autoCraftSpeed?: number;
    abilityUnlock?: string;
  };
}

export interface TraitNode {
  id: string;
  name: string;
  force: CosmicForce;
  era?: EraId;
  tier: number;
  description: string;
  maxRank: number;
  currentRank: number;
  costPerRank: number;
  bonusPerRank: ItemStats;
  icon: string;
}

export interface EraDefinition {
  id: EraId;
  order: number;
  name: string;
  subtitle: string;
  description: string;
  bannerColor: string;
  primaryMaterial: string;
  primaryMaterialName: string;
  heroLevelReq: number;
  advancementCost: {
    eraEnergy: number;
    materials: number;
    titanCores: number;
  };
  generatorName: string;
  baseEnergyRate: number; // energy per second
  baseMaterialRate: number; // materials per second
  bossName: string;
  bossTitle: string;
  bossHp: number;
  bossDamage: number;
  bossAffinity: MythicAffinity;
  bossSpriteName?: string;
  enemies: {
    name: string;
    hpMultiplier: number;
    dmgMultiplier: number;
    affinity: MythicAffinity;
    tint: number;
    spriteName?: string;
  }[];
  specializations: string[];
}

export interface LoreEntry {
  id: string;
  title: string;
  era: EraId;
  category: "Era Chronicles" | "Mythic Beings" | "Human Evolution" | "Cosmic Convergence";
  content: string;
  unlocked: boolean;
  unlockCondition: string;
}

export type TransformationType = "base" | "arc_angel" | "werewolf" | "mythic_drake";

export interface ChiSkillNode {
  id: string;
  name: string;
  tier: number;
  description: string;
  maxRank: number;
  currentRank: number;
  costChiPoints: number;
  icon: string;
  bonus: {
    durationBonusSeconds?: number;
    damageMultiplier?: number;
    chiGainBonus?: number;
    shieldMaxHpPercent?: number;
    aoeCleaveRadius?: number;
    permanentSeraphUnlocked?: boolean;
    leechPercent?: number;
  };
}

export interface RogueRelic {
  id: string;
  name: string;
  icon: string;
  rarity: Rarity;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCostSoulGems: number;
  bonus: {
    damagePercent?: number;
    hpPercent?: number;
    defensePercent?: number;
    marchSpeedPercent?: number;
    goldDropPercent?: number;
    chiGainPercent?: number;
    respawnSpeedPercent?: number;
    troopDamagePercent?: number;
  };
}

export interface CompanionTroop {
  id: string;
  name: string;
  role: "melee" | "ranged" | "caster" | "support";
  count: number;
  maxCapacity: number; // Initially 1 per category
  hardCap: number; // Max capacity ceiling (e.g. 2 or 3) to prevent screen clutter
  expandCostSoulGems: number; // Soul Diamond cost to expand slot capacity
  level: number;
  hireCostEnergy: number;
  upgradeCostSoulGems: number;
  baseDmg: number;
  attackInterval: number;
  attackCooldown: number;
  xOffset: number;
  yOffset: number;
  icon: string;
  color: number;
  spriteName?: string;
  unlocked?: boolean;
}

export interface DepthsInvestment {
  id: string;
  name: string;
  costGold: number;
  incomePerSec: number;
  owned: number;
  description: string;
  icon: string;
}

export interface UnderworldDebtState {
  currentDebt: number;
  initialDebt: number;
  totalRepaid: number;
  interestRatePercent: number;
  investments: DepthsInvestment[];
  unlockedPerks: string[];
}

export interface InvestigationClue {
  id: string;
  title: string;
  description: string;
  icon: string;
  xPercent: number; // For interactive point-and-click scene
  yPercent: number;
  uncovered: boolean;
  historicalSecret: string;
  rewardEnergy: number;
  rewardSoulGems: number;
}

export interface InvestigationDeduction {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  solved: boolean;
}

export interface EraInvestigation {
  eraId: EraId;
  caseTitle: string;
  subtitle: string;
  sherlockPrologue: string;
  eraMysterySummary: string;
  constellation: {
    name: string;
    starPoints: { x: number; y: number; label: string; lore: string; clicked: boolean }[];
  };
  clues: InvestigationClue[];
  deduction: InvestigationDeduction;
  completed: boolean;
  masteryReward: string;
}

export interface CraftingRecipe {
  item: RPGItem;
  craftTimeSeconds: number;
}
