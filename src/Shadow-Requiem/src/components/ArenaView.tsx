import React, { useState } from 'react';
import { PlayerProfile, RankedOpponent, FighterEntity } from '../game/types';
import { LEADERBOARD_PRESETS, generateRankedOpponent } from '../game/multiplayer';
import { BASE_IDLE_POSE } from '../game/weapons';
import { SoundButton } from './SoundButton';
import { 
  Users, 
  Swords, 
  Trophy, 
  ShieldAlert, 
  Crown, 
  Flame, 
  Zap, 
  ChevronRight, 
  Copy, 
  Search,
  Sparkles,
  Gamepad2
} from 'lucide-react';

interface ArenaViewProps {
  profile: PlayerProfile;
  onStartDuel: (opponent: FighterEntity, isLocalTwoPlayer: boolean) => void;
  onBack: () => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  profile,
  onStartDuel,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'ranked' | 'local2p' | 'leaderboard'>('ranked');
  const [isSearchingMatch, setIsSearchingMatch] = useState<boolean>(false);
  const [matchedOpponent, setMatchedOpponent] = useState<RankedOpponent | null>(null);
  const [roomCode, setRoomCode] = useState<string>('SHDW-' + Math.floor(1000 + Math.random() * 9000));
  const [copiedRoom, setCopiedRoom] = useState<boolean>(false);

  // Trigger Ranked matchmaking search animation
  const handleFindRankedMatch = () => {
    setIsSearchingMatch(true);
    setMatchedOpponent(null);

    setTimeout(() => {
      const opp = generateRankedOpponent(profile.rating);
      setMatchedOpponent(opp);
      setIsSearchingMatch(false);
    }, 1800);
  };

  // Launch the ranked battle against the matched opponent
  const handleLaunchDuel = (opp: RankedOpponent) => {
    const enemyFighter: FighterEntity = {
      id: opp.id,
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
      stats: opp.stats,
      currentHealth: opp.stats.health,
      currentShadowEnergy: 0,
      isBlocking: false,
      isInvulnerable: false,
      equipment: opp.equipment,
      currentPose: BASE_IDLE_POSE,
      hurtboxes: [],
    };

    onStartDuel(enemyFighter, false);
  };

  // Launch Local 2-Player Versus
  const handleLaunchLocal2P = () => {
    const p2Fighter: FighterEntity = {
      id: 'player_2_local',
      name: 'Player 2 (Challenger)',
      faction: 'legion',
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
      stats: {
        health: 650,
        maxHealth: 650,
        shadowEnergy: 0,
        maxShadowEnergy: 100,
        attackPower: 80,
        defense: 60,
        shadowPower: 70,
        critChance: 0.2,
        critMultiplier: 1.8,
        poise: 75,
      },
      currentHealth: 650,
      currentShadowEnergy: 0,
      isBlocking: false,
      isInvulnerable: false,
      equipment: {
        weapon: profile.inventory.find((w) => w.weaponType === 'greatsword') || profile.inventory[0],
        armor: profile.inventory.find((a) => a.slot === 'armor') || profile.inventory[1],
        helm: profile.inventory.find((h) => h.slot === 'helm') || profile.inventory[2],
        ranged: profile.inventory.find((r) => r.slot === 'ranged') || profile.inventory[3],
      },
      currentPose: BASE_IDLE_POSE,
      hurtboxes: [],
    };

    onStartDuel(p2Fighter, true);
  };

