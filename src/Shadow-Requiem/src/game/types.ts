export type Faction = 'legion' | 'dynasty' | 'heralds';

export type WeaponType = 
  | 'katana' 
  | 'greatsword' 
  | 'nunchaku' 
  | 'kusarigama' 
  | 'warhammer' 
  | 'dual_daggers' 
  | 'glaive';

export type GearRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type GearSlot = 'helm' | 'armor' | 'weapon' | 'ranged';

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  faction: Faction;
  weaponType?: WeaponType;
  level: number;
  basePower: number;
  attackBonus?: number;
  defenseBonus?: number;
  shadowBonus?: number;
  critChance?: number;
  description: string;
  lore: string;
  colorScheme: {
    primary: string;
    secondary: string;
    glow: string;
  };
  perks: string[];
  iconName: string;
  spriteUrl?: string;
  sprite32Url?: string;
  swordIndex?: number;
  hiltOffset?: [number, number];
  tipOffset?: [number, number];
  priceGold?: number;
  priceGems?: number;
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  effectType: 'lifesteal' | 'crit_damage' | 'shadow_generation' | 'damage_reduction' | 'unbreakable_poise' | 'combo_surge';
  magnitude: number;
}

export interface FighterStats {
  health: number;
  maxHealth: number;
  shadowEnergy: number;
  maxShadowEnergy: number;
  attackPower: number;
  defense: number;
  shadowPower: number;
  critChance: number;
  critMultiplier: number;
  poise: number;
}

export type CombatAction = 
  | 'idle' 
  | 'walk_fwd' 
  | 'walk_bwd' 
  | 'dash_fwd' 
  | 'dash_bwd' 
  | 'jump' 
  | 'crouch' 
  | 'block' 
  | 'hit_light' 
  | 'hit_heavy' 
  | 'knockdown' 
  | 'get_up'
  | 'attack_neutral_1' 
  | 'attack_neutral_2' 
  | 'attack_neutral_3' 
  | 'attack_forward' 
  | 'attack_up' 
  | 'attack_down' 
  | 'attack_heavy'
  | 'kick_neutral' 
  | 'kick_low' 
  | 'kick_flying'
  | 'shadow_ability';

export interface SkeletalPose {
  pelvis: { x: number; y: number; angle: number };
  torso: { angle: number };
  head: { angle: number };
  leftUpperArm: { angle: number };
  leftForearm: { angle: number };
  rightUpperArm: { angle: number };
  rightForearm: { angle: number };
  leftThigh: { angle: number };
  leftShin: { angle: number };
  rightThigh: { angle: number };
  rightShin: { angle: number };
  weaponAngle: number;
  weaponOffsetX: number;
  weaponOffsetY: number;
}

export interface AttackFrame {
  progress: number; // 0 to 1
  pose: SkeletalPose;
  isHitboxActive?: boolean;
  damageMultiplier?: number;
  hitBoxOffset?: { x: number; y: number; r: number };
  unbreakable?: boolean; // Legion poise
  canCombo?: boolean;
}

export interface WeaponMoveSet {
  neutralCombo: AttackFrame[][];
  forwardAttack: AttackFrame[];
  upAttack: AttackFrame[];
  downAttack: AttackFrame[];
  heavyAttack: AttackFrame[];
  shadowAbility: AttackFrame[];
  shadowAbilityName: string;
  shadowAbilityDesc: string;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'shadow_smoke' | 'blood' | 'ring' | 'ember';
}

export interface FighterEntity {
  id: string;
  name: string;
  faction: Faction;
  isPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 1 | -1; // 1 facing right, -1 facing left
  action: CombatAction;
  actionTimer: number;
  actionDuration: number;
  comboCount: number;
  comboStep: number;
  isShadowForm: boolean;
  shadowFormDuration: number;
  stats: FighterStats;
  currentHealth: number;
  currentShadowEnergy: number;
  isBlocking: boolean;
  isInvulnerable: boolean;
  equipment: {
    helm: GearItem;
    armor: GearItem;
    weapon: GearItem;
    ranged: GearItem;
  };
  hitbox?: { x: number; y: number; r: number };
  hurtboxes: { x: number; y: number; r: number; part: 'head' | 'body' | 'legs' }[];
  currentPose: SkeletalPose;
  ragdollJoints?: { [key: string]: { x: number; y: number; vx: number; vy: number } };
  aiPersonality?: 'aggressive' | 'tactical' | 'counter_master' | 'boss_titans' | string;
  isBoss?: boolean;
  hasHitCurrentAction?: boolean;
}

export type ArenaTheme = 
  | 'burning_citadel' 
  | 'dynasty_palace' 
  | 'herald_nexus' 
  | 'void_colosseum'
  | 'frostpeak_sanctuary'
  | 'crimson_bamboo'
  | 'volcanic_abyss'
  | 'astral_observatory'
  | 'emerald_bamboo_temple'
  | 'sunken_shadow_abyss'
  | 'celestial_thunder_plateau'
  | 'crimson_eclipse_citadel';

export interface StoryDialogue {
  speaker: string;
  avatar: string;
  text: string;
  side: 'left' | 'right';
}

export interface StoryStage {
  id: string;
  act: number;
  chapter: number;
  title: string;
  subtitle: string;
  loreIntro: string;
  arenaBackground: ArenaTheme;
  enemy: {
    name: string;
    title: string;
    faction: Faction;
    stats: FighterStats;
    weapon: GearItem;
    armor: GearItem;
    helm: GearItem;
    ranged: GearItem;
    aiPersonality: 'aggressive' | 'tactical' | 'counter_master' | 'boss_titans';
    bossPhases?: number;
  };
  dialogueBefore: StoryDialogue[];
  dialogueAfter: StoryDialogue[];
  rewards: {
    gold: number;
    shadowCores: number;
    gear?: GearItem;
    unlocksCharacterId?: string;
  };
}

export interface PlayableCharacter {
  id: string;
  name: string;
  title: string;
  faction: Faction;
  avatarIcon: string;
  rarity: GearRarity;
  level: number;
  lore: string;
  quote: string;
  signatureWeapon: GearItem;
  defaultArmor: GearItem;
  defaultHelm: GearItem;
  defaultRanged: GearItem;
  baseStats: FighterStats;
  signatureAbility: {
    name: string;
    description: string;
    tag: string;
  };
  unlockCondition: string;
  isUnlockedDefault?: boolean;
}

export interface RankedOpponent {
  id: string;
  name: string;
  rankTitle: string;
  rating: number;
  avatarIcon: string;
  faction: Faction;
  level: number;
  weaponName: string;
  equipment: {
    helm: GearItem;
    armor: GearItem;
    weapon: GearItem;
    ranged: GearItem;
  };
  stats: FighterStats;
  winRatio: string;
}

export interface PlayerProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  shadowCores: number;
  gems: number;
  rating: number;
  rankTier: string;
  storyProgress: number; // completed stage index
  equipped: {
    helm: GearItem;
    armor: GearItem;
    weapon: GearItem;
    ranged: GearItem;
  };
  inventory: GearItem[];
  unlockedPerks: string[];
  factionAffinity: Faction;
  activeCharacterId: string;
  unlockedCharacterIds: string[];
  battleStats: {
    fightsWon: number;
    fightsLost: number;
    perfectVictories: number;
    shadowKills: number;
    highestCombo: number;
  };
}
