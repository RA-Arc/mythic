import { Container, Graphics, Sprite, Texture, ColorMatrixFilter, Assets } from "pixi.js";
import { EraId } from "./types";
import { Hero } from "./Hero";
import { MythicEnemy } from "./Enemy";
import { ERA_STAGE_BACKGROUNDS, ALL_80_BACKGROUND_PATHS } from "./data/battlegrounds";

interface MiniNinjaUnitRef {
  sprite: { x: number; y: number; scale: { x: number; y: number }; texture: Texture; alpha: number };
  color: number;
}

interface ParallaxLayerData {
  container: Container;
  g1: Graphics;
  g2: Graphics;
  scrollFactor: number;
  ambientSpeed: number;
  width: number;
}

export const ERA_BACKGROUND_TEXTURES: Record<EraId, string> = {
  dawn: "assets/backgrounds/packs/flying-island-battle-backgrounds/bg_1.jpg",
  fire: "assets/backgrounds/packs/dragon-caves-battleground-game-asset-pack/bg_1.jpg",
  stone: "assets/backgrounds/packs/cave-horizontal-rpg-battle-backgrounds/bg_1.jpg",
  bronze: "assets/backgrounds/packs/horizontal-egypt-battle-backgrounds/bg_1.jpg",
  iron: "assets/backgrounds/packs/castle-horizontal-battle-backgrounds/bg_1.jpg",
  faith: "assets/backgrounds/packs/vampire-horizontal-battle-backgrounds/bg_1.jpg",
  discovery: "assets/backgrounds/packs/ship-and-coast-battle-game-backgrounds/bg_1.jpg",
  steam: "assets/backgrounds/packs/fantasy-forest-battle-backgrounds/bg_1.jpg",
  atom: "assets/backgrounds/packs/horizontal-dark-magic-battle-backgrounds/bg_1.jpg",
  stars: "assets/backgrounds/packs/rpg-arena-backgrounds-asset-pack/bg_1.jpg"
};

export class ParallaxEngine {
  public rootContainer: Container;
  public backgroundContainer: Container;
  public reflectionContainer: Container;

  private layers: ParallaxLayerData[] = [];
  private currentEra: EraId | null = null;
  private worldScrollX: number = 0;
  private ambientTimer: number = 0;
  private stageFilter: ColorMatrixFilter;
  private currentSubStage: number = -1;
  private currentTexturePath: string = "";
  public customBackgroundLocked: boolean = false;

  // Royalty-free background texture sprites for sky/horizon layer (Layer 1)
  private bgSprite1: Sprite;
  private bgSprite2: Sprite;

  // Reflection system components (reflects ONLY characters and specular shorelines)
  private waterBaseGfx: Graphics;
  private waterRippleGfx: Graphics;
  private heroReflection: Sprite;
  private enemyReflection: Sprite;
  private ninjaReflections: Sprite[] = [];

  public groundY: number = 550;

  constructor() {
    this.rootContainer = new Container();
    this.stageFilter = new ColorMatrixFilter();
    this.rootContainer.label = "ParallaxEngineRoot";

    this.backgroundContainer = new Container();
    this.backgroundContainer.filters = [this.stageFilter];
    this.backgroundContainer.label = "Parallax7Layers";
    this.rootContainer.addChild(this.backgroundContainer);

    // 7 Independent Parallax Layers:
    // Layer 1: Backdrop Landscape & Celestial Sky (0.04x)
    // Layer 2: Extreme Distant Mountain Ranges & Ridge Silhouettes (0.08x)
    // Layer 3: Iconic Era Landmarks, Historical Architecture & Monuments (0.18x)
    // Layer 4: Mid-Backdrop Canopy, Ancient Ruins & Secondary Relics (0.35x)
    // Layer 5: Atmospheric Volumetric Mist & Ambient Glow (0.50x)
    // Layer 6: Roadside Markers, Shrines, Torches & Pathside Props (0.72x)
    // Layer 7: Ground Runway Surface & Pavement Path (1.00x)
    const layerConfigs = [
      { factor: 0.04, ambient: 0.08, label: "L1_BackdropArt" },
      { factor: 0.08, ambient: 0.0, label: "L2_FarMountains" },
      { factor: 0.18, ambient: 0.0, label: "L3_EraMonuments" },
      { factor: 0.35, ambient: 0.0, label: "L4_CanopyRuins" },
      { factor: 0.50, ambient: 0.25, label: "L5_VolumetricMist" },
      { factor: 0.72, ambient: 0.0, label: "L6_PathProps" },
      { factor: 1.00, ambient: 0.0, label: "L7_GroundRunway" }
    ];

    for (const cfg of layerConfigs) {
      const layerCont = new Container();
      layerCont.label = cfg.label;

      const g1 = new Graphics();
      const g2 = new Graphics();
      const layerWidth = cfg.label === "L1_BackdropArt" ? 2560 : 1280;
      g2.x = layerWidth;

      layerCont.addChild(g1);
      layerCont.addChild(g2);
      this.backgroundContainer.addChild(layerCont);

      this.layers.push({
        container: layerCont,
        g1,
        g2,
        scrollFactor: cfg.factor,
        ambientSpeed: cfg.ambient,
        width: layerWidth
      });
    }

    // Attach royalty-free background landscape sprites to Layer 1 (Backdrop Art - 2560px Mirrored Reflection Tile)
    this.bgSprite1 = new Sprite(Texture.WHITE);
    this.bgSprite1.width = 2560;
    this.bgSprite1.height = 552;
    this.bgSprite1.alpha = 1.0;
    this.bgSprite1.visible = false;

    this.bgSprite2 = new Sprite(Texture.WHITE);
    this.bgSprite2.width = 2560;
    this.bgSprite2.height = 552;
    this.bgSprite2.x = 2560;
    this.bgSprite2.alpha = 1.0;
    this.bgSprite2.visible = false;

    // Put sprites at the lowest z-index inside Layer 1
    this.layers[0].container.addChildAt(this.bgSprite1, 0);
    this.layers[0].container.addChildAt(this.bgSprite2, 1);

    // Ground Reflection Container (Mirror plane below groundY - ONLY reflects actors)
    this.reflectionContainer = new Container();
    this.reflectionContainer.label = "GroundReflectionContainer";
    this.rootContainer.addChild(this.reflectionContainer);

    this.waterBaseGfx = new Graphics();
    this.reflectionContainer.addChild(this.waterBaseGfx);

    // Actor reflection sprites
    this.heroReflection = new Sprite(Texture.WHITE);
    this.heroReflection.anchor.set(0.5);
    this.heroReflection.alpha = 0.35;
    this.heroReflection.tint = 0x88c0ff;
    this.heroReflection.visible = false;
    this.reflectionContainer.addChild(this.heroReflection);

    this.enemyReflection = new Sprite(Texture.WHITE);
    this.enemyReflection.anchor.set(0.5);
    this.enemyReflection.alpha = 0.35;
    this.enemyReflection.tint = 0x99bbdd;
    this.enemyReflection.visible = false;
    this.reflectionContainer.addChild(this.enemyReflection);

    // Dynamic water ripple and specular shoreline highlight
    this.waterRippleGfx = new Graphics();
    this.reflectionContainer.addChild(this.waterRippleGfx);
  }

