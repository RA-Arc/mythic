import React from 'react';
import { PlayerProfile, Faction } from '../game/types';
import { PERK_CATALOG } from '../game/armor';
import { SoundButton } from './SoundButton';
import { 
  ShieldAlert, 
  Flame, 
  Zap, 
  Sparkles, 
  Award, 
  Check, 
  Lock,
  ChevronRight
} from 'lucide-react';

interface TalentsViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onBack: () => void;
}

export const TalentsView: React.FC<TalentsViewProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const [talentMsg, setTalentMsg] = React.useState<string | null>(null);

  const handleUnlockPerk = (perkId: string, costCores: number, costGold: number) => {
    if (profile.shadowCores < costCores || profile.gold < costGold) {
      setTalentMsg(`Need ${costCores} Shadow Cores and ${costGold} Gold to unlock this talent.`);
      setTimeout(() => setTalentMsg(null), 3500);
      return;
    }

    onUpdateProfile({
      ...profile,
      shadowCores: profile.shadowCores - costCores,
      gold: profile.gold - costGold,
      unlockedPerks: [...profile.unlockedPerks, perkId],
    });
  };

  return (
    <div id="talents-view" className="w-full h-full flex flex-col bg-[#07080e] text-neutral-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 px-6 py-4 bg-[#0d0e17]/95 border-b border-neutral-800 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-4">
          <button 
            id="talents-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold border border-neutral-700 text-neutral-200 transition-all"
          >
            ← Return to Realm
          </button>
          <div>
            <h1 className="font-cinzel text-xl font-bold text-amber-400">Faction Mastery & Talents</h1>
            <p className="text-xs text-neutral-400">Channel primordial shadow affinities to permanently enhance combat mastery.</p>
          </div>
        </div>

        {/* Header Right: Sound & Currency Display */}
        <div className="flex items-center gap-3">
          <SoundButton id="talents-sound-btn" size="sm" />
          <div className="flex items-center gap-4 bg-black/60 px-4 py-1.5 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <span>🪙</span> {profile.gold} Gold
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
              <span>🔮</span> {profile.shadowCores} Shadow Cores
            </div>
          </div>
        </div>
      </div>

      {/* Main Talents Trees */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        {talentMsg && (
          <div className="px-4 py-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold shadow-lg animate-pulse">
            ⚠️ {talentMsg}
          </div>
        )}
        
        {/* Faction Trees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Legion Tree */}
          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">Legion Bastion</h3>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Mastery of heavy armor, unbreakable poise, and crushing blows that stagger fast opponents.
              </p>

              <div className="flex flex-col gap-3">
                {PERK_CATALOG.filter((p) => p.id === 'perk_damage_reduction' || p.id === 'perk_unbreakable_poise').map((perk) => {
                  const isUnlocked = profile.unlockedPerks.includes(perk.id);
                  return (
                    <div key={perk.id} className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-xs font-bold text-white">{perk.name}</span>
                        {isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Mastered
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{perk.description}</p>
                      {!isUnlocked && (
                        <button
                          onClick={() => handleUnlockPerk(perk.id, 40, 500)}
                          className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold text-[11px] transition-all"
                        >
                          Unlock (40 Cores + 500 🪙)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dynasty Tree */}
          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Flame className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">Dynasty Gale</h3>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Fluid acrobatics, high agility, rapid combo flurries, and sweeping low strikes.
              </p>

              <div className="flex flex-col gap-3">
                {PERK_CATALOG.filter((p) => p.id === 'perk_combo_surge').map((perk) => {
                  const isUnlocked = profile.unlockedPerks.includes(perk.id);
                  return (
                    <div key={perk.id} className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-xs font-bold text-white">{perk.name}</span>
                        {isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Mastered
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{perk.description}</p>
                      {!isUnlocked && (
                        <button
                          onClick={() => handleUnlockPerk(perk.id, 40, 500)}
                          className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 font-bold text-[11px] transition-all"
                        >
                          Unlock (40 Cores + 500 🪙)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Herald Tree */}
          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <Zap className="w-5 h-5" />
                <h3 className="font-cinzel text-base font-bold uppercase tracking-wider">Herald Void</h3>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Precision Iaido quickdraws, high critical rates, shadow dimensional rifts, and life siphon.
              </p>

              <div className="flex flex-col gap-3">
                {PERK_CATALOG.filter((p) => p.id === 'perk_crit_damage' || p.id === 'perk_shadow_generation' || p.id === 'perk_lifesteal').map((perk) => {
                  const isUnlocked = profile.unlockedPerks.includes(perk.id);
                  return (
                    <div key={perk.id} className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-xs font-bold text-white">{perk.name}</span>
                        {isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Mastered
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{perk.description}</p>
                      {!isUnlocked && (
                        <button
                          onClick={() => handleUnlockPerk(perk.id, 50, 600)}
                          className="w-full py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 font-bold text-[11px] transition-all"
                        >
                          Unlock (50 Cores + 600 🪙)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
