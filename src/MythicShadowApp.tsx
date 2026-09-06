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

  const activeChar = getCharacterById(profile.activeCharacterId || 'char_raven');

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

    // Register active champion info on window for in-game HUD
    (window as any).activeChampionName = activeChar.name;
    (window as any).activeChampionLevel = profile.level;

    // Register global window listeners for native DOM buttons
    (window as any).openCharacterSelectModal = () => {
      setShowCharSelectModal(true);
    };
    (window as any).openCharacterBuilder = () => {
      setActiveView('builder');
    };
    (window as any).openSwordForge = () => {
      setActiveView('marketplace');
    };
    (window as any).openTalentsView = () => {
      setActiveView('talents');
    };
    (window as any).openManualCombatArena = () => {
      handleStartQuickDuel();
    };
    (window as any).openCrimsonDuel = () => {
      handleStartQuickDuel();
    };
    (window as any).openRankedArena = () => {
      setActiveView('arena');
    };
    (window as any).openRoster = () => {
      setActiveView('roster');
    };
    (window as any).openShadowStory = () => {
      setActiveView('story');
    };
    (window as any).switchAppView = (view: AppViewMode) => {
      setActiveView(view);
    };
  }, [profile, syncToPixiEngine, activeChar.name]);

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
    if (canvasContainer) {
      if (activeView === 'idle') {
        canvasContainer.style.display = 'block';
      } else {
        canvasContainer.style.display = 'none';
      }
    }
  }, [activeView]);

  return (
    <div id="mythic-shadow-unified-root" className="w-full flex flex-col font-sans">
      
      {/* Sleek Subview Header Bar: Only shown when inside a specific window/subview (hidden in combat for full-screen arcade immersion) */}
      {activeView !== 'idle' && activeView !== 'combat' && (
        <div 
          id="hybrid-header-bar" 
          className="w-full bg-[#0a0b12]/95 border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between gap-3 backdrop-blur z-30 shadow-md"
        >
          <div className="flex items-center gap-3">
            <button
              id="header-back-btn"
              onClick={() => {
                sound.playClick();
                setActiveView('idle');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-neutral-700 font-cinzel text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <span>←</span>
              <span>Back to Game</span>
            </button>
            <span className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
              {activeView === 'builder' ? '🥋 Character Builder & Forge' :
               activeView === 'talents' ? '⚡ Talents & Build' :
               activeView === 'marketplace' ? '🗡️ Sword Forge & Marketplace' :
               activeView === 'roster' ? '👤 Champion Roster' :
               activeView === 'arena' ? '🏆 Ranked Arena' :
               activeView === 'story' ? '📜 Story Acts' : 'Game View'}
            </span>
          </div>

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
      )}

      {/* View Switcher Containers */}
      {activeView === 'builder' && (
        <div id="character-builder-wrapper" className="w-full flex-1 h-[calc(100dvh-55px)] overflow-y-auto">
          <CustomizationView 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setActiveView('idle')}
          />
        </div>
      )}

      {activeView === 'talents' && (
        <div id="talents-view-wrapper" className="w-full flex-1 h-[calc(100dvh-55px)] overflow-y-auto">
          <TalentsView 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setActiveView('idle')}
          />
        </div>
      )}

      {activeView === 'combat' && activeCombat && (
        <div id="combat-view-wrapper" className="fixed inset-0 z-50 w-full h-full h-[100dvh] flex flex-col overflow-hidden bg-[#07070b]">
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
        <div id="story-view-wrapper" className="w-full flex-1 h-[calc(100dvh-55px)] overflow-y-auto">
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
        <div id="marketplace-view-wrapper" className="w-full flex-1 min-h-[calc(100vh-65px)] overflow-y-auto">
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
