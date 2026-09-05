import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { MythicShadowApp } from "./MythicShadowApp";
import { Application, Assets, Container, Graphics, Text, TextStyle, AnimatedSprite, Texture } from "pixi.js";
import { Hero } from "./engine/Hero";
import { GameState } from "./engine/GameState";
import { CombatEngine } from "./engine/CombatEngine";
import { ParticleSystem } from "./engine/ParticleSystem";
import { createMythicUI } from "./engine/Ui";
import { createMythicLog } from "./engine/Log";
import { ERA_DATA } from "./engine/data/eras";
import { soundEngine } from "./engine/SoundEngine";
import { EraId } from "./engine/types";
import { ParallaxEngine } from "./engine/ParallaxEngine";
import { getSafeTextures } from "./engine/safeTexture";

async function initGame() {
  const app = new Application();
  await app.init({
    width: 1280,
    height: 720,
    backgroundColor: 0x090b10,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  });

  const canvasHost = document.getElementById("canvas-wrapper") || document.body;
  const wrapper = document.createElement("div");
  wrapper.id = "game-wrapper";
  wrapper.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 1280px;
    height: 720px;
    transform-origin: top left;
    overflow: hidden;
    background: #090b10;
  `;
  canvasHost.appendChild(wrapper);
  wrapper.appendChild(app.canvas);

  // Responsive Scaling for Canvas Host with ResizeObserver
  let resizeRafId: number | null = null;
  let lastScale = -1;

  function resizeGameViewport() {
    if (!canvasHost) return;
    const hostWidth = canvasHost.clientWidth || 1280;
    const scale = hostWidth / 1280;
    if (Math.abs(scale - lastScale) > 0.0005) {
      lastScale = scale;
      wrapper.style.transform = `scale(${scale})`;
    }
  }

  function scheduleResize() {
    if (resizeRafId !== null) {
      cancelAnimationFrame(resizeRafId);
    }
    resizeRafId = requestAnimationFrame(() => {
      resizeGameViewport();
      resizeRafId = null;
    });
  }

  const resizeObserver = new ResizeObserver(() => {
    scheduleResize();
  });
  if (canvasHost) {
    resizeObserver.observe(canvasHost);
  }
  window.addEventListener("resize", scheduleResize);
  scheduleResize();

  // Preload Sprite Assets (Hero, Humanoid Enemies, Bosses, Arc Angel, and UI)
  async function preloadLocalAssets() {
    const assetList: string[] = [];

    // 1. Base Hero sprites
    const heroPrefixes = ["idle", "run", "attack", "jump", "swim", "x"];
    for (const p of heroPrefixes) {
      const count = p === "attack" ? 3 : p === "idle" || p === "jump" || p === "x" ? 4 : 6;
      for (let i = 0; i < count; i++) {
        assetList.push(`assets/sprites/hero/${p}_${i}.png`);
      }
    }

    // 2. Enemy Humanoid (hero1) sprites
    for (const p of heroPrefixes) {
      const count = p === "attack" ? 3 : p === "idle" || p === "jump" || p === "x" ? 4 : 6;
      for (let i = 0; i < count; i++) {
        assetList.push(`assets/sprites/hero1/${p}_${i}.png`);
      }
    }

    // 3. Boss sprites
    const bossFrames = ["flying1", "flying2", "attack1", "attack2"];
    for (const f of bossFrames) {
      assetList.push(`assets/sprites/boss/${f}.png`);
    }

    // 4. Arc Angel (hero2) sprites
    const hero2Configs = [
      { prefix: "hero2-idle", count: 5 },
      { prefix: "hero2-walk", count: 7 },
      { prefix: "hero2-attack", count: 6 },
      { prefix: "hero2-aoe-attack", count: 6 },
      { prefix: "hero2-s-attack", count: 6 },
      { prefix: "hero2-defend", count: 4 },
      { prefix: "hero2-dodge", count: 2 },
      { prefix: "hero2-low-health", count: 6 },
      { prefix: "hero2-parry", count: 3 },
      { prefix: "hero2-perish", count: 6 },
      { prefix: "hero2-levelup", count: 4 }
    ];
    for (const cfg of hero2Configs) {
      for (let i = 1; i <= cfg.count; i++) {
        assetList.push(`assets/sprites/hero2/${cfg.prefix}${i}.png`);
      }
    }
    assetList.push("assets/sprites/hero2/hero2-turn-center.png");
    assetList.push("assets/sprites/hero2/hero2-turn-center2.png");

    // 5. UI sprites
    assetList.push(
      "assets/sprites/ui/hp_fill.png",
      "assets/sprites/ui/hp_frame.png",
      "assets/sprites/ui/hp_glow.png",
      "assets/sprites/ui/ui-toolbar.png"
    );

    // 6. Royalty-Free Separated Era Backgrounds (Clean CraftPix RPG Battlegrounds & Caves)
    assetList.push(
      "assets/backgrounds/packs/flying-island-battle-backgrounds/bg_1.jpg",
      "assets/backgrounds/packs/dragon-caves-battleground-game-asset-pack/bg_1.jpg",
      "assets/backgrounds/packs/cave-horizontal-rpg-battle-backgrounds/bg_2.jpg",
      "assets/backgrounds/packs/horizontal-egypt-battle-backgrounds/bg_1.jpg",
      "assets/backgrounds/packs/castle-horizontal-battle-backgrounds/bg_1.jpg",
      "assets/backgrounds/packs/cave-horizontal-rpg-battle-backgrounds/bg_1.jpg",
      "assets/backgrounds/packs/ship-and-coast-battle-game-backgrounds/bg_1.jpg",
      "assets/backgrounds/packs/orc-lands-horizontal-battle-backgrounds/bg_1.jpg",
      "assets/backgrounds/packs/horizontal-dark-magic-battle-backgrounds/bg_1.jpg",
      "assets/backgrounds/packs/flying-island-battle-backgrounds/bg_3.jpg"
    );

    // 7. Depths Monsters & Companions
    const depthsSpriteNames = [
      "sprGoblin1", "sprGoblin2", "sprGoblin3",
      "sprBatilisk1", "sprBatilisk2", "sprBatilisk3",
      "sprSkeleton", "sprSkeleton2", "sprSkeleton3",
      "sprOrcArcher", "sprOrcArcher2", "sprOrcArcher3",
      "sprLizardMonk", "sprLizardMonk2", "sprLizardMonk3",
      "sprBogslium1", "sprBogslium2", "sprBogslium3",
      "sprGhost1", "sprGhost2", "sprGhost3",
      "sprMinotaur1", "sprMinotaur2", "sprMinotaur3",
      "sprDragon", "sprWizard",
      "sprAttackLarge", "sprAttackSwing", "sprAttackStab",
      "sprAcidProjectile", "sprFirebolt", "sprMagicBolt"
    ];
    for (const s of depthsSpriteNames) {
      const cnt = s === "sprDragon" ? 6 : (s === "sprAttackLarge" || s === "sprAttackSwing" || s === "sprAttackStab") ? 4 : 4;
      for (let i = 0; i < cnt; i++) {
        assetList.push(`assets/depths/sprites/${s}/frame_${i}.png`);
      }
    }

    // Try fetching manifest for any additional frames
    try {
      const manifestResp = await fetch("assets/depths/sprites_manifest.json");
      if (manifestResp.ok) {
        const manifest = await manifestResp.json();
        for (const key of Object.keys(manifest)) {
          const entry = manifest[key];
          if (entry && Array.isArray(entry.frames)) {
            for (const f of entry.frames) {
              if (!assetList.includes(f)) {
                assetList.push(f);
              }
            }
          }
        }
      }
    } catch {
      // Manifest fetch is optional enhancement
    }

    // Batch load into Pixi Assets cache
    const batchSize = 16;
    for (let i = 0; i < assetList.length; i += batchSize) {
      const chunk = assetList.slice(i, i + batchSize);
      await Promise.allSettled(chunk.map(path => Assets.load(path)));
    }
  }

  await preloadLocalAssets();

  // Visual Layers
  const backgroundLayer = new Container();
  backgroundLayer.label = "BackgroundLayer";

  // Dedicated Tactical Combat Container for Hero, Enemies, Bosses & Combat Sprites
  const tacticalCombatContainer = new Container();
  tacticalCombatContainer.label = "TacticalCombatContainer";
  tacticalCombatContainer.sortableChildren = true;

  // Ground shadow graphics layer beneath combat actors
  const shadowGfx = new Graphics();
  shadowGfx.label = "ShadowLayer";
  tacticalCombatContainer.addChild(shadowGfx);

  const particleLayer = new Container();
  particleLayer.label = "ParticleLayer";

  const hudLayer = new Container();
  hudLayer.label = "HudLayer";

  app.stage.addChild(backgroundLayer);
  app.stage.addChild(tacticalCombatContainer);
  app.stage.addChild(particleLayer);
  app.stage.addChild(hudLayer);

  // Core Game Systems
  const gameState = new GameState();
  const particles = new ParticleSystem(particleLayer);
  const hero = new Hero();
  hero.cosmicAlignment = gameState.cosmicAlignment;
  hero.activeSpecialization = gameState.specializations[gameState.currentEra] || "Primordial Shaman";
  hero.sprite.x = 260;
  hero.sprite.y = 420;
  tacticalCombatContainer.addChild(hero.sprite);

  // Expose global references for hybrid react synchronization
  (window as any).gameHero = hero;
  (window as any).gameState = gameState;

  // Mount Unified React App (Shadow Requiem + Character Builder + Manual Combat)
  const reactRootEl = document.getElementById("react-shadow-requiem-root");
  if (reactRootEl) {
    const reactRoot = createRoot(reactRootEl);
    reactRoot.render(React.createElement(MythicShadowApp));
  }

  // Wire up transformation ascension particle effects (replaces any black circle)
  hero.onTransform = (form) => {
    if (form === "arc_angel") {
      particles.triggerAngelAscension(hero.sprite.x, hero.sprite.y);
    } else {
      particles.triggerScreenFlash(0xff3333, 18, 0.35);
      particles.addFloatingText(`✧ ${form.toUpperCase()} ✧`, hero.sprite.x, hero.sprite.y - 50, "#ff7744", 20);
    }
  };

  const combatEngine = new CombatEngine(hero, gameState, particles);
  const logger = createMythicLog(wrapper);
  const ui = createMythicUI(wrapper, hero, gameState, combatEngine, logger);

  // Companion Visual Squadron Asset Setup (Debts in the Depths + Legacy Ninjas)
  function getTextureFrames(folder: string, prefix: string, count: number): Texture[] {
    const frames: Texture[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const tex = Texture.from(`assets/sprites/${folder}/${prefix}_${i}.png`);
        if (tex instanceof Texture) {
          frames.push(tex);
        }
      } catch {
        // Safe texture fallback
      }
    }
    return getSafeTextures(frames);
  }

  const miniNinjaIdle = getTextureFrames("hero1", "idle", 4);
  const miniNinjaRun = getTextureFrames("hero1", "run", 6);
  const miniNinjaAttack = getTextureFrames("hero1", "attack", 3);

  const depthsTroopTexturesCache = new Map<string, Texture[]>();
  function getDepthsTroopFrames(spriteName: string): Texture[] {
    if (depthsTroopTexturesCache.has(spriteName)) {
      return depthsTroopTexturesCache.get(spriteName)!;
    }
    const frameCount = spriteName === "sprDragon" ? 6 : 4;
    const frames: Texture[] = [];
    for (let i = 0; i < frameCount; i++) {
      try {
        const tex = Texture.from(`assets/depths/sprites/${spriteName}/frame_${i}.png`);
        if (tex instanceof Texture) {
          frames.push(tex);
        }
      } catch {
        // Safe fallback
      }
    }
    const res = getSafeTextures(frames.length > 0 ? frames : miniNinjaIdle);
    depthsTroopTexturesCache.set(spriteName, res);
    return res;
  }

  function getTroopBaseScale(spriteName?: string): number {
    if (!spriteName) return 0.42;
    if (spriteName === "sprDragon") return 1.55;
    if (spriteName === "sprMinotaur1") return 1.4;
    if (spriteName === "sprBatilisk1") return 1.35;
    return 1.6; // 16x16 pixel sprites look crisp and charming at 1.6x
  }

  function isTroopFlying(spriteName?: string): boolean {
    return spriteName === "sprBatilisk1" || spriteName === "sprGhost1" || spriteName === "sprDragon";
  }

  interface MiniNinjaUnit {
    troopId: string;
    indexInCategory: number;
    sprite: AnimatedSprite;
    state: "idle" | "run" | "attack";
    offsetX: number;
    offsetY: number;
    attackTimer: number;
    color: number;
    spriteName?: string;
    baseScale: number;
    isFlying?: boolean;
    floatPhase?: number;
  }
  const activeMiniNinjas: MiniNinjaUnit[] = [];

  const FORMATION_OFFSETS: Record<string, Array<{ x: number; y: number }>> = {
    troop_goblin_skirmisher: [
      { x: -35, y: -12 },
      { x: -55, y: -18 },
      { x: -75, y: -24 }
    ],
    troop_batilisk_scout: [
      { x: -45, y: -38 },
      { x: -65, y: -44 },
      { x: -85, y: -50 }
    ],
    troop_skeleton_guard: [
      { x: -50, y: 16 },
      { x: -70, y: 22 }
    ],
    troop_orc_marksman: [
      { x: -70, y: 28 },
      { x: -95, y: 34 }
    ],
    troop_lizard_monk: [
      { x: -85, y: -18 },
      { x: -105, y: -24 }
    ],
    troop_bogslium: [
      { x: -40, y: 32 },
      { x: -60, y: 38 }
    ],
    troop_ghost: [
      { x: -100, y: 8 },
      { x: -120, y: 14 }
    ],
    troop_minotaur: [
      { x: -75, y: -35 },
      { x: -100, y: -42 }
    ],
    troop_dragon: [
      { x: -120, y: -50 }
    ],
    troop_spectral_samurai: [
      { x: -38, y: 16 },
      { x: -62, y: 24 }
    ],
    troop_moonshadow_archer: [
      { x: -50, y: -18 },
      { x: -74, y: -26 }
    ],
    troop_arcane_sorceress: [
      { x: -90, y: 8 },
      { x: -110, y: 16 }
    ],
    troop_valkyrie_seraph: [
      { x: -58, y: -38 },
      { x: -82, y: -44 }
    ]
  };

  // 7-Layer Parallax Engine with Real-Time Ground Water Reflection
  const parallaxEngine = new ParallaxEngine();
  (window as any).parallaxEngine = parallaxEngine;
  backgroundLayer.addChild(parallaxEngine.rootContainer);
  parallaxEngine.setEra(gameState.currentEra);

  let currentRenderedEra: EraId | null = gameState.currentEra;

  // HUD Graphics for HP bars and metrics
  const hudGfx = new Graphics();
  hudLayer.addChild(hudGfx);

  function drawBar(x: number, y: number, cur: number, max: number, w: number, h: number, col: number, bgCol: number = 0x161b22) {
    hudGfx.fill(bgCol).roundRect(x - w / 2, y, w, h, 3);
    const ratio = Math.max(0, Math.min(1, cur / max));
    if (ratio > 0) {
      hudGfx.fill(col).roundRect(x - w / 2, y, w * ratio, h, 3);
    }
  }

  // Hero wandering logic when out of combat
  let wanderTimer = 0;
  let wanderDuration = 60;
  let vx = 0;
  let vy = 0;
  function pickNewWander() {
    const angle = Math.random() * Math.PI * 2;
    vx = Math.cos(angle) * 1.3;
    vy = Math.sin(angle) * 1.3;
    wanderDuration = 50 + Math.random() * 60;
    hero.setState("run");
    hero.sprite.scale.x = vx < 0 ? -1 : 1;
  }
  pickNewWander();

  // Generator 1-second interval loop
  let generatorTickAccumulator = 0;

  // Banner Watermark
  const eraWatermark = new Text({
    text: `${ERA_DATA[gameState.currentEra].name.toUpperCase()} — ${ERA_DATA[gameState.currentEra].subtitle}`,
    style: new TextStyle({
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      fill: "#8b949e",
      fontWeight: "bold",
      letterSpacing: 1
    })
  });
  eraWatermark.x = 24;
  eraWatermark.y = 56;
  hudLayer.addChild(eraWatermark);

  // Combat Interaction Flip Animation Systems
  interface CombatFlipState {
    active: boolean;
    type: "attack" | "crit" | "hurt";
    timer: number;
    duration: number;
    facing: number;
  }

  const heroCombatFlip: CombatFlipState = {
    active: false,
    type: "attack",
    timer: 0,
    duration: 12,
    facing: 1
  };

  const enemyCombatFlip: CombatFlipState = {
    active: false,
    type: "attack",
    timer: 0,
    duration: 12,
    facing: -1
  };

  function triggerHeroFlip(type: "attack" | "crit" | "hurt", facing: number) {
    heroCombatFlip.active = true;
    heroCombatFlip.type = type;
    heroCombatFlip.timer = type === "crit" ? 18 : 12;
    heroCombatFlip.duration = heroCombatFlip.timer;
    heroCombatFlip.facing = facing;
  }

  function triggerEnemyFlip(type: "attack" | "hurt", facing: number) {
    enemyCombatFlip.active = true;
    enemyCombatFlip.type = type;
    enemyCombatFlip.timer = type === "attack" ? 12 : 10;
    enemyCombatFlip.duration = enemyCombatFlip.timer;
    enemyCombatFlip.facing = facing;
  }

  // Main PixiJS Game Loop
  app.ticker.add(ticker => {
    const delta = ticker.deltaTime;

    // Check if background needs to re-render after era switch
    if (currentRenderedEra !== gameState.currentEra) {
      currentRenderedEra = gameState.currentEra;
      parallaxEngine.setEra(gameState.currentEra);
      eraWatermark.text = `${ERA_DATA[gameState.currentEra].name.toUpperCase()} — ${ERA_DATA[gameState.currentEra].subtitle}`;
      particles.addFloatingText(`ENTERED ${ERA_DATA[gameState.currentEra].name}!`, 640, 200, "#ffd700", 28, true);
    }

    // Generator Idle Production (every 60 frames ~ 1 second)
    generatorTickAccumulator += delta;
    if (generatorTickAccumulator >= 60) {
      generatorTickAccumulator = 0;
      gameState.tickGenerators();
      ui.updateUI();
    }

    // Particle system update
    particles.updateAmbientEraWeather(gameState.currentEra);
    particles.update();

    hudGfx.clear();
    shadowGfx.clear();

    // Run Combat Engine Tick Update
    combatEngine.updateTick(delta, logger, () => {
      ui.updateUI();
    });

    // Hero Dead State
    if (hero.hp <= 0) {
      if (combatEngine.heroRespawnTimer <= 0) {
        pickNewWander();
      }
      return;
    }

    // Target Management (perishing enemies fade away naturally before new targets spawn)
    let target = combatEngine.activeEnemy;
    if (!target && combatEngine.spawnDelayTimer <= 0) {
      target = combatEngine.spawnNextTarget(logger);
      if (target) {
        tacticalCombatContainer.addChild(target.sprite);
      }
    }

    // Combat Movement & Attack Execution
    if (target && target.hp > 0 && !target.isPerishing && hero.hp > 0) {
      const dx = target.sprite.x - hero.sprite.x;
      const dy = target.sprite.y - hero.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 110) {
        const rad = Math.atan2(dy, dx);
        hero.sprite.x += Math.cos(rad) * hero.speed;
        hero.sprite.y += Math.sin(rad) * hero.speed;
        vx = Math.cos(rad) * hero.speed;
        vy = Math.sin(rad) * hero.speed;
        if (hero.state !== "run" && hero.hurtTimer <= 0) hero.setState("run");
        if (target.state !== "run" && !target.isBoss) target.setState("run");
      } else {
        vx = 0;
        vy = 0;
        if (hero.hurtTimer <= 0 && hero.state !== "attack") hero.setState("attack");
        if (hero.attackCooldown <= 0) {
          const result = combatEngine.executeHeroAttack(logger);
          const heroFacing = dx < 0 ? -1 : 1;
          const enemyFacing = -heroFacing;
          triggerHeroFlip(result?.isCrit ? "crit" : "attack", heroFacing);
          triggerEnemyFlip("hurt", enemyFacing);
          ui.updateUI();
        }
      }

      // Enemy counter-attack interval
      if (target.attackCooldown > 0) target.attackCooldown -= delta;
      if (dist < 140 && target.hp > 0 && !target.isPerishing && target.attackCooldown <= 0) {
        target.attackCooldown = target.attackInterval;
        combatEngine.executeEnemyAttack(logger);
        const enemyFacing = hero.sprite.x < target.sprite.x ? -1 : 1;
        triggerEnemyFlip("attack", enemyFacing);
        triggerHeroFlip("hurt", -enemyFacing);
        ui.updateUI();
      }
    } else if (hero.hp > 0) {
      // Walking through 3D parallax historical environment
      hero.setState("run");
      vx = 2.4;
      vy = (455 - hero.sprite.y) * 0.08;
      hero.sprite.x += vx;
      hero.sprite.y += vy;
      if (hero.sprite.x > 860) {
        hero.sprite.x = 220;
      }
      if (target && target.state !== "idle" && !target.isBoss && !target.isPerishing) {
        target.setState("idle");
      }
    }

    // Clamp coordinates inside arena bounds
    hero.sprite.x = Math.max(120, Math.min(1160, hero.sprite.x));
    hero.sprite.y = Math.max(410, Math.min(480, hero.sprite.y));

    // Ground shadows for realistic stage grounding
    shadowGfx.fill({ color: 0x000000, alpha: 0.35 }).ellipse(hero.sprite.x, hero.sprite.y + 36, 26, 8);
    if (target && target.hp > 0 && !target.isPerishing) {
      const sWidth = target.isBoss ? 56 : 24;
      const sHeight = target.isBoss ? 16 : 8;
      const sOffsetY = target.isBoss ? 75 : 34;
      shadowGfx.fill({ color: 0x000000, alpha: 0.4 * target.sprite.alpha }).ellipse(target.sprite.x, target.sprite.y + sOffsetY, sWidth, sHeight);
    }

    // Calculate Base Scales & Facing Direction
    const baseHeroScale = hero.activeForm === "arc_angel" ? 1.2 : hero.activeForm === "werewolf" ? 1.15 : hero.activeForm === "mythic_drake" ? 1.3 : 1.0;
    const heroFacing = (target && target.hp > 0) ? (target.sprite.x < hero.sprite.x ? -1 : 1) : (vx < 0 ? -1 : 1);

    // Apply Hero Flip Animation for Combat Interactions
    if (heroCombatFlip.active) {
      heroCombatFlip.timer -= delta;
      const progress = 1 - Math.max(0, heroCombatFlip.timer) / heroCombatFlip.duration;
      if (heroCombatFlip.type === "crit") {
        // Full acrobatic 360-degree combat backflip
        hero.sprite.rotation = progress * Math.PI * 2 * heroCombatFlip.facing;
        const flipSquish = Math.cos(progress * Math.PI * 2);
        hero.sprite.scale.x = heroCombatFlip.facing * baseHeroScale * (0.8 + 0.4 * flipSquish);
        hero.sprite.scale.y = baseHeroScale * (1 + 0.25 * Math.sin(progress * Math.PI));
        hero.sprite.y -= Math.sin(progress * Math.PI) * 20;
      } else if (heroCombatFlip.type === "attack") {
        // Strike flip lunge & scale squish
        hero.sprite.rotation = Math.sin(progress * Math.PI) * 0.28 * heroCombatFlip.facing;
        const flipFactor = Math.cos(progress * Math.PI);
        hero.sprite.scale.x = heroCombatFlip.facing * baseHeroScale * (flipFactor > 0 ? 1.2 : -0.9);
        hero.sprite.scale.y = baseHeroScale * (1.15 - 0.15 * Math.sin(progress * Math.PI));
      } else if (heroCombatFlip.type === "hurt") {
        // Hit recoil tilt
        hero.sprite.rotation = -heroCombatFlip.facing * 0.25 * Math.sin(progress * Math.PI);
        hero.sprite.scale.x = heroCombatFlip.facing * baseHeroScale * 0.85;
        hero.sprite.scale.y = baseHeroScale * 1.1;
      }

      if (heroCombatFlip.timer <= 0) {
        heroCombatFlip.active = false;
        hero.sprite.rotation = 0;
        hero.sprite.scale.set(baseHeroScale);
        hero.sprite.scale.x = heroFacing * baseHeroScale;
      }
    } else {
      hero.sprite.rotation = 0;
      hero.sprite.scale.x = heroFacing * baseHeroScale;
      hero.sprite.scale.y = baseHeroScale;
    }

    // Apply Enemy Flip Animation & Facing
    if (target && target.hp > 0) {
      const baseEnemyScale = target.baseScale;
      const enemyFacing = hero.sprite.x < target.sprite.x ? -1 : 1;

      if (enemyCombatFlip.active) {
        enemyCombatFlip.timer -= delta;
        const progress = 1 - Math.max(0, enemyCombatFlip.timer) / enemyCombatFlip.duration;
        if (enemyCombatFlip.type === "attack") {
          // Forward attack lunge tilt
          target.sprite.rotation = Math.sin(progress * Math.PI) * 0.3 * enemyCombatFlip.facing;
          target.sprite.scale.x = enemyCombatFlip.facing * baseEnemyScale * (1 + 0.25 * Math.sin(progress * Math.PI));
          target.sprite.scale.y = baseEnemyScale * (1.1 - 0.1 * Math.sin(progress * Math.PI));
        } else if (enemyCombatFlip.type === "hurt") {
          // Hit recoil flip: tilts backward and inverts/squishes scale horizontally
          target.sprite.rotation = -enemyCombatFlip.facing * 0.32 * Math.sin(progress * Math.PI);
          const hitFlipFactor = Math.cos(progress * Math.PI);
          target.sprite.scale.x = enemyCombatFlip.facing * baseEnemyScale * (hitFlipFactor > 0 ? 0.8 : -0.7);
          target.sprite.scale.y = baseEnemyScale * (1.2 - 0.2 * Math.sin(progress * Math.PI));
        }

        if (enemyCombatFlip.timer <= 0) {
          enemyCombatFlip.active = false;
          target.sprite.rotation = 0;
          target.sprite.scale.set(baseEnemyScale);
          target.sprite.scale.x = enemyFacing * baseEnemyScale;
        }
      } else {
        target.sprite.rotation = 0;
        target.sprite.scale.x = enemyFacing * baseEnemyScale;
        target.sprite.scale.y = baseEnemyScale;
      }

      target.sprite.zIndex = target.sprite.y;
    }

    hero.sprite.zIndex = hero.sprite.y;

    // Render Real-time HUD Health & XP Bars
    const maxHp = hero.getEffectiveMaxHp();
    drawBar(hero.sprite.x, hero.sprite.y + 44, hero.hp, maxHp, 70, 7, 0x2ea043);
    drawBar(hero.sprite.x, hero.sprite.y + 53, hero.xp, hero.maxXp, 70, 4, 0x1f6feb);

    // Render Transformation Dynamic Aura (Pure celestial particles, no vector circle)
    if (hero.isTransformed) {
      particles.emitFormAura(hero.activeForm, hero.sprite.x, hero.sprite.y);
    }

    // Synchronize and Render Mini-Ninja Squadron Formations
    for (const troop of hero.troops) {
      const targetCount = troop.count || 0;
      const currentOfTroop = activeMiniNinjas.filter(u => u.troopId === troop.id);

      // Check if this troop just executed an attack
      const didAttack = (troop as any).attackTrigger === true;
      if (didAttack) {
        (troop as any).attackTrigger = false;
      }

      // Add new companion minions when player recruits them
      while (currentOfTroop.length < targetCount) {
        const unitIdx = currentOfTroop.length;
        const offsets = FORMATION_OFFSETS[troop.id] || [{ x: -40, y: 0 }, { x: -70, y: 10 }];
        const offset = offsets[unitIdx % offsets.length];

        const spriteName = troop.spriteName;
        const isDepthsTroop = !!spriteName;
        const textures = isDepthsTroop ? getDepthsTroopFrames(spriteName) : miniNinjaIdle;
        const baseScale = getTroopBaseScale(spriteName);
        const flying = isTroopFlying(spriteName);

        const ninjaSprite = new AnimatedSprite(getSafeTextures(textures));
        ninjaSprite.anchor.set(0.5, 0.5);
        ninjaSprite.scale.set(baseScale);
        if (!isDepthsTroop) {
          ninjaSprite.tint = troop.color;
        }
        ninjaSprite.animationSpeed = isDepthsTroop ? 0.16 : 0.12;
        ninjaSprite.play();

        ninjaSprite.x = hero.sprite.x + offset.x;
        ninjaSprite.y = hero.sprite.y + offset.y;
        tacticalCombatContainer.addChild(ninjaSprite);

        const newUnit: MiniNinjaUnit = {
          troopId: troop.id,
          indexInCategory: unitIdx,
          sprite: ninjaSprite,
          state: "idle",
          offsetX: offset.x,
          offsetY: offset.y,
          attackTimer: 0,
          color: troop.color,
          spriteName,
          baseScale,
          isFlying: flying,
          floatPhase: Math.random() * Math.PI * 2
        };
        activeMiniNinjas.push(newUnit);
        currentOfTroop.push(newUnit);
      }

      // Remove minions if count reduced (e.g., reset)
      while (currentOfTroop.length > targetCount) {
        const removed = currentOfTroop.pop()!;
        const idx = activeMiniNinjas.indexOf(removed);
        if (idx !== -1) activeMiniNinjas.splice(idx, 1);
        tacticalCombatContainer.removeChild(removed.sprite);
        removed.sprite.destroy();
      }

      // Trigger combat strike lunge for units of this category
      if (didAttack) {
        if (troop.spriteName === "sprBatilisk1") soundEngine.playBatiliskWing();
        else if (troop.spriteName === "sprOrcArcher") soundEngine.playDepthsSound("sndArrow");
        else if (troop.spriteName === "sprBogslium1") soundEngine.playDepthsSound("sndAcidShot");
        else if (troop.spriteName === "sprMinotaur1" || troop.spriteName === "sprDragon") soundEngine.playDepthsSound("sndLargeAttack");
        else soundEngine.playDepthsSound("sndAttackStab");

        for (const unit of currentOfTroop) {
          unit.attackTimer = 16;
          if (!unit.spriteName && miniNinjaAttack.length > 0) {
            unit.sprite.textures = getSafeTextures(miniNinjaAttack);
            unit.sprite.animationSpeed = 0.2;
            unit.sprite.play();
            unit.state = "attack";
          }
        }
      }
    }

    // Update Companions Positions, Shadows, and Animation Cycles
    for (const ninja of activeMiniNinjas) {
      const facing = heroFacing;
      const targetX = hero.sprite.x + (facing * ninja.offsetX);
      let targetY = hero.sprite.y + ninja.offsetY;

      if (ninja.isFlying) {
        ninja.floatPhase = (ninja.floatPhase || 0) + delta * 0.08;
        targetY += Math.sin(ninja.floatPhase) * 6;
      }

      if (ninja.attackTimer > 0) {
        ninja.attackTimer -= delta;
        const progress = 1 - Math.max(0, ninja.attackTimer) / 16;
        const lungeDist = Math.sin(progress * Math.PI) * 28;
        ninja.sprite.x += (targetX + (facing * lungeDist) - ninja.sprite.x) * 0.25;
        ninja.sprite.y += (targetY - ninja.sprite.y) * 0.25;
        ninja.sprite.scale.y = ninja.baseScale * (1 + 0.15 * Math.sin(progress * Math.PI));

        if (ninja.attackTimer <= 0) {
          ninja.state = "idle";
          if (!ninja.spriteName && miniNinjaIdle.length > 0) {
            ninja.sprite.textures = getSafeTextures(miniNinjaIdle);
            ninja.sprite.animationSpeed = 0.12;
            ninja.sprite.play();
          }
        }
      } else {
        // Marching glide towards tactical formation
        ninja.sprite.x += (targetX - ninja.sprite.x) * 0.14;
        ninja.sprite.y += (targetY - ninja.sprite.y) * 0.14;
        ninja.sprite.scale.y = ninja.baseScale;

        if (hero.state === "run") {
          if (ninja.state !== "run") {
            ninja.state = "run";
            if (!ninja.spriteName && miniNinjaRun.length > 0) {
              ninja.sprite.textures = getSafeTextures(miniNinjaRun);
              ninja.sprite.animationSpeed = 0.18;
              ninja.sprite.play();
            }
          }
        } else {
          if (ninja.state !== "idle") {
            ninja.state = "idle";
            if (!ninja.spriteName && miniNinjaIdle.length > 0) {
              ninja.sprite.textures = getSafeTextures(miniNinjaIdle);
              ninja.sprite.animationSpeed = 0.12;
              ninja.sprite.play();
            }
          }
        }
      }

      ninja.sprite.scale.x = facing * ninja.baseScale;
      ninja.sprite.zIndex = ninja.sprite.y;

      // Draw Companion ground shadow
      const shadowRadiusX = ninja.baseScale > 1.2 ? 14 : 9;
      shadowGfx.fill({ color: 0x000000, alpha: ninja.isFlying ? 0.22 : 0.35 }).ellipse(ninja.sprite.x, hero.sprite.y + ninja.offsetY + 16, shadowRadiusX, 4);
    }

    if (target && target.hp > 0 && !target.isPerishing) {
      const barW = target.isBoss ? 160 : 75;
      const barH = target.isBoss ? 10 : 7;
      const barY = target.sprite.y + (target.isBoss ? 90 : 44);
      drawBar(target.sprite.x, barY, target.hp, target.maxHp, barW, barH, target.isBoss ? 0xda3633 : 0xff7b72);
    }

    // Update 7 independent parallax layers and real-time ground reflection
    const isWalking = hero.state === "run" || Math.abs(vx) > 0.1;
    const walkSpeed = Math.sqrt(vx * vx + vy * vy) || 2.4;
    parallaxEngine.update(delta, isWalking, walkSpeed, heroFacing, hero, combatEngine.activeEnemy, activeMiniNinjas);

    // Sync HTML Sidebars and Header
    syncExternalLayout();
  });

  function syncExternalLayout() {
    // Header Badges
    const eraNameEl = document.getElementById("quick-era-name");
    if (eraNameEl) eraNameEl.textContent = ERA_DATA[hero.activeEra].name;

    const alignEl = document.getElementById("quick-alignment-name");
    if (alignEl) alignEl.textContent = hero.cosmicAlignment;

    const lvlEl = document.getElementById("quick-hero-level");
    if (lvlEl) lvlEl.textContent = `Level ${hero.level}`;

    // Hero Sidebar
    const sideLvl = document.getElementById("sidebar-hero-lvl");
    if (sideLvl) sideLvl.textContent = `LVL ${hero.level}`;

    const sideSpec = document.getElementById("sidebar-hero-spec");
    if (sideSpec) sideSpec.textContent = hero.activeSpecialization;

    const hpEl = document.getElementById("sb-stat-hp");
    if (hpEl) hpEl.textContent = `${Math.floor(hero.hp)} / ${Math.floor(hero.getEffectiveMaxHp())}`;

    const dmgEl = document.getElementById("sb-stat-dmg");
    if (dmgEl) dmgEl.textContent = `${Math.floor(hero.getEffectiveDamage())} DMG`;

    const defEl = document.getElementById("sb-stat-def");
    if (defEl) defEl.textContent = `${Math.floor(hero.getEffectiveDefense())} Armor`;

    const critEl = document.getElementById("sb-stat-crit");
    if (critEl) critEl.textContent = `${hero.getCritRate().toFixed(1)}%`;

    const hasteEl = document.getElementById("sb-stat-haste");
    if (hasteEl) hasteEl.textContent = `${hero.getAttackInterval()} frames`;

    // Combat Indicator
    const bossInd = document.getElementById("sidebar-boss-indicator");
    if (bossInd) {
      if (combatEngine.bossMode || combatEngine.activeEnemy?.isBoss) {
        bossInd.textContent = "BOSS BATTLE";
        bossInd.style.color = "#f85149";
      } else {
        bossInd.textContent = `WAVE COMBAT`;
        bossInd.style.color = "#ffd700";
      }
    }
  }

  // Global Quick Action Buttons in Top Bar
  const summonBtn = document.getElementById("header-summon-boss-btn") || document.getElementById("sidebar-summon-boss-btn");
  if (summonBtn) {
    summonBtn.onclick = () => {
      combatEngine.bossMode = true;
      if (combatEngine.activeEnemy && !combatEngine.activeEnemy.isBoss) {
        combatEngine.activeEnemy.hp = 0; // Trigger boss spawn next cycle
      }
      ui.updateUI();
    };
  }

  const surgeChiBtn = document.getElementById("header-surge-chi-btn");
  if (surgeChiBtn) {
    surgeChiBtn.onclick = () => {
      if (hero.canTransform("arc_angel")) {
        hero.transform("arc_angel", 20);
        particles.addFloatingText("⚡ ARC ANGEL SURGE! ⚡", hero.sprite.x, hero.sprite.y - 70, "#ffd700", 28, true);
        soundEngine.playLevelUp();
      } else {
        ui.openTab("chi");
      }
    };
  }

  // Hook all top quick navigation buttons to open respective screens
  document.querySelectorAll(".quick-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      if (tab) {
        ui.toggleTab(tab as any);
      }
    });
  });

  logger.printLine("Welcome to Mythic Human History: Idle RPG.", "#ffd700");
  logger.printLine(`Era of Dawn active. Defeat elemental spirits and harvest Era-Energy!`, "#58a6ff");
}

initGame();
