const fs = require('fs');
let content = fs.readFileSync('src/engine/ParallaxEngine.ts', 'utf8');

const lines = content.split('\n');
// Find index of '  public update('
const idx = lines.findIndex(l => l.startsWith('  public update('));
if (idx !== -1) {
  // Find the end of the signature '  ) {'
  let endIdx = idx;
  while(endIdx < lines.length && !lines[endIdx].includes('  ) {')) {
    endIdx++;
  }
  // There are two '  ) {' apparently.
  let actualEnd = endIdx;
  if (lines[endIdx + 3] && lines[endIdx + 3].includes('  ) {')) {
    actualEnd = endIdx + 3;
  }
  
  lines.splice(idx, actualEnd - idx + 1, 
    '  public update(',
    '    delta: number,',
    '    isWalking: boolean,',
    '    walkSpeed: number,',
    '    facing: number,',
    '    hero: import("./Hero").Hero,',
    '    activeEnemy: import("./Enemy").MythicEnemy | null,',
    '    activeMiniNinjas: any[],',
    '    distanceMeters: number = 0',
    '  ) {'
  );
  fs.writeFileSync('src/engine/ParallaxEngine.ts', lines.join('\n'));
}
