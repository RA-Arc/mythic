const fs = require('fs');

let content = fs.readFileSync('src/engine/CombatEngine.ts', 'utf8');

const replacement = `
    if (isBoss) {
      this.gameState.currencies.titanCores += 1;
      logger.printLine(\`*** OBTAINED 1 TITAN CORE! ***\`, "#ffd700");
      this.particles.addFloatingText("+1 TITAN CORE!", 640, 240, "#ffd700", 26, true);
      
      const currentSubStage = Math.floor(this.gameState.distanceMeters / 100);
      if (currentSubStage === 9) {
        // Defeated 1000m Giant Era Boss!
        this.gameState.currencies.mythicShards += 50;
        this.gameState.currencies.titanCores += 5;
        this.particles.addFloatingText("ERA CONQUERED! +50 SHARDS", 640, 280, "#ff4081", 32, true);
        
        // Unlock next era
        const eraOrder = ["dawn", "fire", "stone", "bronze", "iron", "faith", "discovery", "steam", "atom", "stars"];
        const currentIdx = eraOrder.indexOf(eraId);
        if (currentIdx >= 0 && currentIdx < eraOrder.length - 1) {
          const nextEra = eraOrder[currentIdx + 1];
          if (!this.gameState.unlockedEras.includes(nextEra)) {
             this.gameState.unlockedEras.push(nextEra);
             logger.printLine(\`*** ERA UNLOCKED: \${nextEra.toUpperCase()} ***\`, "#ffd700");
          }
        }
        
        this.gameState.distanceMeters += 2;
      } else {
        // Mini boss defeated
        this.gameState.distanceMeters += 2; // push past the 99m mark
      }

      this.bossMode = false;
    }
`;

content = content.replace(/if \(isBoss\) \{[\s\S]*?this\.bossMode = false;\n    \}/, replacement.trim());
fs.writeFileSync('src/engine/CombatEngine.ts', content);
console.log('Patched CombatEngine.ts');
