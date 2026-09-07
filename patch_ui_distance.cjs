const fs = require('fs');
let content = fs.readFileSync('src/engine/Ui.ts', 'utf8');

const distLogic = `
            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-size: 11px; line-height: 1.6;">
              <div style="font-size: 14px; font-weight: bold; color: #ffd700;">\${curEra.bossName}</div>
              <div style="color: #8b949e; font-style: italic;">"\${curEra.bossTitle}"</div>
              <div style="margin-top: 6px;"><b>Boss Max Health:</b> <span style="color:#7ee787;">\${curEra.bossHp.toLocaleString()} HP</span></div>
              <div><b>Base Damage:</b> <span style="color:#ff7b72;">\${curEra.bossDamage} DMG</span></div>
              <div><b>Mythic Affinity:</b> <span style="color:#d2a8ff;">\${curEra.bossAffinity}</span></div>
            </div>
            
            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #8b949e; text-transform: uppercase;">Era Exploration Progress</div>
              <div style="font-size: 16px; font-weight: bold; color: #58a6ff;">Stage \${Math.floor((gameState.distanceMeters||0) / 100) + 1}/10 (\${Math.floor((gameState.distanceMeters||0) % 100)}m / 100m)</div>
              <div style="width: 100%; background: #21262d; height: 6px; border-radius: 3px; margin-top: 8px; overflow: hidden;">
                <div style="width: \${(gameState.distanceMeters||0) % 100}%; background: #58a6ff; height: 100%;"></div>
              </div>
            </div>
`;

content = content.replace(/<div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-size: 11px; line-height: 1\.6;">[\s\S]*?<\/div>/, distLogic.trim());

fs.writeFileSync('src/engine/Ui.ts', content);
console.log('Added distance tracker in Ui.ts');
