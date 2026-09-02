import { EraInvestigation } from "../types";

export const ERA_INVESTIGATIONS: Record<string, EraInvestigation> = {
  dawn: {
    eraId: "dawn",
    caseTitle: "The Mystery of the Primordial Sparks",
    subtitle: "A Sherlockian Forensic Inquiry into the First Flame",
    sherlockPrologue:
      "Observe, my dear observer, the stratigraphy of these volcanic ashes. One does not simply find crystallized obsidian alongside burnt meteoritic iron without deliberate intelligence at work. Someone—or something—orchestrated the ignition of humanity's primordial fire.",
    eraMysterySummary:
      "Investigate the volcanic obsidian basin, trace the celestial constellation of the Great Bear, and deduce who bestowed the initial spark upon mankind.",
    constellation: {
      name: "Ursa Major (The Great Celestial Bear)",
      starPoints: [
        { x: 120, y: 80, label: "Dubhe (Alpha)", lore: "The pointer star of the primeval compass.", clicked: false },
        { x: 190, y: 130, label: "Merak (Beta)", lore: "Radiates the thermal pulse that ignited tectonic rifts.", clicked: false },
        { x: 260, y: 150, label: "Phecda (Gamma)", lore: "Anchors the cosmic gravity that preserved the early atmosphere.", clicked: false },
        { x: 330, y: 110, label: "Megrez (Delta)", lore: "The pivot node connecting mortal consciousness to the cosmos.", clicked: false },
        { x: 410, y: 140, label: "Alioth (Epsilon)", lore: "The brightest jewel guiding primordial shamans across ice sheets.", clicked: false }
      ]
    },
    clues: [
      {
        id: "clue_volcanic_ash",
        title: "Vitrified Volcanic Basalt",
        description: "Examination with a 10x magnifying loupe reveals melted meteoric iridium embedded inside natural obsidian.",
        icon: "🔬",
        xPercent: 22,
        yPercent: 68,
        uncovered: false,
        historicalSecret: "The first tools were forged from cosmic meteorites that crash-landed during the Great Tectonic Fracture.",
        rewardEnergy: 100,
        rewardSoulGems: 2
      },
      {
        id: "clue_cave_glyph",
        title: "Cave Wall Luminescent Pigment",
        description: "Bioluminescent ochre pigment depicting a winged figure descending to kindle the tribe's hearth.",
        icon: "🎨",
        xPercent: 78,
        yPercent: 42,
        uncovered: false,
        historicalSecret: "Early humans documented the Arc Angel descending in the night sky to gift the gift of spiritual Chi.",
        rewardEnergy: 120,
        rewardSoulGems: 2
      },
      {
        id: "clue_calcified_bone",
        title: "Carved Shaman Flute",
        description: "A mammoth bone drilled with 7 harmonic acoustic holes tuned precisely to ancient frequencies.",
        icon: "🦴",
        xPercent: 52,
        yPercent: 82,
        uncovered: false,
        historicalSecret: "Shamans used harmonic resonance to awaken spiritual Chi and channel animal transformations.",
        rewardEnergy: 150,
        rewardSoulGems: 3
      }
    ],
    deduction: {
      question: "Elementary, my friend: What truly ignited the dawn of human civilization and awakened our spiritual Chi?",
      options: [
        {
          text: "A celestial cosmic entity gifted the flame of conscious Chi, preserving humanity from the ice age.",
          isCorrect: true,
          explanation: "Correct! The vitrified iridium and sacred winged cave murals prove divine intervention."
        },
        {
          text: "Random lightning strikes alone created civilization without any spiritual catalyst.",
          isCorrect: false,
          explanation: "Incompatible with the harmonic mammoth flutes and alien meteoric alloys discovered in the strata."
        },
        {
          text: "Ancient humans evolved without ever interacting with celestial forces.",
          isCorrect: false,
          explanation: "The celestial alignment of Ursa Major directly corresponds with ancient ritual altars."
        }
      ],
      solved: false
    },
    completed: false,
    masteryReward: "+15% Permanent Chi Generation & Ancient Shaman Insight"
  },
  bronze: {
    eraId: "bronze",
    caseTitle: "The Fall of the Sun King's Colossus",
    subtitle: "A Classical Tragedy of Orichalcum & Treason",
    sherlockPrologue:
      "When a bronze empire crumbles in a single solstice, it is never mere decay. Look at the bevel on these fallen colossus joints—they were cut with precision diamond chisels from within the inner sanctum.",
    eraMysterySummary:
      "Inspect the Mediterranean temple ruins, examine the constellations of the Zodiac, and uncover the secret alloy behind the immortal automaton army.",
    constellation: {
      name: "Orion (The Celestial Hunter)",
      starPoints: [
        { x: 150, y: 60, label: "Betelgeuse", lore: "Red supergiant pulsing with ancestral warrior wrath.", clicked: false },
        { x: 270, y: 180, label: "Rigel", lore: "Blue-white star that illuminated Mediterranean triremes.", clicked: false },
        { x: 200, y: 110, label: "Alnitak (Belt)", lore: "Aligns directly with the apex of the Sun King's pyramid.", clicked: false },
        { x: 220, y: 120, label: "Alnilam (Belt)", lore: "Channels celestial solar power into Orichalcum alloys.", clicked: false },
        { x: 240, y: 130, label: "Mintaka (Belt)", lore: "The celestial gate through which the Valkyries descend.", clicked: false }
      ]
    },
    clues: [
      {
        id: "clue_orichalcum_seal",
        title: "Broken Emperor's Seal",
        description: "A disc of pure Orichalcum stamped with the symbol of the Winged Seraph.",
        icon: "👑",
        xPercent: 30,
        yPercent: 70,
        uncovered: false,
        historicalSecret: "The Bronze Kings channeled Arc Angel Chi into their royal armor, granting inhuman longevity.",
        rewardEnergy: 300,
        rewardSoulGems: 4
      },
      {
        id: "clue_astrolabe_gear",
        title: "Antikythera Celestial Gear",
        description: "Bronze precision gear train calculating solar eclipses and lunar cycles.",
        icon: "⚙️",
        xPercent: 72,
        yPercent: 55,
        uncovered: false,
        historicalSecret: "The Antikythera mechanism predicted the precise moment when the Blood Moon awakens the Werewolf form.",
        rewardEnergy: 350,
        rewardSoulGems: 5
      }
    ],
    deduction: {
      question: "What caused the catastrophic collapse of the Bronze Citadel?",
      options: [
        {
          text: "The High Priests attempted to siphon the Arc Angel's holy power without purifying their spiritual Chi.",
          isCorrect: true,
          explanation: "Indubitably! Overcharging the Orichalcum matrix without spiritual balance ruptured the citadel."
        },
        {
          text: "A simple drought defeated the mightiest army of antiquity.",
          isCorrect: false,
          explanation: "The fractured Orichalcum conduits show signs of a catastrophic spiritual meltdown."
        }
      ],
      solved: false
    },
    completed: false,
    masteryReward: "+20% Attack Damage & Bronze Phalanx Banner"
  },
  steam: {
    eraId: "steam",
    caseTitle: "The Chronometer of Perpetual Momentum",
    subtitle: "Victorian London's Greatest Mechanical Enigma",
    sherlockPrologue:
      "A mystery straight from Baker Street! A master clockmaker in the heart of foggy London has constructed a locomotive that runs without burning a single ounce of coal. The energy signature points to distilled ancestral Chi.",
    eraMysterySummary:
      "Search the smog-shrouded laboratory, study the constellation of Cygnus the Swan, and discover how Victorian inventors harnessed ethereal Chi in brass steam engines.",
    constellation: {
      name: "Cygnus (The Northern Cross)",
      starPoints: [
        { x: 130, y: 90, label: "Deneb", lore: "A beacon radiating high-frequency celestial radio pulses.", clicked: false },
        { x: 230, y: 150, label: "Sadr", lore: "Surrounded by rich emission nebulae of ethereal steam.", clicked: false },
        { x: 310, y: 210, label: "Albireo", lore: "A golden and sapphire double star symbolizing dual energy polarity.", clicked: false }
      ]
    },
    clues: [
      {
        id: "clue_brass_resonator",
        title: "Acoustic Brass Resonator",
        description: "A polished brass cylinder vibrating at harmonic ultrasonic frequencies.",
        icon: "🎷",
        xPercent: 35,
        yPercent: 65,
        uncovered: false,
        historicalSecret: "Industrial engineers converted spiritual Chi waves into mechanical torque through ultrasonic resonance.",
        rewardEnergy: 800,
        rewardSoulGems: 8
      },
      {
        id: "clue_sherlock_pipe",
        title: "Briarwood Meerschaum Pipe & Notes",
        description: "Handwritten detective notes analyzing the chemical makeup of distilled ether.",
        icon: "🔍",
        xPercent: 80,
        yPercent: 50,
        uncovered: false,
        historicalSecret: "Holmes deduced that human thoughts and ancestral memories generate physical electromagnetic force.",
        rewardEnergy: 900,
        rewardSoulGems: 10
      }
    ],
    deduction: {
      question: "How did the Victorian Overclock Engine achieve perpetual motion?",
      options: [
        {
          text: "It tapped directly into the collective ancestral memory field using Chi resonance.",
          isCorrect: true,
          explanation: "Brilliant deduction! The harmonic resonator bridges the physical engine with spiritual Chi."
        },
        {
          text: "It used ordinary coal hidden inside a hollow chamber.",
          isCorrect: false,
          explanation: "There is zero carbon residue; the energy output is purely ethereal Chi."
        }
      ],
      solved: false
    },
    completed: false,
    masteryReward: "+30% Overclock Generator Speed & Master Detective Loupe"
  }
};
