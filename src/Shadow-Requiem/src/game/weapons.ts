import { GearItem, WeaponType, Faction, SkeletalPose, AttackFrame } from './types';

// Stance base poses
export const BASE_IDLE_POSE: SkeletalPose = {
  pelvis: { x: 0, y: 0, angle: 0 },
  torso: { angle: 0.08 },
  head: { angle: -0.04 },
  leftUpperArm: { angle: 0.6 },
  leftForearm: { angle: 1.2 },
  rightUpperArm: { angle: -0.4 },
  rightForearm: { angle: 0.9 },
  leftThigh: { angle: 0.2 },
  leftShin: { angle: -0.3 },
  rightThigh: { angle: -0.35 },
  rightShin: { angle: 0.4 },
  weaponAngle: -0.3,
  weaponOffsetX: 25,
  weaponOffsetY: -10,
};

export const CROUCH_POSE: SkeletalPose = {
  pelvis: { x: 0, y: 22, angle: 0.1 },
  torso: { angle: 0.4 },
  head: { angle: -0.1 },
  leftUpperArm: { angle: 0.8 },
  leftForearm: { angle: 1.4 },
  rightUpperArm: { angle: -0.2 },
  rightForearm: { angle: 1.1 },
  leftThigh: { angle: 1.1 },
  leftShin: { angle: -1.3 },
  rightThigh: { angle: 0.8 },
  rightShin: { angle: -1.0 },
  weaponAngle: 0.4,
  weaponOffsetX: 20,
  weaponOffsetY: 10,
};

export const BLOCK_POSE: SkeletalPose = {
  pelvis: { x: -8, y: 4, angle: -0.05 },
  torso: { angle: -0.15 },
  head: { angle: -0.05 },
  leftUpperArm: { angle: 0.9 },
  leftForearm: { angle: 1.6 },
  rightUpperArm: { angle: 0.4 },
  rightForearm: { angle: 1.8 },
  leftThigh: { angle: -0.2 },
  leftShin: { angle: 0.3 },
  rightThigh: { angle: -0.5 },
  rightShin: { angle: 0.5 },
  weaponAngle: -1.4,
  weaponOffsetX: 18,
  weaponOffsetY: -24,
};

export const HIT_LIGHT_POSE: SkeletalPose = {
  pelvis: { x: -14, y: 0, angle: -0.2 },
  torso: { angle: -0.4 },
  head: { angle: -0.6 },
  leftUpperArm: { angle: -0.4 },
  leftForearm: { angle: 0.5 },
  rightUpperArm: { angle: -0.7 },
  rightForearm: { angle: 0.4 },
  leftThigh: { angle: -0.5 },
  leftShin: { angle: 0.6 },
  rightThigh: { angle: 0.1 },
  rightShin: { angle: 0.2 },
  weaponAngle: -0.8,
  weaponOffsetX: 15,
  weaponOffsetY: -5,
};

export const KNOCKDOWN_POSE: SkeletalPose = {
  pelvis: { x: -45, y: 46, angle: -1.5 },
  torso: { angle: -1.4 },
  head: { angle: -1.3 },
  leftUpperArm: { angle: -1.8 },
  leftForearm: { angle: -0.2 },
  rightUpperArm: { angle: -1.2 },
  rightForearm: { angle: -0.3 },
  leftThigh: { angle: -1.1 },
  leftShin: { angle: 0.2 },
  rightThigh: { angle: -1.5 },
  rightShin: { angle: 0.5 },
  weaponAngle: -2.1,
  weaponOffsetX: -20,
  weaponOffsetY: 40,
};

