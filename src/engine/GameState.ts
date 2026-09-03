import { EraId, CosmicForce, RPGItem, ChiSkillNode, RogueRelic, CompanionTroop, EraInvestigation, UnderworldDebtState, DepthsInvestment } from "./types";
import { ERA_DATA, ERA_ORDER } from "./data/eras";
import { ANCESTRAL_MEMORIES } from "./data/memories";
import { COSMIC_TRAIT_TREE } from "./data/traits";
import { ITEM_DATABASE } from "./data/gear";
import { CHI_SKILL_TREE } from "./data/chiSkills";
import { INITIAL_ROGUE_RELICS } from "./data/relics";
import { INITIAL_COMPANION_TROOPS } from "./data/troops";
import { ERA_INVESTIGATIONS } from "./data/investigations";
import { soundEngine } from "./SoundEngine";

export interface SerializedState {
  currentEra: EraId;
  unlockedEras: EraId[];
  cosmicAlignment: CosmicForce;
  hero: {
    level: number;
    xp: number;
    maxXp: number;
    hp: number;
    maxHp: number;
    baseDmg: number;
    equipment: Record<string, string | null>;
    inventory: string[];
    activeSpecialization: string;
    equippedAbilities: string[];
  };
  currencies: {
    eraEnergy: number;
    mythicShards: number;
    echoFragments: number;
    titanCores: number;
    materials: Record<string, number>;
  };
  generators: Record<string, { level: number }>;
  unlockedMemories: string[];
  traits: Record<string, number>;
  specializations: Record<string, string>;
  stats: {
    totalKills: number;
    bossKills: number;
    totalEraEnergyEarned: number;
    reincarnations: number;
    lastSavedTimestamp: number;
  };
}

const STORAGE_KEY = "MYTHIC_RPG_SAVE_V2";

export class GameState {
  currentEra: EraId = "dawn";
  unlockedEras: EraId[] = ["dawn"];
  cosmicAlignment: CosmicForce = "Echoes";

  currencies = {
    eraEnergy: 150,
    mythicShards: 5,
    echoFragments: 10,
    titanCores: 1,
    materials: {
      primordial_essence: 20,
      ember_flint: 0,
      runed_granite: 0,
      orichalcum_ingot: 0,
      damascus_steel: 0,
      sacred_relic: 0,
      philosophers_quicksilver: 0,
      steam_core: 0,
      plutonium_isotope: 0,
      stellarite_shard: 0
    } as Record<string, number>
  };

  generators: Record<EraId, { level: number }> = {
    dawn: { level: 1 },
    fire: { level: 0 },
    stone: { level: 0 },
    bronze: { level: 0 },
    iron: { level: 0 },
    faith: { level: 0 },
    discovery: { level: 0 },
    steam: { level: 0 },
    atom: { level: 0 },
    stars: { level: 0 }
  };

  unlockedMemories: Set<string> = new Set();
  traits: Record<string, number> = {};
  specializations: Record<EraId, string> = {
    dawn: "Primordial Shaman",
    fire: "Flame Ritualist",
    stone: "Megalith Sentinel",
    bronze: "Spartan Phalanx",
    iron: "Imperial Centurion",
    faith: "Radiant Templar",
    discovery: "Magnum Alchemist",
    steam: "Overclock Savant",
    atom: "Quantum Manipulator",
    stars: "Cosmic Architect"
  };

  stats = {
    totalKills: 0,
    bossKills: 0,
    totalEraEnergyEarned: 150,
    reincarnations: 0,
    lastSavedTimestamp: Date.now()
  };

  chiSkills: ChiSkillNode[] = JSON.parse(JSON.stringify(CHI_SKILL_TREE));
  investigations: Record<string, EraInvestigation> = JSON.parse(JSON.stringify(ERA_INVESTIGATIONS));
  relics: RogueRelic[] = JSON.parse(JSON.stringify(INITIAL_ROGUE_RELICS));
  troops: CompanionTroop[] = JSON.parse(JSON.stringify(INITIAL_COMPANION_TROOPS));

