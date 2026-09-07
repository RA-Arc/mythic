const fs = require('fs');
let content = fs.readFileSync('src/engine/ParallaxEngine.ts', 'utf8');

content = content.replace(/public update\(\n    delta: number,\n    isWalking: boolean,\n    walkSpeed: number,\n    facing: number,\n    hero: Hero,/, 'public update(\n    delta: number,\n    isWalking: boolean,\n    walkSpeed: number,\n    facing: number,\n    hero: Hero,\n    activeEnemy: any,\n    miniNinjas: any[],\n    distanceMeters: number = 0) {');

fs.writeFileSync('src/engine/ParallaxEngine.ts', content);
console.log('Patched ParallaxEngine.ts update signature');
