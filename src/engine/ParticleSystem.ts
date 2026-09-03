import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { EraId } from "./types";

interface FloatingText {
  text: Text;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  scaleGrowth?: number;
}

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  decayAlpha: boolean;
  gravity?: number;
  scaleGrowth?: number;
}

interface Shockwave {
  gfx: Graphics;
  x: number;
  y: number;
  radius: number;
  speed: number;
  lineWidth: number;
  color: number;
  life: number;
  maxLife: number;
}

interface ScreenFlash {
  gfx: Graphics;
  life: number;
  maxLife: number;
  startAlpha: number;
}

export class ParticleSystem {
  container: Container;
  private floatingTexts: FloatingText[] = [];
  private particles: Particle[] = [];
  private ambientParticles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private screenFlashes: ScreenFlash[] = [];
  private baseTextStyle: TextStyle;

  constructor(parent: Container) {
    this.container = new Container();
    parent.addChild(this.container);

    this.baseTextStyle = new TextStyle({
      fontFamily: "Courier New, monospace",
      fontSize: 20,
      fontWeight: "bold",
      fill: "#ffffff",
      stroke: { color: "#000000", width: 4 }
    });
  }

  public addFloatingText(
    msg: string,
    x: number,
    y: number,
    color: string = "#ffffff",
    fontSize: number = 20,
    isCrit: boolean = false
  ) {
    const style = this.baseTextStyle.clone();
    style.fill = color;
    style.fontSize = isCrit ? fontSize * 1.4 : fontSize;
    if (isCrit) {
      style.stroke = { color: "#330000", width: 5 };
      style.dropShadow = {
        alpha: 0.9,
        angle: Math.PI / 4,
        blur: 6,
        color: "#ff0055",
        distance: 3
      };
    }

    const txt = new Text({ text: msg, style });
    // Add subtle random horizontal jitter
    txt.x = x + (Math.random() - 0.5) * 16;
    txt.y = y;
    txt.anchor.set(0.5);

    if (isCrit) {
      txt.scale.set(1.25);
    }

    this.container.addChild(txt);
    this.floatingTexts.push({
      text: txt,
      vx: (Math.random() - 0.5) * 1.2,
      vy: isCrit ? -2.6 : -1.6,
      life: isCrit ? 55 : 45,
      maxLife: isCrit ? 55 : 45
    });

    // Keep screen clean: cap floating texts so combat never gets too busy
    if (this.floatingTexts.length > 10) {
      const oldest = this.floatingTexts[0];
      if (oldest.life > 10) {
        oldest.life = 10;
      }
    }
  }

