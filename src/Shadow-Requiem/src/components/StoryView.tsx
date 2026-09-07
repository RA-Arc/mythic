import React, { useState } from 'react';
import { PlayerProfile, StoryStage } from '../game/types';
import { STORY_CAMPAIGN } from '../game/campaign';
import { SoundButton } from './SoundButton';
import { 
  BookOpen, 
  MapPin, 
  Award, 
  ChevronRight, 
  Skull, 
  ShieldAlert, 
  Sword, 
  Flame, 
  Zap, 
  Crown, 
  Sparkles,
  CheckCircle,
  Lock
} from 'lucide-react';

interface StoryViewProps {
  profile: PlayerProfile;
  onSelectStage: (stage: StoryStage) => void;
  onBack: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  profile,
  onSelectStage,
  onBack,
}) => {
  const [selectedStage, setSelectedStage] = useState<StoryStage>(STORY_CAMPAIGN[0]);
  const [showDialogue, setShowDialogue] = useState<boolean>(false);
  const [dialogueIdx, setDialogueIdx] = useState<number>(0);

  const handleStartBriefing = (stage: StoryStage) => {
    setSelectedStage(stage);
    setDialogueIdx(0);
    setShowDialogue(true);
  };

  const handleNextDialogue = () => {
    if (dialogueIdx < selectedStage.dialogueBefore.length - 1) {
      setDialogueIdx(dialogueIdx + 1);
    } else {
      setShowDialogue(false);
      onSelectStage(selectedStage);
    }
  };

  return (
    <div id="story-view" className="w-full h-full flex flex-col bg-[#07080e] text-neutral-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 px-6 py-4 bg-[#0d0e17]/95 border-b border-neutral-800 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-4">
          <button 
            id="story-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold border border-neutral-700 text-neutral-200 transition-all"
          >
            ← Return to Realm
          </button>
          <div>
            <h1 className="font-cinzel text-xl font-bold text-amber-400">Chronicles of the Dark Realm</h1>
            <p className="text-xs text-neutral-400">Embark on the perilous path through the Three Factions to confront the Void Titan.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SoundButton id="story-sound-btn" size="sm" />
          <div className="bg-neutral-900 border border-neutral-800 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Stage {profile.storyProgress + 1} of {STORY_CAMPAIGN.length} Unlocked</span>
          </div>
        </div>
      </div>

      {/* Main Campaign Canvas Layout */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Stages Timeline Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-cinzel text-base font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" /> Storyline Nodes
          </h2>

          <div className="flex flex-col gap-3">
            {STORY_CAMPAIGN.map((stage, idx) => {
              const isCompleted = profile.storyProgress > idx;
              const isCurrent = profile.storyProgress === idx;
              const isLocked = profile.storyProgress < idx;

              return (
                <div
                  key={stage.id}
                  onClick={() => !isLocked && setSelectedStage(stage)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedStage.id === stage.id
                      ? 'bg-neutral-800/90 border-amber-400 shadow-xl shadow-amber-500/10'
                      : isLocked
                        ? 'bg-neutral-950/60 border-neutral-900 opacity-50 cursor-not-allowed'
                        : 'bg-[#10121d] border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Node Status Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-cinzel text-base font-black ${
                      isCompleted 
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400' 
                        : isCurrent 
                          ? 'bg-amber-950/60 border-amber-400 text-amber-300 animate-pulse' 
                          : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : `ACT ${stage.act}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase text-amber-400">{stage.subtitle}</span>
                        {stage.enemy.bossPhases && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-400 font-bold uppercase">
                            Boss Encounter
                          </span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                          🏟️ {stage.arenaBackground.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-cinzel text-base font-bold text-white">{stage.title}</h3>
                      <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <Skull className="w-3.5 h-3.5 text-neutral-500" /> Foe: {stage.enemy.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Recommended Power</span>
                    <div className="font-cinzel text-sm font-bold text-indigo-400">
                      {stage.enemy.stats.attackPower * 4 + stage.enemy.stats.defense * 2}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail & Launch Briefing (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="font-cinzel text-base font-bold text-neutral-300 uppercase tracking-wider">
            Stage Intel
          </h2>

          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                {selectedStage.subtitle}
              </span>
              <h3 className="font-cinzel text-2xl font-black text-white mt-1 mb-3">
                {selectedStage.title}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-6 bg-black/40 p-3.5 rounded-xl border border-neutral-800/80">
                "{selectedStage.loreIntro}"
              </p>

              {/* Boss/Opponent Preview */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-600 flex items-center justify-center text-rose-400">
                    <Skull className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white">{selectedStage.enemy.name}</h4>
                    <span className="text-xs text-rose-400 font-semibold">{selectedStage.enemy.title}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400">Health</span>
                    <div className="font-cinzel text-xs font-bold text-emerald-400">{selectedStage.enemy.stats.health}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400">Attack</span>
                    <div className="font-cinzel text-xs font-bold text-rose-400">{selectedStage.enemy.stats.attackPower}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400">Weapon</span>
                    <div className="font-cinzel text-xs font-bold text-amber-400 capitalize">{selectedStage.enemy.weapon.weaponType}</div>
                  </div>
                </div>
              </div>

              {/* Battleground Arena */}
              <div className="bg-neutral-900/60 border border-neutral-800/90 rounded-xl p-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm">
                    🏟️
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Battleground Arena</span>
                    <h5 className="font-cinzel text-xs font-bold text-amber-300">
                      {selectedStage.arenaBackground.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h5>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Custom Parallax Map
                </span>
              </div>

              {/* Rewards */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Victory Rewards
                </h4>
                <div className="flex items-center gap-3">
                  <div className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-bold text-amber-400">
                    🪙 {selectedStage.rewards.gold} Gold
                  </div>
                  <div className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-bold text-indigo-400">
                    🔮 {selectedStage.rewards.shadowCores} Cores
                  </div>
                  {selectedStage.rewards.gear && (
                    <div className="bg-amber-950/40 border border-amber-500/60 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300">
                      🎁 {selectedStage.rewards.gear.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              id="start-stage-btn"
              onClick={() => handleStartBriefing(selectedStage)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 font-cinzel font-black text-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 transition-all"
            >
              Initiate Story Encounter <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Narrative Dialogue Cinematics Modal */}
      {showDialogue && (
        <div id="narrative-dialogue-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#10121d] border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative">
            
            {/* Speaker Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                  <Sword className="w-4 h-4" />
                </div>
                <span className="font-cinzel text-base font-bold text-amber-400">
                  {selectedStage.dialogueBefore[dialogueIdx].speaker}
                </span>
              </div>
              <span className="text-xs text-neutral-400">
                Dialogue {dialogueIdx + 1} of {selectedStage.dialogueBefore.length}
              </span>
            </div>

            {/* Dialogue Text */}
            <p className="font-rajdhani text-lg text-neutral-100 leading-relaxed min-h-[60px]">
              "{selectedStage.dialogueBefore[dialogueIdx].text}"
            </p>

            {/* Next / Proceed Button */}
            <div className="flex justify-end pt-2">
              <button
                id="dialogue-continue-btn"
                onClick={handleNextDialogue}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-cinzel font-bold text-black text-xs uppercase flex items-center gap-2 shadow-lg transition-all"
              >
                {dialogueIdx < selectedStage.dialogueBefore.length - 1 ? 'Next' : 'Engage in Battle!'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
