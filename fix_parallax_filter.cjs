const fs = require('fs');
let content = fs.readFileSync('src/engine/ParallaxEngine.ts', 'utf8');

if (!content.includes('import { Container, Sprite, Graphics, Texture, Assets, ColorMatrixFilter }')) {
  content = content.replace(/import \{ Container, Sprite, Graphics, Texture, Assets \} from "pixi.js";/, 'import { Container, Sprite, Graphics, Texture, Assets, ColorMatrixFilter } from "pixi.js";');
}

if (!content.includes('stageFilter: ColorMatrixFilter')) {
  content = content.replace(/private bgContainer: Container;/, 'private bgContainer: Container;\n  private stageFilter: ColorMatrixFilter;');
}
if (!content.includes('this.stageFilter = new ColorMatrixFilter();')) {
  content = content.replace(/this\.bgContainer = new Container\(\);/, 'this.bgContainer = new Container();\n    this.stageFilter = new ColorMatrixFilter();\n    this.bgContainer.filters = [this.stageFilter];');
}

// Add filter to update loop
if (!content.includes('this.stageFilter.hue')) {
  content = content.replace(/this\.ambientTimer \+= delta \* 0\.03;/, `this.ambientTimer += delta * 0.03;
    const subStage = Math.floor(distanceMeters / 100) % 10;
    this.stageFilter.hue(subStage * 36, false);`);
}

fs.writeFileSync('src/engine/ParallaxEngine.ts', content);
console.log('Fixed filters in ParallaxEngine.ts');
