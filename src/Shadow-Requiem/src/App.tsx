import React, { useState, useEffect } from 'react';
import { PlayerProfile, FighterEntity, StoryStage, PlayableCharacter, ArenaTheme } from './game/types';
import { loadPlayerProfile, savePlayerProfile, calculateFighterStats } from './game/state';
import { BASE_IDLE_POSE } from './game/weapons';
import { CombatView } from './components/CombatView';
import { CustomizationView } from './components/CustomizationView';
import { StoryView } from './components/StoryView';
import { ArenaView } from './components/ArenaView';
import { TalentsView } from './components/TalentsView';
import { RosterView } from './components/RosterView';
import { MarketplaceView } from './components/MarketplaceView';
import { SoundButton } from './components/SoundButton';
import { 
  PLAYABLE_CHARACTERS, 
  getCharacterById, 
  checkDefeatedBossUnlock, 
  checkBattleMilestoneUnlock 
} from './game/characters';
import { 
  Swords, 
  BookOpen, 
  ShieldAlert, 
  Sparkles, 
  Trophy, 
  Crown, 
  Zap, 
  ChevronRight, 
  RotateCcw,
  Flame,
  Award,
  Users,
  Shield,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';

type AppTab = 'hub' | 'combat' | 'customization' | 'story' | 'arena' | 'talents' | 'roster' | 'marketplace';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [currentTab, setCurrentTab] = useState<AppTab>('hub');
  const [newlyUnlockedCharacter, setNewlyUnlockedCharacter] = useState<PlayableCharacter | null>(null);
  
  // Active combat session parameters
  const [activeCombat, setActiveCombat] = useState<{
    enemy: FighterEntity;
    theme: ArenaTheme;
    title: string;
    isTwoPlayer: boolean;
    rewardStage?: StoryStage;
  } | null>(null);

  // Save profile changes automatically to persistence
  const handleUpdateProfile = (updated: PlayerProfile) => {
    setProfile(updated);
    savePlayerProfile(updated);
  };

  // Switch active character
  const handleSelectCharacter = (characterId: string) => {
    const char = getCharacterById(characterId);
    const updatedProfile: PlayerProfile = {
      ...profile,
      activeCharacterId: characterId,
      name: char.name,
      title: char.title,
      factionAffinity: char.faction,
      equipped: {
        weapon: char.signatureWeapon,
        armor: char.defaultArmor,
        helm: char.defaultHelm,
        ranged: char.defaultRanged,
      },
    };
    handleUpdateProfile(updatedProfile);
  };

  // Construct Player's active FighterEntity with dynamic gear stats
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

  // Launch battle from Story Campaign
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
    setCurrentTab('combat');
  };

  // Launch battle from Multiplayer Arena
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
    setCurrentTab('combat');
  };

  // Match finished handler (rewards, level up, story advancement, boss/level character unlocks)
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

      // Check level up
      let newXp = profile.xp + gainedXp;
      let newLevel = profile.level;
      let nextXpTarget = profile.xpToNextLevel;

      if (newXp >= nextXpTarget) {
        newLevel += 1;
        newXp -= nextXpTarget;
        nextXpTarget = Math.round(nextXpTarget * 1.35);
      }

      const nextWins = profile.battleStats.fightsWon + 1;

      // Character Unlock Detection:
      // 1. Defeating a campaign boss with unlocksCharacterId
      // 2. Defeating a named boss enemy (Marcus, Ironclad, Ling, Kibo, Chronos)
      // 3. Reaching combat victory milestones across battles
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
    } else {
      const updatedProfile: PlayerProfile = {
        ...profile,
        battleStats: {
          ...profile.battleStats,
          fightsLost: profile.battleStats.fightsLost + 1,
        },
      };
      handleUpdateProfile(updatedProfile);
    }
  };

  return (
    <div id="shadow-requiem-root" className="w-screen h-screen bg-[#07070b] text-neutral-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. Combat View (Full-Screen Immersive Canvas) */}
      {currentTab === 'combat' && activeCombat && (
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
            setCurrentTab('hub');
          }}
        />
      )}

      {/* 2. Customization Armory View */}
      {currentTab === 'customization' && (
        <CustomizationView
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => setCurrentTab('hub')}
        />
      )}

      {/* 3. Dark Fantasy Storyline View */}
      {currentTab === 'story' && (
        <StoryView
          profile={profile}
          onSelectStage={handleStartStoryStage}
          onBack={() => setCurrentTab('hub')}
        />
      )}

      {/* 4. Multiplayer Arenas View */}
      {currentTab === 'arena' && (
        <ArenaView
          profile={profile}
          onStartDuel={handleStartArenaDuel}
          onBack={() => setCurrentTab('hub')}
        />
      )}

      {/* 5. Faction Talents View */}
      {currentTab === 'talents' && (
        <TalentsView
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => setCurrentTab('hub')}
        />
      )}

      {/* 6. Fighters Roster View (Character Viewer) */}
      {currentTab === 'roster' && (
        <div id="roster-view-container" className="w-full h-full flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-20 px-6 py-4 bg-[#0d0e17]/95 border-b border-neutral-800 flex items-center justify-between backdrop-blur">
            <button
              id="roster-back-btn"
              onClick={() => setCurrentTab('hub')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 transition-all shadow"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" /> Back to Realm Hub
            </button>
            <div className="flex items-center gap-3">
              <SoundButton id="roster-sound-btn" size="sm" />
              <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl border border-neutral-800 text-xs">
                <span className="text-neutral-400">Active Duelist:</span>
                <span className="font-cinzel font-bold text-amber-400">{profile.name}</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <RosterView
              profile={profile}
              onSelectCharacter={handleSelectCharacter}
              onNavigateToStory={() => setCurrentTab('story')}
              onNavigateToArena={() => setCurrentTab('arena')}
            />
          </div>
        </div>
      )}

      {/* 7. Master Weapon Marketplace View (70 Pixel Blades) */}
      {currentTab === 'marketplace' && (
        <div id="marketplace-view-container" className="w-full h-full flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-20 px-6 py-4 bg-[#0d0e17]/95 border-b border-neutral-800 flex items-center justify-between backdrop-blur">
            <button
              id="marketplace-back-btn"
              onClick={() => setCurrentTab('hub')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 transition-all shadow"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" /> Back to Realm Hub
            </button>
            <div className="flex items-center gap-3">
              <SoundButton id="marketplace-sound-btn" size="sm" />
              <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl border border-neutral-800 text-xs">
                <span className="text-neutral-400">Active Duelist:</span>
                <span className="font-cinzel font-bold text-amber-400">{profile.name}</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <MarketplaceView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onClose={() => setCurrentTab('hub')}
            />
          </div>
        </div>
      )}

      {/* 6. Central Realm Hub (Dashboard) */}
      {currentTab === 'hub' && (
        <div id="realm-hub-view" className="w-full h-full flex flex-col overflow-y-auto">
          
          {/* Top Bar Navigation & Stats */}
          <div className="sticky top-0 z-20 px-6 py-4 bg-[#0d0e17]/95 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-amber-900 border border-amber-500/50 flex items-center justify-center shadow-lg shadow-purple-950">
                <Swords className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="font-cinzel text-lg font-black tracking-wider text-amber-400">
                  Shadow Requiem
                </h1>
                <span className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
                  Dark Fantasy Combat RPG
                </span>
              </div>
            </div>

            {/* Quick Menu Navigation Bar */}
            <div className="hidden lg:flex items-center gap-1 bg-black/40 border border-neutral-800/80 p-1.5 rounded-xl">
              <button
                id="nav-tab-hub"
                onClick={() => setCurrentTab('hub')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'hub' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Hub
              </button>
              <button
                id="nav-tab-roster"
                onClick={() => setCurrentTab('roster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'roster' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Fighters ({profile.unlockedCharacterIds.length}/{PLAYABLE_CHARACTERS.length})
              </button>
              <button
                id="nav-tab-marketplace"
                onClick={() => setCurrentTab('marketplace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'marketplace' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-amber-400/90 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Marketplace
              </button>
              <button
                id="nav-tab-armory"
                onClick={() => setCurrentTab('customization')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-neutral-200 transition-all flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-indigo-400" /> Armory
              </button>
              <button
                id="nav-tab-story"
                onClick={() => setCurrentTab('story')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-neutral-200 transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Story
              </button>
              <button
                id="nav-tab-arena"
                onClick={() => setCurrentTab('arena')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-neutral-200 transition-all flex items-center gap-1.5"
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" /> Arena
              </button>
              <button
                id="nav-tab-talents"
                onClick={() => setCurrentTab('talents')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-neutral-200 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Talents
              </button>
            </div>

            {/* Profile Level, Rating, Currencies & Sound Toggle */}
            <div className="flex items-center gap-3">
              <SoundButton id="hub-sound-btn" size="md" />

              <div className="flex items-center gap-4 bg-black/60 px-4 py-2 rounded-2xl border border-neutral-800 text-xs">
                <div className="flex items-center gap-2 pr-3 border-r border-neutral-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                    {profile.level}
                  </span>
                  <div>
                    <div className="font-bold text-white leading-tight">{profile.name}</div>
                    <div className="text-[10px] text-neutral-400 leading-tight">{profile.rating} Trophies</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <span>🪙</span> {profile.gold}
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
                  <span>🔮</span> {profile.shadowCores}
                </div>
              </div>
            </div>
          </div>

          {/* Main Hub Dashboard Body */}
          <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
            
            {/* Hero Realm Overview Banner */}
            <div className="relative w-full rounded-3xl bg-gradient-to-r from-[#180e29] via-[#121324] to-[#0f172a] border border-amber-500/30 p-8 overflow-hidden shadow-2xl">
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Primordial Shadow Realm
                </div>
                <h2 className="font-cinzel text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                  Conquer the Void. Forge Your Shadow Legend.
                </h2>
                <p className="text-xs md:text-sm text-neutral-300 leading-relaxed mb-6">
                  Engage in realistic physics-based martial arts combat with articulated skeletal kinematics, weapon parries, and devastating shadow abilities. Choose your fighter, recruit defeated bosses into your roster, master legendary weapons, and challenge warriors across the realm.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    id="hub-launch-roster-hero-btn"
                    onClick={() => setCurrentTab('roster')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:brightness-110 font-cinzel font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-950 transition-all border border-purple-400/30"
                  >
                    <Users className="w-4 h-4 text-purple-300" /> Champions Roster ({profile.unlockedCharacterIds.length}/{PLAYABLE_CHARACTERS.length})
                  </button>

                  <button
                    id="hub-launch-marketplace-btn"
                    onClick={() => setCurrentTab('marketplace')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 font-cinzel font-black text-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-950 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" /> Sword Marketplace (70 Blades) <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    id="hub-launch-story-btn"
                    onClick={() => setCurrentTab('story')}
                    className="px-6 py-3 rounded-xl bg-[#1d1e2e] hover:bg-[#25273b] border border-neutral-700 font-cinzel font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" /> Story Campaign
                  </button>

                  <button
                    id="hub-launch-arena-btn"
                    onClick={() => setCurrentTab('arena')}
                    className="px-6 py-3 rounded-xl bg-[#1d1e2e] hover:bg-[#25273b] border border-neutral-700 font-cinzel font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Swords className="w-4 h-4 text-amber-400" /> Multiplayer Arena
                  </button>
                </div>
              </div>
            </div>

            {/* Core Game Modes & Modules Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              
              {/* Card 1: Fighter Roster (Character Viewer) */}
              <div 
                id="bento-roster-card"
                onClick={() => setCurrentTab('roster')}
                className="group p-5 rounded-2xl bg-[#11131e] border border-neutral-800 hover:border-purple-500/80 cursor-pointer transition-all shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Player Roster</span>
                  <h3 className="font-cinzel text-base font-bold text-white mt-1 mb-1.5">Fighter Champions</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Inspect your fighters, switch active characters, and review boss recruitment prerequisites.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-purple-400 mt-4 group-hover:translate-x-1 transition-transform">
                  View Roster ({profile.unlockedCharacterIds.length}/{PLAYABLE_CHARACTERS.length}) <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Card 2: Sword Marketplace (70 Pixel Art Weapons) */}
              <div 
                id="bento-marketplace-card"
                onClick={() => setCurrentTab('marketplace')}
                className="group p-5 rounded-2xl bg-[#11131e] border border-neutral-800 hover:border-amber-500/80 cursor-pointer transition-all shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Arsenal Store</span>
                  <h3 className="font-cinzel text-base font-bold text-white mt-1 mb-1.5">Sword Market</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    70 transparent cut-out blades. Buy and equip to any character.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-amber-400 mt-4 group-hover:translate-x-1 transition-transform">
                  Browse Swords (70) <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Card 3: Story Campaign */}
              <div 
                onClick={() => setCurrentTab('story')}
                className="group p-5 rounded-2xl bg-[#11131e] border border-neutral-800 hover:border-amber-500/80 cursor-pointer transition-all shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Chapter Progression</span>
                  <h3 className="font-cinzel text-base font-bold text-white mt-1 mb-1.5">Dark Fantasy Story</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Fight Citadels, Pagodas, and Void Cores to defeat bosses and recruit them into your roster.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-amber-400 mt-4 group-hover:translate-x-1 transition-transform">
                  Enter Chronicles <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Card 3: Armory & Customization */}
              <div 
                onClick={() => setCurrentTab('customization')}
                className="group p-5 rounded-2xl bg-[#11131e] border border-neutral-800 hover:border-indigo-500/80 cursor-pointer transition-all shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Gear & Upgrades</span>
                  <h3 className="font-cinzel text-base font-bold text-white mt-1 mb-1.5">Armory RPG</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Equip Katanas, Greatswords, and Kusarigama. Forge stats and dye aesthetics.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-indigo-400 mt-4 group-hover:translate-x-1 transition-transform">
                  Open Armory <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Card 4: Multiplayer Ranked & Local Duels */}
              <div 
                onClick={() => setCurrentTab('arena')}
                className="group p-5 rounded-2xl bg-[#11131e] border border-neutral-800 hover:border-rose-500/80 cursor-pointer transition-all shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                    <Swords className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">PvP & 2-Player</span>
                  <h3 className="font-cinzel text-base font-bold text-white mt-1 mb-1.5">Multiplayer Arena</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Climb the ranked ladder or challenge a friend in 2-Player shared arena mode.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-rose-400 mt-4 group-hover:translate-x-1 transition-transform">
                  Enter Arena <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Card 5: Faction Talents */}
              <div 
                onClick={() => setCurrentTab('talents')}
                className="group p-5 rounded-2xl bg-[#11131e] border border-neutral-800 hover:border-emerald-500/80 cursor-pointer transition-all shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Mastery Trees</span>
                  <h3 className="font-cinzel text-base font-bold text-white mt-1 mb-1.5">Faction Talents</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Unlock passive affinities for hyper-armor, combo multipliers, and void criticals.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-400 mt-4 group-hover:translate-x-1 transition-transform">
                  View Talents <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

            </div>

            {/* Battle Stats & Active Champion Summary Strip */}
            <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-cinzel text-base font-bold text-white">{profile.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                      {profile.title}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {profile.battleStats.fightsWon} Victories • {profile.battleStats.fightsLost} Defeats • {profile.battleStats.perfectVictories} Perfect Rounds • {profile.unlockedCharacterIds.length} Warriors Recruited
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-neutral-500">Active Weapon</span>
                  <div className="font-cinzel font-bold text-amber-400">{profile.equipped.weapon.name}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500">Faction Stance</span>
                  <div className="font-cinzel font-bold text-indigo-400 capitalize">{profile.equipped.weapon.faction}</div>
                </div>
                <div>
                  <button
                    id="hub-switch-duelist-btn"
                    onClick={() => setCurrentTab('roster')}
                    className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 font-cinzel font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Users className="w-3.5 h-3.5" /> Switch Duelist
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