  underworldDebt: UnderworldDebtState = {
    currentDebt: 5000,
    initialDebt: 5000,
    totalRepaid: 0,
    interestRatePercent: 0.05,
    investments: [
      {
        id: "invest_mine_cart",
        name: "Underworld Ore Cart",
        costGold: 120,
        incomePerSec: 4,
        owned: 0,
        description: "Hauls raw stygian mineral ore continuously from the underworld shaft.",
        icon: "⛏️"
      },
      {
        id: "invest_alchemist_vat",
        name: "Alchemical Slime Vat",
        costGold: 450,
        incomePerSec: 18,
        owned: 0,
        description: "Transmutes corrosive bogslium essence into marketable stygian coins.",
        icon: "🧪"
      },
      {
        id: "invest_batilisk_roost",
        name: "Batilisk Air Roost",
        costGold: 1600,
        incomePerSec: 65,
        owned: 0,
        description: "Dispatches trained winged batilisks to scour the caverns for forgotten treasure.",
        icon: "🦇"
      },
      {
        id: "invest_minotaur_forge",
        name: "Minotaur Armory Guild",
        costGold: 6000,
        incomePerSec: 260,
        owned: 0,
        description: "Produces master-crafted underworld war relics for wealthy planar collectors.",
        icon: "⚒️"
      },
      {
        id: "invest_dragon_horde",
        name: "Dragon Hoard Syndicate",
        costGold: 25000,
        incomePerSec: 1200,
        owned: 0,
        description: "Invests directly in the slumbering Wyrm's treasury for massive yield.",
        icon: "🐉"
      }
    ],
    unlockedPerks: []
  };

  offlineGains: { seconds: number; energy: number; materials: number } | null = null;

  constructor() {
    this.load();
  }

  // Ticks generators once per second
  tickGenerators(): { energyGained: number; materialsGained: Record<string, number> } {
    let energyGained = 0;
    const materialsGained: Record<string, number> = {};

    const memoryMultiplier = this.getMemoryBonusMultiplier("energyGenMultiplier");
    const traitEnergyBonus = this.getTraitBonus().eraEnergyBonus || 0;
    const alignmentBonus = this.cosmicAlignment === "Echoes" ? 1.5 : 1.0;

    const totalRateMultiplier = (1 + traitEnergyBonus) * memoryMultiplier * alignmentBonus;

    for (const eraId of this.unlockedEras) {
      const gen = this.generators[eraId];
      if (gen && gen.level > 0) {
        const era = ERA_DATA[eraId];
        const energyRate = era.baseEnergyRate * gen.level * totalRateMultiplier;
        const matRate = era.baseMaterialRate * gen.level * totalRateMultiplier;

        energyGained += energyRate;
        materialsGained[era.primaryMaterial] = (materialsGained[era.primaryMaterial] || 0) + matRate;

        this.currencies.materials[era.primaryMaterial] = (this.currencies.materials[era.primaryMaterial] || 0) + matRate;
      }
    }

    // Underworld Passive Investments Yield (Debts in the Depths)
    let underworldYield = 0;
    for (const inv of this.underworldDebt.investments) {
      if (inv.owned > 0) {
        underworldYield += inv.incomePerSec * inv.owned;
      }
    }
    if (underworldYield > 0) {
      energyGained += underworldYield;
    }

    this.currencies.eraEnergy += energyGained;
    this.stats.totalEraEnergyEarned += energyGained;

    return { energyGained, materialsGained };
  }

  repayUnderworldDebt(amount: number): boolean {
    const toPay = Math.min(amount, this.underworldDebt.currentDebt);
    if (toPay <= 0) return false;
    if (this.currencies.eraEnergy < toPay) return false;

    this.currencies.eraEnergy -= toPay;
    this.underworldDebt.currentDebt -= toPay;
    this.underworldDebt.totalRepaid += toPay;

    const repaidPct = (this.underworldDebt.totalRepaid / this.underworldDebt.initialDebt) * 100;
    if (repaidPct >= 25 && !this.underworldDebt.unlockedPerks.includes("perk_25")) {
      this.underworldDebt.unlockedPerks.push("perk_25");
      soundEngine.playLevelUp();
    }
    if (repaidPct >= 50 && !this.underworldDebt.unlockedPerks.includes("perk_50")) {
      this.underworldDebt.unlockedPerks.push("perk_50");
      soundEngine.playLevelUp();
    }
    if (repaidPct >= 75 && !this.underworldDebt.unlockedPerks.includes("perk_75")) {
      this.underworldDebt.unlockedPerks.push("perk_75");
      soundEngine.playLevelUp();
    }
    if (this.underworldDebt.currentDebt <= 0 && !this.underworldDebt.unlockedPerks.includes("perk_100")) {
      this.underworldDebt.unlockedPerks.push("perk_100");
      soundEngine.playVictoryFanfare();
    } else {
      soundEngine.playGoldPickup();
    }

    this.save();
    return true;
  }

