import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { EraId } from "./types";
import { Hero } from "./Hero";
import { MythicEnemy } from "./Enemy";

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
  stone: "assets/backgrounds/packs/cave-horizontal-rpg-battle-backgrounds/bg_2.jpg",
  bronze: "assets/backgrounds/packs/horizontal-egypt-battle-backgrounds/bg_1.jpg",
  iron: "assets/backgrounds/packs/castle-horizontal-battle-backgrounds/bg_1.jpg",
  faith: "assets/backgrounds/packs/cave-horizontal-rpg-battle-backgrounds/bg_1.jpg",
  discovery: "assets/backgrounds/packs/ship-and-coast-battle-game-backgrounds/bg_1.jpg",
  steam: "assets/backgrounds/packs/orc-lands-horizontal-battle-backgrounds/bg_1.jpg",
  atom: "assets/backgrounds/packs/horizontal-dark-magic-battle-backgrounds/bg_1.jpg",
  stars: "assets/backgrounds/packs/flying-island-battle-backgrounds/bg_3.jpg"
};

export class ParallaxEngine {
  public rootContainer: Container;
  public backgroundContainer: Container;
  public reflectionContainer: Container;

  private layers: ParallaxLayerData[] = [];
  private currentEra: EraId | null = null;
  private worldScrollX: number = 0;
  private ambientTimer: number = 0;

  // Royalty-free background texture sprites for sky/horizon layer (Layer 1)
  private bgSprite1: Sprite;
  private bgSprite2: Sprite;

  // Reflection system components (reflects ONLY characters and specular shorelines)
  private waterBaseGfx: Graphics;
  private waterRippleGfx: Graphics;
  private heroReflection: Sprite;
  private enemyReflection: Sprite;
  private ninjaReflections: Sprite[] = [];

  public groundY: number = 508;

