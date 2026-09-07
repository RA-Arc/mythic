const fs = require('fs');

let content = fs.readFileSync('src/main.ts', 'utf8');

const replacement = `
    const isWalking = hero.state === "run" || Math.abs(vx) > 0.1;
    const walkSpeed = isWalking ? 0.85 : 0.2;

    if (isWalking && hero.hp > 0 && !combatEngine.bossMode && !combatEngine.enemies.some(e => e.isBoss)) {
      gameState.distanceMeters += (walkSpeed * delta * 0.05);
    }

    const currentSubStage = Math.floor(gameState.distanceMeters / 100);
    const distanceIntoStage = gameState.distanceMeters % 100;
    
    // Trigger mini-boss at 99m if we haven't beaten the stage
    if (distanceIntoStage >= 99 && currentSubStage < 10 && !combatEngine.bossMode && !combatEngine.enemies.some(e => e.isBoss)) {
      combatEngine.bossMode = true;
    }
`;

content = content.replace(/const isWalking = hero\.state === "run" \|\| Math\.abs\(vx\) > 0\.1;\n\s*const walkSpeed = isWalking \? 0\.85 : 0\.2;/, replacement.trim());
fs.writeFileSync('src/main.ts', content);
console.log('Patched main.ts');