  buyDepthsInvestment(investmentId: string): boolean {
    const invest = this.underworldDebt.investments.find((i: DepthsInvestment) => i.id === investmentId);
    if (!invest) return false;
    if (this.currencies.eraEnergy < invest.costGold) return false;

    this.currencies.eraEnergy -= invest.costGold;
    invest.owned += 1;
    invest.costGold = Math.floor(invest.costGold * 1.15);

    soundEngine.playCraft();
    this.save();
    return true;
  }

  upgradeGenerator(eraId: EraId): boolean {
    const current = this.generators[eraId] ? this.generators[eraId].level : 0;
    const cost = Math.floor(50 * Math.pow(1.8, current));

    if (this.currencies.eraEnergy >= cost) {
      this.currencies.eraEnergy -= cost;
      if (!this.generators[eraId]) this.generators[eraId] = { level: 0 };
      this.generators[eraId].level += 1;
      soundEngine.playCraft();
      this.save();
      return true;
    }
    return false;
  }

  getGeneratorUpgradeCost(eraId: EraId): number {
    const current = this.generators[eraId] ? this.generators[eraId].level : 0;
    return Math.floor(50 * Math.pow(1.8, current));
  }

  canAdvanceEra(targetEra: EraId): { can: boolean; reason?: string } {
    const currentIdx = ERA_ORDER.indexOf(this.currentEra);
    const targetIdx = ERA_ORDER.indexOf(targetEra);

    if (targetIdx !== currentIdx + 1) {
      return { can: false, reason: "Must advance sequentially through history." };
    }

    const eraInfo = ERA_DATA[targetEra];
    const cost = eraInfo.advancementCost;

    if (this.currencies.eraEnergy < cost.eraEnergy) {
      return { can: false, reason: `Requires ${cost.eraEnergy} Era-Energy (Have: ${Math.floor(this.currencies.eraEnergy)}).` };
    }

    const matCount = this.currencies.materials[ERA_DATA[this.currentEra].primaryMaterial] || 0;
    if (matCount < cost.materials) {
      return { can: false, reason: `Requires ${cost.materials} ${ERA_DATA[this.currentEra].primaryMaterialName} (Have: ${Math.floor(matCount)}).` };
    }

    if (this.currencies.titanCores < cost.titanCores) {
      return { can: false, reason: `Requires ${cost.titanCores} Titan Cores (Have: ${this.currencies.titanCores}). Defeat Era Bosses to obtain Titan Cores!` };
    }

    return { can: true };
  }

  advanceEra(targetEra: EraId): boolean {
    const check = this.canAdvanceEra(targetEra);
    if (!check.can) return false;

    const eraInfo = ERA_DATA[targetEra];
    const cost = eraInfo.advancementCost;

    this.currencies.eraEnergy -= cost.eraEnergy;
    this.currencies.materials[ERA_DATA[this.currentEra].primaryMaterial] -= cost.materials;
    this.currencies.titanCores -= cost.titanCores;

    this.currentEra = targetEra;
    if (!this.unlockedEras.includes(targetEra)) {
      this.unlockedEras.push(targetEra);
      if (!this.generators[targetEra] || this.generators[targetEra].level === 0) {
        this.generators[targetEra] = { level: 1 };
      }
    }

    soundEngine.playEraAdvance();
    this.save();
    return true;
  }

