import { EraDefinition, EraId } from "../types";

export const ERA_DATA: Record<EraId, EraDefinition> = {
  dawn: {
    id: "dawn",
    order: 1,
    name: "Era of Dawn",
    subtitle: "Pre-Human Primordial Chaos",
    description: "Titans clash across volcanic expanses and elemental caverns. Proto-humans awaken within cosmic depths, capturing the first sparks of mythic essence.",
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
    bossTitle: "The Unshaped World-Breaker Dragon",
    bossHp: 800,
    bossDamage: 18,
    bossAffinity: "Architect",
    bossSpriteName: "sprDragon",
    enemies: [
      { name: "Batilisk Scout", hpMultiplier: 1.0, dmgMultiplier: 1.0, affinity: "Elemental", tint: 0xff6633, spriteName: "sprBatilisk1" },
      { name: "Cave Goblin", hpMultiplier: 1.2, dmgMultiplier: 1.1, affinity: "Neutral", tint: 0xffffff, spriteName: "sprGoblin1" },
      { name: "Cavern Bogslium", hpMultiplier: 1.5, dmgMultiplier: 1.3, affinity: "Architect", tint: 0x88dd44, spriteName: "sprBogslium1" }
    ],
    specializations: ["Titan Warden", "Primordial Shaman", "Chaos Binder"]
  },
  fire: {
    id: "fire",
    order: 2,
    name: "Era of Fire",
    subtitle: "Hunter-Gatherer & The First Flame",
    description: "Nomadic hunters bind wandering flame spirits. Humanity crafts the first bone tools beneath the gaze of subterranean inferno beasts.",
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
    bossTitle: "Ancient Terror of the Inferno",
    bossHp: 2400,
    bossDamage: 38,
    bossAffinity: "Wraithborn",
    bossSpriteName: "sprDragon",
    enemies: [
      { name: "Brimstone Batilisk", hpMultiplier: 2.2, dmgMultiplier: 1.8, affinity: "Elemental", tint: 0xff8833, spriteName: "sprBatilisk2" },
      { name: "Magma Goblin", hpMultiplier: 2.0, dmgMultiplier: 2.2, affinity: "Wraithborn", tint: 0xff4422, spriteName: "sprGoblin2" },
      { name: "Infernal Minotaur", hpMultiplier: 3.0, dmgMultiplier: 2.5, affinity: "Architect", tint: 0xee5533, spriteName: "sprMinotaur1" }
    ],
    specializations: ["Ash Vanguard", "Flame Ritualist", "Wild Beastlord"]
  },
  stone: {
    id: "stone",
    order: 3,
    name: "Era of Stone",
    subtitle: "Early Civilization & Megaliths",
    description: "Great stone monoliths rise as tribal deities watch over clan warfare. Crypt skeletons and ancient minotaurs guard the first barrows.",
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
    bossSpriteName: "sprMinotaur2",
    enemies: [
      { name: "Crypt Skeleton", hpMultiplier: 4.5, dmgMultiplier: 3.5, affinity: "Wraithborn", tint: 0xffffff, spriteName: "sprSkeleton" },
      { name: "Tomb Goblin", hpMultiplier: 3.8, dmgMultiplier: 4.2, affinity: "Neutral", tint: 0x99aacc, spriteName: "sprGoblin3" },
      { name: "Acidic Bogslium", hpMultiplier: 5.2, dmgMultiplier: 4.0, affinity: "Elemental", tint: 0x33ee77, spriteName: "sprBogslium2" }
    ],
    specializations: ["Megalith Sentinel", "Earth Totemist", "Chieftain Warcaller"]
  },
  bronze: {
    id: "bronze",
    order: 4,
    name: "Era of Bronze",
    subtitle: "City-States & Mythic Champions",
    description: "Gilded city-states build ziggurats and acropolises. Heroic champions wield mythic bronze alloys against deadly orc archers and lizard monks.",
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
    bossSpriteName: "sprMinotaur2",
    enemies: [
      { name: "Orc Marksman", hpMultiplier: 7.5, dmgMultiplier: 6.5, affinity: "Neutral", tint: 0xffffff, spriteName: "sprOrcArcher" },
      { name: "Lizard Monk Acolyte", hpMultiplier: 9.0, dmgMultiplier: 7.2, affinity: "Echo", tint: 0xffffff, spriteName: "sprLizardMonk" },
      { name: "Armored Skeleton Guard", hpMultiplier: 8.2, dmgMultiplier: 8.0, affinity: "Architect", tint: 0xddaa77, spriteName: "sprSkeleton2" }
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
    bossSpriteName: "sprMinotaur3",
    enemies: [
      { name: "Heavy Orc Crossbowman", hpMultiplier: 14.0, dmgMultiplier: 11.5, affinity: "Architect", tint: 0x99aabb, spriteName: "sprOrcArcher2" },
      { name: "Dread Skeleton Knight", hpMultiplier: 16.5, dmgMultiplier: 13.0, affinity: "Wraithborn", tint: 0xcccccc, spriteName: "sprSkeleton3" },
      { name: "Ironclad Minotaur", hpMultiplier: 20.0, dmgMultiplier: 14.5, affinity: "Neutral", tint: 0x778899, spriteName: "sprMinotaur2" }
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
    bossName: "Spectral Sovereign Dragon",
    bossTitle: "The Six-Winged Inquisitor of the Deep",
    bossHp: 85000,
    bossDamage: 450,
    bossAffinity: "Architect",
    bossSpriteName: "sprDragon",
    enemies: [
      { name: "Spectral Apparition", hpMultiplier: 26.0, dmgMultiplier: 20.0, affinity: "Echo", tint: 0xffffff, spriteName: "sprGhost1" },
      { name: "Ascended Lizard Monk", hpMultiplier: 29.0, dmgMultiplier: 22.0, affinity: "Echo", tint: 0xffe066, spriteName: "sprLizardMonk2" },
      { name: "Dread Batilisk Screecher", hpMultiplier: 25.0, dmgMultiplier: 27.0, affinity: "Wraithborn", tint: 0xcc4488, spriteName: "sprBatilisk3" }
    ],
    specializations: ["Grand Inquisitor", "Radiant Templar", "Eldritch Saint"]
  },
  discovery: {
    id: "discovery",
    order: 7,
    name: "Era of Discovery",
    subtitle: "Renaissance & Alchemical Magic",
    description: "Astronomers, alchemists, and navigators map the cosmos and transmute base reality into mythic inventions.",
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
    bossTitle: "Transmuted Wyrm of the Depths",
    bossHp: 190000,
    bossDamage: 850,
    bossAffinity: "Echo",
    bossSpriteName: "sprDragon",
    enemies: [
      { name: "Caustic Bogslium Hulk", hpMultiplier: 42.0, dmgMultiplier: 36.0, affinity: "Elemental", tint: 0x00ffcc, spriteName: "sprBogslium3" },
      { name: "Elite Orc Deadeye", hpMultiplier: 38.0, dmgMultiplier: 44.0, affinity: "Neutral", tint: 0xffffff, spriteName: "sprOrcArcher3" },
      { name: "Phantasm Stalker", hpMultiplier: 45.0, dmgMultiplier: 40.0, affinity: "Echo", tint: 0x99ddff, spriteName: "sprGhost2" }
    ],
    specializations: ["Magnum Alchemist", "Celestial Cartographer", "Grand Artificer"]
  },
  steam: {
    id: "steam",
    order: 8,
    name: "Era of Steam",
    subtitle: "Industrial Revolution & Iron Giants",
    description: "Soot-choked skies hum with steam engines, iron foundries, and machine spirits. Gigantic automatons rule industrial metropolises.",
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
    bossTitle: "Clockwork Apex of the Depths",
    bossHp: 460000,
    bossDamage: 1650,
    bossAffinity: "Architect",
    bossSpriteName: "sprDragon",
    enemies: [
      { name: "Clockwork Goblin Sapper", hpMultiplier: 68.0, dmgMultiplier: 58.0, affinity: "Architect", tint: 0xffffff, spriteName: "sprGoblin3" },
      { name: "Steam Slime Automaton", hpMultiplier: 62.0, dmgMultiplier: 70.0, affinity: "Elemental", tint: 0xcc9944, spriteName: "sprBogslium3" },
      { name: "Steam-Forged Minotaur", hpMultiplier: 78.0, dmgMultiplier: 64.0, affinity: "Architect", tint: 0xddaa55, spriteName: "sprMinotaur3" }
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
    bossTitle: "The Radioactive Reactor Dragon",
    bossHp: 1100000,
    bossDamage: 3400,
    bossAffinity: "Wraithborn",
    bossSpriteName: "sprDragon",
    enemies: [
      { name: "Gamma Batilisk", hpMultiplier: 110.0, dmgMultiplier: 100.0, affinity: "Elemental", tint: 0x39ff14, spriteName: "sprBatilisk3" },
      { name: "Radiation Phantom", hpMultiplier: 100.0, dmgMultiplier: 120.0, affinity: "Echo", tint: 0x00ffaa, spriteName: "sprGhost3" },
      { name: "Atomic Minotaur Juggernaut", hpMultiplier: 135.0, dmgMultiplier: 108.0, affinity: "Architect", tint: 0x55ff55, spriteName: "sprMinotaur3" }
    ],
    specializations: ["Atomic Physicist", "Quantum Manipulator", "Cyber-Vanguard"]
  },
  stars: {
    id: "stars",
    order: 10,
    name: "Era of Stars",
    subtitle: "Far Future & Cosmic Ascendance",
    description: "Humanity reaches the galactic rim, confronting cosmic titans in the ultimate convergence of time and space.",
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
    bossTitle: "Eternal Cosmic Star Dragon",
    bossHp: 3200000,
    bossDamage: 7500,
    bossAffinity: "Echo",
    bossSpriteName: "sprDragon",
    enemies: [
      { name: "Astral Void Ghost", hpMultiplier: 200.0, dmgMultiplier: 180.0, affinity: "Wraithborn", tint: 0xaa66ff, spriteName: "sprGhost3" },
      { name: "Cosmic Grandmaster Monk", hpMultiplier: 220.0, dmgMultiplier: 200.0, affinity: "Architect", tint: 0xffeedd, spriteName: "sprLizardMonk3" },
      { name: "Singularity Minotaur Colossus", hpMultiplier: 240.0, dmgMultiplier: 220.0, affinity: "Echo", tint: 0x9955ee, spriteName: "sprMinotaur3" }
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
