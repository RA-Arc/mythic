const fs = require('fs');
let content = fs.readFileSync('src/engine/ParallaxEngine.ts', 'utf8');

content = content.replace(/public update\([\s\S]*?\) \{/, `public update(
    delta: number,
    isWalking: boolean,
    walkSpeed: number,
    facing: number,
    hero: import("./Hero").Hero,
    activeEnemy: any,
    activeMiniNinjas: any[],
    distanceMeters: number = 0
  ) {`);

fs.writeFileSync('src/engine/ParallaxEngine.ts', content);
console.log('Patched ParallaxEngine.ts exact signature');