// Attack motion sequences generator with hitboxes and timings
export function generateKatanaMoveSet(): {
  neutralCombo: AttackFrame[][];
  forwardAttack: AttackFrame[];
  upAttack: AttackFrame[];
  downAttack: AttackFrame[];
  heavyAttack: AttackFrame[];
  shadowAbility: AttackFrame[];
} {
  // Neutral combo 1: Horizontal swift draw slash
  const combo1: AttackFrame[] = [
    {
      progress: 0.2,
      pose: { ...BASE_IDLE_POSE, rightUpperArm: { angle: -1.2 }, rightForearm: { angle: 0.3 }, weaponAngle: -1.8, weaponOffsetX: -10, weaponOffsetY: -15 },
      isHitboxActive: false,
    },
    {
      progress: 0.5,
      pose: { ...BASE_IDLE_POSE, rightUpperArm: { angle: 0.8 }, rightForearm: { angle: 1.2 }, weaponAngle: 1.2, weaponOffsetX: 65, weaponOffsetY: -12, torso: { angle: 0.3 } },
      isHitboxActive: true,
      damageMultiplier: 1.0,
      hitBoxOffset: { x: 65, y: -20, r: 42 },
      canCombo: true,
    },
    {
      progress: 0.9,
      pose: { ...BASE_IDLE_POSE, rightUpperArm: { angle: 0.4 }, rightForearm: { angle: 0.9 }, weaponAngle: 0.6, weaponOffsetX: 45, weaponOffsetY: -8 },
      isHitboxActive: false,
      canCombo: true,
    },
  ];

  // Neutral combo 2: Diagonal rising slash
  const combo2: AttackFrame[] = [
    {
      progress: 0.2,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 10, y: 0, angle: 0 }, rightUpperArm: { angle: -0.8 }, rightForearm: { angle: 0.2 }, weaponAngle: 0.9, weaponOffsetX: 20, weaponOffsetY: 20 },
      isHitboxActive: false,
    },
    {
      progress: 0.55,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 22, y: -4, angle: 0.1 }, rightUpperArm: { angle: -1.6 }, rightForearm: { angle: 1.4 }, weaponAngle: -1.5, weaponOffsetX: 70, weaponOffsetY: -55, torso: { angle: -0.2 } },
      isHitboxActive: true,
      damageMultiplier: 1.2,
      hitBoxOffset: { x: 70, y: -45, r: 46 },
      canCombo: true,
    },
    {
      progress: 0.9,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 15, y: 0, angle: 0 }, rightUpperArm: { angle: -0.6 }, rightForearm: { angle: 0.8 }, weaponAngle: -0.8, weaponOffsetX: 40, weaponOffsetY: -25 },
      isHitboxActive: false,
    },
  ];

  // Neutral combo 3: Spinning whirlwind finisher
  const combo3: AttackFrame[] = [
    {
      progress: 0.25,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 25, y: -10, angle: 0.2 }, torso: { angle: -0.4 }, rightUpperArm: { angle: -1.8 }, weaponAngle: -2.2, weaponOffsetX: -15, weaponOffsetY: -30 },
      isHitboxActive: false,
    },
    {
      progress: 0.6,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 38, y: -5, angle: 0.3 }, torso: { angle: 0.5 }, rightUpperArm: { angle: 1.4 }, weaponAngle: 1.8, weaponOffsetX: 85, weaponOffsetY: -25 },
      isHitboxActive: true,
      damageMultiplier: 1.6,
      hitBoxOffset: { x: 85, y: -25, r: 52 },
    },
    {
      progress: 0.95,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 25, y: 0, angle: 0 }, torso: { angle: 0.1 }, rightUpperArm: { angle: 0.2 }, weaponAngle: 0.2, weaponOffsetX: 35, weaponOffsetY: -10 },
      isHitboxActive: false,
    },
  ];

  // Forward Attack: Lunging Thrust (Iaido Flash Step)
  const forwardAttack: AttackFrame[] = [
    {
      progress: 0.2,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: -10, y: 8, angle: -0.1 }, torso: { angle: 0.3 }, rightUpperArm: { angle: -0.5 }, weaponAngle: 0, weaponOffsetX: 10, weaponOffsetY: -10 },
      isHitboxActive: false,
    },
    {
      progress: 0.5,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 55, y: 4, angle: 0.2 }, torso: { angle: 0.5 }, rightUpperArm: { angle: 0.2 }, rightForearm: { angle: 0.1 }, weaponAngle: 0.05, weaponOffsetX: 95, weaponOffsetY: -22 },
      isHitboxActive: true,
      damageMultiplier: 1.4,
      hitBoxOffset: { x: 95, y: -22, r: 40 },
    },
    {
      progress: 0.85,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 30, y: 0, angle: 0.1 }, torso: { angle: 0.2 }, weaponOffsetX: 50, weaponOffsetY: -15, weaponAngle: -0.2 },
      isHitboxActive: false,
    },
  ];

  // Up Attack: Rising Sky Piercer
  const upAttack: AttackFrame[] = [
    {
      progress: 0.25,
      pose: { ...CROUCH_POSE, rightUpperArm: { angle: 0.6 }, weaponAngle: 1.2, weaponOffsetX: 15, weaponOffsetY: 25 },
      isHitboxActive: false,
    },
    {
      progress: 0.55,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 15, y: -28, angle: -0.1 }, torso: { angle: -0.3 }, rightUpperArm: { angle: -2.4 }, rightForearm: { angle: 0.2 }, weaponAngle: -1.7, weaponOffsetX: 55, weaponOffsetY: -80 },
      isHitboxActive: true,
      damageMultiplier: 1.35,
      hitBoxOffset: { x: 55, y: -75, r: 48 },
    },
    {
      progress: 0.9,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 10, y: -4, angle: 0 }, rightUpperArm: { angle: -1.2 }, weaponAngle: -0.8, weaponOffsetX: 30, weaponOffsetY: -35 },
      isHitboxActive: false,
    },
  ];

  // Down Attack: Low Ankle Sweep
  const downAttack: AttackFrame[] = [
    {
      progress: 0.25,
      pose: { ...CROUCH_POSE, pelvis: { x: 5, y: 26, angle: 0.2 }, weaponAngle: 0.4, weaponOffsetX: 10, weaponOffsetY: 30 },
      isHitboxActive: false,
    },
    {
      progress: 0.55,
      pose: { ...CROUCH_POSE, pelvis: { x: 40, y: 30, angle: 0.3 }, rightUpperArm: { angle: 1.2 }, rightForearm: { angle: 0.2 }, weaponAngle: 0.9, weaponOffsetX: 80, weaponOffsetY: 40 },
      isHitboxActive: true,
      damageMultiplier: 1.15,
      hitBoxOffset: { x: 80, y: 40, r: 38 },
    },
    {
      progress: 0.88,
      pose: { ...CROUCH_POSE, pelvis: { x: 20, y: 22, angle: 0.1 }, weaponOffsetX: 35, weaponOffsetY: 20, weaponAngle: 0.2 },
      isHitboxActive: false,
    },
  ];

  // Heavy Attack: Judgement Slash (Charged breaker with unbreakable frames)
  const heavyAttack: AttackFrame[] = [
    {
      progress: 0.3,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: -20, y: 10, angle: -0.2 }, torso: { angle: -0.4 }, rightUpperArm: { angle: -2.2 }, rightForearm: { angle: 1.2 }, weaponAngle: -2.4, weaponOffsetX: -30, weaponOffsetY: -45 },
      isHitboxActive: false,
      unbreakable: true,
    },
    {
      progress: 0.65,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 50, y: 4, angle: 0.3 }, torso: { angle: 0.6 }, rightUpperArm: { angle: 1.2 }, rightForearm: { angle: 0.4 }, weaponAngle: 1.4, weaponOffsetX: 95, weaponOffsetY: 5 },
      isHitboxActive: true,
      damageMultiplier: 2.2,
      hitBoxOffset: { x: 95, y: 5, r: 56 },
      unbreakable: true,
    },
    {
      progress: 0.95,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 25, y: 0, angle: 0 }, torso: { angle: 0.2 }, weaponOffsetX: 45, weaponOffsetY: -5, weaponAngle: 0.5 },
      isHitboxActive: false,
    },
  ];

  // Shadow Ability: Abyssal Rift Execution (Teleport blade burst)
  const shadowAbility: AttackFrame[] = [
    {
      progress: 0.2,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: -10, y: -15, angle: 0 }, torso: { angle: -0.2 }, rightUpperArm: { angle: -1.9 }, weaponAngle: -2.4, weaponOffsetX: 10, weaponOffsetY: -50 },
      isHitboxActive: false,
    },
    {
      progress: 0.45,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 75, y: -20, angle: 0.4 }, torso: { angle: 0.5 }, rightUpperArm: { angle: 0.8 }, weaponAngle: 1.3, weaponOffsetX: 120, weaponOffsetY: -20 },
      isHitboxActive: true,
      damageMultiplier: 3.2,
      hitBoxOffset: { x: 120, y: -20, r: 70 },
    },
    {
      progress: 0.7,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 110, y: 0, angle: 0.2 }, torso: { angle: -0.3 }, rightUpperArm: { angle: -1.2 }, weaponAngle: -1.1, weaponOffsetX: 70, weaponOffsetY: -40 },
      isHitboxActive: true,
      damageMultiplier: 1.8,
      hitBoxOffset: { x: 70, y: -40, r: 60 },
    },
    {
      progress: 0.98,
      pose: { ...BASE_IDLE_POSE, pelvis: { x: 45, y: 0, angle: 0 }, torso: { angle: 0 }, weaponOffsetX: 35, weaponOffsetY: -15, weaponAngle: -0.3 },
      isHitboxActive: false,
    },
  ];

  return {
    neutralCombo: [combo1, combo2, combo3],
    forwardAttack,
    upAttack,
    downAttack,
    heavyAttack,
    shadowAbility,
  };
}

