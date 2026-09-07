const fs = require('fs');
let content = fs.readFileSync('src/engine/GameState.ts', 'utf8');

content = content.replace(/this\.currentEra = targetEra;/, 'this.currentEra = targetEra;\n    this.distanceMeters = 0;');

fs.writeFileSync('src/engine/GameState.ts', content);
console.log('Patched advanceEra');