  public spawnSoulDissolve(x: number, y: number, colorHex: number = 0xbb86fc, count: number = 18) {
    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const r = 2.5 + Math.random() * 3.5;
      g.fill({ color: colorHex, alpha: 0.85 }).circle(0, 0, r);
      g.x = x + (Math.random() - 0.5) * 36;
      g.y = y + (Math.random() - 0.5) * 36;

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // Rises softly upwards
      const speed = 1.0 + Math.random() * 2.2;

      this.container.addChild(g);
      this.particles.push({
        gfx: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40 + Math.random() * 25,
        maxLife: 65,
        decayAlpha: true
      });
    }
  }

  public spawnSpellEffect(x: number, y: number, colorHex: number, count: number = 24, type: string = "burst") {
    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const radius = 3 + Math.random() * 5;
      g.fill(colorHex).circle(0, 0, radius);
      g.x = x;
      g.y = y;

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;

      this.container.addChild(g);
      this.particles.push({
        gfx: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        decayAlpha: true
      });
    }
  }

  public spawnLaserBeam(x1: number, y1: number, x2: number, y2: number, colorHex: number) {
    const g = new Graphics();
    g.stroke({ width: 8, color: colorHex, alpha: 0.9 });
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);

    this.container.addChild(g);
    this.particles.push({
      gfx: g,
      vx: 0,
      vy: 0,
      life: 15,
      maxLife: 15,
      decayAlpha: true
    });
  }

  public triggerScreenFlash(colorHex: number = 0xffe87c, duration: number = 26, startAlpha: number = 0.6) {
    const flashGfx = new Graphics();
    flashGfx.rect(0, 0, 1280, 720).fill(colorHex);
    flashGfx.alpha = startAlpha;
    this.container.addChild(flashGfx);

    this.screenFlashes.push({
      gfx: flashGfx,
      life: duration,
      maxLife: duration,
      startAlpha
    });
  }

  public triggerLevelUpEffect(x: number, y: number) {
    // 1. Fullscreen radiant golden screen flash
    this.triggerScreenFlash(0xffd700, 24, 0.55);

    // 2. Concentric expanding shockwave rings
    const shockColors = [0xffd700, 0x58a6ff, 0xffffff];
    shockColors.forEach((col, idx) => {
      const g = new Graphics();
      this.container.addChild(g);
      this.shockwaves.push({
        gfx: g,
        x,
        y: y - 10,
        radius: 12 + idx * 8,
        speed: 5.5 + idx * 1.8,
        lineWidth: 6 - idx,
        color: col,
        life: 28 + idx * 4,
        maxLife: 28 + idx * 4
      });
    });

    // 3. Radial burst of luminous stars, sparks, and shards (50 particles)
    const particleColors = [0xffd700, 0xffffff, 0x7ee787, 0x79c0ff, 0xffaa00, 0xf0883e];
    for (let i = 0; i < 54; i++) {
      const g = new Graphics();
      const col = particleColors[i % particleColors.length];
      const isStar = i % 3 === 0;
      const size = isStar ? 4 + Math.random() * 4 : 2.5 + Math.random() * 3.5;

      g.fill(col);
      if (isStar) {
        // Draw 4-point diamond star
        g.poly([
          0, -size * 1.5,
          size * 0.5, 0,
          0, size * 1.5,
          -size * 0.5, 0
        ]);
      } else {
        g.circle(0, 0, size);
      }

      g.x = x;
      g.y = y - 20;

      const angle = (Math.PI * 2 * i) / 54 + (Math.random() - 0.5) * 0.3;
      const speed = 3.5 + Math.random() * 8.5;

      this.container.addChild(g);
      this.particles.push({
        gfx: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 45 + Math.random() * 25,
        maxLife: 70,
        decayAlpha: true,
        gravity: 0.08
      });
    }

    // 4. Ascending vertical pillar beams & light sparks
    for (let i = 0; i < 20; i++) {
      const g = new Graphics();
      const beamW = 2 + Math.random() * 3;
      const beamH = 12 + Math.random() * 24;
      g.fill(0xfffa88).rect(-beamW / 2, -beamH / 2, beamW, beamH);

      g.x = x + (Math.random() - 0.5) * 80;
      g.y = y + 20 + Math.random() * 30;

      this.container.addChild(g);
      this.particles.push({
        gfx: g,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -4 - Math.random() * 5,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        decayAlpha: true
      });
    }
  }

  public triggerAngelAscension(x: number, y: number) {
    // 1. Radiant holy golden screen flash
    this.triggerScreenFlash(0xffea75, 26, 0.4);

    // 2. Concentric expanding golden shockwaves
    const shockCols = [0xffd700, 0xffffff, 0xfffa88];
    shockCols.forEach((col, idx) => {
      const g = new Graphics();
      this.container.addChild(g);
      this.shockwaves.push({
        gfx: g,
        x,
        y: y - 10,
        radius: 14 + idx * 10,
        speed: 6.0 + idx * 2.0,
        lineWidth: 5 - idx,
        color: col,
        life: 32 + idx * 4,
        maxLife: 32 + idx * 4
      });
    });

    // 3. Ascending vertical holy light pillars
    for (let i = 0; i < 28; i++) {
      const g = new Graphics();
      const beamW = 2 + Math.random() * 4;
      const beamH = 24 + Math.random() * 48;
      g.fill(i % 2 === 0 ? 0xffea75 : 0xffffff).rect(-beamW / 2, -beamH / 2, beamW, beamH);
      g.x = x + (Math.random() - 0.5) * 70;
      g.y = y + 20 + Math.random() * 30;
      this.container.addChild(g);
      this.particles.push({
        gfx: g,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -5.5 - Math.random() * 6,
        life: 35 + Math.random() * 20,
        maxLife: 55,
        decayAlpha: true
      });
    }

    // 4. Radial burst of golden celestial diamond stars & holy sparks
    for (let i = 0; i < 44; i++) {
      const g = new Graphics();
      const col = i % 3 === 0 ? 0xffd700 : i % 3 === 1 ? 0xfffae0 : 0xffaa00;
      const sz = 3 + Math.random() * 4;
      g.fill(col);
      // 4-point diamond star
      g.poly([0, -sz * 1.6, sz * 0.5, 0, 0, sz * 1.6, -sz * 0.5, 0]);
      g.x = x;
      g.y = y - 10;
      const angle = (Math.PI * 2 * i) / 44 + (Math.random() - 0.5) * 0.2;
      const speed = 2.8 + Math.random() * 6.5;
      this.container.addChild(g);
      this.particles.push({
        gfx: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 40 + Math.random() * 25,
        maxLife: 65,
        decayAlpha: true,
        gravity: 0.05
      });
    }

    this.addFloatingText("✦ ARC ANGEL ASCENSION ✦", x, y - 60, "#ffd700", 22, true);
  }

  public emitAngelAura(x: number, y: number) {
    // Shimmering divine golden motes gently ascending and wavering
    if (Math.random() < 0.7) {
      const g = new Graphics();
      const isStar = Math.random() < 0.45;
      const sz = 2 + Math.random() * 3;
      const col = Math.random() < 0.5 ? 0xffd700 : 0xfffa90;
      g.fill(col);
      if (isStar) {
        g.poly([0, -sz * 1.5, sz * 0.4, 0, 0, sz * 1.5, -sz * 0.4, 0]);
      } else {
        g.circle(0, 0, sz);
      }
      g.x = x + (Math.random() - 0.5) * 46;
      g.y = y + (Math.random() - 0.5) * 38;
      this.container.addChild(g);
      this.particles.push({
        gfx: g,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1.3 - Math.random() * 1.8,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        decayAlpha: true
      });
    }

    // Occasional wing flurry sparkle
    if (Math.random() < 0.15) {
      this.addFloatingText("✨", x + (Math.random() * 50 - 25), y - 32, "#ffd700", 15);
    }
  }

  public emitFormAura(form: string, x: number, y: number) {
    if (form === "arc_angel") {
      this.emitAngelAura(x, y);
    } else if (form === "werewolf") {
      if (Math.random() < 0.5) {
        const g = new Graphics();
        g.fill(0xff3333).circle(0, 0, 2.5);
        g.x = x + (Math.random() - 0.5) * 40;
        g.y = y + (Math.random() - 0.5) * 30;
        this.container.addChild(g);
        this.particles.push({
          gfx: g,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.5 - Math.random() * 1.5,
          life: 20 + Math.random() * 15,
          maxLife: 35,
          decayAlpha: true
        });
      }
    } else if (form === "mythic_drake") {
      if (Math.random() < 0.55) {
        const g = new Graphics();
        g.fill(Math.random() < 0.5 ? 0xff7700 : 0xffbb00).circle(0, 0, 3);
        g.x = x + (Math.random() - 0.5) * 44;
        g.y = y + (Math.random() - 0.5) * 32;
        this.container.addChild(g);
        this.particles.push({
          gfx: g,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -2 - Math.random() * 2,
          life: 22 + Math.random() * 18,
          maxLife: 40,
          decayAlpha: true
        });
      }
    }
  }

  public updateAmbientEraWeather(eraId: EraId) {
    if (this.ambientParticles.length < 35) {
      const g = new Graphics();
      let col = 0xffaa44;
      let sz = 3;

      if (eraId === "dawn") { col = 0xff4422; sz = 4; }
      else if (eraId === "fire") { col = 0xff8800; sz = 3; }
      else if (eraId === "stone") { col = 0xbbbb99; sz = 3; }
      else if (eraId === "bronze") { col = 0xffcc33; sz = 3; }
      else if (eraId === "iron") { col = 0xaabbcc; sz = 2; }
      else if (eraId === "faith") { col = 0xffffaa; sz = 3; }
      else if (eraId === "discovery") { col = 0x33eebb; sz = 3; }
      else if (eraId === "steam") { col = 0x887766; sz = 5; }
      else if (eraId === "atom") { col = 0x39ff14; sz = 4; }
      else if (eraId === "stars") { col = 0xdd88ff; sz = 3; }

      g.fill(col).circle(0, 0, sz);
      g.x = Math.random() * 1280;
      g.y = Math.random() * 720;
      g.alpha = 0.6;

      this.container.addChild(g);
      this.ambientParticles.push({
        gfx: g,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 0.8,
        life: 120 + Math.random() * 100,
        maxLife: 220,
        decayAlpha: false
      });
    }
  }

  public update() {
    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.text.x += ft.vx;
      ft.text.y += ft.vy;
      ft.vy *= 0.96; // Smooth upward deceleration
      ft.life--;
      ft.text.alpha = Math.min(1, (ft.life / ft.maxLife) * 1.5);

      if (ft.life <= 0) {
        this.container.removeChild(ft.text);
        ft.text.destroy();
        this.floatingTexts.splice(i, 1);
      }
    }

    // Screen flashes
    for (let i = this.screenFlashes.length - 1; i >= 0; i--) {
      const sf = this.screenFlashes[i];
      sf.life--;
      sf.gfx.alpha = (sf.life / sf.maxLife) * sf.startAlpha;
      if (sf.life <= 0) {
        this.container.removeChild(sf.gfx);
        sf.gfx.destroy();
        this.screenFlashes.splice(i, 1);
      }
    }

    // Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.speed *= 0.95;
      sw.life--;
      const alpha = (sw.life / sw.maxLife);

      sw.gfx.clear();
      sw.gfx.stroke({ width: sw.lineWidth * alpha, color: sw.color, alpha });
      sw.gfx.circle(sw.x, sw.y, sw.radius);

      if (sw.life <= 0) {
        this.container.removeChild(sw.gfx);
        sw.gfx.destroy();
        this.shockwaves.splice(i, 1);
      }
    }

    // Spell particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.gfx.x += p.vx;
      p.gfx.y += p.vy;
      if (p.gravity) {
        p.vy += p.gravity;
      }
      p.life--;
      if (p.decayAlpha) {
        p.gfx.alpha = p.life / p.maxLife;
      }

      if (p.life <= 0) {
        this.container.removeChild(p.gfx);
        p.gfx.destroy();
        this.particles.splice(i, 1);
      }
    }

    // Ambient particles
    for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
      const p = this.ambientParticles[i];
      p.gfx.x += p.vx;
      p.gfx.y += p.vy;
      p.life--;

      if (p.life <= 0 || p.gfx.y < -10) {
        this.container.removeChild(p.gfx);
        p.gfx.destroy();
        this.ambientParticles.splice(i, 1);
      }
    }
  }
}