  unlockMemory(memoryId: string, heroLevel: number): boolean {
    const mem = ANCESTRAL_MEMORIES.find(m => m.id === memoryId);
    if (!mem || this.unlockedMemories.has(memoryId)) return false;
    if (heroLevel < mem.requiredHeroLevel) return false;

    if (this.currencies.eraEnergy >= mem.cost.eraEnergy && this.currencies.echoFragments >= mem.cost.echoFragments) {
      this.currencies.eraEnergy -= mem.cost.eraEnergy;
      this.currencies.echoFragments -= mem.cost.echoFragments;
      this.unlockedMemories.add(memoryId);
      soundEngine.playLevelUp();
      this.save();
      return true;
    }
    return false;
  }

  upgradeTrait(traitId: string, force: CosmicForce): boolean {
    const nodes = COSMIC_TRAIT_TREE[force];
    const node = nodes.find(n => n.id === traitId);
    if (!node) return false;

    const curRank = this.traits[traitId] || 0;
    if (curRank >= node.maxRank) return false;

    const cost = node.costPerRank * (curRank + 1);
    if (this.currencies.eraEnergy >= cost) {
      this.currencies.eraEnergy -= cost;
      this.traits[traitId] = curRank + 1;
      soundEngine.playCraft();
      this.save();
      return true;
    }
    return false;
  }

  getTraitBonus(): Record<string, number> {
    const total: Record<string, number> = {
      hpBonus: 0,
      damageBonus: 0,
      defenseBonus: 0,
      critRateBonus: 0,
      critDmgBonus: 0,
      hasteBonus: 0,
      eraEnergyBonus: 0,
      cosmicPowerBonus: 0
    };

    for (const force of ["Architects", "Wraithborn", "Echoes"] as CosmicForce[]) {
      const nodes = COSMIC_TRAIT_TREE[force];
      for (const node of nodes) {
        const rank = this.traits[node.id] || 0;
        if (rank > 0) {
          if (node.bonusPerRank.hpBonus) total.hpBonus += node.bonusPerRank.hpBonus * rank;
          if (node.bonusPerRank.damageBonus) total.damageBonus += node.bonusPerRank.damageBonus * rank;
          if (node.bonusPerRank.defenseBonus) total.defenseBonus += node.bonusPerRank.defenseBonus * rank;
          if (node.bonusPerRank.critRateBonus) total.critRateBonus += node.bonusPerRank.critRateBonus * rank;
          if (node.bonusPerRank.critDmgBonus) total.critDmgBonus += node.bonusPerRank.critDmgBonus * rank;
          if (node.bonusPerRank.hasteBonus) total.hasteBonus += node.bonusPerRank.hasteBonus * rank;
          if (node.bonusPerRank.eraEnergyBonus) total.eraEnergyBonus += node.bonusPerRank.eraEnergyBonus * rank;
        }
      }
    }

    return total;
  }

  getMemoryBonusMultiplier(key: string): number {
    let multiplier = 1.0;
    for (const memId of this.unlockedMemories) {
      const mem = ANCESTRAL_MEMORIES.find(m => m.id === memId);
      if (mem && mem.bonus) {
        if (key === "hpPercent" && mem.bonus.hpPercent) multiplier += mem.bonus.hpPercent / 100;
        if (key === "damagePercent" && mem.bonus.damagePercent) multiplier += mem.bonus.damagePercent / 100;
        if (key === "defensePercent" && mem.bonus.defensePercent) multiplier += mem.bonus.defensePercent / 100;
        if (key === "energyGenMultiplier" && mem.bonus.energyGenMultiplier) multiplier *= mem.bonus.energyGenMultiplier;
      }
    }
    return multiplier;
  }

  getMemoryFlatBonus(key: string): number {
    let sum = 0;
    for (const memId of this.unlockedMemories) {
      const mem = ANCESTRAL_MEMORIES.find(m => m.id === memId);
      if (mem && mem.bonus) {
        if (key === "critRate" && mem.bonus.critRate) sum += mem.bonus.critRate;
      }
    }
    return sum;
  }

  upgradeChiSkill(skillId: string, hero: any): boolean {
    const node = this.chiSkills.find(s => s.id === skillId);
    if (!node) return false;
    if (node.currentRank >= node.maxRank) return false;
    if (hero.chiSkillPoints < node.costChiPoints) return false;

    hero.chiSkillPoints -= node.costChiPoints;
    node.currentRank += 1;

    if (node.bonus.permanentSeraphUnlocked) {
      hero.permanentSeraphEnabled = true;
      hero.transform("arc_angel", 999999);
    }

    soundEngine.playLevelUp();
    this.save();
    return true;
  }

