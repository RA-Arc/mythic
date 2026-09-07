const fs = require('fs');
let content = fs.readFileSync('src/engine/CombatEngine.ts', 'utf8');

const replacement = `
    const newEnemy = MythicEnemy.spawnForEra(eraId, shouldSpawnBoss, this.hero.level);
    
    // Scale up the final 1000m boss!
    const currentSubStage = Math.floor(this.gameState.distanceMeters / 100);
    if (shouldSpawnBoss && currentSubStage === 9) {
       newEnemy.baseScale *= 1.8;
       newEnemy.maxHp *= 3;
       newEnemy.hp = newEnemy.maxHp;
       newEnemy.baseDmg *= 1.5;
       newEnemy.name = "GIANT " + newEnemy.name;
    }
`;

content = content.replace(/const newEnemy = MythicEnemy\.spawnForEra\(eraId, shouldSpawnBoss, this\.hero\.level\);/, replacement.trim());
fs.writeFileSync('src/engine/CombatEngine.ts', content);
console.log('Added Giant Boss Logic');
