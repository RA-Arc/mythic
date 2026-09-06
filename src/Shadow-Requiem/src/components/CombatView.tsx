import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FighterEntity, ParticleEffect, PlayableCharacter, ArenaTheme } from '../game/types';
import { ARENA_WIDTH, GROUND_Y, updateFighterPhysics, updateFighterAI, CombatFrameResult } from '../game/physics';
import { drawArena, drawFighter, drawEffects, CameraState, FloatingText } from '../game/renderer';
import { sound } from '../game/audio';
import { SoundButton } from './SoundButton';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  Award,
  ChevronRight,
  Crown,
  Check,
  Sword,
  Users,
  Gamepad2,
  Shield,
  Maximize2,
  Minimize2,
  Swords,
  Flame
} from 'lucide-react';

interface CombatViewProps {
  playerConfig: FighterEntity;
  enemyConfig: FighterEntity;
  arenaTheme: ArenaTheme;
  matchTitle: string;
  isTwoPlayerMode?: boolean;
  unlockedCharacter?: PlayableCharacter | null;
  onMatchComplete: (winnerId: string, playerPerfect: boolean) => void;
  onEquipUnlockedCharacter?: (characterId: string) => void;
  onExit: () => void;
}

export const CombatView: React.FC<CombatViewProps> = ({
  playerConfig,
  enemyConfig,
  arenaTheme,
  matchTitle,
  isTwoPlayerMode = false,
  unlockedCharacter = null,
  onMatchComplete,
  onEquipUnlockedCharacter,
  onExit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Match state
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [enemyScore, setEnemyScore] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundTimer, setRoundTimer] = useState<number>(99);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [matchOver, setMatchOver] = useState<'victory' | 'defeat' | null>(null);
  const [roundBanner, setRoundBanner] = useState<string>('ROUND 1');
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return true; // Enabled by default so all touch, tablet, and mobile fighters have immediate access to attack controls
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' && !!document.fullscreenElement;
  });

  useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // UI status mirrors for HUD
  const [p1Hp, setP1Hp] = useState(playerConfig.stats.health);
  const [p1MaxHp] = useState(playerConfig.stats.maxHealth);
  const [p1Shadow, setP1Shadow] = useState(0);
  const [p1IsShadowForm, setP1IsShadowForm] = useState(false);

  const [p2Hp, setP2Hp] = useState(enemyConfig.stats.health);
  const [p2MaxHp] = useState(enemyConfig.stats.maxHealth);
  const [p2Shadow, setP2Shadow] = useState(0);
  const [p2IsShadowForm, setP2IsShadowForm] = useState(false);

  const [comboCount, setComboCount] = useState<number>(0);
  const [comboTimer, setComboTimer] = useState<number>(0);

  // Fighter entities reference
  const f1Ref = useRef<FighterEntity>({
    ...playerConfig,
    x: 340,
    y: GROUND_Y,
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
    currentHealth: playerConfig.stats.maxHealth,
    currentShadowEnergy: 0,
    isBlocking: false,
    isInvulnerable: false,
    currentPose: playerConfig.currentPose,
  });

  const f2Ref = useRef<FighterEntity>({
    ...enemyConfig,
    x: 660,
    y: GROUND_Y,
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
    currentHealth: enemyConfig.stats.maxHealth,
    currentShadowEnergy: 0,
    isBlocking: false,
    isInvulnerable: false,
    currentPose: enemyConfig.currentPose,
  });

  const cameraRef = useRef<CameraState>({
    x: 500,
    y: GROUND_Y - 50,
    zoom: 1.05,
    shakeTime: 0,
    shakeIntensity: 0,
  });

  const particlesRef = useRef<ParticleEffect[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const hitstopFramesRef = useRef<number>(0);

  // Keyboard input listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;

      // Single action trigger shortcuts
      const f1 = f1Ref.current;
      if (f1.currentHealth > 0 && !f1.action.startsWith('hit_') && f1.action !== 'knockdown') {
        if (e.code === 'KeyF') triggerAction(f1, 'attack_neutral_1', 0.45);
        if (e.code === 'KeyG') triggerAction(f1, 'attack_forward', 0.55);
        if (e.code === 'KeyH') triggerAction(f1, 'attack_heavy', 0.8);
        if (e.code === 'KeyC') triggerAction(f1, 'attack_down', 0.5);
        if (e.code === 'KeyR') triggerAction(f1, 'attack_up', 0.55);
        if (e.code === 'ShiftLeft' || e.code === 'Space') {
          triggerShadowFormOrAbility(f1);
        }
      }

      // Player 2 local keys if enabled
      if (isTwoPlayerMode) {
        const f2 = f2Ref.current;
        if (f2.currentHealth > 0 && !f2.action.startsWith('hit_') && f2.action !== 'knockdown') {
          if (e.code === 'KeyJ') triggerAction(f2, 'attack_neutral_1', 0.45);
          if (e.code === 'KeyK') triggerAction(f2, 'attack_forward', 0.55);
          if (e.code === 'KeyL') triggerAction(f2, 'attack_heavy', 0.8);
          if (e.code === 'KeyN') triggerAction(f2, 'attack_down', 0.5);
          if (e.code === 'KeyI') triggerAction(f2, 'attack_up', 0.55);
          if (e.code === 'Enter') triggerShadowFormOrAbility(f2);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isTwoPlayerMode]);

  // Trigger fighter action safely
  const triggerAction = (fighter: FighterEntity, actionName: FighterEntity['action'], duration: number) => {
    if (fighter.action.startsWith('attack_') && fighter.actionTimer < fighter.actionDuration * 0.6) {
      return; // prevent cutting off mid swing unless combo window
    }
    fighter.action = actionName;
    fighter.actionTimer = 0;
    fighter.actionDuration = duration;
    fighter.hasHitCurrentAction = false;

    // Play swing audio
    sound.playSwing(actionName === 'attack_heavy' ? 'heavy' : 'medium');
  };

  const triggerShadowFormOrAbility = (fighter: FighterEntity) => {
    if (!fighter.isShadowForm) {
      if (fighter.currentShadowEnergy >= fighter.stats.maxShadowEnergy) {
        fighter.isShadowForm = true;
        fighter.shadowFormDuration = 12;
        sound.playShadowBurst();
        cameraRef.current.shakeTime = 0.3;
        cameraRef.current.shakeIntensity = 12;

        floatingTextsRef.current.push({
          x: fighter.x,
          y: fighter.y - 100,
          text: 'SHADOW FORM!',
          color: '#c084fc',
          fontSize: 26,
          life: 0,
          maxLife: 45,
          isCrit: true,
        });
      }
    } else {
      // Execute shadow ability
      triggerAction(fighter, 'shadow_ability', 0.95);
      sound.playShadowAbilityImpact();
    }
  };

  // Start round banner
  const resetRound = useCallback((nextRound: number) => {
    setRoundNumber(nextRound);
    setRoundTimer(99);
    setRoundBanner(`ROUND ${nextRound}`);

    const f1 = f1Ref.current;
    const f2 = f2Ref.current;

    f1.x = 340;
    f1.y = GROUND_Y;
    f1.vx = 0;
    f1.vy = 0;
    f1.currentHealth = f1.stats.maxHealth;
    f1.action = 'idle';
    f1.actionTimer = 0;
    f1.isShadowForm = false;

    f2.x = 660;
    f2.y = GROUND_Y;
    f2.vx = 0;
    f2.vy = 0;
    f2.currentHealth = f2.stats.maxHealth;
    f2.action = 'idle';
    f2.actionTimer = 0;
    f2.isShadowForm = false;

    setTimeout(() => {
      setRoundBanner('FIGHT!');
      setTimeout(() => setRoundBanner(''), 1000);
    }, 1200);
  }, []);

  // Initialize round on mount
  useEffect(() => {
    sound.startAmbientCombatMusic();
    resetRound(1);
    return () => {
      sound.stopAmbientCombatMusic();
    };
  }, [resetRound]);

  // Round timer countdown
  useEffect(() => {
    if (isPaused || matchOver) return;
    const timerInterval = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          // Time over! Compare HP
          const f1 = f1Ref.current;
          const f2 = f2Ref.current;
          if (f1.currentHealth > f2.currentHealth) {
            handleRoundEnd('p1');
          } else {
            handleRoundEnd('p2');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isPaused, matchOver]);

  // Round end resolution
  const handleRoundEnd = useCallback((winner: 'p1' | 'p2') => {
    if (winner === 'p1') {
      const nextScore = playerScore + 1;
      setPlayerScore(nextScore);
      if (nextScore >= 2) {
        setMatchOver('victory');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        onMatchComplete(f1Ref.current.id, f1Ref.current.currentHealth === f1Ref.current.stats.maxHealth);
      } else {
        setRoundBanner('ROUND WON');
        setTimeout(() => resetRound(roundNumber + 1), 2200);
      }
    } else {
      const nextScore = enemyScore + 1;
      setEnemyScore(nextScore);
      if (nextScore >= 2) {
        setMatchOver('defeat');
        onMatchComplete(f2Ref.current.id, false);
      } else {
        setRoundBanner('ROUND LOST');
        setTimeout(() => resetRound(roundNumber + 1), 2200);
      }
    }
  }, [playerScore, enemyScore, roundNumber, onMatchComplete, resetRound]);

  // Main Render & Physics Game Loop (60 FPS)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      // Responsive canvas resolution sizing
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const f1 = f1Ref.current;
      const f2 = f2Ref.current;
      const camera = cameraRef.current;
      const keys = keysPressedRef.current;

      if (!isPaused && !matchOver) {
        // Hitstop slow-motion frames
        if (hitstopFramesRef.current > 0) {
          hitstopFramesRef.current--;
        } else {
          // --- Player 1 Input Controls ---
          if (f1.currentHealth > 0 && !f1.action.startsWith('attack_') && !f1.action.startsWith('hit_') && f1.action !== 'knockdown' && f1.action !== 'shadow_ability') {
            if (keys['KeyD']) {
              f1.action = f1.direction === 1 ? 'walk_fwd' : 'walk_bwd';
            } else if (keys['KeyA']) {
              f1.action = f1.direction === 1 ? 'walk_bwd' : 'walk_fwd';
            } else if (keys['KeyW'] && f1.y >= GROUND_Y) {
              f1.vy = -14;
              f1.action = 'jump';
            } else if (keys['KeyS']) {
              f1.action = 'crouch';
            } else {
              f1.action = 'idle';
            }
          }

          // --- Player 2 AI or Local Input ---
          if (isTwoPlayerMode) {
            if (f2.currentHealth > 0 && !f2.action.startsWith('attack_') && !f2.action.startsWith('hit_') && f2.action !== 'knockdown' && f2.action !== 'shadow_ability') {
              if (keys['ArrowRight']) {
                f2.action = f2.direction === 1 ? 'walk_fwd' : 'walk_bwd';
              } else if (keys['ArrowLeft']) {
                f2.action = f2.direction === 1 ? 'walk_bwd' : 'walk_fwd';
              } else if (keys['ArrowUp'] && f2.y >= GROUND_Y) {
                f2.vy = -14;
                f2.action = 'jump';
              } else if (keys['ArrowDown']) {
                f2.action = 'crouch';
              } else {
                f2.action = 'idle';
              }
            }
          } else {
            // Intelligent AI logic
            updateFighterAI(f2, f1, dt);
          }

          // --- Physics & Collision Updates ---
          const combatEvents: CombatFrameResult[] = [];
          updateFighterPhysics(f1, f2, dt, combatEvents, particlesRef.current);
          updateFighterPhysics(f2, f1, dt, combatEvents, particlesRef.current);

          // Handle hits and audio feedback
          for (const ev of combatEvents) {
            if (ev.hitBlocked) {
              sound.playMetalParry();
              camera.shakeTime = 0.15;
              camera.shakeIntensity = 6;
              floatingTextsRef.current.push({
                x: ev.hitPos?.x || 500,
                y: (ev.hitPos?.y || 300) - 20,
                text: 'BLOCKED',
                color: '#facc15',
                fontSize: 16,
                life: 0,
                maxLife: 30,
              });
            } else {
              sound.playHitImpact(ev.hitCritical, ev.shadowAbilityTriggered);
              camera.shakeTime = ev.hitCritical || ev.shadowAbilityTriggered ? 0.35 : 0.18;
              camera.shakeIntensity = ev.hitCritical || ev.shadowAbilityTriggered ? 16 : 8;

              if (ev.hitCritical || ev.shadowAbilityTriggered) {
                hitstopFramesRef.current = 4; // SF3 style hit freeze
              }

              floatingTextsRef.current.push({
                x: ev.hitPos?.x || 500,
                y: (ev.hitPos?.y || 300) - 20,
                text: `${ev.damageDealt}${ev.hitCritical ? ' CRIT!' : ''}`,
                color: ev.shadowAbilityTriggered ? '#c084fc' : ev.hitCritical ? '#f43f5e' : '#fb923c',
                fontSize: ev.hitCritical ? 24 : 18,
                life: 0,
                maxLife: 40,
                isCrit: ev.hitCritical,
              });

              if (ev.attackerId === f1.id) {
                setComboCount((c) => c + 1);
                setComboTimer(2.0);
              }
            }
          }

          // Check KO
          if (f1.currentHealth <= 0 && f2.currentHealth > 0 && roundBanner === '') {
            sound.playKnockdown();
            handleRoundEnd('p2');
          } else if (f2.currentHealth <= 0 && f1.currentHealth > 0 && roundBanner === '') {
            sound.playKnockdown();
            handleRoundEnd('p1');
          }
        }
      }

      // Camera dynamic tracking & zoom
      const midX = (f1.x + f2.x) / 2;
      const fighterDist = Math.abs(f1.x - f2.x);
      const targetZoom = Math.max(0.9, Math.min(1.25, 1200 / (fighterDist + 400)));

      camera.x += (midX - camera.x) * 0.08;
      camera.zoom += (targetZoom - camera.zoom) * 0.08;
      if (camera.shakeTime > 0) camera.shakeTime -= dt;

      // Update Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;
        return p.life < p.maxLife;
      });

      // Update Floating Texts
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
        ft.y -= 0.8;
        ft.life++;
        return ft.life < ft.maxLife;
      });

      // Update HUD states
      setP1Hp(f1.currentHealth);
      setP1Shadow(f1.currentShadowEnergy);
      setP1IsShadowForm(f1.isShadowForm);

      setP2Hp(f2.currentHealth);
      setP2Shadow(f2.currentShadowEnergy);
      setP2IsShadowForm(f2.isShadowForm);

      // Render Everything to Canvas
      drawArena(ctx, canvas.width, canvas.height, camera, arenaTheme, time * 0.001);
      drawFighter(ctx, f1, camera, canvas.width, canvas.height, time * 0.001);
      drawFighter(ctx, f2, camera, canvas.width, canvas.height, time * 0.001);
      drawEffects(ctx, particlesRef.current, floatingTextsRef.current, camera, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, matchOver, arenaTheme, isTwoPlayerMode, handleRoundEnd, roundBanner]);

  return (
    <div id="combat-view-container" className="relative w-full h-full flex flex-col bg-[#07070b] overflow-hidden select-none">
      {/* HUD Header: Ultra-Clean Minimalist Health, Timer & Controls */}
      <div id="combat-hud-top" className="absolute top-0 left-0 right-0 z-20 px-4 py-2.5 flex flex-col items-center pointer-events-none">
        <div className="w-full max-w-5xl flex items-center justify-between gap-3">
          
          {/* Player 1 Minimalist HUD */}
          <div id="p1-hud" className="flex-1 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wider text-amber-300 drop-shadow">
                {playerConfig.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase font-semibold">
                {playerConfig.equipment.weapon.weaponType}
              </span>
              <div className="flex gap-1 ml-1">
                <div className={`w-2 h-2 rounded-full border border-amber-500/70 ${playerScore >= 1 ? 'bg-amber-400 shadow-sm shadow-amber-500/50' : 'bg-transparent'}`} />
                <div className={`w-2 h-2 rounded-full border border-amber-500/70 ${playerScore >= 2 ? 'bg-amber-400 shadow-sm shadow-amber-500/50' : 'bg-transparent'}`} />
              </div>
            </div>

            {/* Ultra-Slim Health Bar */}
            <div className="w-full h-2.5 bg-neutral-900/90 border border-neutral-700/80 rounded-sm overflow-hidden relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-150"
                style={{ width: `${Math.max(0, (p1Hp / p1MaxHp) * 100)}%` }}
              />
            </div>

            {/* Slim Shadow Energy Bar */}
            <div className="w-3/4 h-1.5 bg-neutral-950/80 border border-neutral-800 rounded-sm mt-0.5 overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-200 ${
                  p1IsShadowForm 
                    ? 'bg-purple-500 animate-pulse' 
                    : p1Shadow >= 100 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-400 animate-shadow-pulse' 
                      : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, p1Shadow)}%` }}
              />
            </div>
          </div>

          {/* Center Clean Floating Timer */}
          <div id="match-timer-box" className="flex flex-col items-center px-3 pointer-events-auto">
            <span className="font-cinzel text-2xl sm:text-3xl font-black text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-none">
              {roundTimer}
            </span>
          </div>

          {/* Player 2 / Enemy Minimalist HUD */}
          <div id="p2-hud" className="flex-1 flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-1 mr-1">
                <div className={`w-2 h-2 rounded-full border border-rose-500/70 ${enemyScore >= 2 ? 'bg-rose-400 shadow-sm shadow-rose-500/50' : 'bg-transparent'}`} />
                <div className={`w-2 h-2 rounded-full border border-rose-500/70 ${enemyScore >= 1 ? 'bg-rose-400 shadow-sm shadow-rose-500/50' : 'bg-transparent'}`} />
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 uppercase font-semibold">
                {enemyConfig.equipment.weapon.weaponType}
              </span>
              <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wider text-rose-300 drop-shadow">
                {enemyConfig.name}
              </span>
            </div>

            {/* Ultra-Slim Health Bar */}
            <div className="w-full h-2.5 bg-neutral-900/90 border border-neutral-700/80 rounded-sm overflow-hidden relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-l from-rose-600 via-rose-500 to-amber-500 transition-all duration-150 ml-auto"
                style={{ width: `${Math.max(0, (p2Hp / p2MaxHp) * 100)}%` }}
              />
            </div>

            {/* Slim Shadow Energy Bar */}
            <div className="w-3/4 h-1.5 bg-neutral-950/80 border border-neutral-800 rounded-sm mt-0.5 overflow-hidden relative ml-auto">
              <div 
                className={`h-full transition-all duration-200 ml-auto ${
                  p2IsShadowForm 
                    ? 'bg-purple-500 animate-pulse' 
                    : p2Shadow >= 100 
                      ? 'bg-gradient-to-l from-indigo-500 to-purple-400' 
                      : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, p2Shadow)}%` }}
              />
            </div>
          </div>

        </div>

        {/* Minimalist Action Controls Row: Exit, Touch Toggle, Fullscreen, Sound & Pause */}
        <div className="w-full max-w-5xl flex justify-between items-center mt-1.5 pointer-events-auto">
          <button 
            id="combat-exit-btn"
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur transition-all flex items-center gap-1.5 text-xs font-cinzel font-bold shadow-sm active:scale-95"
            title="Exit Combat"
          >
            <span>←</span>
            <span>Exit Duel</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              id="toggle-touch-controls-btn"
              onClick={() => setShowTouchControls(!showTouchControls)}
              className={`px-2.5 py-1.5 rounded-lg border backdrop-blur transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 ${
                showTouchControls 
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]' 
                  : 'bg-neutral-900/90 border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
              title={showTouchControls ? 'Hide Virtual Touch Controls' : 'Show Virtual Touch Controls'}
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>Controls: {showTouchControls ? 'ON' : 'OFF'}</span>
            </button>

            <button
              id="combat-fullscreen-btn"
              onClick={toggleFullscreen}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Toggle Fullscreen View"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
            </button>

            <SoundButton id="combat-sound-btn" size="sm" showLabel={false} />
            <button 
              id="pause-toggle-btn"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 backdrop-blur transition-all flex items-center shadow-sm active:scale-95"
              title={isPaused ? 'Resume Match' : 'Pause Match'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Combo Counter HUD Display */}
      {comboCount >= 2 && (
        <div id="combo-hud-popup" className="absolute top-20 left-6 z-20 pointer-events-none animate-bounce">
          <div className="font-cinzel text-2xl font-black text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.7)]">
            {comboCount} <span className="text-sm">HITS</span>
          </div>
        </div>
      )}

      {/* Round Announcement Banner */}
      {roundBanner && (
        <div id="round-banner" className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[2px]">
          <div className="font-cinzel text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] tracking-widest animate-pulse">
            {roundBanner}
          </div>
        </div>
      )}

      {/* Primary 60FPS Fighting Canvas - Pure Unobstructed View */}
      <canvas 
        ref={canvasRef} 
        id="combat-canvas"
        className="w-full h-full flex-1 touch-none"
      />

      {/* Tablet & Mobile Touch Controls (Arcade Action Suite) */}
      {showTouchControls && (
        <div 
          id="combat-controls-overlay" 
          className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-30 px-3 sm:px-6 flex justify-between items-end pointer-events-none select-none pb-[env(safe-area-inset-bottom,4px)] animate-fadeIn"
        >
          {/* Left: 4-Way Movement D-Pad */}
          <div 
            id="virtual-dpad" 
            className="flex flex-col items-center gap-1 sm:gap-1.5 pointer-events-auto bg-black/60 p-2 sm:p-3 rounded-2xl border border-neutral-700/80 backdrop-blur-md shadow-2xl touch-none"
          >
            <button 
              id="btn-move-jump"
              onPointerDown={(e) => {
                e.preventDefault();
                const f1 = f1Ref.current;
                if (f1.y >= GROUND_Y) {
                  f1.vy = -14;
                  f1.action = 'jump';
                }
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-800/90 active:bg-amber-500/40 border border-neutral-600 active:border-amber-400 flex flex-col items-center justify-center font-bold text-neutral-200 shadow-md active:scale-95 transition-transform touch-none"
              title="Jump [W / Up]"
            >
              <span className="text-sm sm:text-base leading-none">▲</span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-300 mt-0.5">JUMP</span>
            </button>
            <div className="flex gap-1.5 sm:gap-2">
              <button 
                id="btn-move-left"
                onPointerDown={(e) => {
                  e.preventDefault();
                  f1Ref.current.action = f1Ref.current.direction === 1 ? 'walk_bwd' : 'walk_fwd';
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  f1Ref.current.action = 'idle';
                }}
                onPointerLeave={() => { f1Ref.current.action = 'idle'; }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-800/90 active:bg-amber-500/40 border border-neutral-600 active:border-amber-400 flex flex-col items-center justify-center font-bold text-neutral-200 shadow-md active:scale-95 transition-transform touch-none"
                title="Walk Back [A / Left]"
              >
                <span className="text-sm sm:text-base leading-none">◀</span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-300 mt-0.5">BACK</span>
              </button>
              <button 
                id="btn-move-crouch"
                onPointerDown={(e) => {
                  e.preventDefault();
                  f1Ref.current.action = 'crouch';
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  f1Ref.current.action = 'idle';
                }}
                onPointerLeave={() => { f1Ref.current.action = 'idle'; }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-800/90 active:bg-amber-500/40 border border-neutral-600 active:border-amber-400 flex flex-col items-center justify-center font-bold text-neutral-200 shadow-md active:scale-95 transition-transform touch-none"
                title="Crouch / Duck [S / Down]"
              >
                <span className="text-sm sm:text-base leading-none">▼</span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-300 mt-0.5">DUCK</span>
              </button>
              <button 
                id="btn-move-right"
                onPointerDown={(e) => {
                  e.preventDefault();
                  f1Ref.current.action = f1Ref.current.direction === 1 ? 'walk_fwd' : 'walk_bwd';
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  f1Ref.current.action = 'idle';
                }}
                onPointerLeave={() => { f1Ref.current.action = 'idle'; }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-800/90 active:bg-amber-500/40 border border-neutral-600 active:border-amber-400 flex flex-col items-center justify-center font-bold text-neutral-200 shadow-md active:scale-95 transition-transform touch-none"
                title="Advance Forward [D / Right]"
              >
                <span className="text-sm sm:text-base leading-none">▶</span>
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-300 mt-0.5">FWD</span>
              </button>
            </div>
          </div>

          {/* Right: Arcade Strike & Combat Action Buttons */}
          <div 
            id="virtual-action-buttons" 
            className="pointer-events-auto bg-black/60 border border-neutral-700/80 p-2 sm:p-3 rounded-2xl backdrop-blur-md shadow-2xl flex flex-wrap max-w-[290px] sm:max-w-[360px] items-center justify-end gap-1.5 sm:gap-2 touch-none"
          >
            {/* Guard / Block */}
            <button 
              id="btn-action-guard"
              onPointerDown={(e) => {
                e.preventDefault();
                f1Ref.current.action = 'crouch';
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                f1Ref.current.action = 'idle';
              }}
              onPointerLeave={() => { f1Ref.current.action = 'idle'; }}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-slate-900/90 active:bg-blue-600/40 border border-slate-600 active:border-blue-400 flex flex-col items-center justify-center text-white shadow-md active:scale-95 transition-transform touch-none"
              title="Block / Guard [S]"
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase">BLOCK</span>
            </button>

            {/* Low Sweep Attack */}
            <button 
              id="btn-attack-down"
              onPointerDown={(e) => {
                e.preventDefault();
                triggerAction(f1Ref.current, 'attack_down', 0.5);
              }}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-neutral-900/90 active:bg-lime-600/40 border border-neutral-700 active:border-lime-400 flex flex-col items-center justify-center text-white shadow-md active:scale-95 transition-transform touch-none"
              title="Low Sweep [C]"
            >
              <span className="text-xs font-black text-lime-400">SWEEP</span>
              <span className="text-[8px] text-neutral-400 font-mono">[C]</span>
            </button>

            {/* Forward Lunge / Thrust */}
            <button 
              id="btn-attack-fwd"
              onPointerDown={(e) => {
                e.preventDefault();
                triggerAction(f1Ref.current, 'attack_forward', 0.55);
              }}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-neutral-900/90 active:bg-cyan-600/40 border border-neutral-700 active:border-cyan-400 flex flex-col items-center justify-center text-white shadow-md active:scale-95 transition-transform touch-none"
              title="Lunge Strike [G]"
            >
              <span className="text-xs font-black text-cyan-400">LUNGE</span>
              <span className="text-[8px] text-neutral-400 font-mono">[G]</span>
            </button>

            {/* Heavy Charged Breaker */}
            <button 
              id="btn-attack-heavy"
              onPointerDown={(e) => {
                e.preventDefault();
                triggerAction(f1Ref.current, 'attack_heavy', 0.8);
              }}
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 active:from-amber-400 active:to-amber-600 border-2 border-amber-400 shadow-xl shadow-amber-950/60 flex flex-col items-center justify-center text-white active:scale-95 transition-transform touch-none"
              title="Heavy Breaker [H]"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
              <span className="text-[10px] sm:text-xs font-black uppercase text-amber-100 tracking-wider">HEAVY</span>
            </button>

            {/* Light Combo Strike - Primary Action Button */}
            <button 
              id="btn-attack-light"
              onPointerDown={(e) => {
                e.preventDefault();
                triggerAction(f1Ref.current, 'attack_neutral_1', 0.45);
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 active:from-emerald-400 active:to-teal-500 border-2 border-emerald-300 shadow-xl shadow-emerald-950/70 flex flex-col items-center justify-center text-white active:scale-95 transition-transform touch-none"
              title="Slash Combo [F]"
            >
              <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">STRIKE</span>
            </button>

            {/* Shadow Form / Ability Button */}
            <button 
              id="btn-shadow-ability"
              onPointerDown={(e) => {
                e.preventDefault();
                triggerShadowFormOrAbility(f1Ref.current);
              }}
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center border-2 transition-all active:scale-95 touch-none ${
                p1IsShadowForm 
                  ? 'bg-purple-600 border-purple-300 shadow-[0_0_24px_rgba(168,85,247,0.9)] animate-pulse' 
                  : p1Shadow >= 100 
                    ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.7)] animate-bounce' 
                    : 'bg-neutral-900/80 border-neutral-700 opacity-60'
              }`}
              title="Shadow Form / Ability [Shift / Space]"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-200" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-purple-200">SHADOW</span>
            </button>
          </div>
        </div>
      )}

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div id="pause-modal" className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#12131c] border border-neutral-700 rounded-xl p-6 flex flex-col items-center shadow-2xl">
            <h2 className="font-cinzel text-2xl font-bold text-amber-400 mb-4">Combat Paused</h2>

            {/* Keyboard Guide */}
            <div className="w-full p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-300 mb-5 grid grid-cols-2 gap-1.5">
              <div><strong className="text-amber-300">A / D:</strong> Move</div>
              <div><strong className="text-amber-300">W:</strong> Jump</div>
              <div><strong className="text-amber-300">S:</strong> Crouch</div>
              <div><strong className="text-amber-300">F:</strong> Light Strike</div>
              <div><strong className="text-amber-300">G:</strong> Forward Lunge</div>
              <div><strong className="text-amber-300">H:</strong> Heavy Strike</div>
              <div><strong className="text-amber-300">C:</strong> Low Sweep</div>
              <div><strong className="text-purple-300">Shift / Space:</strong> Shadow Form</div>
            </div>
            
            <div className="w-full flex flex-col gap-3">
              <button 
                id="pause-resume-btn"
                onClick={() => setIsPaused(false)}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all"
              >
                Resume Battle
              </button>
              <button 
                id="pause-restart-btn"
                onClick={() => {
                  setPlayerScore(0);
                  setEnemyScore(0);
                  resetRound(1);
                  setIsPaused(false);
                }}
                className="w-full py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-medium text-neutral-200 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Restart Round
              </button>
              <button 
                id="pause-quit-btn"
                onClick={onExit}
                className="w-full py-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Result Overlay (Victory / Defeat) */}
      {matchOver && (
        <div id="match-over-modal" className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#11121b] border-2 border-amber-500/60 rounded-2xl p-6 flex flex-col items-center shadow-2xl text-center">
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              matchOver === 'victory' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/50' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-400/50'
            }`}>
              <Award className="w-8 h-8" />
            </div>

            <h2 className={`font-cinzel text-3xl md:text-4xl font-black mb-2 tracking-wider ${
              matchOver === 'victory' ? 'text-amber-400 drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]' : 'text-rose-500'
            }`}>
              {matchOver === 'victory' ? 'VICTORY ACHIEVED' : 'DEFEAT'}
            </h2>

            <p className="text-neutral-400 text-sm mb-6">
              {matchOver === 'victory' 
                ? 'You stood victorious in the shadow arena and shattered your opponent!' 
                : 'Your defenses were breached. Reforge your armor, master your stances, and strike again.'}
            </p>

            {/* Match Rewards */}
            {matchOver === 'victory' && (
              <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 mb-4 flex justify-around">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-neutral-400">Gold Acquired</span>
                  <span className="font-cinzel text-lg font-bold text-amber-400">+450 Gold</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-neutral-400">Shadow Cores</span>
                  <span className="font-cinzel text-lg font-bold text-indigo-400">+35 Cores</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-neutral-400">Duel Rating</span>
                  <span className="font-cinzel text-lg font-bold text-emerald-400">+30 Trophies</span>
                </div>
              </div>
            )}

            {/* Boss Defeated / Character Unlocked Spotlight */}
            {matchOver === 'victory' && unlockedCharacter && (
              <div className="w-full bg-gradient-to-b from-amber-950/40 to-black/60 border-2 border-amber-500/70 rounded-xl p-4 mb-5 shadow-xl text-left relative overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> New Champion Unlocked!
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {unlockedCharacter.faction}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-cinzel text-base font-black text-neutral-100 truncate">
                      {unlockedCharacter.name}
                    </h4>
                    <p className="text-xs text-amber-300/90 font-medium truncate">
                      {unlockedCharacter.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      Weapon: {unlockedCharacter.signatureWeapon.name}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-300 mt-2.5 pt-2 border-t border-neutral-800/80 leading-relaxed italic">
                  "Having overcome this warrior in mortal combat, they have sworn their blade to your command!"
                </p>

                {onEquipUnlockedCharacter && (
                  <button
                    id="equip-new-unlocked-char-btn"
                    onClick={() => {
                      onEquipUnlockedCharacter(unlockedCharacter.id);
                      onExit();
                    }}
                    className="w-full mt-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 font-cinzel font-bold text-black text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <Sword className="w-3.5 h-3.5" /> Equip & Play As {unlockedCharacter.name}
                  </button>
                )}
              </div>
            )}

            <button 
              id="match-complete-continue-btn"
              onClick={onExit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 font-bold text-black font-cinzel text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition-all"
            >
              Continue to Realm Hub <ChevronRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