  public async applyBackgroundTexture(texPath: string) {
    if (!texPath) return;
    if (this.currentTexturePath === texPath && this.bgSprite1.visible && this.bgSprite1.texture !== Texture.WHITE) return;
    this.currentTexturePath = texPath;

    try {
      let tex: Texture | null = null;
      if (Assets.get(texPath)) {
        tex = Assets.get(texPath);
      } else {
        tex = await Assets.load(texPath);
      }

      if (tex && tex instanceof Texture && this.currentTexturePath === texPath) {
        this.bgSprite1.texture = tex;
        this.bgSprite2.texture = tex;

        const applyStretch = () => {
          this.bgSprite1.width = 2560;
          this.bgSprite1.height = 552;
          this.bgSprite2.width = 2560;
          this.bgSprite2.height = 552;
          this.bgSprite2.x = 2560;
          this.bgSprite1.visible = true;
          this.bgSprite2.visible = true;
        };

        applyStretch();
        if (tex.source) {
          tex.source.once("update", applyStretch);
        }
      }
    } catch (err) {
      console.warn("Could not load background texture:", texPath, err);
    }
  }

  public updateStageBackground(subStageIndex: number) {
    if (this.customBackgroundLocked) return;
    const era = this.currentEra || "dawn";
    const eraList = ERA_STAGE_BACKGROUNDS[era] || ALL_80_BACKGROUND_PATHS;
    if (!eraList || eraList.length === 0) return;
    // Cycle through the backgrounds designated for this era's sub-stages
    const bgPath = eraList[Math.abs(subStageIndex) % eraList.length];
    if (bgPath) {
      this.applyBackgroundTexture(bgPath);
    }
  }

  public setEra(eraId: EraId, subStage: number = 0) {
    this.currentEra = eraId;
    this.customBackgroundLocked = false;
    this.currentSubStage = subStage;

    this.updateStageBackground(subStage);
    this.renderAllEraLayers(eraId);
    this.renderWaterBase(eraId);
  }

  public setCustomBackground(texPath: string, lock: boolean = true) {
    this.customBackgroundLocked = lock;
    this.applyBackgroundTexture(texPath);
  }

  public unlockCustomBackground(distanceMeters: number = 0) {
    this.customBackgroundLocked = false;
    const subStage = Math.floor(distanceMeters / 100);
    this.currentSubStage = subStage;
    this.updateStageBackground(subStage);
  }

  public update(
    delta: number,
    isWalking: boolean,
    walkSpeed: number,
    facing: number,
    hero: Hero,
    activeEnemy: MythicEnemy | null,
    miniNinjas: MiniNinjaUnitRef[],
    distanceMeters: number = 0
  ) {
    this.ambientTimer += delta * 0.03;
    const subStage = Math.floor(distanceMeters / 100);
    if (this.currentSubStage !== subStage) {
      this.currentSubStage = subStage;
      if (!this.customBackgroundLocked) {
        this.updateStageBackground(subStage);
      }
    }

    // Advance world scroll when walking / progressing
    const scrollStep = isWalking ? walkSpeed * 1.2 * facing : 0.45 * facing;
    this.worldScrollX += scrollStep * delta;

    // Update each of the 7 Parallax Layers independently
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const ambientShift = layer.ambientSpeed * this.ambientTimer * 20;
      const totalOffset = (this.worldScrollX * layer.scrollFactor + ambientShift) % layer.width;
      const normalized = totalOffset >= 0 ? totalOffset : totalOffset + layer.width;
      layer.container.x = -normalized;
    }

