import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlayerProfile, 
  FighterEntity, 
  ArenaTheme, 
  PlayableCharacter, 
  StoryStage, 
  WeaponType,
  GearItem
} from './Shadow-Requiem/src/game/types';
import { 
  loadPlayerProfile, 
  savePlayerProfile, 
  calculateFighterStats, 
  INITIAL_PLAYER_PROFILE 
} from './Shadow-Requiem/src/game/state';
import { 
  PLAYABLE_CHARACTERS, 
  getCharacterById, 
  checkDefeatedBossUnlock, 
  checkBattleMilestoneUnlock 
} from './Shadow-Requiem/src/game/characters';
import { BASE_IDLE_POSE } from './Shadow-Requiem/src/game/weapons';
import { sound } from './Shadow-Requiem/src/game/audio';

// Shadow Requiem Components
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { CustomizationView } from './Shadow-Requiem/src/components/CustomizationView';
import { TalentsView } from './Shadow-Requiem/src/components/TalentsView';
import { CombatView } from './Shadow-Requiem/src/components/CombatView';
import { StoryView } from './Shadow-Requiem/src/components/StoryView';
import { ArenaView } from './Shadow-Requiem/src/components/ArenaView';
import { MarketplaceView } from './Shadow-Requiem/src/components/MarketplaceView';
import { RosterView } from './Shadow-Requiem/src/components/RosterView';
import { SoundButton } from './Shadow-Requiem/src/components/SoundButton';

