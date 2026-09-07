const fs = require('fs');
let content = fs.readFileSync('src/engine/CombatEngine.ts', 'utf8');

content = content.replace(/const curEraInfo = import\("\.\/data\/eras"\)\.ERA_DATA\[eraId\];/, 'const curEraInfo = ERA_DATA[eraId];');
fs.writeFileSync('src/engine/CombatEngine.ts', content);
console.log('Fixed drops');
