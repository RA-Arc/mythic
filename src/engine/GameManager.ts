import { Hero } from "./Hero";
import { Boss } from "./Boss";
import { calculateLootDrop, COLOR_MAP } from "./Items";

export class GameManager {
  hero: Hero; boss: Boss; activeMob: Hero | null = null;
  mobSpawnTimer = 0; heroRespawnTimer = 0; bossTimer = 0;

  constructor(hero: Hero, boss: Boss) { this.hero = hero; this.boss = boss; }

  spawnMob() {
    if (this.hero.level >= 10 || this.activeMob || this.hero.hp <= 0) return null;
    this.activeMob = new Hero();
    this.activeMob.maxHp = 40 + this.hero.level * 15; this.activeMob.hp = this.activeMob.maxHp;
    this.activeMob.baseDmg = 5 + this.hero.level * 2;
    this.activeMob.sprite.x = 800 + Math.random() * 200; this.activeMob.sprite.y = 200 + Math.random() * 300;
    this.activeMob.sprite.tint = 0xff5555;
    return this.activeMob;
  }

  processReward(isBoss: boolean, gui: any, logger: any, popText: any) {
    const xpPayout = isBoss ? 500 : 35 + this.hero.level * 5;
    const targetName = isBoss ? "The Dragon Boss" : "a gnoll pup";
    logger.printLine(`You have slain ${targetName}!`, "#00ff00");

    if (this.hero.inventory.length < 10) {
      const rolledItem = calculateLootDrop(isBoss, this.hero.level);
      this.hero.inventory.push(rolledItem.name);
      const textCol = COLOR_MAP[rolledItem.rarity];
      popText(`Looted: [${rolledItem.name}]`, this.hero.sprite.x, this.hero.sprite.y - 145, textCol);
      logger.printLine(`Found Loot: [${rolledItem.name}] (${rolledItem.rarity})`, textCol);
    } else {
      logger.printLine("Your bags are full! Item decayed in the grass.", "#ff3333");
    }

    const lvlEvent = this.hero.gainXp(xpPayout);
    logger.printLine(`You gain ${xpPayout} points of experience.`, "#33ccff");
    if (lvlEvent) logger.printLine(`*** Achieved Level ${this.hero.level}! ***`, "#ffff00");
    if (gui && typeof gui.updateUI === "function") gui.updateUI();
  }

  calculateHeroAttack(target: any, tName: string, logger: any, popText: any, gui: any) {
    this.hero.attackCooldown = this.hero.getAttackInterval(); 
    let dmg = Math.floor(this.hero.getEffectiveDamage() + Math.random() * 8);

    // --- ADVANCED WEAPON TYPE EXPLICIT EQUIPMENT CHECK VALIDATION ---
    const mainWpn = this.hero.equipment.primaryWpn;
    const offWpn = this.hero.equipment.offHandWpn;
    
    let activeWpnType = "fist";
    if (mainWpn) activeWpnType = mainWpn.wpnType;
    else if (offWpn && offWpn.wpnType !== "armor") activeWpnType = offWpn.wpnType;

    let trainedSkill = "1H Blunt (Hammers)"; // Default fallback unarmed punch skill
    if (activeWpnType === "sword") trainedSkill = "1H Slashing (Swords)";
    else if (activeWpnType === "axe") trainedSkill = "2H Offense (Axes)";
    else if (activeWpnType === "bow") trainedSkill = "Archery (Bows)";
    else if (activeWpnType === "hammer") trainedSkill = "1H Blunt (Hammers)";

    // Train skill natively only if weapon profile checks pass validation rules completely
    this.hero.skillsManager.trainSkill(trainedSkill, logger, popText, this.hero.sprite);

    logger.printLine(`You strike ${tName} using [${trainedSkill.split(" ")[0]}] logic for ${dmg} damage.`, "#ffffff");
    target.takeDamage(dmg); popText(`-${dmg}`, target.sprite.x, target.sprite.y - 45, "#ffffff");
    if (gui && typeof gui.updateUI === "function") gui.updateUI();
  }
}
