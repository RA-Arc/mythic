const fs = require('fs');
let content = fs.readFileSync('src/engine/Ui.ts', 'utf8');

// Replace the modal boss toggle with a progress bar or text
const distanceInfo = `
    const distance = gameState.distanceMeters;
    const stage = Math.floor(distance / 100);
    const progress = Math.floor(distance % 100);
    const distanceHtml = \`
      <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; text-align: center;">
        <div style="font-size: 11px; color: #8b949e; text-transform: uppercase;">Era Exploration Progress</div>
        <div style="font-size: 16px; font-weight: bold; color: #58a6ff;">Stage \${stage + 1}/10 (\${progress}m / 100m)</div>
        <div style="width: 100%; background: #21262d; height: 6px; border-radius: 3px; margin-top: 8px; overflow: hidden;">
          <div style="width: \${progress}%; background: #58a6ff; height: 100%;"></div>
        </div>
      </div>
    \`;
`;

content = content.replace(/<button id="modal-boss-toggle"[\s\S]*?<\/button>/, '<div id="era-distance-tracker"></div>');
content = content.replace(/<div class="hub-action-card" id="hub-toggle-boss-btn"[\s\S]*?<\/div>/g, '');

fs.writeFileSync('src/engine/Ui.ts', content);
console.log('Removed manual boss toggles from Ui.ts');
