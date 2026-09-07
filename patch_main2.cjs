const fs = require('fs');
let content = fs.readFileSync('src/main.ts', 'utf8');
content = content.replace(/parallaxEngine\.update\(delta, isWalking, walkSpeed, heroFacing, hero, combatEngine\.activeEnemy, activeMiniNinjas\);/, 'parallaxEngine.update(delta, isWalking, walkSpeed, heroFacing, hero, combatEngine.activeEnemy, activeMiniNinjas, gameState.distanceMeters);');
fs.writeFileSync('src/main.ts', content);
console.log('Patched main.ts parallax update');