  constructor() {
    this.rootContainer = new Container();
    this.rootContainer.label = "ParallaxEngineRoot";

    this.backgroundContainer = new Container();
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
    this.bgSprite1.height = 512;
    this.bgSprite1.alpha = 1.0;

    this.bgSprite2 = new Sprite(Texture.WHITE);
    this.bgSprite2.width = 2560;
    this.bgSprite2.height = 512;
    this.bgSprite2.x = 2560;
    this.bgSprite2.alpha = 1.0;

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

  public setEra(eraId: EraId) {
    this.currentEra = eraId;

    // Load royalty-free era background art
    const texPath = ERA_BACKGROUND_TEXTURES[eraId];
    if (texPath) {
      try {
        const tex = Texture.from(texPath);
        if (tex instanceof Texture) {
          this.bgSprite1.texture = tex;
          this.bgSprite2.texture = tex;

          const applyStretch = () => {
            this.bgSprite1.width = 2560;
            this.bgSprite1.height = 512;
            this.bgSprite2.width = 2560;
            this.bgSprite2.height = 512;
            this.bgSprite2.x = 2560;
            this.bgSprite1.visible = true;
            this.bgSprite2.visible = true;
          };

          applyStretch();
          if (tex.source) {
            tex.source.once("update", applyStretch);
          }
        } else {
          this.bgSprite1.visible = false;
          this.bgSprite2.visible = false;
        }
      } catch {
        this.bgSprite1.visible = false;
        this.bgSprite2.visible = false;
      }
    }

    this.renderAllEraLayers(eraId);
    this.renderWaterBase(eraId);
  }

  public setCustomBackground(texPath: string) {
    try {
      const tex = Texture.from(texPath);
      if (tex instanceof Texture) {
        this.bgSprite1.texture = tex;
        this.bgSprite2.texture = tex;

        const applyStretch = () => {
          this.bgSprite1.width = 2560;
          this.bgSprite1.height = 512;
          this.bgSprite2.width = 2560;
          this.bgSprite2.height = 512;
          this.bgSprite2.x = 2560;
          this.bgSprite1.visible = true;
          this.bgSprite2.visible = true;
        };

        applyStretch();
        if (tex.source) {
          tex.source.once("update", applyStretch);
        }
      }
    } catch {
      // Safe fallback
    }
  }

  public update(
    delta: number,
    isWalking: boolean,
    walkSpeed: number,
    facing: number,
    hero: Hero,
    activeEnemy: MythicEnemy | null,
    miniNinjas: MiniNinjaUnitRef[]
  ) {
    this.ambientTimer += delta * 0.03;

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
      // Invert across ground waterline
      this.heroReflection.y = gy + (gy - hero.sprite.y) + 6;
      this.heroReflection.scale.x = hero.sprite.scale.x;
      this.heroReflection.scale.y = -Math.abs(hero.sprite.scale.y) * 0.85;
      this.heroReflection.alpha = hero.isTransformed ? 0.45 : 0.32;
      this.heroReflection.tint = hero.activeForm === "arc_angel" ? 0xffea88 : 0x88c0ff;
    } else {
      this.heroReflection.visible = false;
    }

    // 2. Mythic Enemy reflection
    if (enemy && enemy.sprite && enemy.sprite.texture instanceof Texture && enemy.hp > 0) {
      this.enemyReflection.visible = true;
      this.enemyReflection.texture = enemy.sprite.texture;
      this.enemyReflection.x = enemy.sprite.x;
      this.enemyReflection.y = gy + (gy - enemy.sprite.y) + 6;
      this.enemyReflection.scale.x = enemy.sprite.scale.x;
      this.enemyReflection.scale.y = -Math.abs(enemy.sprite.scale.y) * 0.85;
      this.enemyReflection.alpha = 0.32;
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
        rSpr.y = gy + (gy - u.sprite.y) + 4;
        rSpr.scale.x = u.sprite.scale.x;
        rSpr.scale.y = -Math.abs(u.sprite.scale.y) * 0.85;
        rSpr.tint = u.color;
        rSpr.alpha = u.sprite.alpha * 0.28;
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
    this.waterRippleGfx.stroke({ width: 1.5, color: 0xaaccff, alpha: 0.45 });
    this.waterRippleGfx.moveTo(0, gy).lineTo(1280, gy);

    // Subtle drifting caustic wave reflections
    for (let i = 0; i < 5; i++) {
      const waveY = gy + 14 + i * 26;
      const speedOffset = time * (1.2 + i * 0.4);
      const alpha = 0.15 - i * 0.025;

      this.waterRippleGfx.stroke({ width: 1, color: 0x99ddff, alpha });
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
    const h = 720 - gy;

    let waterColor = 0x070c14;
    let deepColor = 0x03060a;

    if (eraId === "dawn") {
      waterColor = 0x180a08;
      deepColor = 0x0a0403;
    } else if (eraId === "fire") {
      waterColor = 0x140c08;
      deepColor = 0x090503;
    } else if (eraId === "bronze") {
      waterColor = 0x0a1a24;
      deepColor = 0x040d14;
    } else if (eraId === "faith") {
      waterColor = 0x0f0e1c;
      deepColor = 0x07060e;
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

    // Deep crystalline reflective surface base
    this.waterBaseGfx.fill(waterColor).rect(0, gy, 1280, h);
    this.waterBaseGfx.fill({ color: deepColor, alpha: 0.65 }).rect(0, gy + 45, 1280, h - 45);
    this.waterBaseGfx.fill({ color: 0x000000, alpha: 0.6 }).rect(0, gy + 110, 1280, h - 110);
  }

  private renderAllEraLayers(eraId: EraId) {
    for (const l of this.layers) {
      l.g1.clear();
      l.g2.clear();
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
      // Primordial Basalt Spires, Volcanic Fossilized Leviathan Ribs & Magma Monoliths
      g.fill(0x28120e);
      // Ancient Spire 1
      g.poly([120, 490, 150, 230, 180, 490]);
      // Colossal Fossil Leviathan Rib Arches
      g.stroke({ width: 8, color: 0x3d2018, alpha: 0.95 }).moveTo(240, 490).bezierCurveTo(260, 300, 340, 300, 360, 490);
      g.stroke({ width: 7, color: 0x3d2018, alpha: 0.95 }).moveTo(350, 490).bezierCurveTo(370, 320, 430, 320, 450, 490);
      // Volcanic Monolith Tower
      g.poly([680, 490, 710, 180, 750, 490]);
      g.stroke({ width: 3, color: 0xff5500, alpha: 0.7 }).moveTo(710, 190).lineTo(715, 480); // Magma vein
      // Steaming Lava Vent
      g.fill(0x381810).poly([960, 490, 1000, 290, 1040, 490]);
      g.fill({ color: 0xff3300, alpha: 0.8 }).rect(994, 290, 12, 6);
    } else if (eraId === "fire") {
      // Scorched Earth Dragon Bone Shrines & Towering Flame Altars
      g.fill(0x24150d);
      // Dragon Horn Spire
      g.poly([160, 490, 220, 240, 280, 490]);
      // Tribal Flame Brazier Altar
      g.rect(480, 310, 120, 180);
      g.fill(0x402214).poly([460, 310, 540, 260, 620, 310]);
      g.fill(0xff6600).poly([510, 260, 540, 210, 570, 260]); // Eternal Fire
      // Bone Totem Gate
      g.rect(880, 280, 24, 210);
      g.rect(980, 280, 24, 210);
      g.stroke({ width: 6, color: 0x382012, alpha: 0.95 }).moveTo(870, 300).lineTo(1010, 300);
    } else if (eraId === "stone") {
      // Stonehenge Megalith Trilithon Arches & Carved Dolmen Cairns
      g.fill(0x2c2b27);
      // Trilithon 1
      g.rect(160, 270, 34, 220);
      g.rect(220, 270, 34, 220);
      g.rect(145, 246, 125, 26);
      // Megalithic Standing Stone with carved spiral rune
      g.poly([520, 490, 540, 220, 570, 220, 590, 490]);
      g.stroke({ width: 2, color: 0x58a6ff, alpha: 0.6 }).moveTo(555, 300).lineTo(555, 360);
      // Trilithon 2
      g.rect(860, 250, 38, 240);
      g.rect(930, 250, 38, 240);
      g.rect(840, 224, 144, 28);
    } else if (eraId === "bronze") {
      // Classical Greco-Roman Corinthian Colonnades & Marble Pediments
      g.fill(0x323e4a);
      // Temple Colonnade
      g.rect(420, 270, 440, 220);
      for (let i = 0; i < 8; i++) {
        g.fill(0x4b5b6d).rect(440 + i * 52, 290, 22, 200);
      }
      // Sculpted Triangle Pediment
      g.fill(0x566779).poly([400, 270, 640, 160, 880, 270]);
      // Classical Victory Obelisk
      g.fill(0x3d4b5a).poly([160, 490, 180, 210, 200, 490]);
      g.fill(0xffd700).poly([175, 210, 180, 190, 185, 210]); // Gilded pyramidion
      // Roadside Marble Urn Monument
      g.fill(0x425364).rect(1060, 380, 40, 110);
      g.fill(0x5a6d80).ellipse(1080, 360, 32, 24);
    } else if (eraId === "iron") {
      // Medieval Fortress Watchtowers, Crenellated Ramparts & Rippling Lion War Banners
      g.fill(0x282c33);
      g.rect(0, 350, 1280, 140);
      // Watchtower 1
      g.rect(220, 220, 110, 270);
      g.rect(205, 198, 140, 24);
      // Rippling Crimson War Banner
      g.fill(0xda3633).rect(280, 130, 32, 68);
      g.fill(0xffd700).rect(288, 150, 16, 16); // Gilded crest
      // Watchtower 2
      g.rect(840, 200, 120, 290);
      g.rect(825, 178, 150, 24);
      g.fill(0xda3633).rect(910, 110, 32, 68);
      // Crenellations
      for (let x = 0; x < 1280; x += 36) {
        g.rect(x, 332, 20, 20);
      }
    } else if (eraId === "faith") {
      // Soaring Gothic Cathedral Spire, Rose Window & Flying Buttresses
      g.fill(0x1e1a2b);
      // Main Nave
      g.rect(460, 220, 360, 270);
      // Twin Soaring Spires
      g.poly([440, 220, 480, 60, 520, 220]);
      g.poly([760, 220, 800, 60, 840, 220]);
      // Delicate Rose Window (Golden & Sapphire Inlay)
      g.fill(0xffd700).ellipse(640, 280, 42, 42);
      g.fill(0x203060).ellipse(640, 280, 34, 34);
      g.stroke({ width: 2, color: 0xfffa88, alpha: 0.8 }).moveTo(640, 246).lineTo(640, 314);
      g.stroke({ width: 2, color: 0xfffa88, alpha: 0.8 }).moveTo(606, 280).lineTo(674, 280);
      // Flying buttresses
      g.stroke({ width: 5, color: 0x2b253d, alpha: 0.9 }).moveTo(460, 250).lineTo(380, 370).lineTo(380, 490);
      g.stroke({ width: 5, color: 0x2b253d, alpha: 0.9 }).moveTo(820, 250).lineTo(900, 370).lineTo(900, 490);
      // Angelic Stone Statue Plinth
      g.fill(0x252035).rect(160, 340, 44, 150);
      g.fill(0x453d5a).poly([160, 340, 182, 290, 204, 340]); // Winged Angel silhouette
    } else if (eraId === "discovery") {
      // Renaissance Alchemical Observatory Dome, Armillary Sphere & Celestial Globe
      g.fill(0x1a2e38);
      g.rect(460, 280, 360, 210);
      // Observatory Dome
      g.fill(0x244250).poly([480, 280, 640, 170, 800, 280]);
      // Rotating Brass Armillary Sphere Rings
      g.stroke({ width: 3, color: 0xd29922, alpha: 0.85 }).ellipse(640, 170, 70, 30);
      g.stroke({ width: 3, color: 0xd29922, alpha: 0.85 }).ellipse(640, 170, 30, 70);
      // Coastal Navigational Lighthouse Tower
      g.fill(0x203744).poly([140, 490, 165, 230, 195, 230, 220, 490]);
      g.fill(0xffd700).rect(170, 236, 20, 16); // Lamp room
    } else if (eraId === "steam") {
      // Victorian Industrial Clocktower, Steam Exhausts & Turning Brass Cogs
      g.fill(0x2e231b);
      g.rect(0, 340, 1280, 150);
      // Grand Factory Clocktower
      g.rect(480, 180, 140, 310);
      g.poly([460, 180, 550, 100, 640, 180]);
      // Glowing Clock Face
      g.fill(0xfffae0).ellipse(550, 230, 32, 32);
      g.stroke({ width: 2, color: 0x332211 }).moveTo(550, 230).lineTo(550, 208);
      g.stroke({ width: 2, color: 0x332211 }).moveTo(550, 230).lineTo(564, 230);
      // Smokestacks with Industrial Piping
      g.poly([240, 490, 255, 140, 290, 140, 305, 490]);
      g.poly([880, 490, 895, 110, 935, 110, 950, 490]);
      // Rhythmic Puffs of Steam
      g.fill({ color: 0xeeeeee, alpha: 0.4 }).ellipse(272, 115, 24, 18);
      g.fill({ color: 0xeeeeee, alpha: 0.4 }).ellipse(915, 85, 30, 22);
    } else if (eraId === "atom") {
      // Hyperbolic Nuclear Cooling Towers & High-Voltage Tesla Energy Conductors
      g.fill(0x132718);
      // Cooling Tower 1
      g.poly([220, 490, 260, 180, 370, 180, 410, 490]);
      g.fill({ color: 0x39ff14, alpha: 0.7 }).rect(280, 230, 70, 8); // Radiation ring
      // Cooling Tower 2
      g.poly([820, 490, 860, 180, 970, 180, 1010, 490]);
      g.fill({ color: 0x39ff14, alpha: 0.7 }).rect(880, 230, 70, 8);
      // High-Voltage Grid Pylon
      g.stroke({ width: 3.5, color: 0x00e5ff, alpha: 0.65 })
        .moveTo(620, 490).lineTo(620, 190)
        .lineTo(660, 240).lineTo(580, 240);
    } else {
      // Era of Stars: Transcendent Hyper-Jump Warp Gate & Anti-Gravity Monoliths
      g.fill(0x161026);
      // Hyper-Jump Warp Conduit Gate
      g.stroke({ width: 8, color: 0x00e5ff, alpha: 0.85 }).ellipse(640, 280, 380, 110);
      g.stroke({ width: 3, color: 0xff00ff, alpha: 0.65 }).ellipse(640, 280, 360, 90);
      // Levitating Anti-Gravity Crystal Spire 1
      g.poly([240, 430, 270, 180, 300, 430, 270, 460]);
      g.fill({ color: 0x00f0ff, alpha: 0.6 }).ellipse(270, 310, 12, 40);
      // Levitating Anti-Gravity Crystal Spire 2
      g.poly([980, 430, 1010, 160, 1040, 430, 1010, 460]);
      g.fill({ color: 0xbb86fc, alpha: 0.6 }).ellipse(1010, 290, 12, 40);
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
    if (eraId === "dawn" || eraId === "fire") {
      // Primitive Ritual Torches & Molten Lava Fissures
      g.fill(0x3a2014);
      g.rect(180, 430, 8, 74);
      g.fill(0xff6600).poly([180, 430, 184, 412, 188, 430]); // Torch fire
      g.rect(820, 430, 8, 74);
      g.fill(0xff6600).poly([820, 430, 824, 412, 828, 430]);
    } else if (eraId === "stone") {
      // Carved Rune Stones & Standing Milestone Cairns
      g.fill(0x3c3a34);
      g.poly([240, 504, 250, 436, 272, 436, 282, 504]);
      g.stroke({ width: 1.5, color: 0x58a6ff, alpha: 0.7 }).moveTo(260, 450).lineTo(260, 480);
      g.poly([840, 504, 850, 428, 876, 428, 886, 504]);
    } else if (eraId === "bronze") {
      // Classical Bronze Urns & Stone Road Milestone Posts
      g.fill(0xcd7f32);
      g.rect(220, 448, 26, 56);
      g.rect(212, 438, 42, 12);
      g.rect(820, 448, 26, 56);
      g.rect(812, 438, 42, 12);
    } else if (eraId === "iron") {
      // Imperial War Banners & Iron Lance Posts
      g.fill(0x2f343b);
      g.rect(200, 405, 6, 99);
      g.fill(0xda3633).rect(206, 412, 38, 24); // War banner
      g.rect(860, 405, 6, 99);
      g.fill(0xda3633).rect(866, 412, 38, 24);
    } else if (eraId === "faith") {
      // Sanctuary Stone Lanterns with Glowing Amber Candles
      g.fill(0x342e44);
      g.rect(240, 436, 16, 68);
      g.fill(0xffd700).poly([240, 436, 248, 422, 256, 436]);
      g.rect(840, 436, 16, 68);
      g.fill(0xffd700).poly([840, 436, 848, 422, 856, 436]);
    } else if (eraId === "discovery") {
      // Navigational Compass Posts & Bronze Maritime Lanterns
      g.fill(0x263a44);
      g.rect(210, 420, 8, 84);
      g.fill(0xd29922).ellipse(214, 414, 10, 10);
      g.rect(830, 420, 8, 84);
      g.fill(0xd29922).ellipse(834, 414, 10, 10);
    } else if (eraId === "steam") {
      // Victorian Cast Iron Gas Streetlamps
      g.fill(0x221d18);
      g.rect(200, 405, 8, 99);
      g.fill(0xffea88).poly([196, 405, 204, 392, 212, 405]); // Gas mantle
      g.rect(820, 405, 8, 99);
      g.fill(0xffea88).poly([816, 405, 824, 392, 832, 405]);
    } else if (eraId === "atom") {
      // Cybernetic Boundary Beacons & Radiation Warning Posts
      g.fill(0x1d2e20);
      g.rect(220, 436, 10, 68);
      g.fill(0x39ff14).rect(218, 426, 14, 10);
      g.rect(860, 436, 10, 68);
      g.fill(0x00e5ff).rect(858, 426, 14, 10);
    } else {
      // Era of Stars: Transcendent Energy Nodes & Floating Quantum Monoliths
      g.fill(0x1c1638);
      g.poly([240, 438, 250, 408, 260, 438, 250, 468]);
      g.stroke({ width: 2, color: 0x00e5ff, alpha: 0.85 }).moveTo(240, 438).lineTo(260, 438);
      g.poly([840, 438, 850, 408, 860, 438, 850, 468]);
      g.stroke({ width: 2, color: 0x00e5ff, alpha: 0.85 }).moveTo(840, 438).lineTo(860, 438);
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