import { 
  Swords, 
  Shield, 
  Sparkles, 
  Award, 
  Zap, 
  Flame, 
  Crown, 
  User, 
  Wrench, 
  BookOpen, 
  Store, 
  Clock, 
  Play, 
  Check, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export type AppViewMode = 
  | 'idle' 
  | 'builder' 
  | 'talents' 
  | 'combat' 
  | 'story' 
  | 'arena' 
  | 'marketplace' 
  | 'roster';

export const MythicShadowApp: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const loaded = loadPlayerProfile();
    // Ensure active character is valid
    if (!loaded.activeCharacterId) {
      loaded.activeCharacterId = 'char_raven';
    }
    return loaded;
  });

  const [activeView, setActiveView] = useState<AppViewMode>('idle');
  const [showCharSelectModal, setShowCharSelectModal] = useState<boolean>(() => {
    // Open modal on first start if user has never selected a character
    return !localStorage.getItem('mythic_champion_chosen');
  });

  const [activeCombat, setActiveCombat] = useState<{
    enemy: FighterEntity;
    theme: ArenaTheme;
    title: string;
    isTwoPlayer?: boolean;
    rewardStage?: StoryStage;
  } | null>(null);

  const [newlyUnlockedCharacter, setNewlyUnlockedCharacter] = useState<PlayableCharacter | null>(null);

  // Sync profile to PixiJS engine whenever it updates
  const syncToPixiEngine = useCallback((currentProfile: PlayerProfile) => {
    if (typeof (window as any).gameHero?.applyShadowRequiemProfile === 'function') {
      (window as any).gameHero.applyShadowRequiemProfile(currentProfile);
    }
    // Also notify GameState if needed
    if ((window as any).gameState?.currencies) {
      (window as any).gameState.currencies.eraGold = currentProfile.gold;
    }
  }, []);

  // Initial sync on mount
  useEffect(() => {
    syncToPixiEngine(profile);

    // Register global window listeners for native DOM buttons in index.html
    (window as any).openCharacterSelectModal = () => {
      setShowCharSelectModal(true);
    };
    (window as any).openCharacterBuilder = () => {
      setActiveView('builder');
    };
    (window as any).openTalentsView = () => {
      setActiveView('talents');
    };
    (window as any).openManualCombatArena = () => {
      handleStartQuickDuel();
    };
    (window as any).openShadowStory = () => {
      setActiveView('story');
    };
    (window as any).switchAppView = (view: AppViewMode) => {
      setActiveView(view);
    };
  }, [profile, syncToPixiEngine]);

  // Handle profile updates from Character Builder, Talents, or Marketplace
  const handleUpdateProfile = (updated: PlayerProfile) => {
    setProfile(updated);
    savePlayerProfile(updated);
    syncToPixiEngine(updated);
  };

  // Handle selecting a character from modal or roster
  const handleSelectCharacter = (characterId: string) => {
    const char = getCharacterById(characterId);
    let unlockedIds = [...profile.unlockedCharacterIds];
    if (!unlockedIds.includes(characterId)) {
      unlockedIds.push(characterId);
    }

    const updatedProfile: PlayerProfile = {
      ...profile,
      activeCharacterId: characterId,
      name: char.name,
      title: char.title,
      factionAffinity: char.faction,
      unlockedCharacterIds: unlockedIds,
      equipped: {
        ...profile.equipped,
        weapon: char.signatureWeapon,
        armor: char.defaultArmor,
        helm: char.defaultHelm,
        ranged: char.defaultRanged,
      },
    };

    localStorage.setItem('mythic_champion_chosen', 'true');
    handleUpdateProfile(updatedProfile);
    setShowCharSelectModal(false);
  };

  // Create active player fighter entity
  const createPlayerFighter = (): FighterEntity => {
    const stats = calculateFighterStats(profile);
    const activeChar = getCharacterById(profile.activeCharacterId || 'char_raven');
    return {
      id: 'player_main',
      name: activeChar.name,
      faction: activeChar.faction,
      isPlayer: true,
      x: 340,
      y: 380,
      vx: 0,
      vy: 0,
      direction: 1,
      action: 'idle',
      actionTimer: 0,
      actionDuration: 1,
      comboCount: 0,
      comboStep: 0,
      isShadowForm: false,
      shadowFormDuration: 0,
      stats,
      currentHealth: stats.maxHealth,
      currentShadowEnergy: 0,
      isBlocking: false,
      isInvulnerable: false,
      equipment: profile.equipped,
      currentPose: BASE_IDLE_POSE,
      hurtboxes: [],
    };
  };

  // Quick Duel launcher against an opponent
  const handleStartQuickDuel = () => {
    const activeChar = getCharacterById(profile.activeCharacterId || 'char_raven');
    const opponents = PLAYABLE_CHARACTERS.filter(c => c.id !== activeChar.id);
    const opp = opponents[Math.floor(Math.random() * opponents.length)] || PLAYABLE_CHARACTERS[1];

    const enemyFighter: FighterEntity = {
      id: `opp_${opp.id}`,
      name: opp.name,
      faction: opp.faction,
      isPlayer: false,
      x: 660,
      y: 380,
      vx: 0,
      vy: 0,
      direction: -1,
      action: 'idle',
      actionTimer: 0,
      actionDuration: 1,
      comboCount: 0,
      comboStep: 0,
      isShadowForm: false,
      shadowFormDuration: 0,
      stats: opp.baseStats,
      currentHealth: opp.baseStats.health,
      currentShadowEnergy: opp.baseStats.shadowEnergy,
      isBlocking: false,
      isInvulnerable: false,
      equipment: {
        weapon: opp.signatureWeapon,
        armor: opp.defaultArmor,
        helm: opp.defaultHelm,
        ranged: opp.defaultRanged,
      },
      currentPose: BASE_IDLE_POSE,
      hurtboxes: [],
    };

    const arenaThemes: ArenaTheme[] = [
      'herald_nexus',
      'burning_citadel',
      'dynasty_palace',
      'void_colosseum',
      'crimson_bamboo',
      'frostpeak_sanctuary'
    ];
    const chosenTheme = arenaThemes[Math.floor(Math.random() * arenaThemes.length)];

    setActiveCombat({
      enemy: enemyFighter,
      theme: chosenTheme,
      title: `Shadow Duel: ${activeChar.name} vs ${opp.name}`,
      isTwoPlayer: false,
    });
    setActiveView('combat');
  };

  // Launch battle from Story
  const handleStartStoryStage = (stage: StoryStage) => {
    const enemyFighter: FighterEntity = {
      id: stage.enemy.name,
      name: stage.enemy.name,
      faction: stage.enemy.faction,
      isPlayer: false,
      x: 660,
      y: 380,
      vx: 0,
      vy: 0,
      direction: -1,
      action: 'idle',
      actionTimer: 0,
      actionDuration: 1,
      comboCount: 0,
      comboStep: 0,
      isShadowForm: false,
      shadowFormDuration: 0,
      stats: stage.enemy.stats,
      currentHealth: stage.enemy.stats.maxHealth,
      currentShadowEnergy: stage.enemy.stats.shadowEnergy,
      isBlocking: false,
      isInvulnerable: false,
      equipment: {
        weapon: stage.enemy.weapon,
        armor: stage.enemy.armor,
        helm: stage.enemy.helm,
        ranged: stage.enemy.ranged,
      },
      currentPose: BASE_IDLE_POSE,
      hurtboxes: [],
    };

    setActiveCombat({
      enemy: enemyFighter,
      theme: stage.arenaBackground,
      title: `${stage.subtitle} • ${stage.title}`,
      isTwoPlayer: false,
      rewardStage: stage,
    });
    setActiveView('combat');
  };

  // Launch battle from Arena
  const handleStartArenaDuel = (opponent: FighterEntity, isLocalTwoPlayer: boolean) => {
    const arenaPool: ArenaTheme[] = [
      'burning_citadel',
      'dynasty_palace',
      'herald_nexus',
      'void_colosseum',
      'frostpeak_sanctuary',
      'crimson_bamboo',
      'volcanic_abyss',
      'astral_observatory',
    ];
    const randomTheme = arenaPool[Math.floor(Math.random() * arenaPool.length)];
    setActiveCombat({
      enemy: opponent,
      theme: randomTheme,
      title: isLocalTwoPlayer ? '2-Player Shared Arena Duel' : `Ranked Duel vs ${opponent.name}`,
      isTwoPlayer: isLocalTwoPlayer,
    });
    setActiveView('combat');
  };

  // Match complete callback
  const handleMatchComplete = (winnerId: string, playerPerfect: boolean) => {
    const isPlayerWin = winnerId === 'player_main';
    if (isPlayerWin) {
      let gainedGold = 350;
      let gainedCores = 30;
      let gainedXp = 120;
      let newStoryProg = profile.storyProgress;

      if (activeCombat?.rewardStage) {
        gainedGold = activeCombat.rewardStage.rewards.gold;
        gainedCores = activeCombat.rewardStage.rewards.shadowCores;
        gainedXp = 250;
        newStoryProg = Math.max(profile.storyProgress, profile.storyProgress + 1);
      }

      let newXp = profile.xp + gainedXp;
      let newLevel = profile.level;
      let nextXpTarget = profile.xpToNextLevel;

      if (newXp >= nextXpTarget) {
        newLevel += 1;
        newXp -= nextXpTarget;
        nextXpTarget = Math.round(nextXpTarget * 1.35);
      }

      const nextWins = profile.battleStats.fightsWon + 1;
      let unlockedChar: PlayableCharacter | null = null;

      if (activeCombat?.rewardStage?.rewards?.unlocksCharacterId) {
        const rewardId = activeCombat.rewardStage.rewards.unlocksCharacterId;
        if (!profile.unlockedCharacterIds.includes(rewardId)) {
          unlockedChar = getCharacterById(rewardId);
        }
      }

      if (!unlockedChar && activeCombat?.enemy?.name) {
        unlockedChar = checkDefeatedBossUnlock(activeCombat.enemy.name, profile, playerPerfect);
      }

      if (!unlockedChar) {
        unlockedChar = checkBattleMilestoneUnlock(nextWins, profile);
      }

      let updatedUnlockedIds = [...profile.unlockedCharacterIds];
      if (unlockedChar && !updatedUnlockedIds.includes(unlockedChar.id)) {
        updatedUnlockedIds.push(unlockedChar.id);
        setNewlyUnlockedCharacter(unlockedChar);
      }

      const updatedProfile: PlayerProfile = {
        ...profile,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: nextXpTarget,
        gold: profile.gold + gainedGold,
        shadowCores: profile.shadowCores + gainedCores,
        rating: profile.rating + 35,
        storyProgress: newStoryProg,
        unlockedCharacterIds: updatedUnlockedIds,
        battleStats: {
          ...profile.battleStats,
          fightsWon: nextWins,
          perfectVictories: profile.battleStats.perfectVictories + (playerPerfect ? 1 : 0),
        },
      };

      handleUpdateProfile(updatedProfile);
    }
  };

  const activeChar = getCharacterById(profile.activeCharacterId || 'char_raven');
  const equippedWeapon = profile.equipped.weapon;

  // Describe weapon dynamics
  const getWeaponDynamicsSummary = (wType: WeaponType) => {
    switch (wType) {
      case 'katana':
        return { label: 'Iaido Swift Slash', desc: '30% Attack Speed & High Critical Strike', tag: 'Speed' };
      case 'greatsword':
        return { label: 'Hyper-Armor Cleave', desc: '115px Sweeping Cleave & 40% Damage Mitigation', tag: 'Poise' };
      case 'warhammer':
        return { label: 'Tectonic Sunder', desc: 'Crushing Ground Slam & -30% Enemy Defense', tag: 'Crush' };
      case 'nunchaku':
        return { label: 'Dragon Gale Tempest', desc: 'Multi-Hit Flurry & Double Chi/Shadow Surge', tag: 'Flurry' };
      case 'kusarigama':
        return { label: 'Barbed Chain Siphon', desc: 'Extended 130px Reach & 12% Vampiric Lifesteal', tag: 'Lifesteal' };
      case 'dual_daggers':
        return { label: 'Venom Haste Flurry', desc: '45% Attack Cadence & Poison Ticks', tag: 'Haste' };
      default:
        return { label: 'Martial Blade', desc: 'Balanced Reach & Strike Dynamics', tag: 'Balanced' };
    }
  };

  const dynamics = getWeaponDynamicsSummary(equippedWeapon?.weaponType || 'katana');

  // Toggle visibility of the native canvas container based on active view
  useEffect(() => {
    const canvasContainer = document.getElementById('center-viewport-container');
    const nativeDock = document.getElementById('screen-dock-nav');
    if (canvasContainer) {
      if (activeView === 'idle') {
        canvasContainer.style.display = 'block';
        if (nativeDock) nativeDock.style.display = 'flex';
      } else {
        canvasContainer.style.display = 'none';
        if (nativeDock) nativeDock.style.display = 'none';
      }
    }
  }, [activeView]);

  return (
    <div id="mythic-shadow-unified-root" className="w-full flex flex-col font-sans">
      
      {/* Top Hybrid Navigation Bar */}
      <div 
        id="hybrid-header-bar" 
        className="w-full bg-[#0a0b12]/95 border-b border-neutral-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur z-30"
      >
        {/* Left: Active Champion Badge & Character Select Trigger */}
        <div className="flex items-center gap-3">
          <button
            id="header-champion-pill"
            onClick={() => {
              sound.playClick();
              setShowCharSelectModal(true);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/50 transition-all group shadow-sm text-left"
            title="Click to Choose Character / View Roster"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600/30 to-purple-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-cinzel text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                  {activeChar.name}
                </span>
                <span className="text-[10px] text-amber-400/90 font-semibold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
                  Lv.{profile.level}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 capitalize">
                {activeChar.title} • <span className="text-amber-400">Change Hero</span>
              </div>
            </div>
          </button>

          {/* Active Weapon Dynamics Indicator */}
          <div 
            id="header-weapon-badge"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11131e] border border-neutral-800 text-xs"
            title={dynamics.desc}
          >
            <span className="text-sm">🗡️</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-200">{equippedWeapon.name}</span>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-1.5 rounded border border-indigo-800/60 uppercase">
                  {dynamics.tag}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">{dynamics.label}: {dynamics.desc}</span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-neutral-800 text-xs overflow-x-auto max-w-full">
          <button
            id="tab-idle-timeline"
            onClick={() => {
              sound.playClick();
              setActiveView('idle');
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'idle'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-black shadow-md shadow-amber-950/50'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Idle Timeline</span>
          </button>

          <button
            id="tab-char-builder"
            onClick={() => {
              sound.playClick();
              setActiveView('builder');
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'builder'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-black shadow-md shadow-amber-950/50'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Character Builder</span>
          </button>

          <button
            id="tab-talents"
            onClick={() => {
              sound.playClick();
              setActiveView('talents');
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'talents'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-black shadow-md shadow-amber-950/50'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Talents & Build</span>
          </button>

          <button
            id="tab-manual-combat"
            onClick={() => {
              sound.playWhoosh();
              handleStartQuickDuel();
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'combat'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/50'
                : 'text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Manual Duel Arena</span>
          </button>

          <button
            id="tab-story"
            onClick={() => {
              sound.playClick();
              setActiveView('story');
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'story'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Story Acts</span>
          </button>

          <button
            id="tab-arena"
            onClick={() => {
              sound.playClick();
              setActiveView('arena');
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'arena'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Ranked Arena</span>
          </button>

          <button
            id="tab-marketplace"
            onClick={() => {
              sound.playClick();
              setActiveView('marketplace');
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'marketplace'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Sword Forge</span>
          </button>

          <button
            id="tab-roster"
            onClick={() => {
              sound.playClick();
              setActiveView('roster');
            }}
            className={`px-3 py-1.5 rounded-lg font-cinzel font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeView === 'roster'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-black shadow-md'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Roster</span>
          </button>
        </div>

        {/* Right: Currency & Audio */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-black/60 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
            <span className="text-amber-400 font-semibold" title="Gold">
              🪙 {profile.gold}
            </span>
            <span className="text-indigo-400 font-semibold" title="Shadow Cores">
              🔮 {profile.shadowCores}
            </span>
            <span className="text-cyan-400 font-semibold" title="Gems">
              💎 {profile.gems}
            </span>
          </div>
          <SoundButton id="header-sound-btn" size="sm" />
        </div>
      </div>

      {/* Floating Action Banner When In Idle Mode */}
      {activeView === 'idle' && (
        <div 
          id="idle-mode-action-bar"
          className="w-full bg-gradient-to-r from-[#0d0f1a] via-[#141624] to-[#0d0f1a] border-b border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md z-20"
        >
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="text-amber-400 font-cinzel font-bold">⚡ Part Idle, Part Manual:</span>
            <span>You are currently in the <strong>Idle Historical Timeline</strong>. Farm wave resources, or jump directly into manual combat!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="idle-choose-char-btn"
              onClick={() => {
                sound.playClick();
                setShowCharSelectModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-cinzel text-xs flex items-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Choose Hero</span>
            </button>

            <button
              id="idle-enter-manual-combat-btn"
              onClick={() => {
                sound.playWhoosh();
                handleStartQuickDuel();
              }}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-cinzel font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/60 transition-all active:scale-95 animate-pulse"
            >
              <Swords className="w-4 h-4" />
              <span>ENTER MANUAL COMBAT DUEL</span>
            </button>
          </div>
        </div>
      )}

      {/* View Switcher Containers */}
      {activeView === 'builder' && (
        <div id="character-builder-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)]">
          <CustomizationView 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setActiveView('idle')}
          />
        </div>
      )}

      {activeView === 'talents' && (
        <div id="talents-view-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)]">
          <TalentsView 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setActiveView('idle')}
          />
        </div>
      )}

      {activeView === 'combat' && activeCombat && (
        <div id="combat-view-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)]">
          <CombatView 
            playerConfig={createPlayerFighter()}
            enemyConfig={activeCombat.enemy}
            arenaTheme={activeCombat.theme}
            matchTitle={activeCombat.title}
            isTwoPlayerMode={activeCombat.isTwoPlayer}
            unlockedCharacter={newlyUnlockedCharacter}
            onMatchComplete={handleMatchComplete}
            onEquipUnlockedCharacter={(charId) => handleSelectCharacter(charId)}
            onExit={() => {
              setActiveCombat(null);
              setNewlyUnlockedCharacter(null);
              setActiveView('idle');
            }}
          />
        </div>
      )}

      {activeView === 'story' && (
        <div id="story-view-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)]">
          <StoryView 
            profile={profile}
            onSelectStage={handleStartStoryStage}
            onBack={() => setActiveView('idle')}
          />
        </div>
      )}

      {activeView === 'arena' && (
        <div id="arena-view-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)]">
          <ArenaView 
            profile={profile}
            onStartDuel={handleStartArenaDuel}
            onBack={() => setActiveView('idle')}
          />
        </div>
      )}

      {activeView === 'marketplace' && (
        <div id="marketplace-view-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)]">
          <MarketplaceView 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onClose={() => setActiveView('idle')}
          />
        </div>
      )}

      {activeView === 'roster' && (
        <div id="roster-view-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)]">
          <RosterView 
            profile={profile}
            onSelectCharacter={handleSelectCharacter}
            onNavigateToStory={() => setActiveView('story')}
            onNavigateToArena={() => setActiveView('arena')}
          />
        </div>
      )}

      {/* Character Selection Modal */}
      <CharacterSelectModal 
        isOpen={showCharSelectModal}
        profile={profile}
        onClose={() => setShowCharSelectModal(false)}
        onSelectCharacter={handleSelectCharacter}
        isInitialSelection={!localStorage.getItem('mythic_champion_chosen')}
      />

    </div>
  );
};
