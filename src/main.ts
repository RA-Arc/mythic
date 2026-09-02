import { Application, Assets, Text, TextStyle, Graphics } from "pixi.js";
import { Hero } from "./engine/Hero";
import { Boss } from "./engine/Boss";
import { createEverQuestUI } from "./engine/Ui";
import { createEverQuestLog } from "./engine/Log";
import { GameManager } from "./engine/GameManager";

async function run() {
  const app = new Application();
  await app.init({ width: 1280, height: 720, backgroundColor: 0x1a1a1a });
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative"; wrapper.style.width = "1280px"; wrapper.style.height = "720px"; wrapper.style.margin = "0 auto";
  document.body.appendChild(wrapper); wrapper.appendChild(app.canvas);

  const prefixes = ["idle", "run", "attack", "jump", "swim", "x"];
  for (const p of prefixes) {
    const count = p === "attack" ? 3 : p === "idle" || p === "jump" || p === "x" ? 4 : 6;
    for (let i = 0; i < count; i++) await Assets.load(`assets/sprites/hero/${p}_${i}.png`);
  }
  const bossFrames = ["flying1", "flying2", "attack1", "attack2"];
  for (const f of bossFrames) await Assets.load(`assets/sprites/boss/${f}.png`);

  const txtStyle = new TextStyle({ fontFamily: "Courier New", fontSize: 22, fill: "#ffffff", stroke: { color: "#000000", width: 4 }, fontWeight: "bold" });
  function popText(msg: string, x: number, y: number, color: string, sz = 22) {
    const s = txtStyle.clone(); s.fill = color; s.fontSize = sz; const t = new Text({ text: msg, style: s }); t.x = x; t.y = y; t.anchor.set(0.5);
    app.stage.addChild(t); let life = 60; const tk = () => { t.y -= 1.2; t.alpha = life/60; life--; if (life<=0) { app.stage.removeChild(t); app.ticker.remove(tk); t.destroy(); }};
    app.ticker.add(tk);
  }

  const ui = new Graphics(); app.stage.addChild(ui);
  function drawBar(x: number, y: number, cur: number, max: number, w: number, h: number, col: number) {
    ui.fill(0x222222).rect(x - w/2, y, w, h).fill(col).rect(x - w/2, y, w * Math.max(0, cur/max), h);
  }

  const hero = new Hero(); hero.sprite.x = 200; hero.sprite.y = 400; app.stage.addChild(hero.sprite);
  const boss = new Boss(); boss.setPosition(1000, 360); boss.setScale(2.2); app.stage.addChild(boss.sprite);
  
  const gui = createEverQuestUI(wrapper, hero); const logger = createEverQuestLog(wrapper);
  const gm = new GameManager(hero, boss);

  let wanderT = 0, wanderD = 0, vx = 0, vy = 0;
  function chooseWander() { const a = Math.random() * Math.PI * 2; vx = Math.cos(a) * 1.2; vy = Math.sin(a) * 1.2; wanderD = 60 + Math.random() * 60; hero.setState("run"); hero.sprite.scale.x = vx < 0 ? -1 : 1; }
  chooseWander();

  app.ticker.add(() => { if (boss.sprite.visible && boss.hp > 0) { gm.bossTimer++; if (gm.bossTimer % 200 === 0) boss.setState(boss.state === "fly" ? "attack" : "fly"); } });

  app.ticker.add(() => {
    ui.clear();
    if (hero.hp <= 0) {
      if (hero.state !== "death") { hero.setState("death"); popText("YOU DIED...", hero.sprite.x, hero.sprite.y - 50, "#ff3333"); logger.printLine("Slain! Returning to bind point...", "#ff3333"); gm.heroRespawnTimer = 240; if (gm.activeMob) { app.stage.removeChild(gm.activeMob.sprite); gm.activeMob = null; } }
      gm.heroRespawnTimer--; if (gm.heroRespawnTimer <= 0) { hero.hp = hero.getEffectiveMaxHp(); hero.sprite.x = 200; hero.sprite.y = 400; hero.setState("idle"); logger.printLine("Woke up at bind point.", "#ffffcc"); chooseWander(); }
      return;
    }

    if (hero.attackCooldown > 0) hero.attackCooldown--;
    if (hero.hurtTimer > 0) hero.hurtTimer--;

    let target: any = null; let tName = "";
    if (hero.level >= 10) {
      if (!boss.sprite.visible) { boss.sprite.visible = true; popText("THE BOSS AWAKES!", 640, 150, "#ff3333", 32); logger.printLine("The Dragon awakens!", "#ff3333"); }
      if (boss.hp > 0) { target = { sprite: boss.sprite, hp: boss.hp, maxHp: boss.maxHp, takeDamage: (d: any) => boss.takeDamage(d), baseDmg: 24 }; tName = "The Dragon Boss"; }
      else if (boss.sprite.alpha === 1.0) { boss.sprite.alpha = 0.2; gm.processReward(true, gui, logger, popText); setTimeout(() => boss.respawn(), 5000); }
    } else {
      boss.sprite.visible = false;
      if (!gm.activeMob) { gm.mobSpawnTimer++; if (gm.mobSpawnTimer > 100) { gm.mobSpawnTimer = 0; const m = gm.spawnMob(); if (m) app.stage.addChild(m.sprite); } }
      else if (gm.activeMob.hp > 0) { target = { sprite: gm.activeMob.sprite, hp: gm.activeMob.hp, maxHp: gm.activeMob.maxHp, takeDamage: (d: any) => gm.activeMob!.takeDamage(d), baseDmg: gm.activeMob.baseDmg }; tName = "a gnoll pup"; }
      else { app.stage.removeChild(gm.activeMob.sprite); gm.activeMob = null; gm.processReward(false, gui, logger, popText); }
    }

    if (target && hero.hp > 0) {
      const dx = target.sprite.x - hero.sprite.x, dy = target.sprite.y - hero.sprite.y, dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 85) {
        const rad = Math.atan2(dy, dx); hero.sprite.x += Math.cos(rad) * hero.speed; hero.sprite.y += Math.sin(rad) * hero.speed;
        if (hero.state !== "run" && hero.hurtTimer <= 0) hero.setState("run"); hero.sprite.scale.x = dx < 0 ? -1 : 1;
      } else {
        if (hero.hurtTimer <= 0 && hero.state !== "attack") hero.setState("attack");
        if (hero.attackCooldown === 0) gm.calculateHeroAttack(target, tName, logger, popText, gui);
      }
      if (dist < 115 && target.hp > 0 && hero.attackCooldown === Math.floor(hero.getAttackInterval() / 2)) {
        const ed = Math.floor(target.baseDmg * (0.8 + Math.random()*0.4)); hero.takeDamage(ed); popText(`-${ed}`, hero.sprite.x, hero.sprite.y - 45, "#ff4444"); logger.printLine(`${tName} hits YOU for ${ed} damage!`, "#ff5555");
      }
    } else if (hero.hp > 0) { wanderT++; if (wanderT > wanderD) { wanderT = 0; chooseWander(); } hero.sprite.x += vx; hero.sprite.y += vy; }

    hero.sprite.x = Math.max(60, Math.min(1220, hero.sprite.x)); hero.sprite.y = Math.max(60, Math.min(660, hero.sprite.y));
    drawBar(hero.sprite.x, hero.sprite.y + 40, hero.hp, hero.getEffectiveMaxHp(), 65, 6, 0x22cc22);
    drawBar(hero.sprite.x, hero.sprite.y + 49, hero.xp, hero.maxXp, 65, 4, 0x00aaff);
    if (target && target.hp > 0) drawBar(target.sprite.x, target.sprite.y + (hero.level >= 10 ? 80 : 40), target.hp, target.maxHp, hero.level >= 10 ? 120 : 60, 6, 0xcc2222);

    const hud = app.stage.getChildByLabel('hud') as Text; const txt = `HERO : LVL ${hero.level}  [XP: ${hero.xp}/${hero.maxXp}]`;
    if (!hud) { const h = new Text({ text: txt, style: { fontFamily: "Courier New", fontSize: 18, fill: "#ffffbb", fontWeight: "bold" } }); h.label = 'hud'; h.x = 25; h.y = 25; app.stage.addChild(h); } else { hud.text = txt; }
  });
}
run();
