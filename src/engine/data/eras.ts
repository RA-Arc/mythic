import { EraDefinition, EraId } from "../types";

export const ERA_DATA: Record<EraId, EraDefinition> = {
  dawn: {
    id: "dawn",
    order: 1,
    name: "Era of Dawn",
    subtitle: "Pre-Human Primordial Chaos",
    description: "Titans clash across volcanic expanses and elemental nebulae. Proto-humans awaken within cosmic geysers, capturing the first sparks of mythic essence.",
    bannerColor: "#ff471a",
    primaryMaterial: "primordial_essence",
    primaryMaterialName: "Primordial Essence",
    heroLevelReq: 1,
    advancementCost: {
      eraEnergy: 100,
      materials: 20,
      titanCores: 1
    },
    generatorName: "Primordial Rift Well",
    baseEnergyRate: 1.5,
    baseMaterialRate: 0.8,
    bossName: "Titan of Dawn",
    bossTitle: "The Unshaped World-Breaker",
    bossHp: 800,
    bossDamage: 18,
    bossAffinity: "Architect",
    enemies: [
      { name: "Magma Whelp", hpMultiplier: 1.0, dmgMultiplier: 1.0, affinity: "Elemental", tint: 0xff6633 },
      { name: "Primordial Shade", hpMultiplier: 1.2, dmgMultiplier: 1.1, affinity: "Wraithborn", tint: 0x9933ff },
      { name: "Volcanic Golem", hpMultiplier: 1.5, dmgMultiplier: 1.3, affinity: "Architect", tint: 0xcc4400 }
    ],
    specializations: ["Titan Warden", "Primordial Shaman", "Chaos Binder"]
  },
  fire: {
    id: "fire",
    order: 2,
    name: "Era of Fire",
    subtitle: "Hunter-Gatherer & The First Flame",
    description: "Nomadic hunters bind wandering flame spirits. Humanity crafts the first bone tools and ritual pyres beneath the gaze of mythic beasts.",
    bannerColor: "#ff7700",
    primaryMaterial: "ember_flint",
    primaryMaterialName: "Ember Flint",
    heroLevelReq: 5,
    advancementCost: {
      eraEnergy: 350,
      materials: 45,
      titanCores: 2
    },
    generatorName: "Eternal Campfire Shrine",
    baseEnergyRate: 3.5,
    baseMaterialRate: 1.5,
    bossName: "Fire Leviathan",
    bossTitle: "Ancient Terror of the Ash Wastes",
    bossHp: 2400,
    bossDamage: 38,
    bossAffinity: "Wraithborn",
    enemies: [
      { name: "Saberclaw Beast", hpMultiplier: 2.2, dmgMultiplier: 1.8, affinity: "Elemental", tint: 0xffaa33 },
      { name: "Ember Spirit", hpMultiplier: 2.0, dmgMultiplier: 2.2, affinity: "Echo", tint: 0xff4422 },
      { name: "Ash Goliath", hpMultiplier: 3.0, dmgMultiplier: 2.5, affinity: "Wraithborn", tint: 0x884433 }
    ],
    specializations: ["Ash Vanguard", "Flame Ritualist", "Wild Beastlord"]
  },
  stone: {
    id: "stone",
    order: 3,
    name: "Era of Stone",
    subtitle: "Early Civilization & Megaliths",
    description: "Great stone monoliths rise as tribal deities watch over clan warfare. Earth guardians and ancient totems guard the first settled valleys.",
    bannerColor: "#9e917d",
    primaryMaterial: "runed_granite",
    primaryMaterialName: "Runed Granite",
    heroLevelReq: 10,
    advancementCost: {
      eraEnergy: 1000,
      materials: 90,
      titanCores: 3
    },
    generatorName: "Megalithic Stone Circle",
    baseEnergyRate: 8.0,
    baseMaterialRate: 3.0,
    bossName: "Megalith Colossus",
    bossTitle: "Awakened Guardian of the Barrows",
    bossHp: 6500,
    bossDamage: 72,
    bossAffinity: "Architect",
    enemies: [
      { name: "Rune-Carved Golem", hpMultiplier: 4.5, dmgMultiplier: 3.5, affinity: "Architect", tint: 0xaa9988 },
      { name: "Clan Berserker", hpMultiplier: 3.8, dmgMultiplier: 4.2, affinity: "Neutral", tint: 0x778899 },
      { name: "Cave Wyrm", hpMultiplier: 5.2, dmgMultiplier: 4.0, affinity: "Wraithborn", tint: 0x556644 }
    ],
    specializations: ["Megalith Sentinel", "Earth Totemist", "Chieftain Warcaller"]
  },
  bronze: {
    id: "bronze",
    order: 4,
    name: "Era of Bronze",
    subtitle: "City-States & Mythic Champions",
    description: "Gilded city-states build ziggurats and acropolises. Heroic champions wield mythic bronze alloys blessed by martial pantheons.",
    bannerColor: "#cd7f32",
    primaryMaterial: "orichalcum_ingot",
    primaryMaterialName: "Orichalcum Ingot",
    heroLevelReq: 16,
    advancementCost: {
      eraEnergy: 2800,
      materials: 180,
      titanCores: 5
    },
    generatorName: "Hephaestian Crucible",
    baseEnergyRate: 18.0,
    baseMaterialRate: 6.0,
    bossName: "Minotaur Champion",
    bossTitle: "Labyrinthine War Titan",
    bossHp: 16000,
    bossDamage: 130,
    bossAffinity: "Wraithborn",
    enemies: [
      { name: "Spartan Hoplon Ghost", hpMultiplier: 7.5, dmgMultiplier: 6.5, affinity: "Echo", tint: 0xdd9944 },
      { name: "Orichalcum Automaton", hpMultiplier: 9.0, dmgMultiplier: 7.2, affinity: "Architect", tint: 0xffbb55 },
      { name: "Chimera Marauder", hpMultiplier: 8.2, dmgMultiplier: 8.0, affinity: "Wraithborn", tint: 0xcc6633 }
    ],
    specializations: ["Spartan Phalanx", "Solar Champion", "Orichalcum Smith"]
  },
  iron: {
    id: "iron",
    order: 5,
    name: "Era of Iron",
    subtitle: "Empires & Mythic Legions",
    description: "Vast imperial war engines clash over continents. Legionary spirits and disciplined iron phalanxes conquer beneath soaring standard banners.",
    bannerColor: "#708090",
    primaryMaterial: "damascus_steel",
    primaryMaterialName: "Damascus Steel",
    heroLevelReq: 24,
    advancementCost: {
      eraEnergy: 7500,
      materials: 350,
      titanCores: 8
    },
    generatorName: "Imperial Iron Foundry",
    baseEnergyRate: 40.0,
    baseMaterialRate: 12.0,
    bossName: "Iron Colossus Dreadnought",
    bossTitle: "Siege Incarnate of Fallen Empires",
    bossHp: 38000,
    bossDamage: 240,
    bossAffinity: "Architect",
    enemies: [
      { name: "Imperial Legionnaire", hpMultiplier: 14.0, dmgMultiplier: 11.5, affinity: "Architect", tint: 0x99aabb },
      { name: "Cataphract Phantom", hpMultiplier: 16.5, dmgMultiplier: 13.0, affinity: "Echo", tint: 0x667788 },
      { name: "Siege Behemoth", hpMultiplier: 20.0, dmgMultiplier: 14.5, affinity: "Neutral", tint: 0x445566 }
    ],
    specializations: ["Imperial Centurion", "Siege Architect", "Warlord Tactician"]
  },
  faith: {
    id: "faith",
    order: 6,
    name: "Era of Faith",
    subtitle: "Medieval Crusades of Light & Dark",
    description: "Cathedrals pierce the heavens as holy relics and demonic incursions wage an eternal crusade for mortal souls.",
    bannerColor: "#ffd700",
    primaryMaterial: "sacred_relic",
    primaryMaterialName: "Sacred Relic",
    heroLevelReq: 32,
    advancementCost: {
      eraEnergy: 18000,
      materials: 650,
      titanCores: 12
    },
    generatorName: "Sanctuary of Divine Radiance",
    baseEnergyRate: 90.0,
    baseMaterialRate: 25.0,
    bossName: "Angelic Seraphim",
    bossTitle: "The Six-Winged Inquisitor",
    bossHp: 85000,
    bossDamage: 450,
    bossAffinity: "Architect",
    enemies: [
      { name: "Fallen Crusader", hpMultiplier: 26.0, dmgMultiplier: 20.0, affinity: "Wraithborn", tint: 0x882233 },
      { name: "Gargoyle Sentinel", hpMultiplier: 29.0, dmgMultiplier: 22.0, affinity: "Architect", tint: 0x667799 },
      { name: "Eldritch Inquisitor", hpMultiplier: 25.0, dmgMultiplier: 27.0, affinity: "Echo", tint: 0xffcc33 }
    ],
    specializations: ["Grand Inquisitor", "Radiant Templar", "Eldritch Saint"]
  },
  discovery: {
    id: "discovery",
    order: 7,
    name: "Era of Discovery",
    subtitle: "Renaissance & Alchemical Magic",
    description: "Astronomers, alchemists, and navigators map the cosmos and transmute base reality. Mythic inventions awaken from parchment blueprints.",
    bannerColor: "#20b2aa",
    primaryMaterial: "philosophers_quicksilver",
    primaryMaterialName: "Philosopher's Quicksilver",
    heroLevelReq: 42,
    advancementCost: {
      eraEnergy: 45000,
      materials: 1200,
      titanCores: 16
    },
    generatorName: "Celestial Astrolabe Array",
    baseEnergyRate: 220.0,
    baseMaterialRate: 55.0,
    bossName: "Leonardo's Grand Automaton",
    bossTitle: "Omni-Disciplinary Clockwork Marvel",
    bossHp: 190000,
    bossDamage: 850,
    bossAffinity: "Echo",
    enemies: [
      { name: "Alchemical Homunculus", hpMultiplier: 42.0, dmgMultiplier: 36.0, affinity: "Wraithborn", tint: 0x33ccaa },
      { name: "Arcane Astrologer", hpMultiplier: 38.0, dmgMultiplier: 44.0, affinity: "Echo", tint: 0x66ddff },
      { name: "Clockwork Duelist", hpMultiplier: 45.0, dmgMultiplier: 40.0, affinity: "Architect", tint: 0xffd700 }
    ],
    specializations: ["Magnum Alchemist", "Celestial Cartographer", "Grand Artificer"]
  },
  steam: {
    id: "steam",
    order: 8,
    name: "Era of Steam",
    subtitle: "Industrial Revolution & Iron Giants",
    description: "Soot-choked skies hum with steam engines, iron foundries, and machine spirits. Gigantic locomotives and brass automatons rule industrial metropolises.",
    bannerColor: "#b8860b",
    primaryMaterial: "steam_core",
    primaryMaterialName: "Pressurized Steam Core",
    heroLevelReq: 54,
    advancementCost: {
      eraEnergy: 120000,
      materials: 2500,
      titanCores: 22
    },
    generatorName: "Geothermal Steam Dynamo",
    baseEnergyRate: 550.0,
    baseMaterialRate: 130.0,
    bossName: "Iron Giant Leviathan",
    bossTitle: "Sovereign of the Smokestacks",
    bossHp: 460000,
    bossDamage: 1650,
    bossAffinity: "Architect",
    enemies: [
      { name: "Overclocked Mechanoid", hpMultiplier: 68.0, dmgMultiplier: 58.0, affinity: "Architect", tint: 0xd2b48c },
      { name: "Smog Wraith", hpMultiplier: 62.0, dmgMultiplier: 70.0, affinity: "Wraithborn", tint: 0x555555 },
      { name: "Piston Enforcer", hpMultiplier: 78.0, dmgMultiplier: 64.0, affinity: "Neutral", tint: 0xb8860b }
    ],
    specializations: ["Steam Mecha-Pilot", "Industrial Magnate", "Overclock Savant"]
  },
  atom: {
    id: "atom",
    order: 9,
    name: "Era of Atom",
    subtitle: "Modernity & Nuclear Gods",
    description: "Quantum physics splits the atom, unchaining radiant nuclear divinities and shadow entities born from particle accelerators.",
    bannerColor: "#39ff14",
    primaryMaterial: "plutonium_isotope",
    primaryMaterialName: "Stabilized Plutonium Isotope",
    heroLevelReq: 68,
    advancementCost: {
      eraEnergy: 320000,
      materials: 5000,
      titanCores: 30
    },
    generatorName: "Tokamak Fusion Reactor",
    baseEnergyRate: 1400.0,
    baseMaterialRate: 300.0,
    bossName: "Nuclear Wraith Titan",
    bossTitle: "The Radioactive Singularity",
    bossHp: 1100000,
    bossDamage: 3400,
    bossAffinity: "Wraithborn",
    enemies: [
      { name: "Radiation Phantom", hpMultiplier: 110.0, dmgMultiplier: 100.0, affinity: "Wraithborn", tint: 0x39ff14 },
      { name: "Cyber-Drone Swarm", hpMultiplier: 100.0, dmgMultiplier: 120.0, affinity: "Echo", tint: 0x00ffff },
      { name: "Superconducting Mech", hpMultiplier: 135.0, dmgMultiplier: 108.0, affinity: "Architect", tint: 0x228833 }
    ],
    specializations: ["Atomic Physicist", "Quantum Manipulator", "Cyber-Vanguard"]
  },
  stars: {
    id: "stars",
    order: 10,
    name: "Era of Stars",
    subtitle: "Far Future & Cosmic Ascendance",
    description: "Humanity reaches the galactic rim, forging Dyson spheres and bending spacetime. The hero confronts cosmic titans in the ultimate convergence.",
    bannerColor: "#9370db",
    primaryMaterial: "stellarite_shard",
    primaryMaterialName: "Dark Matter Stellarite",
    heroLevelReq: 85,
    advancementCost: {
      eraEnergy: 1000000,
      materials: 12000,
      titanCores: 50
    },
    generatorName: "Dyson Swarm Quantum Nexus",
    baseEnergyRate: 4000.0,
    baseMaterialRate: 800.0,
    bossName: "Stellar Behemoth",
    bossTitle: "Cosmic Entity of the Outer Void",
    bossHp: 3200000,
    bossDamage: 7500,
    bossAffinity: "Echo",
    enemies: [
      { name: "Void Titan Spawn", hpMultiplier: 200.0, dmgMultiplier: 180.0, affinity: "Wraithborn", tint: 0x9933cc },
      { name: "Solar Seraph", hpMultiplier: 220.0, dmgMultiplier: 200.0, affinity: "Architect", tint: 0xffd700 },
      { name: "Temporal Echo Shifter", hpMultiplier: 240.0, dmgMultiplier: 220.0, affinity: "Echo", tint: 0x33eeff }
    ],
    specializations: ["Stellar Harbinger", "Cosmic Architect", "Void Dominator"]
  }
};

export const ERA_ORDER: EraId[] = [
  "dawn",
  "fire",
  "stone",
  "bronze",
  "iron",
  "faith",
  "discovery",
  "steam",
  "atom",
  "stars"
];
