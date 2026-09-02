import { AncestralMemory } from "../types";

export const ANCESTRAL_MEMORIES: AncestralMemory[] = [
  // Era of Dawn
  {
    id: "mem_dawn_1",
    name: "Memory of the First Breath",
    era: "dawn",
    description: "+15% Max Health and unlocks innate health regeneration.",
    loreSnippet: "You recall the sensation of breathing pure primordial oxygen as molten continents cooled beneath proto-human soles.",
    cost: { eraEnergy: 50, echoFragments: 2 },
    requiredHeroLevel: 1,
    unlocked: false,
    bonus: { hpPercent: 15 }
  },
  {
    id: "mem_dawn_2",
    name: "Memory of the Titan Shards",
    era: "dawn",
    description: "+20% Base Damage against elemental beings.",
    loreSnippet: "The titanic fractures embedded obsidian crystals into human sinew, granting raw tectonic striking power.",
    cost: { eraEnergy: 120, echoFragments: 4 },
    requiredHeroLevel: 3,
    unlocked: false,
    bonus: { damagePercent: 20 }
  },
  {
    id: "mem_dawn_3",
    name: "Primordial Chaos Resonance",
    era: "dawn",
    description: "+5% Critical Strike Chance across all attacks.",
    loreSnippet: "Attuning to the formless entropy of the universe before the Architects laid the cosmic foundations.",
    cost: { eraEnergy: 200, echoFragments: 6 },
    requiredHeroLevel: 5,
    unlocked: false,
    bonus: { critRate: 5 }
  },
  {
    id: "mem_dawn_4",
    name: "Skill: Genesis Quake",
    era: "dawn",
    description: "Unlocks the active ability Genesis Quake (Deals 220% tectonic AoE damage).",
    loreSnippet: "Stamping the primeval earth to summon shockwaves of newborn crust.",
    cost: { eraEnergy: 300, echoFragments: 10 },
    requiredHeroLevel: 6,
    unlocked: false,
    bonus: { abilityUnlock: "genesis_quake" }
  },

  // Era of Fire
  {
    id: "mem_fire_1",
    name: "First Hearth Rite",
    era: "fire",
    description: "+25% Era-Energy Generation speed.",
    loreSnippet: "The warmth of the first campfire held back the beasts of the ancient night, fostering the dawn of human contemplation.",
    cost: { eraEnergy: 400, echoFragments: 8 },
    requiredHeroLevel: 7,
    unlocked: false,
    bonus: { energyGenMultiplier: 1.25 }
  },
  {
    id: "mem_fire_2",
    name: "Memory of Ember Sinew",
    era: "fire",
    description: "+25% Attack Damage with fiery strikes.",
    loreSnippet: "Binding embers to skin and blade turned simple flint spears into instruments of conquest over ice-age predators.",
    cost: { eraEnergy: 650, echoFragments: 12 },
    requiredHeroLevel: 9,
    unlocked: false,
    bonus: { damagePercent: 25 }
  },
  {
    id: "mem_fire_3",
    name: "Nomad's Resilience",
    era: "fire",
    description: "+20% Armor and Defense rating.",
    loreSnippet: "Tough pelt layers and hardened clay shields preserved the tribe across thousands of leagues of tundra.",
    cost: { eraEnergy: 900, echoFragments: 15 },
    requiredHeroLevel: 11,
    unlocked: false,
    bonus: { defensePercent: 20 }
  },
  {
    id: "mem_fire_4",
    name: "Skill: Pyre of Ancestors",
    era: "fire",
    description: "Unlocks the active ability Pyre of Ancestors (Deals 280% Fire Burn + Haste buff).",
    loreSnippet: "Invoking the spirit spirits of departed chieftains into a whirlwind of sacred flame.",
    cost: { eraEnergy: 1200, echoFragments: 20 },
    requiredHeroLevel: 13,
    unlocked: false,
    bonus: { abilityUnlock: "pyre_ancestors" }
  },

  // Era of Stone
  {
    id: "mem_stone_1",
    name: "Memory of the Megalith",
    era: "stone",
    description: "+35% Maximum Health.",
    loreSnippet: "Aligning heavy dolmens and menhirs with the solstice constellations, anchoring cosmic mass into the hero's body.",
    cost: { eraEnergy: 1500, echoFragments: 18 },
    requiredHeroLevel: 15,
    unlocked: false,
    bonus: { hpPercent: 35 }
  },
  {
    id: "mem_stone_2",
    name: "Runic Carving Lore",
    era: "stone",
    description: "+30% Faster Equipment Crafting & Infusion.",
    loreSnippet: "Inscribing protective spirals and hunting glyphs directly upon polished granite war hammers.",
    cost: { eraEnergy: 2200, echoFragments: 24 },
    requiredHeroLevel: 17,
    unlocked: false,
    bonus: { autoCraftSpeed: 1.3 }
  },
  {
    id: "mem_stone_3",
    name: "Clan Bloodline Vow",
    era: "stone",
    description: "+30% Physical Damage bonus.",
    loreSnippet: "Generations of warriors standing shoulder to shoulder at the barricades of the first fortress valleys.",
    cost: { eraEnergy: 3000, echoFragments: 30 },
    requiredHeroLevel: 19,
    unlocked: false,
    bonus: { damagePercent: 30 }
  },
  {
    id: "mem_stone_4",
    name: "Skill: Obsidian Spike",
    era: "stone",
    description: "Unlocks Obsidian Spike (Pierces enemy defense for 340% damage and stuns).",
    loreSnippet: "Summoning volcanic glass pillars erupted from the bedrock.",
    cost: { eraEnergy: 4000, echoFragments: 40 },
    requiredHeroLevel: 21,
    unlocked: false,
    bonus: { abilityUnlock: "obsidian_spike" }
  },

  // Era of Bronze
  {
    id: "mem_bronze_1",
    name: "Smelting of Orichalcum",
    era: "bronze",
    description: "+40% Era-Energy and Material generation rates.",
    loreSnippet: "Bellows roared in the city-state forges as copper and tin were wedded to mythical gold.",
    cost: { eraEnergy: 5500, echoFragments: 35 },
    requiredHeroLevel: 23,
    unlocked: false,
    bonus: { energyGenMultiplier: 1.4 }
  },
  {
    id: "mem_bronze_2",
    name: "The Heroic Epos",
    era: "bronze",
    description: "+8% Critical Strike Chance and +25% Critical Damage.",
    loreSnippet: "Bards recited the deeds of demigods whose shields held off armies at the ocean gates.",
    cost: { eraEnergy: 7500, echoFragments: 45 },
    requiredHeroLevel: 26,
    unlocked: false,
    bonus: { critRate: 8 }
  },
  {
    id: "mem_bronze_3",
    name: "Phalanx Discipline",
    era: "bronze",
    description: "+40% Defense Rating and Knockback Immunity.",
    loreSnippet: "Interlocking hoplon shields and bronze greaves forged an unbreakable living wall.",
    cost: { eraEnergy: 10000, echoFragments: 55 },
    requiredHeroLevel: 28,
    unlocked: false,
    bonus: { defensePercent: 40 }
  },
  {
    id: "mem_bronze_4",
    name: "Skill: Sun God's Spear",
    era: "bronze",
    description: "Unlocks Sun God's Spear (Calls down solar orichalcum bolts for 420% damage).",
    loreSnippet: "Channelling the golden chariot across the dome of the sky into a piercing spear of light.",
    cost: { eraEnergy: 14000, echoFragments: 70 },
    requiredHeroLevel: 30,
    unlocked: false,
    bonus: { abilityUnlock: "sun_god_spear" }
  },

  // Era of Iron
  {
    id: "mem_iron_1",
    name: "Memory of Imperial Standard",
    era: "iron",
    description: "+50% Hero Damage across all combat.",
    loreSnippet: "The golden eagle hoisted above miles of marching legions trembling the known earth.",
    cost: { eraEnergy: 18000, echoFragments: 60 },
    requiredHeroLevel: 33,
    unlocked: false,
    bonus: { damagePercent: 50 }
  },
  {
    id: "mem_iron_2",
    name: "Damascus Folded Blade Secret",
    era: "iron",
    description: "+12% Critical Strike Chance.",
    loreSnippet: "Carbon and iron layered a thousand times to create wavy steel patterns that could slice through granite.",
    cost: { eraEnergy: 24000, echoFragments: 80 },
    requiredHeroLevel: 36,
    unlocked: false,
    bonus: { critRate: 12 }
  },
  {
    id: "mem_iron_3",
    name: "Imperial Pax Fortress",
    era: "iron",
    description: "+50% Max HP and +30% Armor.",
    loreSnippet: "Frontier walls stretching from sea to mountain, garrisoned by immortal legionnaire souls.",
    cost: { eraEnergy: 32000, echoFragments: 100 },
    requiredHeroLevel: 39,
    unlocked: false,
    bonus: { hpPercent: 50, defensePercent: 30 }
  },
  {
    id: "mem_iron_4",
    name: "Skill: Imperial Decree",
    era: "iron",
    description: "Unlocks Imperial Decree (Commands ethereal iron ballistas dealing 520% damage).",
    loreSnippet: "A singular command echoed across a thousand ballista crews.",
    cost: { eraEnergy: 42000, echoFragments: 130 },
    requiredHeroLevel: 41,
    unlocked: false,
    bonus: { abilityUnlock: "imperial_decree" }
  },

  // Era of Faith
  {
    id: "mem_faith_1",
    name: "Holy Reliquary Communion",
    era: "faith",
    description: "+60% Era-Energy Generation & +20% HP Regeneration.",
    loreSnippet: "Splinters of true crosses and halos of ascetic saints gleaming in gothic alcoves.",
    cost: { eraEnergy: 55000, echoFragments: 120 },
    requiredHeroLevel: 44,
    unlocked: false,
    bonus: { energyGenMultiplier: 1.6 }
  },
  {
    id: "mem_faith_2",
    name: "Sanctified Blade Blessing",
    era: "faith",
    description: "+65% Holy Damage bonus.",
    loreSnippet: "Anointing broadswords with holy water and sacred chrism before stepping into darkened crypts.",
    cost: { eraEnergy: 75000, echoFragments: 160 },
    requiredHeroLevel: 47,
    unlocked: false,
    bonus: { damagePercent: 65 }
  },
  {
    id: "mem_faith_3",
    name: "Martyr's Indomitable Spirit",
    era: "faith",
    description: "+70% Maximum Health and Divine Ward.",
    loreSnippet: "The flesh may burn, but the soul remains eternal in the presence of celestial choirs.",
    cost: { eraEnergy: 95000, echoFragments: 200 },
    requiredHeroLevel: 50,
    unlocked: false,
    bonus: { hpPercent: 70 }
  },
  {
    id: "mem_faith_4",
    name: "Skill: Heavenly Wrath",
    era: "faith",
    description: "Unlocks Heavenly Wrath (Unleashes a descending pillar of light for 650% Holy damage).",
    loreSnippet: "The heavens tear open to cast judgement upon corrupted horrors.",
    cost: { eraEnergy: 120000, echoFragments: 250 },
    requiredHeroLevel: 53,
    unlocked: false,
    bonus: { abilityUnlock: "heavenly_wrath" }
  },

  // Era of Discovery
  {
    id: "mem_discovery_1",
    name: "The Alchemical Magnum Opus",
    era: "discovery",
    description: "+80% Damage and +50% Material Crafting Speed.",
    loreSnippet: "Transmuting lead into radiant gold, and mortal flesh into immortal quicksilver essence.",
    cost: { eraEnergy: 150000, echoFragments: 220 },
    requiredHeroLevel: 56,
    unlocked: false,
    bonus: { damagePercent: 80, autoCraftSpeed: 1.5 }
  },
  {
    id: "mem_discovery_2",
    name: "Heliocentric Epiphany",
    era: "discovery",
    description: "+15% Critical Chance & +50% Critical Damage.",
    loreSnippet: "The earth is no longer the immovable center; the hero maneuvers with the orbit of planets.",
    cost: { eraEnergy: 200000, echoFragments: 280 },
    requiredHeroLevel: 59,
    unlocked: false,
    bonus: { critRate: 15 }
  },
  {
    id: "mem_discovery_3",
    name: "Cartographer of the Infinite Void",
    era: "discovery",
    description: "+80% Era-Energy Generation rate.",
    loreSnippet: "Unfurling star charts that chart pathways beyond terrestrial horizons.",
    cost: { eraEnergy: 260000, echoFragments: 350 },
    requiredHeroLevel: 62,
    unlocked: false,
    bonus: { energyGenMultiplier: 1.8 }
  },
  {
    id: "mem_discovery_4",
    name: "Skill: Transmutation Beam",
    era: "discovery",
    description: "Unlocks Transmutation Beam (Fires concentrated alchemical ray for 780% damage).",
    loreSnippet: "Focusing lenses and quicksilver mirrors to dissolve molecular bonds instantly.",
    cost: { eraEnergy: 340000, echoFragments: 420 },
    requiredHeroLevel: 65,
    unlocked: false,
    bonus: { abilityUnlock: "transmutation_beam" }
  },

  // Era of Steam
  {
    id: "mem_steam_1",
    name: "Memory of the Overclock Boiler",
    era: "steam",
    description: "+100% Attack Speed and +50% Damage.",
    loreSnippet: "Injecting superheated pressurized steam into mechanical pistons and limb servos.",
    cost: { eraEnergy: 420000, echoFragments: 400 },
    requiredHeroLevel: 68,
    unlocked: false,
    bonus: { damagePercent: 100 }
  },
  {
    id: "mem_steam_2",
    name: "Iron Giant Automaton Skein",
    era: "steam",
    description: "+100% Max HP and +60% Armor.",
    loreSnippet: "Bolted boiler plate and pneumatic dampening coils shielding against catastrophic kinetic impacts.",
    cost: { eraEnergy: 550000, echoFragments: 500 },
    requiredHeroLevel: 71,
    unlocked: false,
    bonus: { hpPercent: 100, defensePercent: 60 }
  },
  {
    id: "mem_steam_3",
    name: "Perpetual Motion Machine",
    era: "steam",
    description: "+100% Era-Energy and Material generation rates.",
    loreSnippet: "A closed thermodynamics loop humming softly with infinite mechanical torque.",
    cost: { eraEnergy: 700000, echoFragments: 620 },
    requiredHeroLevel: 74,
    unlocked: false,
    bonus: { energyGenMultiplier: 2.0 }
  },
  {
    id: "mem_steam_4",
    name: "Skill: Steam Barrage",
    era: "steam",
    description: "Unlocks Steam Barrage (Fires high-speed pneumatic iron volleys for 950% damage).",
    loreSnippet: "Discharging triple-cylinder steam cannons in a deafening sonic roar.",
    cost: { eraEnergy: 900000, echoFragments: 750 },
    requiredHeroLevel: 77,
    unlocked: false,
    bonus: { abilityUnlock: "steam_barrage" }
  },

  // Era of Atom
  {
    id: "mem_atom_1",
    name: "Memory of the Split Nucleus",
    era: "atom",
    description: "+140% Damage and +20% Critical Chance.",
    loreSnippet: "Witnessing the fission of heavy isotopes, unleashing the primal fire of stars on earth.",
    cost: { eraEnergy: 1200000, echoFragments: 850 },
    requiredHeroLevel: 80,
    unlocked: false,
    bonus: { damagePercent: 140, critRate: 20 }
  },
  {
    id: "mem_atom_2",
    name: "Quantum Superposition Step",
    era: "atom",
    description: "+120% Max HP and 20% Chance to completely phase through enemy attacks.",
    loreSnippet: "Existing simultaneously across two probable positions in spacetime.",
    cost: { eraEnergy: 1600000, echoFragments: 1000 },
    requiredHeroLevel: 83,
    unlocked: false,
    bonus: { hpPercent: 120 }
  },
  {
    id: "mem_atom_3",
    name: "Fusion Core Cascade",
    era: "atom",
    description: "+150% Era-Energy Generation rate.",
    loreSnippet: "Magnetic bottles holding miniature suns in magnetic levitation fields.",
    cost: { eraEnergy: 2100000, echoFragments: 1200 },
    requiredHeroLevel: 86,
    unlocked: false,
    bonus: { energyGenMultiplier: 2.5 }
  },
  {
    id: "mem_atom_4",
    name: "Skill: Nuclear Fission Blast",
    era: "atom",
    description: "Unlocks Nuclear Fission Blast (Detonates localized sub-atomic explosion for 1250% damage).",
    loreSnippet: "Collapsing matter into pure radiant gamma energy that vaporizes enemy armors.",
    cost: { eraEnergy: 2800000, echoFragments: 1500 },
    requiredHeroLevel: 89,
    unlocked: false,
    bonus: { abilityUnlock: "nuclear_fission" }
  },

  // Era of Stars
  {
    id: "mem_stars_1",
    name: "Memory of the Dyson Horizon",
    era: "stars",
    description: "+200% Damage and +200% Max HP.",
    loreSnippet: "Encapsulating stars to feed cosmic megastructures with absolute power.",
    cost: { eraEnergy: 3500000, echoFragments: 2000 },
    requiredHeroLevel: 92,
    unlocked: false,
    bonus: { damagePercent: 200, hpPercent: 200 }
  },
  {
    id: "mem_stars_2",
    name: "Dark Matter Infusion",
    era: "stars",
    description: "+30% Critical Strike Chance and +100% Critical Damage.",
    loreSnippet: "Weaving invisible cosmic filament webs into the hero's striking vectors.",
    cost: { eraEnergy: 4500000, echoFragments: 2500 },
    requiredHeroLevel: 95,
    unlocked: false,
    bonus: { critRate: 30 }
  },
  {
    id: "mem_stars_3",
    name: "Omnipresent Cosmic Echo",
    era: "stars",
    description: "+300% Era-Energy Generation rate.",
    loreSnippet: "Memories across all 10 eras harmonizing simultaneously into an eternal loop.",
    cost: { eraEnergy: 6000000, echoFragments: 3200 },
    requiredHeroLevel: 98,
    unlocked: false,
    bonus: { energyGenMultiplier: 4.0 }
  },
  {
    id: "mem_stars_4",
    name: "Skill: Supernova Singularity",
    era: "stars",
    description: "Unlocks Supernova Singularity (Collapses a stellar core dealing 2000% Cosmic damage).",
    loreSnippet: "Bending spacetime itself to swallow the enemy in a blazing cosmic vortex.",
    cost: { eraEnergy: 8000000, echoFragments: 4000 },
    requiredHeroLevel: 100,
    unlocked: false,
    bonus: { abilityUnlock: "supernova_singularity" }
  }
];