  upgradeRelic(relicId: string, hero: any): boolean {
    const relic = this.relics.find(r => r.id === relicId);
    if (!relic) return false;
    if (relic.level >= relic.maxLevel) return false;
    if (hero.soulDiamonds < relic.upgradeCostSoulGems) return false;

    hero.soulDiamonds -= relic.upgradeCostSoulGems;
    relic.level += 1;
    relic.upgradeCostSoulGems = Math.floor(relic.upgradeCostSoulGems * 1.5 + 2);
    hero.relics = this.relics;

    soundEngine.playCraft();
    this.save();
    return true;
  }

  hireTroop(troopId: string, hero: any): boolean {
    const troop = this.troops.find(t => t.id === troopId);
    if (!troop) return false;

    // Check category slot capacity limit
    const currentCap = troop.maxCapacity || 1;
    if (troop.count >= currentCap) {
      return false;
    }

    // Global squad limit: max 8 companions total to keep combat clean
    const totalCount = this.troops.reduce((acc, t) => acc + (t.count || 0), 0);
    if (totalCount >= 8) {
      return false;
    }

    if (this.currencies.eraEnergy < troop.hireCostEnergy) return false;

    this.currencies.eraEnergy -= troop.hireCostEnergy;
    troop.count += 1;
    troop.hireCostEnergy = Math.floor(troop.hireCostEnergy * 1.5 + 30);
    hero.troops = this.troops;

    soundEngine.playCraft();
    this.save();
    return true;
  }

  expandTroopCapacity(troopId: string, hero: any): boolean {
    const troop = this.troops.find(t => t.id === troopId);
    if (!troop) return false;

    const currentCap = troop.maxCapacity || 1;
    const hardCap = troop.hardCap || 2;
    if (currentCap >= hardCap) return false;

    const cost = troop.expandCostSoulGems || 3;
    if (hero.soulDiamonds < cost) return false;

    hero.soulDiamonds -= cost;
    troop.maxCapacity = currentCap + 1;
    troop.expandCostSoulGems = Math.floor(cost * 1.8 + 2);
    hero.troops = this.troops;

    soundEngine.playLevelUp();
    this.save();
    return true;
  }

  upgradeTroop(troopId: string, hero: any): boolean {
    const troop = this.troops.find(t => t.id === troopId);
    if (!troop) return false;
    if (hero.soulDiamonds < troop.upgradeCostSoulGems) return false;

    hero.soulDiamonds -= troop.upgradeCostSoulGems;
    troop.level += 1;
    troop.baseDmg = Math.floor(troop.baseDmg * 1.35 + 8);
    troop.upgradeCostSoulGems = Math.floor(troop.upgradeCostSoulGems * 1.5 + 3);
    hero.troops = this.troops;

    soundEngine.playLevelUp();
    this.save();
    return true;
  }

  uncoverInvestigationClue(eraId: string, clueId: string, hero: any): boolean {
    const investigation = this.investigations[eraId];
    if (!investigation) return false;

    const clue = investigation.clues.find(c => c.id === clueId);
    if (!clue || clue.uncovered) return false;

    clue.uncovered = true;
    this.currencies.eraEnergy += clue.rewardEnergy;
    hero.soulDiamonds += clue.rewardSoulGems;
    hero.gainChi(25);

    soundEngine.playCrit();
    this.save();
    return true;
  }

  clickInvestigationStar(eraId: string, starIdx: number): { lore: string; wasNew: boolean } {
    const investigation = this.investigations[eraId];
    if (!investigation || !investigation.constellation.starPoints[starIdx]) {
      return { lore: "Faint cosmic starlight shimmers in the infinite ether.", wasNew: false };
    }

    const star = investigation.constellation.starPoints[starIdx];
    const wasNew = !star.clicked;
    star.clicked = true;

    if (wasNew) {
      this.currencies.eraEnergy += 50;
      soundEngine.playHit();
    }
    this.save();
    return { lore: star.lore, wasNew };
  }