  return (
    <div id="arena-view" className="w-full h-full flex flex-col bg-[#07080e] text-neutral-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 px-6 py-4 bg-[#0d0e17]/95 border-b border-neutral-800 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-4">
          <button 
            id="arena-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold border border-neutral-700 text-neutral-200 transition-all"
          >
            ← Return to Realm
          </button>
          <div>
            <h1 className="font-cinzel text-xl font-bold text-amber-400">Multiplayer Arena Duels</h1>
            <p className="text-xs text-neutral-400">Clash against realm duelists, test your build on the trophy ladder, or challenge a friend.</p>
          </div>
        </div>

        {/* Header Right: Sound & Rating Trophy Badge */}
        <div className="flex items-center gap-3">
          <SoundButton id="arena-sound-btn" size="sm" />
          <div className="bg-amber-950/40 border border-amber-500/50 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{profile.rating} Trophies ({profile.rankTier})</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-neutral-800/80 bg-[#0b0c14] px-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ranked')}
            className={`px-5 py-3 text-xs font-cinzel font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ranked'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Swords className="w-4 h-4" /> Ranked Ladder
          </button>
          <button
            onClick={() => setActiveTab('local2p')}
            className={`px-5 py-3 text-xs font-cinzel font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'local2p'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> 2-Player Versus
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-5 py-3 text-xs font-cinzel font-bold tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-4 h-4" /> Realm Leaderboard
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6">
        
        {/* --- TAB 1: RANKED DUELS --- */}
        {activeTab === 'ranked' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Competitive Season I</span>
                <h2 className="font-cinzel text-2xl font-black text-white mt-1 mb-2">Ranked Duel Matchmaking</h2>
                <p className="text-xs text-neutral-300 max-w-lg">
                  Face high-tier shadow duelists calibrated to your skill tier. Victorious warriors earn rating trophies, gold, and rare forging blueprints.
                </p>
              </div>

              {!matchedOpponent && !isSearchingMatch && (
                <button
                  id="find-match-btn"
                  onClick={handleFindRankedMatch}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 font-cinzel font-bold text-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-950/60 transition-all whitespace-nowrap"
                >
                  <Search className="w-4 h-4" /> Find Opponent
                </button>
              )}
            </div>

            {/* Match Searching State */}
            {isSearchingMatch && (
              <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xl">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-400 animate-spin mb-4" />
                <h3 className="font-cinzel text-xl font-bold text-white mb-1">Scanning the Shadow Rifts...</h3>
                <p className="text-xs text-neutral-400">Locating a warrior around rating {profile.rating}...</p>
              </div>
            )}

            {/* Matched Opponent Card */}
            {matchedOpponent && !isSearchingMatch && (
              <div className="bg-[#11131e] border-2 border-amber-500/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl animate-in fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-950/50 border border-amber-500/60 flex items-center justify-center text-amber-400">
                    <Swords className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-amber-400">{matchedOpponent.rankTitle}</span>
                      <span className="text-xs text-neutral-500">•</span>
                      <span className="text-xs font-semibold text-neutral-300">Win Rate: {matchedOpponent.winRatio}</span>
                    </div>
                    <h3 className="font-cinzel text-2xl font-black text-white">{matchedOpponent.name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Wielding: <span className="text-amber-300 font-semibold">{matchedOpponent.weaponName}</span> ({matchedOpponent.faction} Stance)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleFindRankedMatch}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-all"
                  >
                    Change Opponent
                  </button>
                  <button
                    id="launch-ranked-duel-btn"
                    onClick={() => handleLaunchDuel(matchedOpponent)}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 font-cinzel font-black text-black text-sm uppercase flex items-center gap-2 shadow-lg shadow-amber-950 transition-all"
                  >
                    Enter Arena <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Trophy Road Milestones */}
            <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-cinzel text-base font-bold text-amber-400 uppercase tracking-wider mb-4">
                Trophy Road Progression
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { tier: 'Shadow Initiate', rating: 1200, reward: 'Starter Katana Blueprint' },
                  { tier: 'Veteran Duelist', rating: 1500, reward: '1,000 Gold + 100 Cores' },
                  { tier: 'Shadow Master', rating: 2000, reward: 'Epic Bastion Armor' },
                  { tier: 'Grandmaster', rating: 2500, reward: 'Mythic Void Piercer' },
                ].map((step, idx) => (
                  <div key={idx} className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">{step.rating} Trophies</span>
                      <h4 className="font-cinzel text-sm font-bold text-white mt-0.5">{step.tier}</h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-neutral-800 text-[11px] text-neutral-300">
                      🎁 {step.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: LOCAL 2-PLAYER VERSUS --- */}
        {activeTab === 'local2p' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Same Screen / Device Duel</span>
                <h2 className="font-cinzel text-2xl font-black text-white mt-1 mb-2">2-Player Shared Battle</h2>
                <p className="text-xs text-neutral-300 max-w-lg">
                  Play head-to-head with a friend on the same keyboard! Player 1 controls with WASD & F/G/H, while Player 2 commands with Arrow Keys & J/K/L.
                </p>
              </div>

              <button
                id="start-local-2p-btn"
                onClick={handleLaunchLocal2P}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:brightness-110 font-cinzel font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-indigo-950 transition-all whitespace-nowrap"
              >
                <Gamepad2 className="w-5 h-5" /> Launch 2P Versus
              </button>
            </div>

            {/* Controls Mapping Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player 1 Box */}
              <div className="bg-[#10121d] border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Player 1 (Left Fighter)</span>
                <h3 className="font-cinzel text-base font-bold text-white mb-3">Your Loadout</h3>
                <ul className="text-xs text-neutral-300 space-y-2">
                  <li><strong>Move / Jump / Crouch:</strong> W, A, S, D</li>
                  <li><strong>Light Slash Combo:</strong> F</li>
                  <li><strong>Forward Thrust:</strong> G</li>
                  <li><strong>Heavy Breaker:</strong> H</li>
                  <li><strong>Low Sweep:</strong> C</li>
                  <li><strong>Shadow Form / Ability:</strong> Left Shift or Space</li>
                </ul>
              </div>

              {/* Player 2 Box */}
              <div className="bg-[#10121d] border border-neutral-800 rounded-2xl p-5">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Player 2 (Right Challenger)</span>
                <h3 className="font-cinzel text-base font-bold text-white mb-3">Legion Claymore</h3>
                <ul className="text-xs text-neutral-300 space-y-2">
                  <li><strong>Move / Jump / Crouch:</strong> Arrow Keys (↑, ←, ↓, →)</li>
                  <li><strong>Light Slash Combo:</strong> J</li>
                  <li><strong>Forward Thrust:</strong> K</li>
                  <li><strong>Heavy Breaker:</strong> L</li>
                  <li><strong>Low Sweep:</strong> N</li>
                  <li><strong>Shadow Form / Ability:</strong> Enter</li>
                </ul>
              </div>
            </div>

            {/* Custom Room Code Invite Box */}
            <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h4 className="font-cinzel text-sm font-bold text-white">Duel Lobby Code</h4>
                <p className="text-xs text-neutral-400">Share your match code for synchronized arena sparring.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black px-3 py-1.5 rounded-lg bg-black border border-neutral-700 text-amber-400">
                  {roomCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    setCopiedRoom(true);
                    setTimeout(() => setCopiedRoom(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedRoom ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: LEADERBOARD --- */}
        {activeTab === 'leaderboard' && (
          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <h2 className="font-cinzel text-xl font-black text-amber-400">Realm Grandmaster Leaderboard</h2>
            <p className="text-xs text-neutral-400 mb-2">The highest-ranked champions across Legion, Dynasty, and Herald territories.</p>

            <div className="flex flex-col gap-2">
              {LEADERBOARD_PRESETS.map((champ, idx) => (
                <div
                  key={champ.id}
                  className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-cinzel font-black text-sm ${
                      idx === 0 ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/50' :
                      idx === 1 ? 'bg-slate-300 text-black' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-neutral-800 text-neutral-400'
                    }`}>
                      #{idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-cinzel text-sm font-bold text-white">{champ.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-amber-400">{champ.rankTitle}</span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {champ.weaponName} • Faction: <span className="capitalize text-indigo-300">{champ.faction}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-cinzel text-base font-black text-amber-400">{champ.rating} Trophies</div>
                    <span className="text-[11px] text-neutral-400">Win Rate {champ.winRatio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
