import { Application, Assets, Container, Graphics, Text, TextStyle } from "pixi.js";
import { Hero } from "./engine/Hero";
import { GameState } from "./engine/GameState";
import { CombatEngine } from "./engine/CombatEngine";
import { ParticleSystem } from "./engine/ParticleSystem";
import { createMythicUI } from "./engine/Ui";
import { createMythicLog } from "./engine/Log";
import { ERA_DATA } from "./engine/data/eras";
import { soundEngine } from "./engine/SoundEngine";
import { EraId } from "./engine/types";

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
  function resizeGameViewport() {
    if (!canvasHost) return;
    const hostWidth = canvasHost.clientWidth || 1280;
    const scale = hostWidth / 1280;
    wrapper.style.transform = `scale(${scale})`;
  }
  const resizeObserver = new ResizeObserver(() => {
    resizeGameViewport();
  });
  if (canvasHost) {
    resizeObserver.observe(canvasHost);
  }
  window.addEventListener("resize", resizeGameViewport);
  setTimeout(resizeGameViewport, 50);

  // Preload Sprite Assets
  const heroPrefixes = ["idle", "run", "attack", "jump", "swim", "x"];
  for (const p of heroPrefixes) {
    const count = p === "attack" ? 3 : p === "idle" || p === "jump" || p === "x" ? 4 : 6;
    for (let i = 0; i < count; i++) {
      try {
        await Assets.load(`assets/sprites/hero/${p}_${i}.png`);
      } catch {
        // Safe texture fallback
      }
    }
  }

  const bossFrames = ["flying1", "flying2", "attack1", "attack2"];
  for (const f of bossFrames) {
    try {
      await Assets.load(`assets/sprites/boss/${f}.png`);
    } catch {
      // Safe texture fallback
    }
  }

  // Visual Layers
  const backgroundLayer = new Container();
  backgroundLayer.label = "BackgroundLayer";

  // Dedicated Tactical Combat Container for Hero, Enemies, Bosses & Combat Sprites
  const tacticalCombatContainer = new Container();
  tacticalCombatContainer.label = "TacticalCombatContainer";

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

  const combatEngine = new CombatEngine(hero, gameState, particles);
  const logger = createMythicLog(wrapper);
  const ui = createMythicUI(wrapper, hero, gameState, combatEngine, logger);

  // Dynamic Background Renderer per Era
  const bgGraphics = new Graphics();
  backgroundLayer.addChild(bgGraphics);

  let currentRenderedEra: EraId | null = null;
  function renderEraBackground(eraId: EraId) {
    bgGraphics.clear();
    const era = ERA_DATA[eraId];

    if (eraId === "dawn") {
      // Primal Volcanic Nebulae
      bgGraphics.fill(0x1a0808).rect(0, 0, 1280, 720);
      bgGraphics.fill(0x331100).circle(300, 200, 260);
      bgGraphics.fill(0x441505).circle(900, 250, 300);
      bgGraphics.fill(0x220a05).rect(0, 480, 1280, 240);
      // Magma cracks
      bgGraphics.stroke({ width: 4, color: 0xff3300, alpha: 0.8 });
      bgGraphics.moveTo(100, 560).lineTo(400, 600).lineTo(700, 570).lineTo(1100, 640);
    } else if (eraId === "fire") {
      // Midnight Forest & Campfire Wastes
      bgGraphics.fill(0x0a0c10).rect(0, 0, 1280, 720);
      bgGraphics.fill(0x1e1208).circle(640, 400, 350);
      bgGraphics.fill(0x151008).rect(0, 480, 1280, 240);
      bgGraphics.fill(0xff6600).circle(640, 520, 40);
    } else if (eraId === "stone") {
      // Megalithic Plateau
      bgGraphics.fill(0x101318).rect(0, 0, 1280, 720);
      bgGraphics.fill(0x2a2824).rect(150, 260, 60, 260);
      bgGraphics.fill(0x2a2824).rect(350, 220, 70, 300);
      bgGraphics.fill(0x2a2824).rect(900, 200, 80, 320);
      bgGraphics.fill(0x3a3832).rect(120, 240, 330, 40); // Dolmen arch
      bgGraphics.fill(0x1a1c1a).rect(0, 500, 1280, 220);
    } else if (eraId === "bronze") {
      // Mediterranean Marble Citadel
      bgGraphics.fill(0x121a24).rect(0, 0, 1280, 720);
      bgGraphics.fill(0xffd700).circle(1100, 150, 80); // Solar disc
      // Marble Pillars
      for (let i = 0; i < 6; i++) {
        bgGraphics.fill(0x3a3d45).rect(120 + i * 200, 240, 40, 280);
      }
      bgGraphics.fill(0x4a4235).rect(80, 200, 1120, 45); // Roof pediment
      bgGraphics.fill(0x1a221a).rect(0, 520, 1280, 200);
    } else if (eraId === "iron") {
      // Imperial Fortress & War Standard
      bgGraphics.fill(0x14161a).rect(0, 0, 1280, 720);
      bgGraphics.fill(0x22262d).rect(0, 320, 1280, 200); // Fortress wall
      bgGraphics.fill(0x30363d).rect(400, 200, 120, 320); // Watchtower
      bgGraphics.fill(0x30363d).rect(800, 200, 120, 320);
      bgGraphics.fill(0x1a1a1e).rect(0, 520, 1280, 200);
    } else if (eraId === "faith") {
      // Gothic Cathedral Sanctum
      bgGraphics.fill(0x0c0c16).rect(0, 0, 1280, 720);
      // Rose window
      bgGraphics.fill(0xffcc00).circle(640, 220, 110);
      bgGraphics.fill(0x334488).circle(640, 220, 95);
      // Light shafts
      bgGraphics.fill(0xfffae6).poly([560, 220, 720, 220, 1000, 720, 280, 720]);
      bgGraphics.alpha = 0.85;
      bgGraphics.fill(0x14121a).rect(0, 520, 1280, 200);
    } else if (eraId === "discovery") {
      // Renaissance Alchemical Observatory
      bgGraphics.fill(0x081418).rect(0, 0, 1280, 720);
      bgGraphics.stroke({ width: 3, color: 0x00e5ff, alpha: 0.6 });
      bgGraphics.circle(640, 260, 160);
      bgGraphics.circle(640, 260, 220);
      bgGraphics.fill(0x12242a).rect(0, 500, 1280, 220);
    } else if (eraId === "steam") {
      // Industrial Machine Metropolis
      bgGraphics.fill(0x181410).rect(0, 0, 1280, 720);
      // Smokestacks
      bgGraphics.fill(0x28201a).rect(200, 140, 60, 380);
      bgGraphics.fill(0x28201a).rect(450, 100, 80, 420);
      bgGraphics.fill(0x28201a).rect(850, 160, 70, 360);
      bgGraphics.fill(0x1c1a18).rect(0, 520, 1280, 200);
    } else if (eraId === "atom") {
      // Nuclear Tokamak Facility & Neon Grid
      bgGraphics.fill(0x061208).rect(0, 0, 1280, 720);
      bgGraphics.fill(0x39ff14).circle(640, 260, 140);
      bgGraphics.fill(0x091c0e).circle(640, 260, 120);
      bgGraphics.fill(0x0b1e10).rect(0, 500, 1280, 220);
    } else if (eraId === "stars") {
      // Cosmic Singularity & Dyson Rings
      bgGraphics.fill(0x040308).rect(0, 0, 1280, 720);
      bgGraphics.fill(0x7b2cbf).circle(640, 240, 180);
      bgGraphics.fill(0x000000).circle(640, 240, 150); // Black hole core
      bgGraphics.stroke({ width: 4, color: 0x00f0ff, alpha: 0.7 });
      bgGraphics.ellipse(640, 240, 320, 80);
      bgGraphics.fill(0x0d0b1a).rect(0, 520, 1280, 200);
    }
  }

  // Initial Era background
  renderEraBackground(gameState.currentEra);

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

  // Main PixiJS Game Loop
  app.ticker.add(ticker => {
    const delta = ticker.deltaTime;

    // Check if background needs to re-render after era switch
    if (currentRenderedEra !== gameState.currentEra) {
      currentRenderedEra = gameState.currentEra;
      renderEraBackground(gameState.currentEra);
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

    // Run Combat Engine Tick Update
    combatEngine.updateTick(delta, logger, (lootedItem) => {
      ui.updateUI();
    });

    // Hero Dead State
    if (hero.hp <= 0) {
      if (combatEngine.heroRespawnTimer <= 0) {
        pickNewWander();
      }
      return;
    }

    // Target Management
    let target = combatEngine.activeEnemy;
    if (!target || target.hp <= 0) {
      if (target && target.hp <= 0) {
        tacticalCombatContainer.removeChild(target.sprite);
        ui.updateUI();
      }
      target = combatEngine.spawnNextTarget(logger);
      if (target) {
        tacticalCombatContainer.addChild(target.sprite);
      }
    }

    // Combat Movement & Attack Execution
    if (target && target.hp > 0 && hero.hp > 0) {
      const dx = target.sprite.x - hero.sprite.x;
      const dy = target.sprite.y - hero.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 110) {
        const rad = Math.atan2(dy, dx);
        hero.sprite.x += Math.cos(rad) * hero.speed;
        hero.sprite.y += Math.sin(rad) * hero.speed;
        if (hero.state !== "run" && hero.hurtTimer <= 0) hero.setState("run");
        hero.sprite.scale.x = dx < 0 ? -1 : 1;
      } else {
        if (hero.hurtTimer <= 0 && hero.state !== "attack") hero.setState("attack");
        if (hero.attackCooldown <= 0) {
          combatEngine.executeHeroAttack(logger);
          ui.updateUI();
        }
      }

      // Enemy counter-attack interval
      if (target.attackCooldown > 0) target.attackCooldown -= delta;
      if (dist < 140 && target.hp > 0 && target.attackCooldown <= 0) {
        target.attackCooldown = target.attackInterval;
        combatEngine.executeEnemyAttack(logger);
        ui.updateUI();
      }
    } else if (hero.hp > 0) {
      // Peaceful wandering
      wanderTimer += delta;
      if (wanderTimer > wanderDuration) {
        wanderTimer = 0;
        pickNewWander();
      }
      hero.sprite.x += vx;
      hero.sprite.y += vy;
    }

    // Clamp coordinates inside arena bounds
    hero.sprite.x = Math.max(100, Math.min(1180, hero.sprite.x));
    hero.sprite.y = Math.max(340, Math.min(640, hero.sprite.y));

    // Render Real-time HUD Health & XP Bars
    const maxHp = hero.getEffectiveMaxHp();
    drawBar(hero.sprite.x, hero.sprite.y + 44, hero.hp, maxHp, 70, 7, 0x2ea043);
    drawBar(hero.sprite.x, hero.sprite.y + 53, hero.xp, hero.maxXp, 70, 4, 0x1f6feb);

    // Render Transformation Halo / Wings Aura
    if (hero.isTransformed) {
      const auraCol = hero.activeForm === "arc_angel" ? 0xffd700 : hero.activeForm === "werewolf" ? 0xff4444 : 0xbb86fc;
      hudGfx.stroke({ width: 2, color: auraCol, alpha: 0.85 + Math.sin(Date.now() / 150) * 0.15 });
      hudGfx.circle(hero.sprite.x, hero.sprite.y - 10, 48);
      // Angelic Wing Flurry particles
      if (Math.random() < 0.25) {
        particles.addFloatingText("✨", hero.sprite.x + (Math.random() * 60 - 30), hero.sprite.y - 40, "#ffd700", 16);
      }
    }

    // Render Companion Troops Marching Formations
    let troopOffsetIdx = 0;
    hero.troops.forEach(t => {
      if (t.count > 0) {
        troopOffsetIdx++;
        const ox = (troopOffsetIdx % 2 === 0 ? -1 : 1) * (35 + (troopOffsetIdx * 16));
        const oy = 10 + (troopOffsetIdx * 10);
        const tx = hero.sprite.x + (hero.sprite.scale.x < 0 ? -ox : ox);
        const ty = hero.sprite.y + oy;

        // Draw Troop Avatar Node
        hudGfx.fill(t.color).circle(tx, ty, 7);
        hudGfx.stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });
        hudGfx.circle(tx, ty, 7);
      }
    });

    if (target && target.hp > 0) {
      const barW = target.isBoss ? 160 : 75;
      const barH = target.isBoss ? 10 : 7;
      const barY = target.sprite.y + (target.isBoss ? 90 : 44);
      drawBar(target.sprite.x, barY, target.hp, target.maxHp, barW, barH, target.isBoss ? 0xda3633 : 0xff7b72);
    }

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

  // Hook sidebar summon boss button
  const summonBtn = document.getElementById("sidebar-summon-boss-btn");
  if (summonBtn) {
    summonBtn.onclick = () => {
      combatEngine.bossMode = true;
      if (combatEngine.activeEnemy && !combatEngine.activeEnemy.isBoss) {
        combatEngine.activeEnemy.hp = 0; // Trigger boss spawn next cycle
      }
      ui.updateUI();
    };
  }

  logger.printLine("Welcome to Mythic Human History: Idle RPG.", "#ffd700");
  logger.printLine(`Era of Dawn active. Defeat elemental spirits and harvest Era-Energy!`, "#58a6ff");
}

initGame();
