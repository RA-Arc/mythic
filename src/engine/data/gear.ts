import { RPGItem, EraId, Rarity } from "../types";

export const COLOR_MAP: Record<Rarity, string> = {
  Common: "#ffffff",
  Uncommon: "#22cc22",
  Rare: "#3399ff",
  Epic: "#b57cff",
  Legendary: "#ff9900",
  Mythic: "#ff3366",
  Cosmic: "#00f0ff"
};

export const MASTER_GEAR_CATALOG: RPGItem[] = [
  // =================== ERA OF DAWN ===================
  {
    id: "dawn_wpn_1",
    name: "Primordial Obsidian Club",
    slot: "primaryWpn",
    era: "dawn",
    rarity: "Common",
    wpnType: "hammer",
    damageBonus: 8,
    flavor: "A jagged chunk of volcanic glass bound to petrified wood.",
    cost: { eraEnergy: 30, materials: { primordial_essence: 5 } }
  },
  {
    id: "dawn_chest_1",
    name: "Tectonic Bark Vest",
    slot: "chest",
    era: "dawn",
    rarity: "Common",
    hpBonus: 25,
    defenseBonus: 4,
    flavor: "Stripped from petrified trees that grew before the first sunrise.",
    cost: { eraEnergy: 25, materials: { primordial_essence: 4 } }
  },
  {
    id: "dawn_helm_1",
    name: "Magma-Crusted Browband",
    slot: "head",
    era: "dawn",
    rarity: "Uncommon",
    hpBonus: 35,
    damageBonus: 3,
    flavor: "Cooled basalt glowing with lingering geothermal warmth.",
    cost: { eraEnergy: 60, materials: { primordial_essence: 10 } }
  },
  {
    id: "dawn_relic_1",
    name: "Spire of the First Architect",
    slot: "offHandWpn",
    era: "dawn",
    rarity: "Rare",
    wpnType: "relic",
    hpBonus: 60,
    defenseBonus: 10,
    flavor: "A crystalline tuning fork used by the Architects to calibrate planetary crust.",
    cost: { eraEnergy: 150, materials: { primordial_essence: 25 }, echoFragments: 2 }
  },
  {
    id: "dawn_art_1",
    name: "Heart of the World-Breaker",
    slot: "neck",
    era: "dawn",
    rarity: "Legendary",
    hpBonus: 150,
    damageBonus: 20,
    hasteBonus: 5,
    flavor: "A throbbing volcanic core that pulses in rhythm with the mantle of the earth.",
    cost: { eraEnergy: 350, materials: { primordial_essence: 50 }, titanCores: 1 }
  },

  // =================== ERA OF FIRE ===================
  {
    id: "fire_wpn_1",
    name: "Flint-Tipped Spear of the Hunt",
    slot: "primaryWpn",
    era: "fire",
    rarity: "Common",
    wpnType: "sword",
    damageBonus: 22,
    flavor: "Chipped red flint tied with sinew to seasoned ash wood.",
    cost: { eraEnergy: 80, materials: { ember_flint: 8 } }
  },
  {
    id: "fire_chest_1",
    name: "Smoldering Beast-Hide Cloak",
    slot: "back",
    era: "fire",
    rarity: "Uncommon",
    hpBonus: 80,
    defenseBonus: 12,
    flavor: "Thick pelt from an apex predator that never ceases to emit gentle heat.",
    cost: { eraEnergy: 140, materials: { ember_flint: 14 } }
  },
  {
    id: "fire_ring_1",
    name: "Band of the Living Flame",
    slot: "finger1",
    era: "fire",
    rarity: "Rare",
    damageBonus: 14,
    critRateBonus: 5,
    flavor: "An ember spirit sealed inside a loop of charred mammoth ivory.",
    cost: { eraEnergy: 300, materials: { ember_flint: 25 }, echoFragments: 4 }
  },
  {
    id: "fire_legs_1",
    name: "Ash-Walker Greaves",
    slot: "legs",
    era: "fire",
    rarity: "Epic",
    hpBonus: 160,
    defenseBonus: 20,
    flavor: "Guards worn by hunters who pursued beasts through active volcanic caldera.",
    cost: { eraEnergy: 600, materials: { ember_flint: 40 }, mythicShards: 2 }
  },
  {
    id: "fire_art_1",
    name: "The First Torch of Prometheus",
    slot: "offHandWpn",
    era: "fire",
    rarity: "Legendary",
    wpnType: "relic",
    damageBonus: 45,
    hpBonus: 220,
    eraEnergyBonus: 0.25,
    flavor: "The undying flame that sparked mortal consciousness and drove back the primordial dark.",
    cost: { eraEnergy: 1200, materials: { ember_flint: 80 }, titanCores: 2 }
  },

  // =================== ERA OF STONE ===================
  {
    id: "stone_wpn_1",
    name: "Runic Granite War-Cleaver",
    slot: "primaryWpn",
    era: "stone",
    rarity: "Common",
    wpnType: "axe",
    damageBonus: 48,
    flavor: "Heavy quarried stone chiseled with binding runes of clan power.",
    cost: { eraEnergy: 250, materials: { runed_granite: 15 } }
  },
  {
    id: "stone_chest_1",
    name: "Dolmen Plate Cuirass",
    slot: "chest",
    era: "stone",
    rarity: "Rare",
    hpBonus: 260,
    defenseBonus: 35,
    flavor: "Interlocking stone slabs inscribed with solstice sun marks.",
    cost: { eraEnergy: 700, materials: { runed_granite: 35 }, echoFragments: 8 }
  },
  {
    id: "stone_head_1",
    name: "Totemic Bull Mask",
    slot: "face",
    era: "stone",
    rarity: "Epic",
    damageBonus: 30,
    hpBonus: 180,
    critRateBonus: 6,
    flavor: "Carved from sacred limestone and anointed with ritual ochre.",
    cost: { eraEnergy: 1400, materials: { runed_granite: 60 }, mythicShards: 4 }
  },
  {
    id: "stone_art_1",
    name: "Menhir of the Earth Titan",
    slot: "primaryWpn",
    era: "stone",
    rarity: "Legendary",
    wpnType: "hammer",
    damageBonus: 110,
    hpBonus: 450,
    defenseBonus: 50,
    flavor: "A miniature monolith tuned to the magnetic ley-lines of the ancient world.",
    cost: { eraEnergy: 3200, materials: { runed_granite: 120 }, titanCores: 3 }
  },

  // =================== ERA OF BRONZE ===================
  {
    id: "bronze_wpn_1",
    name: "Orichalcum Xiphos",
    slot: "primaryWpn",
    era: "bronze",
    rarity: "Rare",
    wpnType: "sword",
    damageBonus: 105,
    critRateBonus: 8,
    flavor: "Forged in the sun-kissed ovens of Atlantis from mythic copper-gold alloy.",
    cost: { eraEnergy: 1200, materials: { orichalcum_ingot: 30 }, echoFragments: 15 }
  },
  {
    id: "bronze_shield_1",
    name: "Aegis of the Solar Phalanx",
    slot: "offHandWpn",
    era: "bronze",
    rarity: "Epic",
    wpnType: "armor",
    hpBonus: 600,
    defenseBonus: 85,
    flavor: "Polished bronze mirror-shield embossed with the radiant face of Apollo.",
    cost: { eraEnergy: 2500, materials: { orichalcum_ingot: 65 }, mythicShards: 6 }
  },
  {
    id: "bronze_art_1",
    name: "Talos's Molten Heart Core",
    slot: "neck",
    era: "bronze",
    rarity: "Legendary",
    damageBonus: 95,
    hpBonus: 900,
    hasteBonus: 10,
    flavor: "The singular bronze nail that held the ichor of the legendary Cretan guardian automaton.",
    cost: { eraEnergy: 6500, materials: { orichalcum_ingot: 150 }, titanCores: 5 }
  },

  // =================== ERA OF IRON ===================
  {
    id: "iron_wpn_1",
    name: "Gladius of the Iron Imperator",
    slot: "primaryWpn",
    era: "iron",
    rarity: "Epic",
    wpnType: "sword",
    damageBonus: 220,
    critRateBonus: 12,
    flavor: "Folded Damascus steel that vanquished rival warlords across ten provinces.",
    cost: { eraEnergy: 4500, materials: { damascus_steel: 60 }, echoFragments: 30 }
  },
  {
    id: "iron_chest_1",
    name: "Lorica Segmentata of the Eternal Empire",
    slot: "chest",
    era: "iron",
    rarity: "Epic",
    hpBonus: 1400,
    defenseBonus: 180,
    flavor: "Heavy articulated steel plates stamped with the seal of triumphant legions.",
    cost: { eraEnergy: 6000, materials: { damascus_steel: 80 }, mythicShards: 10 }
  },
  {
    id: "iron_art_1",
    name: "Colossus Siege Core Engine",
    slot: "waist",
    era: "iron",
    rarity: "Legendary",
    damageBonus: 180,
    hpBonus: 2000,
    defenseBonus: 120,
    flavor: "The mechanical heart of a city-shattering siege engine blessed by Mars.",
    cost: { eraEnergy: 16000, materials: { damascus_steel: 220 }, titanCores: 8 }
  },

  // =================== ERA OF FAITH ===================
  {
    id: "faith_wpn_1",
    name: "Holy Relic Excalibur",
    slot: "primaryWpn",
    era: "faith",
    rarity: "Epic",
    wpnType: "sword",
    damageBonus: 480,
    hpBonus: 1200,
    flavor: "Pulled from the sacred anvil, consecrated with the prayers of a million pilgrims.",
    cost: { eraEnergy: 12000, materials: { sacred_relic: 100 }, echoFragments: 50 }
  },
  {
    id: "faith_back_1",
    name: "Shroud of the Ascended Saint",
    slot: "back",
    era: "faith",
    rarity: "Legendary",
    hpBonus: 3500,
    defenseBonus: 350,
    eraEnergyBonus: 0.4,
    flavor: "Woven from threads of pure golden light said to cure any mortal affliction.",
    cost: { eraEnergy: 28000, materials: { sacred_relic: 250 }, titanCores: 12 }
  },
  {
    id: "faith_ring_1",
    name: "Signet of the Celestial Seraphim",
    slot: "finger2",
    era: "faith",
    rarity: "Mythic",
    damageBonus: 280,
    critRateBonus: 15,
    critDmgBonus: 40,
    flavor: "A ring stamped with holy burning fire that cleanses all shadow abominations.",
    cost: { eraEnergy: 45000, materials: { sacred_relic: 400 }, mythicShards: 25, titanCores: 15 }
  },

  // =================== ERA OF DISCOVERY ===================
  {
    id: "disc_wpn_1",
    name: "Philosopher's Quicksilver Rapier",
    slot: "primaryWpn",
    era: "discovery",
    rarity: "Epic",
    wpnType: "sword",
    damageBonus: 950,
    hasteBonus: 15,
    flavor: "Its blade shifts between liquid mercury and diamond-hard crystal in mid-thrust.",
    cost: { eraEnergy: 30000, materials: { philosophers_quicksilver: 180 }, echoFragments: 80 }
  },
  {
    id: "disc_art_1",
    name: "Leonardo's Universal Celestial Clock",
    slot: "offHandWpn",
    era: "discovery",
    rarity: "Legendary",
    wpnType: "relic",
    damageBonus: 600,
    hpBonus: 6500,
    defenseBonus: 500,
    flavor: "Interlocking brass gears that mathematically anticipate the opponent's next action.",
    cost: { eraEnergy: 75000, materials: { philosophers_quicksilver: 450 }, titanCores: 16 }
  },

  // =================== ERA OF STEAM ===================
  {
    id: "steam_wpn_1",
    name: "Overclocked Steam Piston Cannon",
    slot: "primaryWpn",
    era: "steam",
    rarity: "Legendary",
    wpnType: "gun",
    damageBonus: 2100,
    critRateBonus: 18,
    flavor: "Fires pressurized explosive iron bolts with the kinetic force of a freight train.",
    cost: { eraEnergy: 85000, materials: { steam_core: 350 }, echoFragments: 150, titanCores: 20 }
  },
  {
    id: "steam_chest_1",
    name: "Brass Dreadnought Boiler Frame",
    slot: "chest",
    era: "steam",
    rarity: "Mythic",
    hpBonus: 15000,
    defenseBonus: 1200,
    eraEnergyBonus: 0.6,
    flavor: "Rivet-reinforced armored exoskeleton housing a high-pressure coal-and-steam boiler.",
    cost: { eraEnergy: 180000, materials: { steam_core: 700 }, mythicShards: 40, titanCores: 25 }
  },

  // =================== ERA OF ATOM ===================
  {
    id: "atom_wpn_1",
    name: "Plutonium Plasma Railgun",
    slot: "primaryWpn",
    era: "atom",
    rarity: "Mythic",
    wpnType: "energy",
    damageBonus: 4800,
    critRateBonus: 25,
    critDmgBonus: 80,
    flavor: "Electromagnetically accelerates isotope cartridges to 0.05 the speed of light.",
    cost: { eraEnergy: 250000, materials: { plutonium_isotope: 800 }, mythicShards: 60, titanCores: 30 }
  },
  {
    id: "atom_art_1",
    name: "Quantum Supercollider Core",
    slot: "neck",
    era: "atom",
    rarity: "Cosmic",
    damageBonus: 3200,
    hpBonus: 35000,
    defenseBonus: 2500,
    hasteBonus: 20,
    flavor: "Contains a stable micro-singularity generating limitless atomic power.",
    cost: { eraEnergy: 500000, materials: { plutonium_isotope: 1500 }, titanCores: 40 }
  },

  // =================== ERA OF STARS ===================
  {
    id: "star_wpn_1",
    name: "Hyperdrive Singularity Blade",
    slot: "primaryWpn",
    era: "stars",
    rarity: "Cosmic",
    wpnType: "sword",
    damageBonus: 12000,
    critRateBonus: 35,
    critDmgBonus: 150,
    flavor: "A spacetime laceration held in a magnetic stasis field, slicing through physical dimensions.",
    cost: { eraEnergy: 800000, materials: { stellarite_shard: 2000 }, mythicShards: 100, titanCores: 50 }
  },
  {
    id: "star_chest_1",
    name: "Dyson Lattice Astral Cuirass",
    slot: "chest",
    era: "stars",
    rarity: "Cosmic",
    hpBonus: 95000,
    defenseBonus: 6000,
    eraEnergyBonus: 2.0,
    flavor: "Woven from the stellar energy collectors of an entire solar system.",
    cost: { eraEnergy: 1200000, materials: { stellarite_shard: 3500 }, titanCores: 60 }
  },
  {
    id: "star_art_1",
    name: "Chronos Omega: The Infinite Loop",
    slot: "ring1" as any,
    era: "stars",
    rarity: "Cosmic",
    damageBonus: 8500,
    hpBonus: 60000,
    defenseBonus: 4000,
    critRateBonus: 20,
    hasteBonus: 25,
    flavor: "The ultimate artifact binding all 10 eras of human history into a singular omnipotent consciousness.",
    cost: { eraEnergy: 2500000, materials: { stellarite_shard: 6000 }, titanCores: 100 }
  }
];

export const ITEM_DATABASE: Record<string, RPGItem> = {};
MASTER_GEAR_CATALOG.forEach(item => {
  ITEM_DATABASE[item.name] = item;
  ITEM_DATABASE[item.id] = item;
});