  solveInvestigationDeduction(eraId: string, optionIdx: number, hero: any): { success: boolean; explanation: string } {
    const investigation = this.investigations[eraId];
    if (!investigation || !investigation.deduction.options[optionIdx]) {
      return { success: false, explanation: "Invalid deduction choice." };
    }

    const option = investigation.deduction.options[optionIdx];
    if (option.isCorrect) {
      investigation.deduction.solved = true;
      investigation.completed = true;
      this.currencies.eraEnergy += 500;
      this.currencies.titanCores += 2;
      hero.soulDiamonds += 10;
      hero.gainChi(100);
      soundEngine.playBossRoar();
      this.save();
      return { success: true, explanation: option.explanation };
    } else {
      soundEngine.playHit();
      return { success: false, explanation: option.explanation };
    }
  }

  reincarnate(): boolean {
    this.stats.reincarnations += 1;
    this.currencies.titanCores += 5;
    this.currencies.mythicShards += 15;
    this.currencies.echoFragments += 30;
    this.currencies.eraEnergy = 200;

    // Retains memories, traits, and unlocked eras!
    soundEngine.playEraAdvance();
    this.save();
    return true;
  }

  save() {
    this.stats.lastSavedTimestamp = Date.now();
    const data: SerializedState = {
      currentEra: this.currentEra,
      unlockedEras: this.unlockedEras,
      cosmicAlignment: this.cosmicAlignment,
      hero: {
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 150,
        maxHp: 150,
        baseDmg: 15,
        equipment: {},
        inventory: [],
        activeSpecialization: this.specializations[this.currentEra] || "Primordial Shaman",
        equippedAbilities: ["auto_attack", "genesis_quake"]
      },
      currencies: this.currencies,
      generators: this.generators,
      unlockedMemories: Array.from(this.unlockedMemories),
      traits: this.traits,
      specializations: this.specializations,
      stats: this.stats
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Safe fallback
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data: SerializedState = JSON.parse(raw);

      if (data.currentEra) this.currentEra = data.currentEra;
      if (data.unlockedEras) this.unlockedEras = data.unlockedEras;
      if (data.cosmicAlignment) this.cosmicAlignment = data.cosmicAlignment;
      if (data.currencies) this.currencies = { ...this.currencies, ...data.currencies };
      if (data.generators) this.generators = { ...this.generators, ...data.generators };
      if (data.unlockedMemories) this.unlockedMemories = new Set(data.unlockedMemories);
      if (data.traits) this.traits = data.traits;
      if (data.specializations) this.specializations = { ...this.specializations, ...data.specializations };
      if (data.stats) this.stats = { ...this.stats, ...data.stats };

      // Calculate offline gains
      const elapsedSeconds = Math.max(0, Math.min(86400, Math.floor((Date.now() - (this.stats.lastSavedTimestamp || Date.now())) / 1000)));
      if (elapsedSeconds > 10) {
        let offlineEnergy = 0;
        let offlineMats = 0;
        for (const eraId of this.unlockedEras) {
          const gen = this.generators[eraId];
          if (gen && gen.level > 0) {
            const era = ERA_DATA[eraId];
            offlineEnergy += era.baseEnergyRate * gen.level * elapsedSeconds * 0.5;
            offlineMats += era.baseMaterialRate * gen.level * elapsedSeconds * 0.5;
            this.currencies.materials[era.primaryMaterial] = (this.currencies.materials[era.primaryMaterial] || 0) + (era.baseMaterialRate * gen.level * elapsedSeconds * 0.5);
          }
        }
        this.currencies.eraEnergy += offlineEnergy;
        this.offlineGains = {
          seconds: elapsedSeconds,
          energy: Math.floor(offlineEnergy),
          materials: Math.floor(offlineMats)
        };
      }
    } catch {
      // Safe load fallback
    }
  }

  exportSave(): string {
    this.save();
    return localStorage.getItem(STORAGE_KEY) || "{}";
  }

  importSave(json: string): boolean {
    try {
      JSON.parse(json);
      localStorage.setItem(STORAGE_KEY, json);
      this.load();
      return true;
    } catch {
      return false;
    }
  }
}
