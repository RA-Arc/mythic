import React, { useState } from 'react';
import { PlayerProfile, PlayableCharacter, Faction } from '../game/types';
import { PLAYABLE_CHARACTERS, getCharacterById, CHARACTER_UNLOCK_MILESTONES } from '../game/characters';
import { sound } from '../game/audio';
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Crown, 
  Lock, 
  Unlock, 
  Check, 
  Sparkles, 
  Sword, 
  Heart, 
  Activity, 
  Crosshair, 
  ChevronRight,
  ArrowRight,
  Trophy,
  Award
} from 'lucide-react';

interface RosterViewProps {
  profile: PlayerProfile;
  onSelectCharacter: (characterId: string) => void;
  onNavigateToStory: () => void;
  onNavigateToArena: () => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  profile,
  onSelectCharacter,
  onNavigateToStory,
  onNavigateToArena,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    profile.activeCharacterId || 'char_raven'
  );
  const [factionFilter, setFactionFilter] = useState<'all' | Faction>('all');

  const selectedChar: PlayableCharacter = getCharacterById(selectedCharId);
  const isSelectedUnlocked = profile.unlockedCharacterIds.includes(selectedChar.id);
  const isActive = profile.activeCharacterId === selectedChar.id;

  const filteredCharacters = PLAYABLE_CHARACTERS.filter((char) => {
    if (factionFilter === 'all') return true;
    return char.faction === factionFilter;
  });

  const unlockedCount = PLAYABLE_CHARACTERS.filter((c) =>
    profile.unlockedCharacterIds.includes(c.id)
  ).length;

  const getFactionColor = (faction: Faction) => {
    switch (faction) {
      case 'legion':
        return {
          border: 'border-amber-600/50',
          bg: 'bg-amber-950/20',
          text: 'text-amber-400',
          badge: 'bg-amber-950/70 text-amber-300 border-amber-600/40',
          glow: 'from-amber-500/20 via-transparent to-transparent',
          accent: '#d97706',
        };
      case 'dynasty':
        return {
          border: 'border-emerald-600/50',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40',
          glow: 'from-emerald-500/20 via-transparent to-transparent',
          accent: '#059669',
        };
      case 'heralds':
        return {
          border: 'border-purple-600/50',
          bg: 'bg-purple-950/20',
          text: 'text-purple-400',
          badge: 'bg-purple-950/70 text-purple-300 border-purple-600/40',
          glow: 'from-purple-500/20 via-transparent to-transparent',
          accent: '#7c3aed',
        };
    }
  };

  const getAvatarIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-6 h-6" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6" />;
      case 'Flame':
        return <Flame className="w-6 h-6" />;
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      case 'Crown':
        return <Crown className="w-6 h-6" />;
      default:
        return <Sword className="w-6 h-6" />;
    }
  };

  const currentFactionStyle = getFactionColor(selectedChar.faction);

  const handleSelectActive = (id: string) => {
    sound.playEquip();
    onSelectCharacter(id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 animate-in fade-in">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-cinzel text-2xl md:text-3xl font-black text-neutral-100 tracking-wide flex items-center gap-2">
                Fighters & Champions Roster
              </h1>
              <p className="text-neutral-400 text-xs md:text-sm">
                Inspect your fighters, compare martial styles, and switch your active duelist persona
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Quick Stats */}
        <div className="flex items-center gap-4 bg-neutral-900/90 border border-neutral-800 px-4 py-2.5 rounded-xl shadow-lg">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Champions Unlocked
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-cinzel text-xl font-bold text-amber-400">
                {unlockedCount}
              </span>
              <span className="text-xs text-neutral-500">/ {PLAYABLE_CHARACTERS.length}</span>
            </div>
          </div>
          <div className="w-28 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
              style={{
                width: `${(unlockedCount / PLAYABLE_CHARACTERS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Roster List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fighters Selection List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Faction Filter Buttons */}
          <div className="flex gap-1.5 p-1 bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-x-auto text-xs font-semibold">
            <button
              id="roster-filter-all"
              onClick={() => setFactionFilter('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all whitespace-nowrap ${
                factionFilter === 'all'
                  ? 'bg-neutral-800 text-neutral-100 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({PLAYABLE_CHARACTERS.length})
            </button>
            <button
              id="roster-filter-legion"
              onClick={() => setFactionFilter('legion')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all whitespace-nowrap ${
                factionFilter === 'legion'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-700/40 shadow'
                  : 'text-neutral-400 hover:text-amber-400'
              }`}
            >
              Legion
            </button>
            <button
              id="roster-filter-dynasty"
              onClick={() => setFactionFilter('dynasty')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all whitespace-nowrap ${
                factionFilter === 'dynasty'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/40 shadow'
                  : 'text-neutral-400 hover:text-emerald-400'
              }`}
            >
              Dynasty
            </button>
            <button
              id="roster-filter-heralds"
              onClick={() => setFactionFilter('heralds')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all whitespace-nowrap ${
                factionFilter === 'heralds'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-700/40 shadow'
                  : 'text-neutral-400 hover:text-purple-400'
              }`}
            >
              Heralds
            </button>
          </div>

          {/* Character Cards */}
          <div className="flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredCharacters.map((char) => {
              const isUnlocked = profile.unlockedCharacterIds.includes(char.id);
              const isCurrent = profile.activeCharacterId === char.id;
              const isSelected = selectedCharId === char.id;
              const fStyle = getFactionColor(char.faction);

              return (
                <div
                  key={char.id}
                  id={`roster-card-${char.id}`}
                  onClick={() => {
                    setSelectedCharId(char.id);
                    sound.playHitLight();
                  }}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-neutral-800/90 border-amber-500 shadow-lg shadow-amber-950/30'
                      : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                  } ${!isUnlocked ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform ${
                        isUnlocked
                          ? `${fStyle.bg} ${fStyle.border} ${fStyle.text}`
                          : 'bg-neutral-900 border-neutral-700 text-neutral-500'
                      }`}
                    >
                      {isUnlocked ? getAvatarIcon(char.avatarIcon) : <Lock className="w-5 h-5" />}
                    </div>

                    {/* Name & Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-cinzel text-sm font-bold text-neutral-100 truncate">
                          {char.name}
                        </h3>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300 shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{char.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded border ${fStyle.badge}`}
                        >
                          {char.faction}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {(char.signatureWeapon?.weaponType || 'katana').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <Unlock className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-amber-400 translate-x-1' : 'text-neutral-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Fighter Showcase & Attributes Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-5 bg-[#10111a] border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Ambient Background */}
          <div
            className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${currentFactionStyle.glow} rounded-full blur-3xl pointer-events-none opacity-40`}
          />

          {/* Fighter Header Info */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-800/80 pb-5">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-xl ${
                  isSelectedUnlocked
                    ? `${currentFactionStyle.bg} ${currentFactionStyle.border} ${currentFactionStyle.text}`
                    : 'bg-neutral-900 border-neutral-700 text-neutral-500'
                }`}
              >
                {isSelectedUnlocked ? (
                  getAvatarIcon(selectedChar.avatarIcon)
                ) : (
                  <Lock className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-cinzel text-2xl font-black text-neutral-100 tracking-wide">
                    {selectedChar.name}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] uppercase font-bold border tracking-wider ${currentFactionStyle.badge}`}
                  >
                    {selectedChar.faction}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] uppercase font-bold bg-neutral-800 border border-neutral-700 text-neutral-300">
                    Tier {selectedChar.level}
                  </span>
                </div>
                <p className="text-sm font-medium text-amber-400/90 mt-0.5">
                  {selectedChar.title}
                </p>
                <p className="text-xs text-neutral-400 italic mt-1 max-w-lg">
                  "{selectedChar.quote}"
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 flex flex-col items-end">
              {isSelectedUnlocked ? (
                isActive ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow">
                    <Check className="w-4 h-4" /> Active Fighter
                  </div>
                ) : (
                  <button
                    id="roster-equip-fighter-btn"
                    onClick={() => handleSelectActive(selectedChar.id)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-neutral-950 font-cinzel font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all"
                  >
                    <Sword className="w-4 h-4" /> Select as Active Duelist
                  </button>
                )
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-400 text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-500" /> Locked Warrior
                </div>
              )}
            </div>
          </div>

          {/* Lore Narrative */}
          <div className="relative z-10 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Warrior Biography
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">{selectedChar.lore}</p>
          </div>

          {/* Combat Attributes (Health, Attack, Defense, Shadow, Crit, Poise) */}
          <div className="relative z-10 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Combat Performance Parameters</span>
              <span className="text-[10px] text-neutral-500 font-normal">
                Base Combat Multipliers
              </span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Health */}
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> Max Health
                  </span>
                  <span className="font-bold text-neutral-200">
                    {selectedChar.baseStats.maxHealth}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedChar.baseStats.maxHealth / 1000) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Attack */}
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-amber-500" /> Attack Power
                  </span>
                  <span className="font-bold text-neutral-200">
                    {selectedChar.baseStats.attackPower}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedChar.baseStats.attackPower / 160) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Defense */}
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" /> Armor Defense
                  </span>
                  <span className="font-bold text-neutral-200">
                    {selectedChar.baseStats.defense}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedChar.baseStats.defense / 120) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Shadow Power */}
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-500" /> Shadow Surge
                  </span>
                  <span className="font-bold text-neutral-200">
                    {selectedChar.baseStats.shadowPower}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedChar.baseStats.shadowPower / 200) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Critical Chance */}
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-emerald-500" /> Critical Strike
                  </span>
                  <span className="font-bold text-neutral-200">
                    {Math.round(selectedChar.baseStats.critChance * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedChar.baseStats.critChance / 0.5) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Poise */}
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-500" /> Poise Threshold
                  </span>
                  <span className="font-bold text-neutral-200">
                    {selectedChar.baseStats.poise}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedChar.baseStats.poise / 120) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signature Shadow Ability & Weapon */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Signature Shadow Ability Card */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Signature Shadow Art
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/50">
                  {selectedChar.signatureAbility.tag}
                </span>
              </div>
              <h5 className="font-cinzel text-sm font-bold text-neutral-100">
                {selectedChar.signatureAbility.name}
              </h5>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {selectedChar.signatureAbility.description}
              </p>
            </div>

            {/* Signature Weapon Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Sword className="w-3.5 h-3.5 text-amber-400" /> Signature Armament
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {(selectedChar.signatureWeapon?.weaponType || 'katana').replace('_', ' ')}
                </span>
              </div>
              <h5 className="font-cinzel text-sm font-bold text-amber-300">
                {selectedChar.signatureWeapon.name}
              </h5>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {selectedChar.signatureWeapon.description}
              </p>
            </div>
          </div>

          {/* Unlock Requirements Box (if locked) */}
          {!isSelectedUnlocked && (() => {
            const milestone = CHARACTER_UNLOCK_MILESTONES.find((m) => m.charId === selectedChar.id);
            const winsMet = milestone ? profile.battleStats.fightsWon >= milestone.requiredWins : false;
            const levelMet = milestone ? profile.level >= milestone.requiredLevel : false;
            const ratingMet = milestone ? profile.rating >= milestone.requiredRating : false;
            const perfectsMet = milestone ? profile.battleStats.perfectVictories >= milestone.requiredPerfects : false;

            return (
              <div className="relative z-10 p-4 rounded-xl bg-amber-950/20 border border-amber-600/40 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 mt-0.5">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        <span>Warrior Recruitment Trials</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-400">
                          Challenging Path
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-200 mt-1 font-medium">
                        {selectedChar.unlockCondition}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      id="roster-goto-story-btn"
                      onClick={onNavigateToStory}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-cinzel font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      Campaign Boss <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id="roster-goto-arena-btn"
                      onClick={onNavigateToArena}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-cinzel font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      Arena Duel
                    </button>
                  </div>
                </div>

                {milestone && (
                  <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Wins Progress */}
                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Victories</span>
                        <span className={`font-bold ${winsMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {profile.battleStats.fightsWon}/{milestone.requiredWins}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${winsMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{
                            width: `${Math.min(100, (profile.battleStats.fightsWon / milestone.requiredWins) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Level Progress */}
                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Duelist Level</span>
                        <span className={`font-bold ${levelMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                          Lv.{profile.level}/Lv.{milestone.requiredLevel}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${levelMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{
                            width: `${Math.min(100, (profile.level / milestone.requiredLevel) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Rating Progress */}
                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Arena Rating</span>
                        <span className={`font-bold ${ratingMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {profile.rating}/{milestone.requiredRating}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${ratingMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{
                            width: `${Math.min(100, (profile.rating / milestone.requiredRating) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Flawless Rounds */}
                    <div className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">Perfect Rounds</span>
                        <span className={`font-bold ${perfectsMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {profile.battleStats.perfectVictories}/{milestone.requiredPerfects}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${perfectsMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{
                            width: `${Math.min(100, (profile.battleStats.perfectVictories / milestone.requiredPerfects) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
