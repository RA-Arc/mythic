import React, { useState } from 'react';
import { PlayableCharacter, PlayerProfile, Faction } from '../Shadow-Requiem/src/game/types';
import { PLAYABLE_CHARACTERS, getCharacterById } from '../Shadow-Requiem/src/game/characters';
import { sound } from '../Shadow-Requiem/src/game/audio';
import { 
  Shield, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Crown, 
  Check, 
  Sparkles, 
  Sword, 
  Heart, 
  Activity, 
  Crosshair, 
  ChevronRight,
  Trophy,
  X
} from 'lucide-react';

interface CharacterSelectModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onClose: () => void;
  onSelectCharacter: (characterId: string) => void;
  isInitialSelection?: boolean;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSelectCharacter,
  isInitialSelection = false,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    profile.activeCharacterId || 'char_raven'
  );

  if (!isOpen) return null;

  const selectedChar: PlayableCharacter = getCharacterById(selectedCharId);

  const getFactionTheme = (faction: Faction) => {
    switch (faction) {
      case 'legion':
        return {
          border: 'border-amber-600/60',
          bg: 'bg-amber-950/20',
          text: 'text-amber-400',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-600/40',
          glow: 'from-amber-600/20 via-transparent to-transparent',
          accent: '#d97706',
          label: 'Iron Legion',
        };
      case 'dynasty':
        return {
          border: 'border-emerald-600/60',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40',
          glow: 'from-emerald-600/20 via-transparent to-transparent',
          accent: '#059669',
          label: 'Jade Dynasty',
        };
      case 'heralds':
      default:
        return {
          border: 'border-purple-600/60',
          bg: 'bg-purple-950/20',
          text: 'text-purple-400',
          badge: 'bg-purple-950/80 text-purple-300 border-purple-600/40',
          glow: 'from-purple-600/20 via-transparent to-transparent',
          accent: '#7c3aed',
          label: 'Shadow Heralds',
        };
    }
  };

  const getAvatarIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Crown':
        return <Crown className="w-5 h-5" />;
      default:
        return <Sword className="w-5 h-5" />;
    }
  };

  const getWeaponDynamicsInfo = (weaponType: string) => {
    switch (weaponType) {
      case 'katana':
        return {
          title: 'Katana Dynamics (Iaido Precision)',
          description: 'Swift 3-hit horizontal-to-whirlwind combo with high critical multiplier and 30% faster attack cadence.',
          tag: 'Speed & Criticals',
          color: 'text-purple-400 border-purple-800/60 bg-purple-950/40',
        };
      case 'greatsword':
        return {
          title: 'Greatsword Dynamics (Hyper-Armor Cleave)',
          description: 'Sweeping 115px wide-arc cleaves with unbreakable poise. Takes 40% less incoming damage during heavy swings.',
          tag: 'Poise & Heavy Cleave',
          color: 'text-amber-400 border-amber-800/60 bg-amber-950/40',
        };
      case 'warhammer':
        return {
          title: 'Warhammer Dynamics (Tectonic Sunder)',
          description: 'Crushing overhead ground slam that shatters enemy armor defense (-30% defense) and generates shockwaves.',
          tag: 'Armor Shatter & Poise',
          color: 'text-orange-400 border-orange-800/60 bg-orange-950/40',
        };
      case 'nunchaku':
        return {
          title: 'Nunchaku Dynamics (Tempest Flurry)',
          description: 'Rapid multi-hit flurry combos with aerial tempests. Generates double Chi / Shadow Energy on consecutive hits.',
          tag: 'Multi-Hit Chi Surge',
          color: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40',
        };
      case 'kusarigama':
        return {
          title: 'Kusarigama Dynamics (Barbed Chain Lifesteal)',
          description: 'Extended 130px reach chain-and-sickle strikes that siphon 12% of damage dealt back into character health.',
          tag: 'Reach & Vampiric Siphon',
          color: 'text-rose-400 border-rose-800/60 bg-rose-950/40',
        };
      case 'dual_daggers':
        return {
          title: 'Dual Daggers Dynamics (Venom Haste)',
          description: 'Ultra-fast twin slash flurries with 45% attack acceleration and venom damage over time.',
          tag: 'Extreme Haste & Venom',
          color: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40',
        };
      default:
        return {
          title: 'Martial Blade Dynamics',
          description: 'Balanced combat dynamics with versatile striking velocity and standard reach.',
          tag: 'Balanced Martial Art',
          color: 'text-indigo-400 border-indigo-800/60 bg-indigo-950/40',
        };
    }
  };

  const handleConfirmChoice = () => {
    sound.playWhoosh();
    onSelectCharacter(selectedChar.id);
    onClose();
  };

  const selectedFaction = getFactionTheme(selectedChar.faction);
  const weaponDynamics = getWeaponDynamicsInfo(selectedChar.signatureWeapon?.weaponType || 'katana');

  return (
    <div 
      id="character-select-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0d16] border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-[#121422]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              ⚔️
            </div>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-amber-300">
                {isInitialSelection ? 'Choose Your Starting Champion' : 'Champion Roster & Character Selection'}
              </h2>
              <p className="text-xs text-neutral-400">
                Select your fighter to wield dynamic weapon mechanics, martial combos, and manual character building.
              </p>
            </div>
          </div>

          {!isInitialSelection && (
            <button 
              id="close-char-select-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
          
          {/* Left Column: Characters Grid (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-3 bg-[#090a10]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Playable Roster ({PLAYABLE_CHARACTERS.length})
              </span>
              <span className="text-[11px] text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                Select to Preview
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PLAYABLE_CHARACTERS.map((char) => {
                const isSelected = char.id === selectedCharId;
                const isActive = profile.activeCharacterId === char.id;
                const charFaction = getFactionTheme(char.faction);

                return (
                  <button
                    key={char.id}
                    id={`select-char-btn-${char.id}`}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCharId(char.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? `bg-gradient-to-r from-neutral-800 to-neutral-850 ${charFaction.border} shadow-lg ring-1 ring-amber-400/40`
                        : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/50 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                          isSelected ? charFaction.badge : 'bg-neutral-800/70 border-neutral-700 text-neutral-300'
                        }`}
                      >
                        {getAvatarIcon(char.avatarIcon)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel text-sm font-bold text-neutral-100">{char.name}</span>
                          {isActive && (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.2 rounded border border-emerald-800/60">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span className={charFaction.text}>{charFaction.label}</span>
                          <span>•</span>
                          <span className="text-neutral-300 capitalize">{char.signatureWeapon.weaponType}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-neutral-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Character & Weapon Dynamics Inspector (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-[#0e101c]">
            <div className="flex flex-col gap-5">
              
              {/* Character Header Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-[#151726] border border-neutral-800 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${selectedFaction.glow} pointer-events-none rounded-bl-full`} />
                
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${selectedFaction.badge}`}>
                        {selectedFaction.label}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-amber-400/90 font-semibold">
                        {selectedChar.title}
                      </span>
                    </div>
                    <h3 className="font-cinzel text-2xl font-bold text-white tracking-wide">
                      {selectedChar.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-neutral-400">Class Rarity</span>
                    <div className="font-cinzel text-sm font-bold capitalize text-amber-400">{selectedChar.rarity}</div>
                  </div>
                </div>

                <p className="text-xs italic text-neutral-300 mt-2 border-l-2 border-amber-500/40 pl-2.5">
                  "{selectedChar.quote}"
                </p>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {selectedChar.lore}
                </p>
              </div>

              {/* Weapon Dynamics Showcase */}
              <div className="p-4 rounded-xl bg-[#121422] border border-neutral-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sword className="w-4 h-4 text-amber-400" />
                    <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Signature Weapon & Dynamics
                    </span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${weaponDynamics.color}`}>
                    {weaponDynamics.tag}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-1.5 shadow-inner">
                    <img 
                      src={selectedChar.signatureWeapon.sprite32Url || selectedChar.signatureWeapon.spriteUrl} 
                      alt={selectedChar.signatureWeapon.name}
                      className="w-full h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-neutral-100">
                      {selectedChar.signatureWeapon.name}
                    </h4>
                    <p className="text-xs text-neutral-400 capitalize">
                      Type: <strong className="text-amber-400">{selectedChar.signatureWeapon.weaponType}</strong> • Base Power: {selectedChar.signatureWeapon.basePower}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed mt-1">
                  <strong className="text-amber-300">{weaponDynamics.title}:</strong> {weaponDynamics.description}
                </div>
              </div>

              {/* Signature Combat Ability */}
              <div className="p-3.5 rounded-xl bg-[#121422] border border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="font-cinzel text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Signature Shadow Ability
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {selectedChar.signatureAbility.tag}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-indigo-200">{selectedChar.signatureAbility.name}</h5>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {selectedChar.signatureAbility.description}
                </p>
              </div>

              {/* Base Combat Attributes */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Health</div>
                  <div className="font-cinzel text-sm font-bold text-emerald-400">{selectedChar.baseStats.health}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Attack</div>
                  <div className="font-cinzel text-sm font-bold text-amber-400">{selectedChar.baseStats.attackPower}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Defense</div>
                  <div className="font-cinzel text-sm font-bold text-blue-400">{selectedChar.baseStats.defense}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Shadow</div>
                  <div className="font-cinzel text-sm font-bold text-purple-400">{selectedChar.baseStats.shadowPower}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Crit</div>
                  <div className="font-cinzel text-sm font-bold text-rose-400">{Math.round(selectedChar.baseStats.critChance * 100)}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">Poise</div>
                  <div className="font-cinzel text-sm font-bold text-amber-500">{selectedChar.baseStats.poise}</div>
                </div>
              </div>

            </div>

            {/* Bottom Confirmation Action */}
            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div className="text-xs text-neutral-400">
                Selected: <strong className="text-amber-300 font-cinzel">{selectedChar.name}</strong>
              </div>

              <button
                id="confirm-char-choice-btn"
                onClick={handleConfirmChoice}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-cinzel font-bold text-sm tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                {profile.activeCharacterId === selectedChar.id ? 'Keep & Continue' : 'Select This Champion'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