    // Update Ground Reflections for all characters (no background mirroring!)
    this.updateReflections(hero, activeEnemy, miniNinjas);
    this.updateWaterRipples();
  }

  private updateReflections(hero: Hero, enemy: MythicEnemy | null, miniNinjas: MiniNinjaUnitRef[]) {
    const gy = this.groundY;

    // 1. Hero reflection
    if (hero.sprite && hero.sprite.texture instanceof Texture && hero.hp > 0) {
      this.heroReflection.visible = true;
      this.heroReflection.texture = hero.sprite.texture;
      this.heroReflection.x = hero.sprite.x;
      // Invert across ground waterline (gy = 472, hero feet at ~471)
      this.heroReflection.y = gy + (gy - hero.sprite.y);
      this.heroReflection.scale.x = hero.sprite.scale.x;
      this.heroReflection.scale.y = -Math.abs(hero.sprite.scale.y) * 0.85;
      this.heroReflection.alpha = hero.isTransformed ? 0.55 : 0.42;
      this.heroReflection.tint = hero.activeForm === "arc_angel" ? 0xffea88 : 0x88c0ff;
    } else {
      this.heroReflection.visible = false;
    }

    // 2. Mythic Enemy reflection
    if (enemy && enemy.sprite && enemy.sprite.texture instanceof Texture && enemy.hp > 0) {
      this.enemyReflection.visible = true;
      this.enemyReflection.texture = enemy.sprite.texture;
      this.enemyReflection.x = enemy.sprite.x;
      this.enemyReflection.y = gy + (gy - enemy.sprite.y);
      this.enemyReflection.scale.x = enemy.sprite.scale.x;
      this.enemyReflection.scale.y = -Math.abs(enemy.sprite.scale.y) * 0.85;
      this.enemyReflection.alpha = 0.42;
    } else {
      this.enemyReflection.visible = false;
    }

    // 3. Mini-Ninja Squad Reflections
    while (this.ninjaReflections.length < miniNinjas.length) {
      const spr = new Sprite(Texture.WHITE);
      spr.anchor.set(0.5);
      spr.alpha = 0.28;
      this.reflectionContainer.addChild(spr);
      this.ninjaReflections.push(spr);
    }

    for (let i = 0; i < this.ninjaReflections.length; i++) {
      const rSpr = this.ninjaReflections[i];
      if (i < miniNinjas.length && miniNinjas[i].sprite.texture instanceof Texture) {
        const u = miniNinjas[i];
        rSpr.visible = true;
        rSpr.texture = u.sprite.texture;
        rSpr.x = u.sprite.x;
        rSpr.y = gy + (gy - u.sprite.y);
        rSpr.scale.x = u.sprite.scale.x;
        rSpr.scale.y = -Math.abs(u.sprite.scale.y) * 0.85;
        rSpr.tint = u.color;
        rSpr.alpha = u.sprite.alpha * 0.38;
      } else {
        rSpr.visible = false;
      }
    }
  }

  private updateWaterRipples() {
    this.waterRippleGfx.clear();
    const gy = this.groundY;
    const time = this.ambientTimer * 3;

    // Specular waterline boundary
    this.waterRippleGfx.stroke({ width: 2, color: 0xaaccff, alpha: 0.6 });
    this.waterRippleGfx.moveTo(0, gy).lineTo(1280, gy);

    // Subtle drifting caustic wave reflections
    for (let i = 0; i < 5; i++) {
      const waveY = gy + 10 + i * 24;
      const speedOffset = time * (1.2 + i * 0.4);
      const alpha = 0.2 - i * 0.03;

      this.waterRippleGfx.stroke({ width: 1.2, color: 0x99ddff, alpha });
      this.waterRippleGfx.moveTo(0, waveY);

      for (let x = 0; x <= 1280; x += 120) {
        const waveH = Math.sin((x / 80) + speedOffset) * 2;
        this.waterRippleGfx.lineTo(x, waveY + waveH);
      }
    }
  }

  private renderWaterBase(eraId: EraId) {
    this.waterBaseGfx.clear();
    const gy = this.groundY;
    const fullHeight = 720 - gy;

    let waterColor = 0x070c14;
    let deepColor = 0x03060a;

    if (eraId === "dawn") {
      waterColor = 0x180a08;
      deepColor = 0x0a0403;
    } else if (eraId === "fire") {
      waterColor = 0x140c08;
      deepColor = 0x090503;
    } else if (eraId === "stone") {
      waterColor = 0x0c1410;
      deepColor = 0x040806;
    } else if (eraId === "bronze") {
      waterColor = 0x0a1a24;
      deepColor = 0x040d14;
    } else if (eraId === "iron") {
      waterColor = 0x0d141b;
      deepColor = 0x05080c;
    } else if (eraId === "faith") {
      waterColor = 0x0f0e1c;
      deepColor = 0x07060e;
    } else if (eraId === "discovery") {
      waterColor = 0x0d1a22;
      deepColor = 0x050b0f;
    } else if (eraId === "steam") {
      waterColor = 0x14110d;
      deepColor = 0x0b0907;
    } else if (eraId === "atom") {
      waterColor = 0x06140b;
      deepColor = 0x030b05;
    } else if (eraId === "stars") {
      waterColor = 0x0a0818;
      deepColor = 0x04030d;
    }

    // 1. Solid reflective water body from groundY down to screen bottom (720px)
    this.waterBaseGfx.fill({ color: waterColor, alpha: 0.92 }).rect(0, gy, 1280, fullHeight);
    
    // 2. Deep underwater layered horizontal depth gradients
    for (let yOffset = 15; yOffset < fullHeight; yOffset += 28) {
      const alphaVal = Math.min(0.85, 0.3 + (yOffset / fullHeight) * 0.55);
      this.waterBaseGfx.fill({ color: deepColor, alpha: alphaVal }).rect(0, gy + yOffset, 1280, 16);
    }

    // 3. Glowing caustic water particle bubbles and light flecks across the water volume
    const time = this.ambientTimer * 3.5;
    for (let i = 0; i < 40; i++) {
      const px = (i * 137.5 + time * 25) % 1280;
      const py = gy + 15 + ((i * 59.2 + Math.sin(time + i) * 12) % (fullHeight - 25));
      const pRadius = 1.5 + (i % 3);
      const pAlpha = 0.25 + 0.35 * Math.sin(time + i);
      this.waterBaseGfx.fill({ color: 0x79c0ff, alpha: pAlpha }).circle(px, py, pRadius);
    }

    // 4. Vibrant wavy shimmering color reflection streaks representing all background layers
    for (let layerIdx = 0; layerIdx < this.layers.length; layerIdx++) {
      const alphaReflect = Math.max(0.1, 0.38 - layerIdx * 0.035);
      const waveFreq = 30 + layerIdx * 12;
      const streakColor = layerIdx === 0 ? 0x99ccff : layerIdx === 1 ? 0x6699ff : layerIdx === 2 ? 0x58a6ff : layerIdx === 3 ? 0x388bfd : 0x1f6feb;

      this.waterBaseGfx.stroke({ width: 2.5 + (6 - layerIdx) * 0.5, color: streakColor, alpha: alphaReflect });
      
      for (let relY = 12; relY < fullHeight - 12; relY += 18) {
        this.waterBaseGfx.moveTo(0, gy + relY);
        for (let x = 0; x <= 1280; x += 60) {
          const waveDistort = Math.sin((x / waveFreq) + time + (relY * 0.12) + layerIdx) * (6 + layerIdx * 1.2);
          this.waterBaseGfx.lineTo(x, gy + relY + waveDistort);
        }
      }
    }
  }

  private renderAllEraLayers(eraId: EraId) {
    for (const l of this.layers) {
      l.g1.clear();
      l.g1.removeChildren();
      l.g2.clear();
      l.g2.removeChildren();
    }

    // Populate both g1 and g2 identically so seamless wrapping is perfect
    this.renderEraLayer1(this.layers[0].g1, eraId);
    this.renderEraLayer1(this.layers[0].g2, eraId);

    this.renderEraLayer2(this.layers[1].g1, eraId);
    this.renderEraLayer2(this.layers[1].g2, eraId);

    this.renderEraLayer3(this.layers[2].g1, eraId);
    this.renderEraLayer3(this.layers[2].g2, eraId);

    this.renderEraLayer4(this.layers[3].g1, eraId);
    this.renderEraLayer4(this.layers[3].g2, eraId);

    this.renderEraLayer5(this.layers[4].g1, eraId);
    this.renderEraLayer5(this.layers[4].g2, eraId);

    this.renderEraLayer6(this.layers[5].g1, eraId);
    this.renderEraLayer6(this.layers[5].g2, eraId);

    this.renderEraLayer7(this.layers[6].g1, eraId);
    this.renderEraLayer7(this.layers[6].g2, eraId);
  }

  // LAYER 1: Backdrop Atmosphere Enhancement (NO HUGE CIRCLES, Pure CraftPix art with subtle gradient blend)
  private renderEraLayer1(g: Graphics, eraId: EraId) {
    // Soft atmospheric horizon blend so backdrop art blends seamlessly into distant mountain ridges
    let horizonGlow = 0xff6622;
    let alpha = 0.12;

    if (eraId === "stone") {
      horizonGlow = 0x88aacc;
      alpha = 0.08;
    } else if (eraId === "bronze") {
      horizonGlow = 0xffbb44;
      alpha = 0.14;
    } else if (eraId === "iron") {
      horizonGlow = 0x99aab8;
      alpha = 0.08;
    } else if (eraId === "faith") {
      horizonGlow = 0xbbccff;
      alpha = 0.15;
    } else if (eraId === "discovery") {
      horizonGlow = 0x55ccff;
      alpha = 0.1;
    } else if (eraId === "steam") {
      horizonGlow = 0xcc8855;
      alpha = 0.12;
    } else if (eraId === "atom") {
      horizonGlow = 0x39ff14;
      alpha = 0.08;
    } else if (eraId === "stars") {
      horizonGlow = 0x9955ff;
      alpha = 0.12;
    }

    // Gentle horizon mist glow band (never covering the sky!)
    g.fill({ color: horizonGlow, alpha }).rect(0, 380, 2560, 130);

    // Subtle celestial star glints for night/cosmic eras
    if (eraId === "stars" || eraId === "faith") {
      const starCol = eraId === "stars" ? 0xccddff : 0xfffaea;
      const seedPoints = [
        [120, 60], [280, 110], [420, 50], [590, 85], [740, 45],
        [880, 95], [1020, 55], [1160, 120], [220, 160], [820, 150],
        [1400, 60], [1560, 110], [1700, 50], [1870, 85], [2020, 45],
        [2160, 95], [2300, 55], [2440, 120], [1500, 160], [2100, 150]
      ];
      for (const [sx, sy] of seedPoints) {
        g.fill({ color: starCol, alpha: 0.8 }).rect(sx, sy, 2, 2);
      }
    }
  }

  // LAYER 2: Extreme Distant Mountain Ranges & Horizon Silhouettes (0.08x)
  private renderEraLayer2(g: Graphics, eraId: EraId) {
    let col = 0x1f1414;
    if (eraId === "bronze") col = 0x182430;
    else if (eraId === "stone") col = 0x1a2228;
    else if (eraId === "iron") col = 0x1b2026;
    else if (eraId === "faith") col = 0x121422;
    else if (eraId === "steam") col = 0x221a14;
    else if (eraId === "atom") col = 0x0e2015;
    else if (eraId === "stars") col = 0x0e0a1e;

    g.fill({ color: col, alpha: 0.9 });
    // Refined jagged mountain ridge across the distant horizon
    g.poly([
      0, 500,
      0, 340,
      120, 270,
      240, 330,
      360, 240,
      490, 320,
      630, 260,
      760, 340,
      900, 250,
      1030, 310,
      1150, 260,
      1280, 330,
      1280, 500
    ]);
  }

  // LAYER 3: Iconic Era Landmarks, Monuments & Interesting Things Along the Way (0.18x)
  private renderEraLayer3(g: Graphics, eraId: EraId) {
    if (eraId === "dawn") {
      try {
        const texPillar = Texture.from("assets/sprites/objects/dawn_rock_pillar.png");
        const texObelisk = Texture.from("assets/sprites/objects/dawn_sky_obelisk.png");

        const obelisk = new Sprite(texObelisk);
        obelisk.anchor.set(0.5, 1);
        obelisk.x = 350;
        obelisk.y = 495;
        obelisk.scale.set(0.65);
        obelisk.tint = 0xdddddd;
        g.addChild(obelisk);

        const pillar = new Sprite(texPillar);
        pillar.anchor.set(0.5, 1);
        pillar.x = 900;
        pillar.y = 495;
        pillar.scale.set(0.8);
        pillar.tint = 0xdde4ec;
        g.addChild(pillar);
      } catch (err) {
        console.warn("Could not load dawn layer 3 sprites", err);
      }
    } else if (eraId === "fire") {
      try {
        const texSkull = Texture.from("assets/sprites/objects/fire_dragon_skull.png");
        const texStalagmites = Texture.from("assets/sprites/objects/fire_stalagmites.png");

        const skull = new Sprite(texSkull);
        skull.anchor.set(0.5, 1);
        skull.x = 280;
        skull.y = 495;
        skull.scale.set(0.65);
        skull.tint = 0xeeccaa;
        g.addChild(skull);

        const stalagmite = new Sprite(texStalagmites);
        stalagmite.anchor.set(0.5, 1);
        stalagmite.x = 950;
        stalagmite.y = 495;
        stalagmite.scale.set(0.7);
        stalagmite.tint = 0xddbb99;
        g.addChild(stalagmite);
      } catch (err) {
        console.warn("Could not load fire layer 3 sprites", err);
      }
    } else if (eraId === "stone") {
      try {
        const texTotem = Texture.from("assets/sprites/objects/stone_bone_totem.png");
        const texBoulder = Texture.from("assets/sprites/objects/stone_mossy_boulder.png");

        const totem = new Sprite(texTotem);
        totem.anchor.set(0.5, 1);
        totem.x = 220;
        totem.y = 495;
        totem.scale.set(0.7);
        totem.tint = 0xaabbcc;
        g.addChild(totem);

        const boulder = new Sprite(texBoulder);
        boulder.anchor.set(0.5, 1);
        boulder.x = 900;
        boulder.y = 495;
        boulder.scale.set(0.85);
        boulder.tint = 0xaabbcc;
        g.addChild(boulder);
      } catch (err) {
        console.warn("Could not load stone layer 3 sprites", err);
      }
    } else if (eraId === "bronze") {
      try {
        const texPillar = Texture.from("assets/sprites/objects/bronze_sandstone_pillar.png");
        const texAnubis = Texture.from("assets/sprites/objects/bronze_anubis_statue.png");

        const pillar = new Sprite(texPillar);
        pillar.anchor.set(0.5, 1);
        pillar.x = 260;
        pillar.y = 495;
        pillar.scale.set(0.7);
        g.addChild(pillar);

        const anubis = new Sprite(texAnubis);
        anubis.anchor.set(0.5, 1);
        anubis.x = 940;
        anubis.y = 495;
        anubis.scale.set(0.85);
        g.addChild(anubis);
      } catch (err) {
        console.warn("Could not load bronze layer 3 sprites", err);
      }
    } else if (eraId === "iron") {
      try {
        const texWall = Texture.from("assets/sprites/objects/iron_castle_wall.png");
        const texTent = Texture.from("assets/sprites/objects/iron_war_tent.png");

        const wall = new Sprite(texWall);
        wall.anchor.set(0.5, 1);
        wall.x = 280;
        wall.y = 495;
        wall.scale.set(0.75);
        g.addChild(wall);

        const tent = new Sprite(texTent);
        tent.anchor.set(0.5, 1);
        tent.x = 920;
        tent.y = 495;
        tent.scale.set(0.7);
        g.addChild(tent);
      } catch (err) {
        console.warn("Could not load iron layer 3 sprites", err);
      }
    } else if (eraId === "faith") {
      try {
        const texTomb = Texture.from("assets/sprites/objects/faith_gothic_tomb.png");
        const texTree = Texture.from("assets/sprites/objects/faith_dead_tree.png");

        const tomb = new Sprite(texTomb);
        tomb.anchor.set(0.5, 1);
        tomb.x = 280;
        tomb.y = 495;
        tomb.scale.set(0.7);
        g.addChild(tomb);

        const tree = new Sprite(texTree);
        tree.anchor.set(0.5, 1);
        tree.x = 940;
        tree.y = 495;
        tree.scale.set(0.75);
        g.addChild(tree);
      } catch (err) {
        console.warn("Could not load faith layer 3 sprites", err);
      }
    } else if (eraId === "discovery") {
      try {
        const texShip = Texture.from("assets/sprites/objects/discovery_shipwreck.png");
        const texAnchor = Texture.from("assets/sprites/objects/discovery_anchor.png");

        const ship = new Sprite(texShip);
        ship.anchor.set(0.5, 1);
        ship.x = 280;
        ship.y = 495;
        ship.scale.set(0.75);
        g.addChild(ship);

        const anchor = new Sprite(texAnchor);
        anchor.anchor.set(0.5, 1);
        anchor.x = 940;
        anchor.y = 495;
        anchor.scale.set(0.7);
        g.addChild(anchor);
      } catch (err) {
        console.warn("Could not load discovery layer 3 sprites", err);
      }
    } else if (eraId === "steam") {
      try {
        const texStack = Texture.from("assets/sprites/objects/steam_smokestack.png");
        const texGear = Texture.from("assets/sprites/objects/steam_gear_mechanism.png");

        const stack = new Sprite(texStack);
        stack.anchor.set(0.5, 1);
        stack.x = 280;
        stack.y = 495;
        stack.scale.set(0.7);
        g.addChild(stack);

        const gear = new Sprite(texGear);
        gear.anchor.set(0.5, 1);
        gear.x = 940;
        gear.y = 495;
        gear.scale.set(0.75);
        g.addChild(gear);
      } catch (err) {
        console.warn("Could not load steam layer 3 sprites", err);
      }
    } else if (eraId === "atom") {
      try {
        const texCore = Texture.from("assets/sprites/objects/atom_fusion_core.png");
        const texConduit = Texture.from("assets/sprites/objects/atom_energy_conduit.png");

        const core = new Sprite(texCore);
        core.anchor.set(0.5, 1);
        core.x = 280;
        core.y = 495;
        core.scale.set(0.7);
        g.addChild(core);

        const conduit = new Sprite(texConduit);
        conduit.anchor.set(0.5, 1);
        conduit.x = 940;
        conduit.y = 495;
        conduit.scale.set(0.75);
        g.addChild(conduit);
      } catch (err) {
        console.warn("Could not load atom layer 3 sprites", err);
      }
    } else {
      try {
        const texMonolith = Texture.from("assets/sprites/objects/stars_quantum_monolith.png");
        const texNode = Texture.from("assets/sprites/objects/stars_energy_node.png");

        const monolith = new Sprite(texMonolith);
        monolith.anchor.set(0.5, 1);
        monolith.x = 280;
        monolith.y = 495;
        monolith.scale.set(0.75);
        g.addChild(monolith);

        const node = new Sprite(texNode);
        node.anchor.set(0.5, 1);
        node.x = 940;
        node.y = 495;
        node.scale.set(0.7);
        g.addChild(node);
      } catch (err) {
        console.warn("Could not load stars layer 3 sprites", err);
      }
    }
  }

  // LAYER 4: Mid-Backdrop Canopy, Trees, Ancient Ruins & Secondary Relics (0.35x)
  private renderEraLayer4(g: Graphics, eraId: EraId) {
    let col = 0x22110c;
    if (eraId === "stone") col = 0x1d241c;
    else if (eraId === "bronze") col = 0x222f22;
    else if (eraId === "iron") col = 0x1e2428;
    else if (eraId === "faith") col = 0x161724;
    else if (eraId === "steam") col = 0x261c16;
    else if (eraId === "atom") col = 0x0e2213;
    else if (eraId === "stars") col = 0x120c22;

    g.fill({ color: col, alpha: 0.95 });
    // Rolling forested canopy / low ridge with natural tree silhouettes
    g.poly([
      0, 500,
      0, 410,
      80, 370,
      160, 420,
      280, 360,
      380, 410,
      500, 350,
      620, 420,
      760, 360,
      880, 410,
      1020, 350,
      1140, 410,
      1280, 370,
      1280, 500
    ]);

    if (eraId === "steam") {
      try {
        const texTree = Texture.from("assets/sprites/objects/forest_tree_1.png");
        const distTree = new Sprite(texTree);
        distTree.anchor.set(0.5, 1);
        distTree.x = 220;
        distTree.y = 440;
        distTree.scale.set(0.4);
        distTree.tint = 0x444d56; // Silhouette/shadow tint
        g.addChild(distTree);

        const distTree2 = new Sprite(texTree);
        distTree2.anchor.set(0.5, 1);
        distTree2.x = 840;
        distTree2.y = 430;
        distTree2.scale.set(0.45);
        distTree2.tint = 0x444d56; 
        g.addChild(distTree2);
      } catch(err){}
    }
  }

  // LAYER 5: Atmospheric Volumetric Mist, Weather & Ambient Glow (0.50x)
  private renderEraLayer5(g: Graphics, eraId: EraId) {
    let mistCol = 0x79c0ff;
    if (eraId === "dawn") mistCol = 0xff5500;
    else if (eraId === "fire") mistCol = 0xff8833;
    else if (eraId === "bronze") mistCol = 0xffd700;
    else if (eraId === "faith") mistCol = 0xbbccff;
    else if (eraId === "steam") mistCol = 0xddaa88;
    else if (eraId === "atom") mistCol = 0x39ff14;
    else if (eraId === "stars") mistCol = 0xbb86fc;

    // Soft drifting volumetric fog ribbons (pure subtle atmosphere, no circles)
    g.fill({ color: mistCol, alpha: 0.08 });
    g.ellipse(320, 450, 260, 34);
    g.ellipse(880, 460, 300, 38);
    g.ellipse(600, 470, 200, 28);
  }

  // LAYER 6: Roadside Markers, Shrines, Torches & Pathside Props (0.72x)
  private renderEraLayer6(g: Graphics, eraId: EraId) {
    if (eraId === "dawn") {
      try {
        const texCrystal = Texture.from("assets/sprites/objects/dawn_crystal_cluster.png");
        
        const crystal1 = new Sprite(texCrystal);
        crystal1.anchor.set(0.5, 1);
        crystal1.x = 220;
        crystal1.y = 515;
        crystal1.scale.set(0.4);
        g.addChild(crystal1);

        const crystal2 = new Sprite(texCrystal);
        crystal2.anchor.set(0.5, 1);
        crystal2.x = 880;
        crystal2.y = 510;
        crystal2.scale.set(0.45);
        crystal2.scale.x = -0.45; // mirror
        g.addChild(crystal2);
      } catch (err) {
        console.warn("Could not load dawn layer 6 sprites", err);
      }
    } else if (eraId === "fire") {
      try {
        const texObsidian = Texture.from("assets/sprites/objects/fire_obsidian_rock.png");
        
        const obs1 = new Sprite(texObsidian);
        obs1.anchor.set(0.5, 1);
        obs1.x = 240;
        obs1.y = 510;
        obs1.scale.set(0.45);
        g.addChild(obs1);

        const obs2 = new Sprite(texObsidian);
        obs2.anchor.set(0.5, 1);
        obs2.x = 850;
        obs2.y = 515;
        obs2.scale.set(0.5);
        obs2.scale.x = -0.5; // mirror
        g.addChild(obs2);
      } catch (err) {
        console.warn("Could not load fire layer 6 sprites", err);
      }
    } else if (eraId === "stone") {
      try {
        const texBarricade = Texture.from("assets/sprites/objects/stone_spiked_barricade.png");
        
        const b1 = new Sprite(texBarricade);
        b1.anchor.set(0.5, 1);
        b1.x = 260;
        b1.y = 510;
        b1.scale.set(0.45);
        g.addChild(b1);

        const b2 = new Sprite(texBarricade);
        b2.anchor.set(0.5, 1);
        b2.x = 860;
        b2.y = 515;
        b2.scale.set(0.5);
        b2.scale.x = -0.5; // mirror
        g.addChild(b2);
      } catch (err) {
        console.warn("Could not load stone layer 6 sprites", err);
      }
    } else if (eraId === "bronze") {
      try {
        const texPalm = Texture.from("assets/sprites/objects/bronze_palm_tree.png");
        
        const palm1 = new Sprite(texPalm);
        palm1.anchor.set(0.5, 1);
        palm1.x = 240;
        palm1.y = 515;
        palm1.scale.set(0.5);
        g.addChild(palm1);

        const palm2 = new Sprite(texPalm);
        palm2.anchor.set(0.5, 1);
        palm2.x = 880;
        palm2.y = 510;
        palm2.scale.set(0.55);
        palm2.scale.x = -0.55; // mirror
        g.addChild(palm2);
      } catch (err) {
        console.warn("Could not load bronze layer 6 sprites", err);
      }
    } else if (eraId === "iron") {
      try {
        const texBallista = Texture.from("assets/sprites/objects/iron_siege_ballista.png");
        
        const b1 = new Sprite(texBallista);
        b1.anchor.set(0.5, 1);
        b1.x = 240;
        b1.y = 515;
        b1.scale.set(0.45);
        g.addChild(b1);

        const b2 = new Sprite(texBallista);
        b2.anchor.set(0.5, 1);
        b2.x = 880;
        b2.y = 515;
        b2.scale.set(0.5);
        b2.scale.x = -0.5; // mirror
        g.addChild(b2);
      } catch (err) {
        console.warn("Could not load iron layer 6 sprites", err);
      }
    } else if (eraId === "faith") {
      try {
        const texFence = Texture.from("assets/sprites/objects/faith_iron_fence.png");
        
        const f1 = new Sprite(texFence);
        f1.anchor.set(0.5, 1);
        f1.x = 240;
        f1.y = 515;
        f1.scale.set(0.45);
        g.addChild(f1);

        const f2 = new Sprite(texFence);
        f2.anchor.set(0.5, 1);
        f2.x = 880;
        f2.y = 515;
        f2.scale.set(0.5);
        f2.scale.x = -0.5; // mirror
        g.addChild(f2);
      } catch (err) {
        console.warn("Could not load faith layer 6 sprites", err);
      }
    } else if (eraId === "discovery") {
      try {
        const texBarrels = Texture.from("assets/sprites/objects/discovery_barrels.png");
        
        const b1 = new Sprite(texBarrels);
        b1.anchor.set(0.5, 1);
        b1.x = 240;
        b1.y = 515;
        b1.scale.set(0.45);
        g.addChild(b1);

        const b2 = new Sprite(texBarrels);
        b2.anchor.set(0.5, 1);
        b2.x = 880;
        b2.y = 515;
        b2.scale.set(0.5);
        b2.scale.x = -0.5; // mirror
        g.addChild(b2);
      } catch (err) {
        console.warn("Could not load discovery layer 6 sprites", err);
      }
    } else if (eraId === "steam") {
      try {
        const texLamp = Texture.from("assets/sprites/objects/steam_lamp_post.png");
        
        const l1 = new Sprite(texLamp);
        l1.anchor.set(0.5, 1);
        l1.x = 240;
        l1.y = 515;
        l1.scale.set(0.45);
        g.addChild(l1);

        const l2 = new Sprite(texLamp);
        l2.anchor.set(0.5, 1);
        l2.x = 880;
        l2.y = 515;
        l2.scale.set(0.5);
        l2.scale.x = -0.5; // mirror
        g.addChild(l2);
      } catch (err) {
        console.warn("Could not load steam layer 6 sprites", err);
      }
    } else if (eraId === "atom") {
      try {
        const texBeacon = Texture.from("assets/sprites/objects/atom_boundary_beacon.png");
        
        const b1 = new Sprite(texBeacon);
        b1.anchor.set(0.5, 1);
        b1.x = 240;
        b1.y = 515;
        b1.scale.set(0.45);
        g.addChild(b1);

        const b2 = new Sprite(texBeacon);
        b2.anchor.set(0.5, 1);
        b2.x = 880;
        b2.y = 515;
        b2.scale.set(0.5);
        b2.scale.x = -0.5; // mirror
        g.addChild(b2);
      } catch (err) {
        console.warn("Could not load atom layer 6 sprites", err);
      }
    } else {
      try {
        const texPylon = Texture.from("assets/sprites/objects/stars_warp_pylon.png");
        
        const p1 = new Sprite(texPylon);
        p1.anchor.set(0.5, 1);
        p1.x = 240;
        p1.y = 515;
        p1.scale.set(0.45);
        g.addChild(p1);

        const p2 = new Sprite(texPylon);
        p2.anchor.set(0.5, 1);
        p2.x = 880;
        p2.y = 515;
        p2.scale.set(0.5);
        p2.scale.x = -0.5; // mirror
        g.addChild(p2);
      } catch (err) {
        console.warn("Could not load stars layer 6 sprites", err);
      }
    }
  }

  // LAYER 7: Ground Runway Surface & Pavement Path (1.00x)
  private renderEraLayer7(g: Graphics, eraId: EraId) {
    const gy = this.groundY;

    let pathColor = 0x22130e;
    let edgeColor = 0x442016;

    if (eraId === "stone") {
      pathColor = 0x242621;
      edgeColor = 0x3d4037;
    } else if (eraId === "bronze") {
      pathColor = 0x38444f;
      edgeColor = 0x5a6d7e;
    } else if (eraId === "iron") {
      pathColor = 0x24282f;
      edgeColor = 0x3e4550;
    } else if (eraId === "faith") {
      pathColor = 0x201c2c;
      edgeColor = 0x3e3752;
    } else if (eraId === "discovery") {
      pathColor = 0x242b32;
      edgeColor = 0x3c4955;
    } else if (eraId === "steam") {
      pathColor = 0x251e18;
      edgeColor = 0x44362b;
    } else if (eraId === "atom") {
      pathColor = 0x122216;
      edgeColor = 0x24422b;
    } else if (eraId === "stars") {
      pathColor = 0x140f28;
      edgeColor = 0x2d2258;
    }

    // Top surface runway where feet land
    g.fill(pathColor).rect(0, gy - 24, 1280, 24);
    // Pathway edge curb
    g.fill(edgeColor).rect(0, gy - 4, 1280, 4);

    // Perspective flagstone pavers
    g.stroke({ width: 1.5, color: edgeColor, alpha: 0.6 });
    for (let x = 0; x < 1280; x += 64) {
      g.moveTo(x, gy - 24).lineTo(x - 14, gy);
    }
  }
}
