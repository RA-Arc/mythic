const fs = require('fs');
let content = fs.readFileSync('src/engine/CombatEngine.ts', 'utf8');

const replacement = `
      if (currentSubStage === 9) {
        // Defeated 1000m Giant Era Boss!
        this.gameState.currencies.mythicShards += 50;
        this.gameState.currencies.titanCores += 5;
        this.gameState.currencies.eraEnergy += 5000;
        
        const curEraInfo = import("./data/eras").ERA_DATA[eraId];
        const nextEraMat = curEraInfo ? curEraInfo.primaryMaterial : "primordial_essence";
        if (this.gameState.currencies.materials[nextEraMat] === undefined) {
           this.gameState.currencies.materials[nextEraMat] = 0;
        }
        this.gameState.currencies.materials[nextEraMat] += 1000;
        
        this.particles.addFloatingText("ERA CONQUERED! MASSIVE LOOT", 640, 280, "#ff4081", 32, true);
        
        // Unlock next era
`;

content = content.replace(/if \(currentSubStage === 9\) \{[\s\S]*?\/\/ Unlock next era/, replacement.trim() + '\n        // Unlock next era');
fs.writeFileSync('src/engine/CombatEngine.ts', content);
console.log('Added Giant Boss Drops');
