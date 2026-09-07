const fs = require('fs');
let content = fs.readFileSync('src/engine/ParallaxEngine.ts', 'utf8');

// Ensure ColorMatrixFilter is imported
if (!content.includes('ColorMatrixFilter')) {
  content = content.replace(/import \{ Container, Sprite, Graphics, Texture, Assets \} from "pixi.js";/, 'import { Container, Sprite, Graphics, Texture, Assets, ColorMatrixFilter } from "pixi.js";');
}

// Update the update signature
content = content.replace(/public update\(delta: number, isWalking: boolean, speedMultiplier: number, heroFacing: number, hero: Hero, activeEnemy: any, miniNinjas: any\[\]\) \{/, 'public update(delta: number, isWalking: boolean, speedMultiplier: number, heroFacing: number, hero: Hero, activeEnemy: any, miniNinjas: any[], distanceMeters: number = 0) {');

// Add filter creation in constructor
if (!content.includes('this.stageFilter = new ColorMatrixFilter()')) {
  content = content.replace(/this\.rootContainer = new Container\(\);/, 'this.rootContainer = new Container();\n    this.stageFilter = new ColorMatrixFilter();\n    this.bgContainer.filters = [this.stageFilter];');
  content = content.replace(/private bgContainer: Container;/, 'private bgContainer: Container;\n  private stageFilter: ColorMatrixFilter;');
}

// In the update loop, change hue based on subStage
const filterUpdate = `
    const subStage = Math.floor(distanceMeters / 100) % 10;
    // Each subStage shifts the hue by 36 degrees to give 10 completely different distinct palettes per era
    this.stageFilter.hue(subStage * 36, false);
`;

// Insert it somewhere in the update function
content = content.replace(/this\.time \+= delta \* 0\.02;/, 'this.time += delta * 0.02;\n' + filterUpdate);

fs.writeFileSync('src/engine/ParallaxEngine.ts', content);
console.log('Patched ParallaxEngine.ts');