// Greatsword (Legion - heavy poise, massive reach and cleaves)
export function generateGreatswordMoveSet() {
  const katanaMoves = generateKatanaMoveSet();
  // Greatsword has longer range and unbreakable charge
  const heavyMoves = { ...katanaMoves };
  heavyMoves.heavyAttack[1].damageMultiplier = 2.6;
  heavyMoves.heavyAttack[1].hitBoxOffset = { x: 115, y: 0, r: 68 };
  return heavyMoves;
}

// Full weapon catalog with stats and dark fantasy lore
export const WEAPON_CATALOG: GearItem[] = [
  {
    id: 'w_katana_void',
    name: 'Void Piercer Katana',
    slot: 'weapon',
    rarity: 'legendary',
    faction: 'heralds',
    weaponType: 'katana',
    level: 5,
    basePower: 380,
    attackBonus: 145,
    critChance: 0.26,
    shadowBonus: 95,
    description: 'Forged from solidified shadow rift crystals. Slashes warp spacetime.',
    lore: 'Carried by the High Shadow Arbiter who sealed the Celestial Gate.',
    colorScheme: {
      primary: '#1e1b4b',
      secondary: '#818cf8',
      glow: '#a855f7',
    },
    perks: ['perk_crit_damage', 'perk_shadow_generation'],
    iconName: 'Sword',
    spriteUrl: '/assets/weapons/items/sword_36.png',
    sprite32Url: '/assets/weapons/items/sword_36_32.png',
    swordIndex: 36,
    hiltOffset: [4.9, 89.3],
    tipOffset: [90.7, 4.3],
  },
  {
    id: 'w_claymore_ironclad',
    name: 'Bastion Colossus Claymore',
    slot: 'weapon',
    rarity: 'mythic',
    faction: 'legion',
    weaponType: 'greatsword',
    level: 7,
    basePower: 450,
    attackBonus: 190,
    defenseBonus: 60,
    critChance: 0.14,
    shadowBonus: 60,
    description: 'Massive two-handed iron slab with unbreakable poise on heavy strikes.',
    lore: 'None could lift this blade until Commander Ironclad crushed the southern rebellion.',
    colorScheme: {
      primary: '#334155',
      secondary: '#f59e0b',
      glow: '#fbbf24',
    },
    perks: ['perk_unbreakable_poise', 'perk_damage_reduction'],
    iconName: 'ShieldAlert',
    spriteUrl: '/assets/weapons/items/sword_15.png',
    sprite32Url: '/assets/weapons/items/sword_15_32.png',
    swordIndex: 15,
    hiltOffset: [4.9, 89.3],
    tipOffset: [90.7, 4.3],
  },
  {
    id: 'w_nunchaku_dragon',
    name: 'Dragon Wind Nunchaku',
    slot: 'weapon',
    rarity: 'epic',
    faction: 'dynasty',
    weaponType: 'nunchaku',
    level: 4,
    basePower: 320,
    attackBonus: 120,
    critChance: 0.22,
    shadowBonus: 80,
    description: 'Enchanted oak bound by celestial serpent chain. Fluid relentless flurries.',
    lore: 'Mastered only by the Jade Pagoda monks in the high winds of Mount Lu.',
    colorScheme: {
      primary: '#064e3b',
      secondary: '#10b981',
      glow: '#34d399',
    },
    perks: ['perk_combo_surge'],
    iconName: 'Flame',
  },
  {
    id: 'w_kusarigama_blood',
    name: 'Bloodweaver Kusarigama',
    slot: 'weapon',
    rarity: 'legendary',
    faction: 'heralds',
    weaponType: 'kusarigama',
    level: 6,
    basePower: 410,
    attackBonus: 160,
    critChance: 0.30,
    shadowBonus: 110,
    description: 'Serrated sickle on a barbed chain that siphons life from afflicted foes.',
    lore: 'A forbidden relic crafted from the shadow bone of a slain abyss titan.',
    colorScheme: {
      primary: '#450a0a',
      secondary: '#ef4444',
      glow: '#f87171',
    },
    perks: ['perk_lifesteal', 'perk_crit_damage'],
    iconName: 'Zap',
  },
  {
    id: 'w_warhammer_quake',
    name: 'Titanbreaker War Hammer',
    slot: 'weapon',
    rarity: 'epic',
    faction: 'legion',
    weaponType: 'warhammer',
    level: 5,
    basePower: 360,
    attackBonus: 150,
    defenseBonus: 40,
    critChance: 0.12,
    shadowBonus: 50,
    description: 'Dense meteoric core that shatters armor plates on direct impact.',
    lore: 'Used by the Iron Legion to siege the adamantine gates of the Sun King.',
    colorScheme: {
      primary: '#1c1917',
      secondary: '#ea580c',
      glow: '#f97316',
    },
    perks: ['perk_unbreakable_poise'],
    iconName: 'Hammer',
  },
  {
    id: 'w_daggers_phantom',
    name: 'Phantom Twin Daggers',
    slot: 'weapon',
    rarity: 'rare',
    faction: 'dynasty',
    weaponType: 'dual_daggers',
    level: 3,
    basePower: 260,
    attackBonus: 95,
    critChance: 0.28,
    shadowBonus: 70,
    description: 'Whisper-quiet curved blades steeped in spectral venom.',
    lore: 'Standard arms for the Night Stalkers of the lower bamboo districts.',
    colorScheme: {
      primary: '#18181b',
      secondary: '#a855f7',
      glow: '#c084fc',
    },
    perks: ['perk_combo_surge'],
    iconName: 'Scissors',
  },
];
