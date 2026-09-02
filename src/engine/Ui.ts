import { Hero } from "./Hero";
import { ITEM_DATABASE, COLOR_MAP } from "./Items";
import { BASE_RACE_STATS, RPGRace, RPGClass } from "./Skills";

export function createEverQuestUI(wrapper: HTMLDivElement, hero: Hero) {
  const panel = document.createElement("div");
  panel.style.cssText = "position:absolute; top:0; left:0; width:1280px; height:720px; background:rgba(9,11,16,0.99); border:4px solid #a48e6c; color:#ebdcb9; font-family:'Courier New',monospace; padding:20px; display:none; z-index:1000; box-sizing:border-box; box-shadow:inset 0 0 40px #000;";
  wrapper.appendChild(panel);

  const bar = document.createElement("div");
  bar.style.cssText = "position:absolute; bottom:10px; right:10px; z-index:1001;";
  wrapper.appendChild(bar);

  let open = false;
  const races: RPGRace[] = ["Human", "Dwarf", "Elf", "Iksar"];
  const classes: RPGClass[] = ["Paladin", "Cleric", "Enchanter", "Shadow Knight"];
  
  const slots: Array<{ l: string; k: keyof typeof hero.equipment }> = [
    { l: "Head/Helm", k: "head" }, { l: "Face/Mask", k: "face" }, { l: "Necklace", k: "neck" }, { l: "Shoulders", k: "shoulder" },
    { l: "Chest Plate", k: "chest" }, { l: "Cloak/Back", k: "back" }, { l: "Wrist Guard", k: "wrist" }, { l: "Gauntlets", k: "hands" },
    { l: "Waist Sash", k: "waist" }, { l: "Legplates", k: "legs" }, { l: "Earring 1", k: "ear1" }, { l: "Earring 2", k: "ear2" },
    { l: "Ring 1", k: "finger1" }, { l: "Ring 2", k: "finger2" }, { l: "Primary Wpn", k: "primaryWpn" }, { l: "Off-Hand Slot", k: "offHandWpn" }
  ];

  function updateUI() {
    bar.innerHTML = `<button id="toggle-eq-panel" style="background:#544634; border:2px solid #a48e6c; color:#fffdd0; padding:8px 16px; cursor:pointer; font-weight:bold; font-size:13px; border-radius:3px;">📋 CHAR DETAILS (${hero.inventory.length}/10)</button>`;
    if (!open) { panel.style.display = "none"; return; }
    panel.style.display = "block";

    const rStats = BASE_RACE_STATS[hero.skillsManager.selectedRace];
    const buildList = (arr: typeof slots) => arr.map(s => {
      const g = hero.equipment[s.k];
      return `<div style="background:#141822; border:1px solid #5a4e3b; padding:6px; min-height:52px; text-align:center; border-radius:3px; margin-bottom:4px;"><div style="font-size:8px; color:#a48e6c; font-weight:bold;">${s.l}</div><span style="font-size:10px; color:${g ? COLOR_MAP[g.rarity] : '#555'}; font-weight:bold;">${g ? g.name : '[Empty]'}</span></div>`;
    }).join("");

    const skillsHtml = Object.values(hero.skillsManager.skills).map(s => `
      <div style="margin-bottom:5px; font-size:11px;"><div style="display:flex; justify-content:space-between;"><b>${s.name}</b><span style="color:#00ffcc;">Lvl ${s.level}</span></div><div style="width:100%; background:#222; height:4px; overflow:hidden; border:1px solid #333; margin-top:2px;"><div style="width:${Math.min(100,(s.currentXp/s.maxXp)*100)}%; background:#3399ff; height:100%;"></div></div></div>
    `).join("");

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #a48e6c; padding-bottom:6px; margin-bottom:10px;"><span style="font-size:15px; font-weight:bold; color:#ffffcc;">⚙️ CHARACTER MATRICES SHEET</span><button id="close-full-panel" style="background:#7c3131; color:#fff; border:2px solid #a48e6c; padding:3px 12px; cursor:pointer; font-weight:bold; border-radius:3px;">CLOSE [X]</button></div>
      <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:15px; height:595px;">
        <div style="display:grid; grid-template-columns: 1fr 1.5fr 1fr; gap:8px; background:#0a0c10; border:2px solid #3a3226; padding:8px; border-radius:6px; height:570px;">
          <div>${buildList(slots.slice(0, 8))}</div>
          <div style="background:radial-gradient(circle, #2d3b4d 0%, #0e1218 80%); border:2px solid #a48e6c; border-radius:4px; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative; box-shadow:inset 0 0 20px #000;"><div style="font-size:64px; filter:drop-shadow(0 0 10px #ffcc00);">🧝</div><div style="position:absolute; bottom:10px; color:#ffcc00; font-size:12px; font-weight:bold; text-transform:uppercase;">${hero.skillsManager.selectedRace} ${hero.skillsManager.selectedClass}</div></div>
          <div>${buildList(slots.slice(8))}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; overflow-y:auto;">
          <div style="background:#141822; padding:6px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div><span style="font-size:10px; font-weight:bold; color:#ffcc00;">RACE:</span><div style="display:grid; grid-template-columns:1fr 1fr; gap:2px;">${races.map(r=>`<button class="race-btn" data-race="${r}" style="padding:3px; font-size:9px; background:${r===hero.skillsManager.selectedRace?'#4a3d25':'#1f2430'}; color:#fff; border:1px solid #444; cursor:pointer;">${r}</button>`).join("")}</div></div>
            <div><span style="font-size:10px; font-weight:bold; color:#3399ff;">CLASS:</span><div style="display:grid; grid-template-columns:1fr 1fr; gap:2px;">${classes.map(c=>`<button class="class-btn" data-class="${c}" style="padding:3px; font-size:9px; background:${c===hero.skillsManager.selectedClass?'#1a334d':'#1f2430'}; color:#fff; border:1px solid #444; cursor:pointer;">${c}</button>`).join("")}</div></div>
          </div>
          <div style="background:rgba(0,0,0,0.4); border:1px solid #3d3526; padding:6px; font-size:10px; display:grid; grid-template-columns:1fr 1fr; gap:6px; line-height:1.3;"><div><b>ATTRIBUTES:</b><br/>STR: ${rStats.Strength}<br/>STA: ${rStats.Stamina}<br/>AGI: ${rStats.Agility}</div><div><b>LIVE STATS:</b><br/>Max HP: <span style="color:#22cc22;">${hero.getEffectiveMaxHp()}</span><br/>Attack: <span style="color:#ff4444;">${hero.getEffectiveDamage()}</span></div></div>
          <div style="background:#0c0f14; border:1px solid #2d3545; padding:6px; border-radius:4px; max-height:160px; overflow-y:auto;">${skillsHtml}</div>
          <div style="font-weight:bold; color:#ffffcc; font-size:11px;">🎒 BAG STORAGE:</div>
          <div style="display:flex; flex-direction:column; gap:4px; max-height:120px; overflow-y:auto; background:rgba(0,0,0,0.3); padding:4px; border:1px solid #3a3226; border-radius:4px;">
            ${hero.inventory.map((n, i) => {
              const d = ITEM_DATABASE[n]; if (!d) return '';
              return `<div style="background:#241d15; border:1px solid #4a3e2d; padding:4px; display:flex; justify-content:space-between; align-items:center; font-size:10px;"><b><span style="color:${COLOR_MAP[d.rarity]};">${d.name}</span></b><div><button class="action-eq" data-idx="${i}" style="background:#3d5236; color:#fff; border:none; padding:2px 5px; cursor:pointer; font-size:9px; margin-right:2px; font-weight:bold;">EQUIP</button><button class="action-del" data-idx="${i}" style="background:#6d2828; color:#fff; border:none; padding:2px 5px; cursor:pointer; font-size:9px; font-weight:bold;">DROP</button></div></div>`;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    panel.querySelector("#close-full-panel")?.addEventListener("click", () => { open = false; updateUI(); });
    panel.querySelectorAll(".race-btn").forEach(b => b.addEventListener("click", (e) => { hero.skillsManager.selectedRace = (e.target as HTMLElement).getAttribute("data-race") as RPGRace; hero.hp = hero.getEffectiveMaxHp(); updateUI(); }));
    panel.querySelectorAll(".class-btn").forEach(b => b.addEventListener("click", (e) => { hero.skillsManager.selectedClass = (e.target as HTMLElement).getAttribute("data-class") as RPGClass; updateUI(); }));
    
    panel.querySelectorAll(".action-eq").forEach(b => b.addEventListener("click", (e) => {
      const idx = parseInt((e.target as HTMLElement).getAttribute("data-idx")!);
      const name = hero.inventory[idx]; const d = ITEM_DATABASE[name];
      if (d) {
        let k: keyof typeof hero.equipment = d.slot as any;
        if (d.slot === "finger1" || d.slot === "finger2") k = !hero.equipment.finger1 ? "finger1" : "finger2";
        else if (d.slot === "ear1" || d.slot === "ear2") k = !hero.equipment.ear1 ? "ear1" : "ear2";
        else if (d.slot === "primaryWpn") k = !hero.equipment.primaryWpn ? "primaryWpn" : "offHandWpn";
        const old = hero.equipment[k]; hero.equipment[k] = d; hero.inventory.splice(idx, 1); if (old) hero.inventory.push(old.name);
      }
      updateUI();
    }));
    panel.querySelectorAll(".action-del").forEach(b => b.addEventListener("click", (e) => { hero.inventory.splice(parseInt((e.target as HTMLElement).getAttribute("data-idx")!), 1); updateUI(); }));
  }

  bar.addEventListener("click", (e) => { if ((e.target as HTMLElement).id === "toggle-eq-panel") { open = !open; updateUI(); } });
  
  setTimeout(() => {
    const box = wrapper.querySelector("div[style*='width: 420px']") as HTMLDivElement;
    if (box && !box.querySelector("#chat-toggle-header")) {
      const h = document.createElement("div"); h.id = "chat-toggle-header";
      h.style.cssText = "background:#1e2430; border-bottom:1px solid #5a4a35; padding:2px 6px; display:flex; justify-content:space-between; font-weight:bold; color:#ffcc00; font-size:10px; cursor:pointer;";
      h.innerHTML = `<span>"💬 EVERQUEST CHAT INTERFACE"</span><span id='chat-min-btn'>[-]</span>`;
      let min = false; const orig = box.style.height;
      h.addEventListener("click", () => { min = !min; box.style.height = min ? "20px" : orig; box.style.overflowY = min ? "hidden" : "auto"; h.querySelector("#chat-min-btn")!.textContent = min ? "[+]" : "[-]"; });
      box.insertBefore(h, box.firstChild);
    }
  }, 500);

  updateUI();
  return { updateUI };
}
