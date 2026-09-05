import { FighterEntity, ParticleEffect, SkeletalPose, ArenaTheme, GearItem } from './types';
import { ARENA_WIDTH, GROUND_Y } from './physics';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  shakeTime: number;
  shakeIntensity: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
  isCrit?: boolean;
}

export function drawArena(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraState,
  theme: ArenaTheme = 'burning_citadel',
  time: number
) {
  // Save pre-camera transform
  ctx.save();
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, width, height);

  // Apply Camera transform with shake
  const shakeX = camera.shakeTime > 0 ? (Math.random() - 0.5) * camera.shakeIntensity : 0;
  const shakeY = camera.shakeTime > 0 ? (Math.random() - 0.5) * camera.shakeIntensity : 0;

  ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // Background Parallax Layer 1: Sky gradient
  const skyGrad = ctx.createLinearGradient(0, -200, 0, 500);
  if (theme === 'burning_citadel') {
    skyGrad.addColorStop(0, '#1c0c0c');
    skyGrad.addColorStop(0.6, '#381616');
    skyGrad.addColorStop(1, '#180a0a');
  } else if (theme === 'dynasty_palace') {
    skyGrad.addColorStop(0, '#041d1a');
    skyGrad.addColorStop(0.7, '#082f2c');
    skyGrad.addColorStop(1, '#051817');
  } else if (theme === 'herald_nexus') {
    skyGrad.addColorStop(0, '#090d29');
    skyGrad.addColorStop(0.7, '#131b4d');
    skyGrad.addColorStop(1, '#090c21');
  } else if (theme === 'void_colosseum') {
    skyGrad.addColorStop(0, '#120526');
    skyGrad.addColorStop(0.6, '#280c4a');
    skyGrad.addColorStop(1, '#0c041c');
  } else if (theme === 'frostpeak_sanctuary') {
    skyGrad.addColorStop(0, '#041824');
    skyGrad.addColorStop(0.5, '#083344');
    skyGrad.addColorStop(1, '#021018');
  } else if (theme === 'crimson_bamboo') {
    skyGrad.addColorStop(0, '#2b090b');
    skyGrad.addColorStop(0.6, '#501416');
    skyGrad.addColorStop(1, '#1f0608');
  } else if (theme === 'volcanic_abyss') {
    skyGrad.addColorStop(0, '#240803');
    skyGrad.addColorStop(0.5, '#431407');
    skyGrad.addColorStop(1, '#1a0401');
  } else if (theme === 'emerald_bamboo_temple') {
    skyGrad.addColorStop(0, '#022c22');
    skyGrad.addColorStop(0.5, '#064e3b');
    skyGrad.addColorStop(1, '#021a14');
  } else if (theme === 'sunken_shadow_abyss') {
    skyGrad.addColorStop(0, '#020b1c');
    skyGrad.addColorStop(0.5, '#042747');
    skyGrad.addColorStop(1, '#010813');
  } else if (theme === 'celestial_thunder_plateau') {
    skyGrad.addColorStop(0, '#130a2a');
    skyGrad.addColorStop(0.5, '#240c4a');
    skyGrad.addColorStop(1, '#090417');
  } else if (theme === 'crimson_eclipse_citadel') {
    skyGrad.addColorStop(0, '#200307');
    skyGrad.addColorStop(0.5, '#450a0a');
    skyGrad.addColorStop(1, '#120104');
  } else {
    // astral_observatory
    skyGrad.addColorStop(0, '#060814');
    skyGrad.addColorStop(0.5, '#111836');
    skyGrad.addColorStop(1, '#050711');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-ARENA_WIDTH, -300, ARENA_WIDTH * 3, 900);

  // Celestial object / Atmospheric effect
  ctx.save();
  if (theme === 'burning_citadel') {
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.5, 120, 75, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'dynasty_palace') {
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 35;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.7, 100, 65, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'herald_nexus') {
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 50;
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.5, 90, 80, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'void_colosseum') {
    // Void Rift vortex
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 60;
    ctx.fillStyle = '#7e22ce';
    ctx.beginPath();
    ctx.ellipse(ARENA_WIDTH * 0.5, 110, 110, 50, time * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'frostpeak_sanctuary') {
    // Aurora Borealis curtains + Pale Frost Moon
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 45;
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.35, 110, 60, 0, Math.PI * 2);
    ctx.fill();

    // Aurora waves
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(time * 1.5) * 0.15;
    const auroraGrad = ctx.createLinearGradient(-ARENA_WIDTH, 50, ARENA_WIDTH * 2, 180);
    auroraGrad.addColorStop(0, '#06b6d4');
    auroraGrad.addColorStop(0.5, '#10b981');
    auroraGrad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = auroraGrad;
    ctx.beginPath();
    ctx.moveTo(-ARENA_WIDTH, 140);
    for (let x = -ARENA_WIDTH; x <= ARENA_WIDTH * 2; x += 150) {
      const waveY = 110 + Math.sin((x / 200) + time * 0.8) * 35;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(ARENA_WIDTH * 2, -100);
    ctx.lineTo(-ARENA_WIDTH, -100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (theme === 'crimson_bamboo') {
    // Blood Orange Lantern Moon
    ctx.shadowColor = '#fb923c';
    ctx.shadowBlur = 50;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.65, 115, 80, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'volcanic_abyss') {
    // Molten Magma Core Glow
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 65;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.5, 140, 95, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'astral_observatory') {
    // Astrological celestial armillary rings
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(ARENA_WIDTH * 0.5, 110, 140, 45, time * 0.15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
    ctx.beginPath();
    ctx.ellipse(ARENA_WIDTH * 0.5, 110, 110, 80, -time * 0.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.5, 110, 32, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'emerald_bamboo_temple') {
    // Sacred Emerald Jade Dragon Orb
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 55;
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.5, 115, 75, 0, Math.PI * 2);
    ctx.fill();
    // Pagoda roof silhouettes in background
    ctx.fillStyle = 'rgba(2, 44, 34, 0.8)';
    ctx.beginPath();
    ctx.moveTo(ARENA_WIDTH * 0.5 - 120, 160);
    ctx.lineTo(ARENA_WIDTH * 0.5, 130);
    ctx.lineTo(ARENA_WIDTH * 0.5 + 120, 160);
    ctx.lineTo(ARENA_WIDTH * 0.5 + 80, 175);
    ctx.lineTo(ARENA_WIDTH * 0.5 - 80, 175);
    ctx.closePath();
    ctx.fill();
  } else if (theme === 'sunken_shadow_abyss') {
    // Luminous Subterranean Void Crystal Monolith
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 60;
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(ARENA_WIDTH * 0.5, 60);
    ctx.lineTo(ARENA_WIDTH * 0.5 + 40, 140);
    ctx.lineTo(ARENA_WIDTH * 0.5, 180);
    ctx.lineTo(ARENA_WIDTH * 0.5 - 40, 140);
    ctx.closePath();
    ctx.fill();
  } else if (theme === 'celestial_thunder_plateau') {
    // Storm Eye with Lightning Discharge
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 50;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.5, 95, 70, 0, Math.PI * 2);
    ctx.fill();
    // Lightning fork flash
    if (Math.sin(time * 8) > 0.7) {
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ARENA_WIDTH * 0.5, 95);
      ctx.lineTo(ARENA_WIDTH * 0.5 - 35, 160);
      ctx.lineTo(ARENA_WIDTH * 0.5 - 15, 200);
      ctx.lineTo(ARENA_WIDTH * 0.5 - 45, 270);
      ctx.stroke();
    }
  } else if (theme === 'crimson_eclipse_citadel') {
    // Blood Moon Total Solar Eclipse
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 65;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH * 0.5, 110, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#0a0204';
    ctx.fill();
  }
  ctx.restore();

  // Distant Mountain & Structure Silhouettes (Parallax)
  ctx.fillStyle = theme === 'frostpeak_sanctuary' 
    ? 'rgba(10, 32, 48, 0.9)' 
    : theme === 'crimson_bamboo' 
      ? 'rgba(32, 10, 14, 0.9)'
      : theme === 'volcanic_abyss'
        ? 'rgba(35, 10, 6, 0.9)'
        : 'rgba(15, 18, 28, 0.85)';

  ctx.beginPath();
  ctx.moveTo(-200, GROUND_Y);
  ctx.lineTo(-50, 180);
  ctx.lineTo(200, 240);
  ctx.lineTo(350, 150);
  ctx.lineTo(550, 220);
  ctx.lineTo(800, 140);
  ctx.lineTo(1100, 260);
  ctx.lineTo(1300, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Arena Pillars & Architectural silhouettes
  if (theme === 'crimson_bamboo') {
    // Tall bamboo stalks and Torii shrine arches
    ctx.fillStyle = '#140608';
    for (let i = 0; i < 14; i++) {
      const bx = 40 + i * 72;
      ctx.fillRect(bx, 120, 12, GROUND_Y - 120);
      ctx.fillRect(bx - 3, 160, 18, 4);
      ctx.fillRect(bx - 3, 230, 18, 4);
    }
    // Torii arch crossbeam
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(180, 190, 640, 18);
    ctx.fillRect(150, 175, 700, 16);
  } else if (theme === 'frostpeak_sanctuary') {
    // Crystalline ice spires
    ctx.fillStyle = '#0a2333';
    for (let i = 0; i < 7; i++) {
      const px = 120 + i * 135;
      ctx.beginPath();
      ctx.moveTo(px, 160);
      ctx.lineTo(px + 20, GROUND_Y);
      ctx.lineTo(px - 20, GROUND_Y);
      ctx.closePath();
      ctx.fill();
    }
  } else if (theme === 'volcanic_abyss') {
    // Jagged basalt pillars with molten crevices
    ctx.fillStyle = '#1c0704';
    for (let i = 0; i < 8; i++) {
      const px = 100 + i * 125;
      ctx.fillRect(px - 16, 170, 32, GROUND_Y - 170);
      // Glowing molten fissure in pillars
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(px - 2, 200, 4, 120);
      ctx.fillStyle = '#1c0704';
    }
  } else if (theme === 'astral_observatory') {
    // Floating crystalline obelisks
    ctx.fillStyle = '#141829';
    for (let i = 0; i < 6; i++) {
      const ox = 150 + i * 150;
      const floatY = 170 + Math.sin(time * 2 + i) * 12;
      ctx.fillRect(ox - 10, floatY, 20, 150);
      // Runic neon core
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(ox - 2, floatY + 20, 4, 110);
      ctx.fillStyle = '#141829';
    }
  } else if (theme === 'emerald_bamboo_temple') {
    // Carved Jade Dragon Lantern Columns
    ctx.fillStyle = '#064e3b';
    for (let i = 0; i < 8; i++) {
      const px = 90 + i * 130;
      ctx.fillRect(px - 14, 160, 28, GROUND_Y - 160);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(px - 6, 190, 12, 16);
      ctx.fillStyle = '#064e3b';
    }
  } else if (theme === 'sunken_shadow_abyss') {
    // Sunken Subterranean Monoliths with cyan runes
    ctx.fillStyle = '#042747';
    for (let i = 0; i < 7; i++) {
      const px = 110 + i * 145;
      ctx.fillRect(px - 18, 150, 36, GROUND_Y - 150);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(px - 2, 170, 4, 130);
      ctx.fillStyle = '#042747';
    }
  } else if (theme === 'celestial_thunder_plateau') {
    // Electrified Basalt Pylons
    ctx.fillStyle = '#1e1b4b';
    for (let i = 0; i < 7; i++) {
      const px = 100 + i * 140;
      ctx.fillRect(px - 16, 165, 32, GROUND_Y - 165);
      ctx.fillStyle = '#a5b4fc';
      ctx.fillRect(px - 3, 180, 6, 80);
      ctx.fillStyle = '#1e1b4b';
    }
  } else if (theme === 'crimson_eclipse_citadel') {
    // Gothic Darkstone Flying Buttresses
    ctx.fillStyle = '#1c0508';
    for (let i = 0; i < 8; i++) {
      const px = 85 + i * 135;
      ctx.fillRect(px - 15, 155, 30, GROUND_Y - 155);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(px - 3, 175, 6, 50);
      ctx.fillStyle = '#1c0508';
    }
  } else {
    // Default classic Gothic & Imperial Pillars
    ctx.fillStyle = '#0f1016';
    for (let i = 0; i < 8; i++) {
      const px = 100 + i * 125;
      ctx.fillRect(px - 14, 180, 28, GROUND_Y - 180);
      ctx.fillRect(px - 22, 175, 44, 12);
    }
  }

  // Arena Ground Platform
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y - 5, 0, GROUND_Y + 150);
  if (theme === 'frostpeak_sanctuary') {
    groundGrad.addColorStop(0, '#0c2233');
    groundGrad.addColorStop(0.3, '#081722');
    groundGrad.addColorStop(1, '#030a0f');
  } else if (theme === 'volcanic_abyss') {
    groundGrad.addColorStop(0, '#2b0c07');
    groundGrad.addColorStop(0.3, '#190603');
    groundGrad.addColorStop(1, '#0d0302');
  } else if (theme === 'crimson_bamboo') {
    groundGrad.addColorStop(0, '#24080b');
    groundGrad.addColorStop(0.3, '#140507');
    groundGrad.addColorStop(1, '#0a0203');
  } else if (theme === 'emerald_bamboo_temple') {
    groundGrad.addColorStop(0, '#064e3b');
    groundGrad.addColorStop(0.3, '#022c22');
    groundGrad.addColorStop(1, '#011c15');
  } else if (theme === 'sunken_shadow_abyss') {
    groundGrad.addColorStop(0, '#0c2847');
    groundGrad.addColorStop(0.3, '#04172a');
    groundGrad.addColorStop(1, '#010912');
  } else if (theme === 'celestial_thunder_plateau') {
    groundGrad.addColorStop(0, '#1e1b4b');
    groundGrad.addColorStop(0.3, '#100e2b');
    groundGrad.addColorStop(1, '#080717');
  } else if (theme === 'crimson_eclipse_citadel') {
    groundGrad.addColorStop(0, '#310a0e');
    groundGrad.addColorStop(0.3, '#1a0406');
    groundGrad.addColorStop(1, '#0a0102');
  } else {
    groundGrad.addColorStop(0, '#1a1c26');
    groundGrad.addColorStop(0.2, '#12131a');
    groundGrad.addColorStop(1, '#090a0f');
  }

  ctx.fillStyle = groundGrad;
  ctx.fillRect(-100, GROUND_Y, ARENA_WIDTH + 200, 300);

  // Ground edge highlight line
  ctx.lineWidth = 3;
  if (theme === 'burning_citadel') ctx.strokeStyle = '#dc2626';
  else if (theme === 'dynasty_palace') ctx.strokeStyle = '#10b981';
  else if (theme === 'herald_nexus') ctx.strokeStyle = '#38bdf8';
  else if (theme === 'void_colosseum') ctx.strokeStyle = '#a855f7';
  else if (theme === 'frostpeak_sanctuary') ctx.strokeStyle = '#22d3ee';
  else if (theme === 'crimson_bamboo') ctx.strokeStyle = '#f43f5e';
  else if (theme === 'volcanic_abyss') ctx.strokeStyle = '#ea580c';
  else if (theme === 'emerald_bamboo_temple') ctx.strokeStyle = '#10b981';
  else if (theme === 'sunken_shadow_abyss') ctx.strokeStyle = '#06b6d4';
  else if (theme === 'celestial_thunder_plateau') ctx.strokeStyle = '#818cf8';
  else if (theme === 'crimson_eclipse_citadel') ctx.strokeStyle = '#e11d48';
  else ctx.strokeStyle = '#818cf8';

  ctx.beginPath();
  ctx.moveTo(-100, GROUND_Y);
  ctx.lineTo(ARENA_WIDTH + 100, GROUND_Y);
  ctx.stroke();

  // Stone tiles / Platform seams
  ctx.strokeStyle = theme === 'volcanic_abyss' ? '#431407' : theme === 'frostpeak_sanctuary' ? '#164e63' : theme === 'emerald_bamboo_temple' ? '#047857' : theme === 'sunken_shadow_abyss' ? '#083344' : '#272a38';
  ctx.lineWidth = 1;
  for (let x = 0; x <= ARENA_WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x, GROUND_Y + 40);
    ctx.stroke();
  }

  // Ambient atmospheric floating particles (Snow, Embers, Leaves, Cosmos)
  ctx.save();
  for (let i = 0; i < 20; i++) {
    const seed = i * 47.19;
    const px = ((seed * 37 + time * 40) % (ARENA_WIDTH + 200)) - 100;
    const py = ((seed * 63 + time * (theme === 'volcanic_abyss' ? -50 : 35)) % 320) + 70;
    
    if (theme === 'frostpeak_sanctuary') {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'crimson_bamboo') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.65)';
      ctx.beginPath();
      ctx.ellipse(px, py, 3, 1.5, time + i, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'volcanic_abyss') {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'emerald_bamboo_temple') {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.75)';
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'sunken_shadow_abyss') {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.75)';
      ctx.beginPath();
      ctx.arc(px, py, 1.9, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'celestial_thunder_plateau') {
      ctx.fillStyle = 'rgba(165, 180, 252, 0.8)';
      ctx.beginPath();
      ctx.arc(px, py, 2.0, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'crimson_eclipse_citadel') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.beginPath();
      ctx.arc(px, py, 1.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'astral_observatory') {
      ctx.fillStyle = 'rgba(192, 132, 252, 0.7)';
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.restore();
}

// Render articulate skeletal shadow fighter
export function drawFighter(
  ctx: CanvasRenderingContext2D,
  fighter: FighterEntity,
  camera: CameraState,
  canvasWidth: number,
  canvasHeight: number,
  time: number
) {
  ctx.save();
  // Apply camera
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  const pose = fighter.currentPose;
  const dir = fighter.direction;
  const rootX = fighter.x + pose.pelvis.x * dir;
  const rootY = fighter.y + pose.pelvis.y;

  // Shadow on ground
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  const shadowScale = Math.max(0.4, 1 - (GROUND_Y - fighter.y) / 200);
  ctx.ellipse(fighter.x, GROUND_Y + 2, 38 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Shadow Form Aura effect
  if (fighter.isShadowForm) {
    ctx.save();
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(rootX, rootY - 45, 36, 68, Math.sin(time * 6) * 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Fighter Colors: Iconic sleek black silhouette with armor trims & glowing accents
  const silhouetteColor = fighter.isShadowForm ? '#090814' : '#14141d';
  const trimColor = fighter.equipment.armor.colorScheme.glow;
  const eyeColor = fighter.isShadowForm ? '#a855f7' : '#38bdf8';

  ctx.save();
  ctx.translate(rootX, rootY);
  ctx.scale(dir, 1);

  // --- LEGS (Back & Front) ---
  // Left Leg (Back)
  drawLimb(ctx, 4, -5, pose.leftThigh.angle, 34, pose.leftShin.angle, 34, silhouetteColor, 9, 7);
  // Right Leg (Front)
  drawLimb(ctx, -4, -5, pose.rightThigh.angle, 34, pose.rightShin.angle, 34, silhouetteColor, 10, 8);

  // --- TORSO ---
  ctx.save();
  ctx.rotate(pose.torso.angle);

  // Pelvis / Belt
  ctx.fillStyle = silhouetteColor;
  ctx.beginPath();
  ctx.ellipse(0, -10, 16, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Armor Cuirass
  ctx.fillStyle = silhouetteColor;
  ctx.beginPath();
  ctx.moveTo(-14, -10);
  ctx.lineTo(14, -10);
  ctx.lineTo(19, -46);
  ctx.lineTo(-17, -46);
  ctx.closePath();
  ctx.fill();

  // Armor Crest / Glowing sigil
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-8, -40);
  ctx.lineTo(0, -20);
  ctx.lineTo(8, -40);
  ctx.stroke();

  // --- HEAD & HELMET ---
  ctx.save();
  ctx.translate(0, -50);
  ctx.rotate(pose.head.angle);

  // Head base
  ctx.fillStyle = silhouetteColor;
  ctx.beginPath();
  ctx.arc(2, -12, 14, 0, Math.PI * 2);
  ctx.fill();

  // Helmet Visor Trim
  ctx.fillStyle = fighter.equipment.helm.colorScheme.primary;
  ctx.beginPath();
  ctx.arc(2, -14, 15, -Math.PI * 0.7, Math.PI * 0.2);
  ctx.fill();

  // Glowing Eyes
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(8, -13, 3.5, 2, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore(); // restore head

  // --- ARMS & WEAPON ---
  // Left Arm (Back Arm)
  drawLimb(ctx, -14, -42, pose.leftUpperArm.angle, 26, pose.leftForearm.angle, 26, silhouetteColor, 7, 6);

  // Right Arm (Weapon Arm)
  const shoulderX = 14;
  const shoulderY = -42;
  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(pose.rightUpperArm.angle);

  // Upper arm
  ctx.fillStyle = silhouetteColor;
  ctx.fillRect(-4, 0, 9, 26);

  // Elbow & Forearm
  ctx.translate(0, 26);
  ctx.rotate(pose.rightForearm.angle);
  ctx.fillRect(-3.5, 0, 8, 26);

  // Hand / Wrist
  ctx.translate(0, 26);

  // Weapon Render
  ctx.save();
  ctx.translate(pose.weaponOffsetX * 0.3, pose.weaponOffsetY * 0.3);
  ctx.rotate(pose.weaponAngle);

  drawWeapon(ctx, fighter.equipment.weapon, fighter.isShadowForm);

  ctx.restore(); // restore weapon
  ctx.restore(); // restore right arm
  ctx.restore(); // restore torso

  ctx.restore(); // restore fighter root scale/translate
  ctx.restore(); // restore pre-camera
}

function drawLimb(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  angle1: number,
  len1: number,
  angle2: number,
  len2: number,
  color: string,
  width1: number,
  width2: number
) {
  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle1);

  // Limb part 1
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-width1 / 2, 0, width1, len1, width1 / 2);
  ctx.fill();

  // Joint 2
  ctx.translate(0, len1);
  ctx.rotate(angle2);

  // Limb part 2
  ctx.beginPath();
  ctx.roundRect(-width2 / 2, 0, width2, len2, width2 / 2);
  ctx.fill();

  ctx.restore();
}

// Global cache for weapon sprite images so they are loaded once and drawn with 0 lag
const weaponImageCache: Map<string, HTMLImageElement> = new Map();

function getWeaponImage(url?: string): HTMLImageElement | null {
  if (!url) return null;
  let img = weaponImageCache.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    weaponImageCache.set(url, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

function drawWeapon(
  ctx: CanvasRenderingContext2D,
  weapon: GearItem,
  isShadowForm: boolean
) {
  ctx.save();

  // Blade glow
  const glowColor = isShadowForm ? '#c084fc' : (weapon.colorScheme?.glow || '#38bdf8');
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = isShadowForm ? 22 : 14;

  // 1. Cut-out transparent pixel weapon sprite rendering
  if (weapon.spriteUrl) {
    const img = getWeaponImage(weapon.spriteUrl);
    if (img) {
      // Keep pixel art sharp and crisp
      ctx.imageSmoothingEnabled = false;

      // In the extracted 96x96 sprite, the sword lies along the 45-deg diagonal (bottom-left to top-right).
      // Rotating by -Math.PI / 4 aligns the diagonal blade straight UP along the negative Y axis.
      ctx.rotate(-Math.PI / 4);

      // Grip anchor: ~18% up from bottom-left pommel to top-right tip, placing the grip squarely in the fist
      const hiltX = weapon.hiltOffset ? weapon.hiltOffset[0] : 4.9;
      const hiltY = weapon.hiltOffset ? weapon.hiltOffset[1] : 89.3;
      const tipX = weapon.tipOffset ? weapon.tipOffset[0] : 90.7;
      const tipY = weapon.tipOffset ? weapon.tipOffset[1] : 4.3;

      const gripX = hiltX * 0.82 + tipX * 0.18;
      const gripY = hiltY * 0.82 + tipY * 0.18;

      const scale = 1.05;
      ctx.scale(scale, scale);
      ctx.drawImage(img, -gripX, -gripY);

      // Shadow Form ethereal aura blade trail
      if (isShadowForm) {
        ctx.globalAlpha = 0.55;
        ctx.drawImage(img, -gripX - 1.5, -gripY - 1.5);
      }

      ctx.restore();
      return;
    }
  }

  // 2. Vector fallback for non-sprite weapons
  const weaponType = weapon.weaponType;
  const colors = weapon.colorScheme || { primary: '#64748b', secondary: '#94a3b8', glow: '#38bdf8' };

  switch (weaponType) {
    case 'greatsword': {
      // Massive Claymore
      ctx.fillStyle = colors.primary;
      ctx.fillRect(-5, -75, 10, 85);
      // Blade edge
      ctx.strokeStyle = colors.glow;
      ctx.lineWidth = 2;
      ctx.strokeRect(-5, -75, 10, 85);
      // Crossguard
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(-18, 10, 36, 7);
      // Hilt
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-3, 17, 6, 25);
      break;
    }
    case 'nunchaku': {
      // Twin wooden batons with chain
      ctx.fillStyle = colors.primary;
      ctx.fillRect(-3, -35, 6, 40);
      ctx.fillStyle = colors.glow;
      ctx.fillRect(-3, -80, 6, 35);
      // Chain
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -35);
      ctx.lineTo(0, -45);
      ctx.stroke();
      break;
    }
    case 'kusarigama': {
      // Sickle and chain
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(20, -30, 45, -20);
      ctx.stroke();
      // Curved blade
      ctx.fillStyle = colors.glow;
      ctx.beginPath();
      ctx.arc(45, -20, 18, -Math.PI * 0.4, Math.PI * 0.5);
      ctx.lineTo(45, -20);
      ctx.fill();
      break;
    }
    case 'warhammer': {
      // Shaft
      ctx.fillStyle = '#292524';
      ctx.fillRect(-3, -60, 6, 80);
      // Heavy stone/iron head
      ctx.fillStyle = colors.primary;
      ctx.fillRect(-18, -65, 36, 24);
      ctx.strokeStyle = colors.glow;
      ctx.strokeRect(-18, -65, 36, 24);
      break;
    }
    default: {
      // Katana / curved nodachi
      ctx.strokeStyle = colors.glow;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.quadraticCurveTo(3, -35, 8, -75);
      ctx.stroke();

      // Blade Tip Glow Spark
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -75, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Tsuba (Guard)
      ctx.fillStyle = colors.secondary;
      ctx.beginPath();
      ctx.ellipse(0, 8, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Handle (Tsuka)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2.5, 8, 5, 22);
      break;
    }
  }

  ctx.restore();
}

// Draw Floating Numbers and Particles
export function drawEffects(
  ctx: CanvasRenderingContext2D,
  particles: ParticleEffect[],
  floatingTexts: FloatingText[],
  camera: CameraState,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // Render particles
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.type === 'spark') {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else if (p.type === 'shadow_smoke') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'blood') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Render floating damage numbers and critical alerts
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.font = `${ft.isCrit ? 'bold 24px' : '600 19px'} 'Cinzel', serif`;
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.isCrit ? '#f43f5e' : '#000000';
    ctx.shadowBlur = ft.isCrit ? 15 : 6;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
