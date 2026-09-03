import { Hero } from "./Hero";
import { GameState } from "./GameState";
import { CombatEngine } from "./CombatEngine";
import { ERA_DATA, ERA_ORDER } from "./data/eras";
import { ANCESTRAL_MEMORIES } from "./data/memories";
import { COSMIC_TRAIT_TREE } from "./data/traits";
import { MASTER_GEAR_CATALOG, COLOR_MAP } from "./data/gear";
import { ALL_ABILITIES } from "./data/skills";
import { LORE_DATABASE } from "./data/lore";
import { soundEngine } from "./SoundEngine";
import { EquipSlot, RPGItem, CosmicForce, EraId } from "./types";

export function createMythicUI(
  wrapper: HTMLDivElement,
  hero: Hero,
  gameState: GameState,
  combatEngine: CombatEngine,
  logger: any
) {
  // Main tactical HUD & Tab container
  const uiContainer = document.createElement("div");
  uiContainer.id = "mythic-ui-root";
  uiContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 1280px;
    height: 720px;
    pointer-events: none;
    z-index: 100;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    color: #e6edf3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
  `;
  wrapper.appendChild(uiContainer);

  // Top Bar: Resources & Era Indicator
  const topBar = document.createElement("div");
  topBar.id = "top-hud-bar";
  topBar.style.cssText = `
    pointer-events: auto;
    width: 100%;
    height: 48px;
    background: linear-gradient(180deg, rgba(13, 17, 23, 0.96) 0%, rgba(9, 11, 16, 0.9) 100%);
    border-bottom: 2px solid #30363d;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.6);
  `;
  uiContainer.appendChild(topBar);

  // Bottom Navigation Bar
  const navBar = document.createElement("div");
  navBar.id = "bottom-nav-bar";
  navBar.style.cssText = `
    pointer-events: auto;
    width: 100%;
    height: 52px;
    background: linear-gradient(0deg, rgba(13, 17, 23, 0.98) 0%, rgba(22, 27, 34, 0.95) 100%);
    border-top: 2px solid #30363d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    box-shadow: 0 -4px 16px rgba(0,0,0,0.6);
  `;
  uiContainer.appendChild(navBar);

  // Modal / Drawer Window for Panels
  const modalWindow = document.createElement("div");
  modalWindow.id = "game-modal-window";
  modalWindow.style.cssText = `
    pointer-events: auto;
    position: absolute;
    top: 56px;
    left: 20px;
    width: 1240px;
    height: 604px;
    background: rgba(13, 17, 23, 0.97);
    border: 2px solid #388bfd;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.85);
    display: none;
    flex-direction: column;
    overflow: hidden;
    z-index: 500;
  `;
  uiContainer.appendChild(modalWindow);

  // Active Tab state
  type TabType =
    | "hero"
    | "chi"
    | "rogue"
    | "debts"
    | "investigation"
    | "combat"
    | "timeline"
    | "memories"
    | "forge"
    | "lore"
    | "ascension"
    | null;
  let activeTab: TabType = null;
  let activeInvestigationEra: string = "dawn";

  // Render Top Bar
  function renderTopBar() {
    const curEra = ERA_DATA[gameState.currentEra];
    const energy = Math.floor(gameState.currencies.eraEnergy);
    const mats = Math.floor(gameState.currencies.materials[curEra.primaryMaterial] || 0);
    const shards = gameState.currencies.mythicShards;
    const echoes = gameState.currencies.echoFragments;
    const cores = gameState.currencies.titanCores;
    const chiPercent = Math.min(100, Math.floor((hero.chi / hero.maxChi) * 100));
    const isTransformed = hero.isTransformed;

    topBar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size: 18px;">⏳</span>
          <div>
            <span style="font-weight: 800; color: ${curEra.bannerColor}; font-size: 13px; text-transform: uppercase;">${curEra.name}</span>
            <span style="font-size: 10px; color: #8b949e; margin-left: 4px;">(${curEra.order}/10)</span>
          </div>
        </div>
        <div style="height: 18px; width: 1px; background: #30363d;"></div>
        <div style="font-size: 11px; color: #7ee787;">
          <span>⚡ <b>${energy.toLocaleString()}</b> Energy</span>
        </div>
        <div style="font-size: 11px; color: #79c0ff;">
          <span>📦 <b>${mats.toLocaleString()}</b> ${curEra.primaryMaterialName.split(" ")[0]}</span>
        </div>
        <div style="height: 18px; width: 1px; background: #30363d;"></div>
        <!-- Rogue With Dead Distance & Soul Diamonds -->
        <div style="font-size: 11px; color: #ffd700;" title="Rogue Marching Distance">
          <span>🚩 <b>${Math.floor(hero.distanceMeters)}m</b></span>
        </div>
        <div style="font-size: 11px; color: #d2a8ff;" title="Soul Diamonds for Relic & Troop Meta-Upgrades">
          <span>💎 <b>${hero.soulDiamonds}</b> Soul Gems</span>
        </div>
        <div style="height: 18px; width: 1px; background: #30363d;"></div>
        <!-- Underworld Debt Pill -->
        <div id="quick-debt-pill" style="
          font-size: 11px;
          color: ${gameState.underworldDebt.currentDebt > 0 ? '#ff7b72' : '#7ee787'};
          background: ${gameState.underworldDebt.currentDebt > 0 ? 'rgba(255, 123, 114, 0.12)' : 'rgba(46, 160, 67, 0.15)'};
          border: 1px solid ${gameState.underworldDebt.currentDebt > 0 ? '#ff7b72' : '#2ea043'};
          padding: 2px 7px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        " title="Debts in the Depths — Manage Underworld Debt & Summoned Minions">
          <span>🪙</span>
          <span><b>${gameState.underworldDebt.currentDebt > 0 ? `${gameState.underworldDebt.currentDebt.toLocaleString()} Debt` : 'DEBT FREE!'}</b></span>
        </div>
      </div>

      <!-- Chi Force Gauge & Instant Transform -->
      <div style="display: flex; align-items: center; gap: 10px; font-size: 11px;">
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: ${isTransformed ? '#ffd700' : '#00f0ff'}; font-weight: bold;">
              ${isTransformed ? `🌟 ${hero.activeForm.toUpperCase()} (${Math.ceil(hero.formTimer)}s)` : `🌀 CHI: ${Math.floor(hero.chi)}/${hero.maxChi}`}
            </span>
          </div>
          <div style="width: 100px; height: 6px; background: #0d1117; border-radius: 3px; border: 1px solid ${isTransformed ? '#ffd700' : '#00f0ff'}; overflow: hidden;">
            <div style="width: ${isTransformed ? (hero.formTimer / hero.maxFormTimer) * 100 : chiPercent}%; height: 100%; background: ${isTransformed ? 'linear-gradient(90deg, #ffcc00, #ff7b72)' : 'linear-gradient(90deg, #00e5ff, #79c0ff)'}; transition: width 0.2s ease;"></div>
          </div>
        </div>

        <button id="quick-transform-btn" style="
          background: ${isTransformed ? '#ff9900' : hero.chi >= 50 ? '#1f6feb' : '#21262d'};
          border: 1px solid ${isTransformed ? '#ffd700' : hero.chi >= 50 ? '#58a6ff' : '#30363d'};
          color: #fff;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 800;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          ${isTransformed ? '✨ REVERT FORM' : '🪶 ARC ANGEL'}
        </button>

        <div style="height: 18px; width: 1px; background: #30363d;"></div>
        <button id="quick-boss-toggle" style="background: ${combatEngine.bossMode ? '#b62324' : '#238636'}; border: 1px solid #30363d; color: #fff; padding: 4px 8px; font-size: 10px; font-weight: bold; border-radius: 4px; cursor: pointer;">
          ${combatEngine.bossMode ? '⚔️ BOSS ACTIVE' : '💀 SUMMON BOSS'}
        </button>
        <button id="audio-toggle-btn" style="background: #21262d; border: 1px solid #30363d; color: #e6edf3; padding: 4px 6px; border-radius: 4px; cursor: pointer; font-size: 10px;">
          ${soundEngine.isMuted() ? '🔇' : '🔊'}
        </button>
      </div>
    `;

    topBar.querySelector("#quick-transform-btn")?.addEventListener("click", () => {
      if (hero.isTransformed) {
        hero.revertTransform();
      } else {
        if (hero.canTransform("arc_angel")) {
          hero.transform("arc_angel", 20);
          soundEngine.playEraAdvance();
          logger.printLine("*** SURGED WITH CHI: TRANSFORMED INTO ARC ANGEL! ***", "#ffd700");
        } else {
          logger.printLine(`Need at least 50 Chi Force to transform (Have ${Math.floor(hero.chi)}).`, "#ff7b72");
        }
      }
      renderTopBar();
      if (activeTab) renderModalContent();
    });

    topBar.querySelector("#quick-debt-pill")?.addEventListener("click", () => {
      activeTab = "debts";
      modalWindow.style.display = "flex";
      renderModalContent();
      renderNavBar();
    });

    topBar.querySelector("#quick-boss-toggle")?.addEventListener("click", () => {
      combatEngine.bossMode = !combatEngine.bossMode;
      if (combatEngine.bossMode && combatEngine.activeEnemy && !combatEngine.activeEnemy.isBoss) {
        combatEngine.activeEnemy = null; // Forces immediate boss spawn
      }
      renderTopBar();
    });

    topBar.querySelector("#audio-toggle-btn")?.addEventListener("click", () => {
      soundEngine.toggleMute();
      renderTopBar();
    });
  }

  // Render Bottom Nav Buttons
  function renderNavBar() {
    const tabs: Array<{ id: TabType; label: string; icon: string }> = [
      { id: "hero", label: "HERO & GEAR", icon: "👤" },
      { id: "chi", label: "ARC ANGEL & CHI", icon: "🪶" },
      { id: "rogue", label: "ROGUE TROOPS & RELICS", icon: "⚔️" },
      { id: "debts", label: "UNDERWORLD DEBT", icon: "🪙" },
      { id: "investigation", label: "ERA INVESTIGATION", icon: "🔍" },
      { id: "combat", label: "BATTLE & SKILLS", icon: "⚡" },
      { id: "timeline", label: "ERA TIMELINE", icon: "🗺️" },
      { id: "memories", label: "MEMORIES & TRAITS", icon: "🧠" },
      { id: "forge", label: "MYTHIC FORGE", icon: "🔨" },
      { id: "lore", label: "LORE CODEX", icon: "📜" },
      { id: "ascension", label: "ASCENSION & SAVE", icon: "🌌" }
    ];

    navBar.innerHTML = tabs
      .map(
        t => `
      <button class="nav-tab-btn" data-tab="${t.id}" style="
        background: ${activeTab === t.id ? '#1f6feb' : '#21262d'};
        border: 1px solid ${activeTab === t.id ? '#58a6ff' : '#30363d'};
        color: ${activeTab === t.id ? '#ffffff' : '#c9d1d9'};
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 700;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      ">
        <span>${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `
      )
      .join("");

    navBar.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const targetTab = (btn as HTMLElement).getAttribute("data-tab") as TabType;
        if (activeTab === targetTab) {
          activeTab = null;
          modalWindow.style.display = "none";
        } else {
          activeTab = targetTab;
          modalWindow.style.display = "flex";
          renderModalContent();
        }
        renderNavBar();
      });
    });
  }

  // Equipment slots definition
  const SLOTS: Array<{ key: EquipSlot; label: string }> = [
    { key: "head", label: "Helm" },
    { key: "face", label: "Face/Mask" },
    { key: "neck", label: "Necklace" },
    { key: "shoulder", label: "Shoulders" },
    { key: "chest", label: "Chest Armor" },
    { key: "back", label: "Cloak/Back" },
    { key: "wrist", label: "Bracers" },
    { key: "hands", label: "Gauntlets" },
    { key: "waist", label: "Belt" },
    { key: "legs", label: "Legplates" },
    { key: "finger1", label: "Ring 1" },
    { key: "finger2", label: "Ring 2" },
    { key: "ear1", label: "Earring 1" },
    { key: "ear2", label: "Earring 2" },
    { key: "primaryWpn", label: "Main Hand" },
    { key: "offHandWpn", label: "Off Hand" }
  ];

  // Render Modal Content based on activeTab
  function renderModalContent() {
    if (!activeTab) {
      modalWindow.style.display = "none";
      return;
    }

    modalWindow.style.display = "flex";

    const curEra = ERA_DATA[gameState.currentEra];
    const traitBonus = gameState.getTraitBonus();
    const memDmgMult = gameState.getMemoryBonusMultiplier("damagePercent");
    const memHpMult = gameState.getMemoryBonusMultiplier("hpPercent");

    let headerTitle = "";
    let bodyHtml = "";

    // 1. HERO TAB
    if (activeTab === "hero") {
      headerTitle = `👤 HERO PROFILE — LEVEL ${hero.level} [${gameState.cosmicAlignment} Alignment]`;

      const buildSlotItem = (s: { key: EquipSlot; label: string }) => {
        const item = hero.equipment[s.key];
        const col = item ? COLOR_MAP[item.rarity] : "#6e7681";
        const infStr = item && item.infusionLevel ? ` <span style="color:#ff4081;">+${item.infusionLevel}</span>` : "";
        return `
          <div class="equip-slot-box" data-slot="${s.key}" style="
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 4px;
            padding: 5px 8px;
            min-height: 48px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="font-size: 9px; color: #8b949e; text-transform: uppercase;">${s.label}</div>
            <div style="font-size: 11px; font-weight: bold; color: ${col}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${item ? item.name + infStr : '<span style="color:#484f58;">[Empty]</span>'}
            </div>
          </div>
        `;
      };

      const inventoryHtml = hero.inventory
        .map((item, idx) => {
          const col = COLOR_MAP[item.rarity];
          const inf = item.infusionLevel ? ` <span style="color:#ff4081;">+${item.infusionLevel}</span>` : "";
          return `
          <div style="background:#161b22; border:1px solid #30363d; border-radius:4px; padding:6px 8px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
            <div>
              <span style="font-weight:bold; color:${col};">${item.name}${inf}</span>
              <span style="font-size:9px; color:#8b949e; margin-left:6px;">(${item.slot})</span>
            </div>
            <div style="display:flex; gap:4px;">
              <button class="inv-equip-btn" data-idx="${idx}" style="background:#238636; color:#fff; border:none; border-radius:3px; padding:3px 7px; font-size:10px; font-weight:bold; cursor:pointer;">EQUIP</button>
              <button class="inv-infuse-btn" data-idx="${idx}" style="background:#8957e5; color:#fff; border:none; border-radius:3px; padding:3px 7px; font-size:10px; font-weight:bold; cursor:pointer;" title="Spend 2 Mythic Shards to +15% item stats">INFUSE (2💎)</button>
              <button class="inv-drop-btn" data-idx="${idx}" style="background:#da3633; color:#fff; border:none; border-radius:3px; padding:3px 6px; font-size:10px; font-weight:bold; cursor:pointer;">DROP</button>
            </div>
          </div>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 320px 1fr 340px; gap: 16px; height: 100%; padding: 16px;">
          <!-- Left: Equipment Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; overflow-y: auto;">
            ${SLOTS.map(buildSlotItem).join("")}
          </div>

          <!-- Middle: Hero Visual & Stats -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto;">
            <div style="text-align: center; border-bottom: 1px solid #30363d; padding-bottom: 10px;">
              <div style="font-size: 16px; font-weight: 800; color: #58a6ff;">THE MYTHIC AVATAR</div>
              <div style="font-size: 11px; color: #8b949e;">Specialization: <b style="color:#ffd700;">${hero.activeSpecialization}</b></div>
            </div>

            <!-- Alignment Selector -->
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #8b949e; margin-bottom: 4px;">COSMIC FORCE ALIGNMENT:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                ${(["Architects", "Wraithborn", "Echoes"] as CosmicForce[])
                  .map(
                    force => `
                  <button class="align-select-btn" data-force="${force}" style="
                    background: ${gameState.cosmicAlignment === force ? '#1f6feb' : '#21262d'};
                    border: 1px solid ${gameState.cosmicAlignment === force ? '#58a6ff' : '#30363d'};
                    color: #fff;
                    font-size: 10px;
                    font-weight: bold;
                    padding: 5px 2px;
                    border-radius: 4px;
                    cursor: pointer;
                  ">
                    ${force === "Architects" ? "🏛️" : force === "Wraithborn" ? "🩸" : "🌀"} ${force}
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <!-- Live Combat Metrics -->
            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-size: 11px; line-height: 1.6;">
              <div style="display:flex; justify-content:space-between;"><span>Max Health:</span> <b style="color:#7ee787;">${hero.getEffectiveMaxHp(traitBonus.hpBonus || 0, memHpMult).toLocaleString()} HP</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Attack Power:</span> <b style="color:#ff7b72;">${hero.getEffectiveDamage(traitBonus.damageBonus || 0, memDmgMult).toLocaleString()} DMG</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Defense / Armor:</span> <b style="color:#79c0ff;">${hero.getEffectiveDefense(traitBonus.defenseBonus || 0)} Armor</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Critical Strike:</span> <b style="color:#ffd700;">${hero.getCritRate(traitBonus.critRateBonus || 0)}% (x${hero.getCritDamageMultiplier(traitBonus.critDmgBonus || 0).toFixed(2)})</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Attack Interval:</span> <b style="color:#d2a8ff;">${hero.getAttackInterval()} frames (~${(60 / hero.getAttackInterval()).toFixed(1)}/s)</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Energy Multiplier:</span> <b style="color:#00f0ff;">x${(hero.getEraEnergyBonusMultiplier() * gameState.getMemoryBonusMultiplier("energyGenMultiplier")).toFixed(2)}</b></div>
            </div>

            <!-- Experience Bar -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>Experience:</span>
                <span>${hero.xp} / ${hero.maxXp} XP</span>
              </div>
              <div style="width: 100%; height: 8px; background: #0d1117; border-radius: 4px; overflow: hidden; border: 1px solid #30363d;">
                <div style="width: ${Math.min(100, (hero.xp / hero.maxXp) * 100)}%; height: 100%; background: #238636;"></div>
              </div>
            </div>
          </div>

          <!-- Right: Bag Inventory -->
          <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 6px;">
              <span style="font-size: 13px; font-weight: bold; color: #ffd700;">🎒 BAG STORAGE</span>
              <span style="font-size: 11px; color: #8b949e;">${hero.inventory.length} / 24 Slots</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; flex: 1;">
              ${hero.inventory.length === 0 ? '<div style="color:#6e7681; font-size:11px; text-align:center; padding:30px 0;">Your inventory is empty.<br/>Defeat enemies to loot gear!</div>' : inventoryHtml}
            </div>
          </div>
        </div>
      `;
    }

    // 2. CHI & ARC ANGEL TAB
    else if (activeTab === "chi") {
      headerTitle = `🪶 SPIRITUAL CHI FORCE & ARC ANGEL TRANSFORMATION — [${hero.activeForm.toUpperCase()}]`;

      const chiSkillCards = gameState.chiSkills
        .map(node => {
          const isMaxed = node.currentRank >= node.maxRank;
          const canAfford = hero.chiSkillPoints >= node.costChiPoints;
          return `
          <div style="background: #161b22; border: 1px solid ${node.currentRank > 0 ? '#58a6ff' : '#30363d'}; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size: 28px;">${node.icon}</span>
              <div>
                <div style="font-weight: bold; color: #ffd700; font-size: 13px;">${node.name} <span style="color:#8b949e; font-size:11px;">(Rank ${node.currentRank}/${node.maxRank})</span></div>
                <div style="font-size: 11px; color: #c9d1d9; margin-top: 2px;">${node.description}</div>
                <div style="font-size: 10px; color: #7ee787; margin-top: 2px;">${node.tier === 4 ? '👑 Capstone Mastery Node' : `Requires Tier ${node.tier}`}</div>
              </div>
            </div>
            <div>
              ${
                isMaxed
                  ? '<span style="color:#7ee787; font-size:11px; font-weight:bold;">[MAX RANK]</span>'
                  : `
                <button class="upgrade-chi-skill-btn" data-id="${node.id}" style="
                  background: ${canAfford ? '#238636' : '#21262d'};
                  border: 1px solid ${canAfford ? '#2ea043' : '#30363d'};
                  color: ${canAfford ? '#fff' : '#6e7681'};
                  padding: 6px 12px;
                  font-size: 11px;
                  font-weight: bold;
                  border-radius: 4px;
                  cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                ">
                  UPGRADE (${node.costChiPoints} 🌀)
                </button>
              `
              }
            </div>
          </div>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 360px 1fr; gap: 16px; height: 100%; padding: 16px;">
          <!-- Left: Spiritual Chi Gauge & Form Selection -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto;">
            <div style="text-align: center; border-bottom: 1px solid #30363d; padding-bottom: 10px;">
              <div style="font-size: 16px; font-weight: 800; color: #ffd700;">SPIRITUAL CHI HARMONY</div>
              <div style="font-size: 11px; color: #8b949e;">Defeat foes in combat to build spiritual Chi force.</div>
            </div>

            <!-- Chi Status Strip -->
            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-size: 11px;">
              <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                <span>Current Chi Force:</span>
                <b style="color:#00f0ff;">${Math.floor(hero.chi)} / ${hero.maxChi}</b>
              </div>
              <div style="width: 100%; height: 10px; background: #21262d; border-radius: 5px; overflow: hidden; border: 1px solid #30363d; margin-bottom: 8px;">
                <div style="width: ${Math.min(100, (hero.chi / hero.maxChi) * 100)}%; height: 100%; background: linear-gradient(90deg, #00e5ff, #ffd700);"></div>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Chi Skill Points:</span>
                <b style="color:#ffd700;">${hero.chiSkillPoints} Available</b>
              </div>
            </div>

            <!-- Form Selector Cards -->
            <div style="font-size: 12px; font-weight: bold; color: #8b949e;">SELECT TRANSFORMATION FORM:</div>

            <!-- 1. Arc Angel Form (Hero2 Sprite Set) -->
            <div class="form-card" data-form="arc_angel" style="background: ${hero.activeForm === 'arc_angel' ? 'rgba(255, 215, 0, 0.12)' : '#0d1117'}; border: 1px solid ${hero.activeForm === 'arc_angel' ? '#ffd700' : '#30363d'}; border-radius: 6px; padding: 10px; cursor: pointer;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-weight: bold; color: #ffd700; font-size: 12px;">🪶 ARC ANGEL (hero2)</span>
                <span style="font-size: 10px; color: #7ee787;">${hero.activeForm === 'arc_angel' ? 'ACTIVE' : 'SELECT'}</span>
              </div>
              <div style="font-size: 10px; color: #c9d1d9; margin-top: 4px;">
                Summon your transcendent alter spiritual persona. Features dual high-speed animations, +250% HP, +300% DMG, +100 Armor, and Holy Cleave AOE!
              </div>
            </div>

            <!-- 2. Lunar Werewolf Form -->
            <div class="form-card" data-form="werewolf" style="background: ${hero.activeForm === 'werewolf' ? 'rgba(255, 123, 114, 0.12)' : '#0d1117'}; border: 1px solid ${hero.activeForm === 'werewolf' ? '#ff7b72' : '#30363d'}; border-radius: 6px; padding: 10px; cursor: pointer;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-weight: bold; color: #ff7b72; font-size: 12px;">🐺 LUNAR WEREWOLF</span>
                <span style="font-size: 10px; color: #8b949e;">Req Lv 8</span>
              </div>
              <div style="font-size: 10px; color: #c9d1d9; margin-top: 4px;">
                Feral predatory instincts. Grants +80% Attack Speed, +35% Critical Strike, and 25% Life Leech on every strike.
              </div>
            </div>

            <!-- 3. Ancient Mythic Drake Form -->
            <div class="form-card" data-form="mythic_drake" style="background: ${hero.activeForm === 'mythic_drake' ? 'rgba(187, 134, 252, 0.12)' : '#0d1117'}; border: 1px solid ${hero.activeForm === 'mythic_drake' ? '#bb86fc' : '#30363d'}; border-radius: 6px; padding: 10px; cursor: pointer;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-weight: bold; color: #bb86fc; font-size: 12px;">🐉 ANCIENT MYTHIC DRAKE</span>
                <span style="font-size: 10px; color: #8b949e;">Req Lv 20</span>
              </div>
              <div style="font-size: 10px; color: #c9d1d9; margin-top: 4px;">
                Primordial dragon deity. Deals +280% Damage with solar fire burn and fatal damage resurrection shield.
              </div>
            </div>

            <!-- Main Transform Action Button -->
            <button id="modal-transform-btn" style="
              background: ${hero.isTransformed ? '#ff9900' : hero.chi >= 50 ? '#1f6feb' : '#21262d'};
              border: 1px solid ${hero.isTransformed ? '#ffd700' : hero.chi >= 50 ? '#58a6ff' : '#30363d'};
              color: #fff;
              padding: 10px;
              font-size: 13px;
              font-weight: 800;
              border-radius: 6px;
              cursor: pointer;
              margin-top: auto;
            ">
              ${hero.isTransformed ? `✨ REVERT TO NINJA (${Math.ceil(hero.formTimer)}s remaining)` : `🪶 SURGE CHI & TRANSFORM (50 Chi)`}
            </button>
          </div>

          <!-- Right: Dedicated Chi Skill Tree -->
          <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #30363d; padding-bottom: 8px;">
              <div>
                <span style="font-size: 14px; font-weight: 800; color: #ffd700;">ARC ANGEL & MYTHIC TALENT TREE</span>
                <span style="font-size: 11px; color: #8b949e; margin-left: 8px;">Invest points to permanently empower transformations.</span>
              </div>
              <span style="color:#00f0ff; font-weight:bold; font-size:12px;">🌀 ${hero.chiSkillPoints} Chi Points</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${chiSkillCards}
            </div>
          </div>
        </div>
      `;
    }

    // 3. ROGUE WITH THE DEAD TAB (Troops & Relics)
    else if (activeTab === "rogue") {
      headerTitle = `⚔️ ROGUE CRUSADE & MINI-NINJA SQUAD — [${Math.floor(hero.distanceMeters)}m MARCHED]`;

      const totalActiveSquad = gameState.troops.reduce((acc, t) => acc + (t.count || 0), 0);

      const troopCards = gameState.troops
        .map(t => {
          const cap = t.maxCapacity || 1;
          const hardCap = t.hardCap || 2;
          const expandCost = t.expandCostSoulGems || 3;
          const atCategoryCap = t.count >= cap;
          const canExpand = hero.soulDiamonds >= expandCost && cap < hardCap;
          const canHire = gameState.currencies.eraEnergy >= t.hireCostEnergy && !atCategoryCap && totalActiveSquad < 8;
          const canUpgrade = hero.soulDiamonds >= t.upgradeCostSoulGems;

          return `
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size: 26px;">${t.icon}</span>
              <div>
                <div style="font-weight: bold; color: #${t.color.toString(16)}; font-size: 12px;">
                  ${t.name}
                  <span style="color:#ffd700; font-size:11px; margin-left: 4px;">(Slots: ${t.count}/${cap} | Hard Cap: ${hardCap})</span>
                </div>
                <div style="font-size: 10px; color: #c9d1d9;">Role: ${t.role.toUpperCase()} (Mini Ninja Unit) | Lv ${t.level}</div>
                <div style="font-size: 10px; color: #7ee787; margin-top: 2px;">Dmg: ${t.baseDmg} DMG | Interval: ${(t.attackInterval / 60).toFixed(1)}s</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
              <div style="display:flex; gap:6px;">
                ${
                  atCategoryCap
                    ? cap < hardCap
                      ? `
                    <button class="expand-troop-btn" data-id="${t.id}" style="
                      background: ${canExpand ? '#0969da' : '#21262d'};
                      border: 1px solid ${canExpand ? '#58a6ff' : '#30363d'};
                      color: ${canExpand ? '#fff' : '#6e7681'};
                      padding: 4px 8px;
                      font-size: 10px;
                      font-weight: bold;
                      border-radius: 4px;
                      cursor: ${canExpand ? 'pointer' : 'not-allowed'};
                    " title="Spend Soul Diamonds to expand category slot capacity">
                      EXPAND SLOT (+1) [💎${expandCost}]
                    </button>
                    `
                      : `<span style="color:#7ee787; font-size:10px; font-weight:bold; padding: 4px 6px; background: rgba(46, 160, 67, 0.15); border-radius: 4px; border: 1px solid #2ea043;">MAXED (${hardCap}/${hardCap})</span>`
                    : `
                    <button class="hire-troop-btn" data-id="${t.id}" style="
                      background: ${canHire ? '#1f6feb' : '#21262d'};
                      border: 1px solid ${canHire ? '#58a6ff' : '#30363d'};
                      color: ${canHire ? '#fff' : '#6e7681'};
                      padding: 4px 8px;
                      font-size: 10px;
                      font-weight: bold;
                      border-radius: 4px;
                      cursor: ${canHire ? 'pointer' : 'not-allowed'};
                    ">
                      RECRUIT (+1) [⚡${t.hireCostEnergy}]
                    </button>
                  `
                }
                <button class="upgrade-troop-btn" data-id="${t.id}" style="
                  background: ${canUpgrade ? '#8957e5' : '#21262d'};
                  border: 1px solid ${canUpgrade ? '#d2a8ff' : '#30363d'};
                  color: ${canUpgrade ? '#fff' : '#6e7681'};
                  padding: 4px 8px;
                  font-size: 10px;
                  font-weight: bold;
                  border-radius: 4px;
                  cursor: ${canUpgrade ? 'pointer' : 'not-allowed'};
                ">
                  TRAIN (+1 LVL) [💎${t.upgradeCostSoulGems}]
                </button>
              </div>
            </div>
          </div>
        `;
        })
        .join("");

      const relicCards = gameState.relics
        .map(r => {
          const isMax = r.level >= r.maxLevel;
          const canUpgrade = hero.soulDiamonds >= r.upgradeCostSoulGems;
          const bonusVal = (Object.values(r.bonus)[0] || 5) * r.level;
          return `
          <div style="background: #161b22; border: 1px solid ${r.level > 0 ? '#ffd700' : '#30363d'}; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size: 24px;">${r.icon}</span>
              <div>
                <div style="font-weight: bold; color: #ffd700; font-size: 12px;">${r.name} <span style="color:#8b949e; font-size:10px;">(Lv ${r.level}/${r.maxLevel})</span></div>
                <div style="font-size: 10px; color: #c9d1d9;">${r.description}</div>
                <div style="font-size: 10px; color: #79c0ff; margin-top: 2px;">Bonus: +${bonusVal.toFixed(1)}%</div>
              </div>
            </div>
            <div>
              ${
                isMax
                  ? '<span style="color:#7ee787; font-size:10px; font-weight:bold;">[MAXED]</span>'
                  : `
                <button class="upgrade-relic-btn" data-id="${r.id}" style="
                  background: ${canUpgrade ? '#238636' : '#21262d'};
                  border: 1px solid ${canUpgrade ? '#2ea043' : '#30363d'};
                  color: ${canUpgrade ? '#fff' : '#6e7681'};
                  padding: 4px 10px;
                  font-size: 10px;
                  font-weight: bold;
                  border-radius: 4px;
                  cursor: ${canUpgrade ? 'pointer' : 'not-allowed'};
                ">
                  UPGRADE [💎${r.upgradeCostSoulGems}]
                </button>
              `
              }
            </div>
          </div>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 100%; padding: 16px;">
          <!-- Left: Rogue Distance & Companion Troops -->
          <div style="display: flex; flex-direction: column; gap: 12px; overflow-y: auto;">
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                <span style="font-size: 14px; font-weight: 800; color: #ffd700;">🚩 MARCHING DISTANCE</span>
                <span style="font-size: 14px; font-weight: 800; color: #7ee787;">${Math.floor(hero.distanceMeters)}m Reached</span>
              </div>
              <div style="font-size: 11px; color: #8b949e; margin-bottom: 4px;">Next Relic Chest milestone at: <b>${(Math.floor(hero.distanceMeters / 250) + 1) * 250}m</b> (+3 Soul Diamonds!)</div>
              <div style="width: 100%; height: 8px; background: #0d1117; border-radius: 4px; overflow: hidden; border: 1px solid #30363d;">
                <div style="width: ${((hero.distanceMeters % 250) / 250) * 100}%; height: 100%; background: linear-gradient(90deg, #1f6feb, #7ee787);"></div>
              </div>
            </div>

            <div style="font-size: 12px; font-weight: bold; color: #8b949e;">COMPANION TROOPS ROSTER:</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${troopCards}
            </div>
          </div>

          <!-- Right: Legendary Relics -->
          <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #30363d; padding-bottom: 8px;">
              <div>
                <span style="font-size: 14px; font-weight: 800; color: #ffd700;">LEGENDARY ROGUE RELICS</span>
                <span style="font-size: 11px; color: #8b949e; margin-left: 8px;">Persistent across all reincarnations!</span>
              </div>
              <span style="color:#d2a8ff; font-weight:bold; font-size:12px;">💎 ${hero.soulDiamonds} Soul Gems</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${relicCards}
            </div>
          </div>
        </div>
      `;
    }

    // 3B. DEBTS IN THE DEPTHS TAB (Underworld Debt & Minion Guild)
    else if (activeTab === "debts") {
      headerTitle = `🪙 DEBTS IN THE DEPTHS — UNDERWORLD BROKERAGE & MONSTER BESTIARY`;
      const debt = gameState.underworldDebt;
      const repaidPct = Math.min(100, Math.floor((debt.totalRepaid / debt.initialDebt) * 100));
      const isCleared = debt.currentDebt <= 0;

      const perksList = [
        { id: "perk_25", pct: 25, title: "Debt Leniency", desc: "+25% Minion Troop Attack Damage", icon: "🗡️" },
        { id: "perk_50", pct: 50, title: "Valued Underworld Client", desc: "+30% Era Energy Generation Speed", icon: "⚡" },
        { id: "perk_75", pct: 75, title: "Stygian Mogul", desc: "+50% Hero Critical Strike Multiplier", icon: "💥" },
        { id: "perk_100", pct: 100, title: "DEBT FREE IMMORTAL", desc: "Ancient Sovereign Wyrm summoned & Double Rewards!", icon: "👑" }
      ];

      const perkCards = perksList
        .map(p => {
          const unlocked = debt.unlockedPerks.includes(p.id) || repaidPct >= p.pct;
          return `
          <div style="background: ${unlocked ? 'rgba(46, 160, 67, 0.15)' : '#161b22'}; border: 1px solid ${unlocked ? '#2ea043' : '#30363d'}; border-radius: 6px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size: 20px;">${p.icon}</span>
              <div>
                <div style="font-weight: bold; font-size: 11px; color: ${unlocked ? '#7ee787' : '#c9d1d9'};">${p.title} (${p.pct}% Repaid)</div>
                <div style="font-size: 10px; color: #8b949e;">${p.desc}</div>
              </div>
            </div>
            <span style="font-size: 10px; font-weight: bold; color: ${unlocked ? '#7ee787' : '#8b949e'};">${unlocked ? '✨ UNLOCKED' : `${p.pct}% REQ`}</span>
          </div>
        `;
        })
        .join("");

      const investmentCards = debt.investments
        .map((inv: any) => {
          const canBuy = gameState.currencies.eraEnergy >= inv.costGold;
          return `
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size: 24px;">${inv.icon}</span>
              <div>
                <div style="font-weight: bold; color: #e6edf3; font-size: 12px;">${inv.name} <span style="color:#ffd700; font-size:10px;">(Owned: ${inv.owned})</span></div>
                <div style="font-size: 10px; color: #8b949e;">${inv.description}</div>
                <div style="font-size: 10px; color: #7ee787; margin-top: 2px;">Yield: +${inv.incomePerSec * inv.owned} Energy/sec (+${inv.incomePerSec}/sec each)</div>
              </div>
            </div>
            <button class="buy-investment-btn" data-id="${inv.id}" style="
              background: ${canBuy ? '#1f6feb' : '#21262d'};
              border: 1px solid ${canBuy ? '#58a6ff' : '#30363d'};
              color: ${canBuy ? '#fff' : '#6e7681'};
              padding: 6px 12px;
              font-size: 10px;
              font-weight: bold;
              border-radius: 4px;
              cursor: ${canBuy ? 'pointer' : 'not-allowed'};
              white-space: nowrap;
            ">
              BUY (+1) [⚡${inv.costGold}]
            </button>
          </div>
        `;
        })
        .join("");

      const minionCards = gameState.troops
        .map(t => {
          const cap = t.maxCapacity || 1;
          const hardCap = t.hardCap || 2;
          const expandCost = t.expandCostSoulGems || 3;
          const atCap = t.count >= cap;
          const canExpand = hero.soulDiamonds >= expandCost && cap < hardCap;
          const canHire = gameState.currencies.eraEnergy >= t.hireCostEnergy && !atCap;
          const canUpgrade = hero.soulDiamonds >= t.upgradeCostSoulGems;

          return `
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size: 22px;">${t.icon}</span>
              <div>
                <div style="font-weight: bold; color: #${t.color.toString(16)}; font-size: 11px;">
                  ${t.name} <span style="color:#ffd700; font-size:10px;">(${t.count}/${cap})</span>
                </div>
                <div style="font-size: 9px; color: #8b949e;">Role: ${t.role.toUpperCase()} | Base: ${t.baseDmg} DMG | Spd: ${(t.attackInterval / 60).toFixed(1)}s</div>
              </div>
            </div>
            <div style="display:flex; gap:4px;">
              ${
                atCap
                  ? cap < hardCap
                    ? `
                <button class="expand-troop-btn" data-id="${t.id}" style="background:#0969da; border:1px solid #58a6ff; color:#fff; padding:3px 6px; font-size:9px; font-weight:bold; border-radius:3px; cursor:${canExpand ? 'pointer' : 'not-allowed'};">
                  EXPAND [💎${expandCost}]
                </button>
              `
                    : `<span style="color:#7ee787; font-size:9px; font-weight:bold; padding:2px 4px;">MAXED</span>`
                  : `
                <button class="hire-troop-btn" data-id="${t.id}" style="background:${canHire ? '#1f6feb' : '#21262d'}; border:1px solid ${canHire ? '#58a6ff' : '#30363d'}; color:${canHire ? '#fff' : '#6e7681'}; padding:3px 6px; font-size:9px; font-weight:bold; border-radius:3px; cursor:${canHire ? 'pointer' : 'not-allowed'};">
                  RECRUIT [⚡${t.hireCostEnergy}]
                </button>
              `
              }
              <button class="upgrade-troop-btn" data-id="${t.id}" style="background:${canUpgrade ? '#8957e5' : '#21262d'}; border:1px solid ${canUpgrade ? '#d2a8ff' : '#30363d'}; color:${canUpgrade ? '#fff' : '#6e7681'}; padding:3px 6px; font-size:9px; font-weight:bold; border-radius:3px; cursor:${canUpgrade ? 'pointer' : 'not-allowed'};">
                TRAIN [💎${t.upgradeCostSoulGems}]
              </button>
            </div>
          </div>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; height: 100%; padding: 16px;">
          <!-- Left: Debt Balance, Repayment & Passive Investments -->
          <div style="display: flex; flex-direction: column; gap: 12px; overflow-y: auto;">
            <div style="background: linear-gradient(180deg, #1f1b24 0%, #161b22 100%); border: 2px solid ${isCleared ? '#ffd700' : '#ff7b72'}; border-radius: 8px; padding: 14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                <div>
                  <span style="font-size: 15px; font-weight: 800; color: #ffd700;">🪙 UNDERWORLD DEBT REPAYMENT</span>
                  <div style="font-size: 11px; color: #8b949e;">Clear your ancient debt to the depths to earn immortality & cosmic boons.</div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 18px; font-weight: 800; color: ${isCleared ? '#7ee787' : '#ff7b72'};">
                    ${isCleared ? '✨ DEBT PAID IN FULL! ✨' : `${debt.currentDebt.toLocaleString()} OBOLS REMAINING`}
                  </span>
                </div>
              </div>

              <!-- Progress bar -->
              <div style="width: 100%; height: 10px; background: #0d1117; border-radius: 5px; overflow: hidden; border: 1px solid #30363d; margin: 8px 0;">
                <div style="width: ${repaidPct}%; height: 100%; background: linear-gradient(90deg, #ff7b72, #ffd700, #7ee787); transition: width 0.3s ease;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size: 10px; color: #8b949e;">
                <span>Total Repaid: ${debt.totalRepaid.toLocaleString()} Obols</span>
                <span>${repaidPct}% Cleared</span>
              </div>

              <!-- Action Repay Buttons -->
              ${
                !isCleared
                  ? `
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                  <button class="repay-debt-btn" data-amt="100" style="flex: 1; background: #238636; border: 1px solid #2ea043; color: #fff; padding: 6px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer;">
                    PAY 100 [⚡100]
                  </button>
                  <button class="repay-debt-btn" data-amt="500" style="flex: 1; background: #238636; border: 1px solid #2ea043; color: #fff; padding: 6px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer;">
                    PAY 500 [⚡500]
                  </button>
                  <button class="repay-debt-btn" data-amt="${debt.currentDebt}" style="flex: 1; background: #8957e5; border: 1px solid #a371f7; color: #fff; padding: 6px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer;">
                    PAY ALL [⚡${debt.currentDebt}]
                  </button>
                </div>
              `
                  : `
                <div style="margin-top: 8px; padding: 6px; background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700; border-radius: 4px; text-align: center; color: #ffd700; font-weight: bold; font-size: 11px;">
                  👑 YOU HAVE CLEARED ALL DEBTS IN THE DEPTHS! MAXIMUM REPUTATION & MULTIPLIERS ACHIEVED!
                </div>
              `
              }
            </div>

            <div style="font-size: 12px; font-weight: bold; color: #8b949e;">DEBT RELIEF TIER PERKS:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${perkCards}
            </div>

            <div style="font-size: 12px; font-weight: bold; color: #8b949e; margin-top: 4px;">PASSIVE STYGIAN INVESTMENTS:</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${investmentCards}
            </div>
          </div>

          <!-- Right: Debts in the Depths Minions Guild -->
          <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #30363d; padding-bottom: 8px;">
              <div>
                <span style="font-size: 14px; font-weight: 800; color: #ffd700;">⚔️ SUMMONED MONSTER BESTIARY</span>
                <div style="font-size: 10px; color: #8b949e;">Recruit and command creature companions from the Debts in the Depths caverns!</div>
              </div>
              <span style="color:#7ee787; font-weight:bold; font-size:11px;">⚡ ${gameState.troops.reduce((a, t) => a + t.count, 0)} Active</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${minionCards}
            </div>
          </div>
        </div>
      `;
    }

    // 4. SHERLOCK HOLMES ERA INVESTIGATION TAB
    else if (activeTab === "investigation") {
      headerTitle = `🔍 ERA INVESTIGATION — SHERLOCK HISTORICAL MYSTERIES & CELESTIAL CODEX`;
      const curInv = gameState.investigations[activeInvestigationEra] || gameState.investigations["dawn"];

      const clueCards = curInv.clues
        .map(c => {
          return `
          <div class="clue-card" data-era="${curInv.eraId}" data-id="${c.id}" style="
            background: ${c.uncovered ? '#161b22' : '#0d1117'};
            border: 1px solid ${c.uncovered ? '#58a6ff' : '#30363d'};
            border-radius: 6px;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: ${c.uncovered ? 'default' : 'pointer'};
          ">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size: 24px;">${c.icon}</span>
              <div>
                <div style="font-weight: bold; color: ${c.uncovered ? '#79c0ff' : '#8b949e'}; font-size: 12px;">${c.uncovered ? c.title : '[Hidden Clue: Click with Loupe]'}</div>
                <div style="font-size: 10px; color: ${c.uncovered ? '#c9d1d9' : '#484f58'};">${c.uncovered ? c.description : 'Examine historical anomaly to uncover evidence.'}</div>
              </div>
            </div>
            <div>
              ${
                c.uncovered
                  ? '<span style="color:#7ee787; font-size:10px; font-weight:bold;">✓ EXAMINED</span>'
                  : '<button style="background:#238636; border:none; color:#fff; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold;">EXAMINE 🔍</button>'
              }
            </div>
          </div>
        `;
        })
        .join("");

      const deductionOptions = curInv.deduction.options
        .map((opt, idx) => {
          return `
          <button class="deduction-btn" data-era="${curInv.eraId}" data-idx="${idx}" style="
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 10px 14px;
            text-align: left;
            color: #e6edf3;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.15s ease;
          ">
            <div style="font-weight: bold; color: #ffd700; margin-bottom: 2px;">Hypothesis ${String.fromCharCode(65 + idx)}:</div>
            <div>${opt.text}</div>
          </button>
        `;
        })
        .join("");

      const starPointsSvg = curInv.constellation.starPoints
        .map((star, idx) => {
          return `
          <circle class="star-point-svg" data-era="${curInv.eraId}" data-idx="${idx}" cx="${star.x}" cy="${star.y}" r="${star.clicked ? 6 : 9}" fill="${star.clicked ? '#ffd700' : '#00e5ff'}" stroke="#ffffff" stroke-width="1.5" style="cursor: pointer; filter: drop-shadow(0 0 6px ${star.clicked ? '#ffd700' : '#00e5ff'});" />
          <text x="${star.x + 10}" y="${star.y + 4}" fill="#ffffff" font-size="10" font-weight="bold">${star.label}</text>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 280px 1fr 340px; gap: 14px; height: 100%; padding: 14px;">
          <!-- Left: Era Case Ledger & Sherlock Notes -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
            <div style="font-size: 13px; font-weight: 800; color: #ffd700; border-bottom: 1px solid #30363d; padding-bottom: 6px;">
              📁 HISTORICAL CASE FILES
            </div>

            <!-- Era Switcher Tabs -->
            <div style="display: flex; gap: 4px;">
              ${["dawn", "bronze", "steam"]
                .map(
                  eId => `
                <button class="inv-era-tab" data-era="${eId}" style="
                  flex: 1;
                  background: ${activeInvestigationEra === eId ? '#1f6feb' : '#21262d'};
                  border: 1px solid ${activeInvestigationEra === eId ? '#58a6ff' : '#30363d'};
                  color: #fff;
                  font-size: 10px;
                  font-weight: bold;
                  padding: 5px;
                  border-radius: 4px;
                  cursor: pointer;
                  text-transform: uppercase;
                ">
                  ${eId}
                </button>
              `
                )
                .join("")}
            </div>

            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-size: 11px;">
              <div style="font-weight: bold; color: #58a6ff; font-size: 12px;">${curInv.caseTitle}</div>
              <div style="color: #8b949e; font-style: italic; margin-bottom: 6px;">"${curInv.subtitle}"</div>
              <div style="color: #c9d1d9; font-size: 10px; line-height: 1.5; border-top: 1px solid #21262d; padding-top: 6px;">
                ${curInv.sherlockPrologue}
              </div>
            </div>

            <div style="font-size: 11px; font-weight: bold; color: #8b949e;">FORENSIC EVIDENCE CLUES:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${clueCards}
            </div>
          </div>

          <!-- Middle: Interactive Celestial Star Map -->
          <div style="background: radial-gradient(circle at 50% 50%, #161b22 0%, #090b10 100%); border: 1px solid #58a6ff; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; z-index: 10;">
              <div>
                <span style="font-size: 13px; font-weight: 800; color: #ffd700;">✨ CELESTIAL CONSTELLATION: ${curInv.constellation.name.toUpperCase()}</span>
                <div style="font-size: 10px; color: #8b949e;">Click the luminous star nodes to decipher ancient celestial coordinates.</div>
              </div>
              <span style="font-size: 11px; color: #7ee787;">⭐ Click to Learn</span>
            </div>

            <div style="flex: 1; position: relative; display: flex; align-items: center; justify-content: center;">
              <svg width="100%" height="100%" viewBox="0 0 400 300" style="width: 100%; height: 100%;">
                <defs>
                  <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ffffff" />
                    <stop offset="100%" stop-color="#00f0ff" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <!-- Constellation Connecting Lines -->
                <line x1="80" y1="90" x2="160" y2="60" stroke="rgba(88, 166, 255, 0.4)" stroke-width="1.5" stroke-dasharray="3,3" />
                <line x1="160" y1="60" x2="270" y2="100" stroke="rgba(88, 166, 255, 0.4)" stroke-width="1.5" stroke-dasharray="3,3" />
                <line x1="270" y1="100" x2="330" y2="200" stroke="rgba(88, 166, 255, 0.4)" stroke-width="1.5" stroke-dasharray="3,3" />
                <line x1="270" y1="100" x2="200" y2="220" stroke="rgba(88, 166, 255, 0.4)" stroke-width="1.5" stroke-dasharray="3,3" />
                <!-- Star Nodes -->
                ${starPointsSvg}
              </svg>
            </div>

            <!-- Interactive Star Lore Inspector Banner -->
            <div id="star-lore-display" style="background: rgba(13, 17, 23, 0.85); border: 1px solid #30363d; border-radius: 4px; padding: 8px 12px; font-size: 11px; color: #e6edf3; z-index: 10;">
              ✨ <i>Click any celestial star point above to inspect astrological revelations.</i>
            </div>
          </div>

          <!-- Right: Sherlock Holmes Elementary Deduction Riddle -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
            <div style="font-size: 13px; font-weight: 800; color: #ffd700; border-bottom: 1px solid #30363d; padding-bottom: 6px;">
              🧠 SHERLOCK DEDUCTION RIDDLE
            </div>

            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-size: 11px;">
              <div style="font-weight: bold; color: #ffd700; margin-bottom: 4px;">Elementary Question:</div>
              <div style="color: #c9d1d9; line-height: 1.5;">${curInv.deduction.question}</div>
            </div>

            ${
              curInv.deduction.solved
                ? `
              <div style="background: rgba(35, 134, 54, 0.2); border: 1px solid #2ea043; border-radius: 6px; padding: 12px; text-align: center;">
                <div style="font-size: 14px; font-weight: bold; color: #7ee787;">🎉 CASE SOLVED!</div>
                <div style="font-size: 11px; color: #e6edf3; margin-top: 4px;">Mastery buff granted: +500 Energy, +2 Titan Cores, +10 Soul Diamonds, and +100 Chi!</div>
              </div>
            `
                : `
              <div style="font-size: 11px; font-weight: bold; color: #8b949e;">CHOOSE DEDUCTION HYPOTHESIS:</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${deductionOptions}
              </div>
            `
            }
          </div>
        </div>
      `;
    }

    // 2. COMBAT TAB
    else if (activeTab === "combat") {
      headerTitle = `⚔️ BATTLEGROUND & ERA ABILITIES — [${curEra.name}]`;

      const abilityCardsHtml = Object.values(ALL_ABILITIES)
        .map(ab => {
          const isEquipped = hero.equippedAbilities.includes(ab.id);
          const isDawnOrUnlocked = ab.id === "auto_attack" || gameState.unlockedMemories.has(`mem_${ab.era}_4`);
          return `
          <div style="background: #161b22; border: 1px solid ${isEquipped ? '#58a6ff' : '#30363d'}; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size: 24px;">${ab.icon}</span>
              <div>
                <div style="font-weight: bold; color: ${ab.particleColor}; font-size: 13px;">${ab.name}</div>
                <div style="font-size: 10px; color: #8b949e;">${ab.description}</div>
                <div style="font-size: 9px; color: #58a6ff; margin-top: 2px;">Cost: ${ab.costEnergy} Energy | Cooldown: ${Math.round(ab.cooldownFrames / 60)}s | Affinity: ${ab.affinity}</div>
              </div>
            </div>
            <div>
              ${
                !isDawnOrUnlocked
                  ? '<span style="font-size:10px; color:#da3633; font-weight:bold;">[LOCKED IN MEMORIES]</span>'
                  : `
                <button class="toggle-ability-btn" data-id="${ab.id}" style="
                  background: ${isEquipped ? '#1f6feb' : '#21262d'};
                  border: 1px solid ${isEquipped ? '#58a6ff' : '#30363d'};
                  color: #fff;
                  padding: 4px 10px;
                  font-size: 11px;
                  font-weight: bold;
                  border-radius: 4px;
                  cursor: pointer;
                ">
                  ${isEquipped ? 'EQUIPPED' : 'EQUIP'}
                </button>
              `
              }
            </div>
          </div>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 1fr 380px; gap: 16px; height: 100%; padding: 16px;">
          <!-- Left: Ability Configuration -->
          <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px;">
              <div>
                <span style="font-weight: bold; color: #ffd700;">AUTO-CAST ABILITIES:</span>
                <span style="font-size: 11px; color: #8b949e; margin-left: 6px;">Hero automatically expends Era-Energy to trigger equipped abilities.</span>
              </div>
              <button id="toggle-autocast" style="background: ${combatEngine.autoCastAbilities ? '#238636' : '#21262d'}; border: 1px solid #30363d; color: #fff; padding: 4px 12px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer;">
                ${combatEngine.autoCastAbilities ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #8b949e; margin-top: 4px;">MYTHIC ERA ABILITIES:</div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${abilityCardsHtml}
            </div>
          </div>

          <!-- Right: Boss & Combat Info -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto;">
            <div style="font-size: 14px; font-weight: bold; color: #ff7b72; border-bottom: 1px solid #30363d; padding-bottom: 6px;">
              ERA BOSS ENCOUNTER
            </div>
            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; font-size: 11px; line-height: 1.6;">
              <div style="font-size: 14px; font-weight: bold; color: #ffd700;">${curEra.bossName}</div>
              <div style="color: #8b949e; font-style: italic;">"${curEra.bossTitle}"</div>
              <div style="margin-top: 6px;"><b>Boss Max Health:</b> <span style="color:#7ee787;">${curEra.bossHp.toLocaleString()} HP</span></div>
              <div><b>Base Damage:</b> <span style="color:#ff7b72;">${curEra.bossDamage} DMG</span></div>
              <div><b>Mythic Affinity:</b> <span style="color:#d2a8ff;">${curEra.bossAffinity}</span></div>
            </div>
            <button id="modal-boss-toggle" style="background: ${combatEngine.bossMode ? '#b62324' : '#238636'}; border: 1px solid #30363d; color: #fff; padding: 10px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
              ${combatEngine.bossMode ? '⚔️ CURRENTLY IN BOSS BATTLE' : '💀 SUMMON ERA BOSS NOW'}
            </button>
            <div style="font-size: 11px; color: #8b949e; text-align: center;">
              Defeating the Era Boss grants guaranteed <b>Titan Cores</b>, <b>Mythic Shards</b>, and rare gear drops!
            </div>
          </div>
        </div>
      `;
    }

    // 3. TIMELINE & ERAS TAB
    else if (activeTab === "timeline") {
      headerTitle = `🗺️ MYTHIC TIMELINE — ERA ADVANCEMENT & GENERATORS`;

      const eraCardsHtml = ERA_ORDER.map(eraId => {
        const era = ERA_DATA[eraId];
        const isUnlocked = gameState.unlockedEras.includes(eraId);
        const isCurrent = gameState.currentEra === eraId;
        const gen = gameState.generators[eraId] || { level: 0 };
        const cost = gameState.getGeneratorUpgradeCost(eraId);

        return `
          <div style="
            background: ${isCurrent ? 'rgba(31, 111, 235, 0.15)' : '#161b22'};
            border: 2px solid ${isCurrent ? '#58a6ff' : isUnlocked ? '#30363d' : '#21262d'};
            border-radius: 6px;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size: 16px; font-weight: 800; color: ${era.bannerColor};">${era.order}. ${era.name}</span>
                ${isCurrent ? '<span style="background:#1f6feb; color:#fff; font-size:9px; padding:2px 6px; border-radius:3px; font-weight:bold;">ACTIVE</span>' : ''}
                ${!isUnlocked ? '<span style="background:#21262d; color:#8b949e; font-size:9px; padding:2px 6px; border-radius:3px;">LOCKED</span>' : ''}
              </div>
              <div style="font-size: 11px; color: #8b949e; margin-top: 2px;">${era.subtitle}</div>
              <div style="font-size: 10px; color: #7ee787; margin-top: 4px;">
                🏭 <b>${era.generatorName}</b>: Level ${gen.level} (${(era.baseEnergyRate * gen.level).toFixed(1)} Energy/s | ${(era.baseMaterialRate * gen.level).toFixed(1)} ${era.primaryMaterialName.split(" ")[0]}/s)
              </div>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              ${
                isUnlocked
                  ? `
                <button class="upgrade-gen-btn" data-era="${eraId}" style="
                  background: #238636;
                  border: 1px solid #30363d;
                  color: #fff;
                  padding: 6px 10px;
                  font-size: 11px;
                  font-weight: bold;
                  border-radius: 4px;
                  cursor: pointer;
                ">
                  UPGRADE GEN (${cost}⚡)
                </button>
                ${
                  !isCurrent
                    ? `
                  <button class="switch-era-btn" data-era="${eraId}" style="
                    background: #21262d;
                    border: 1px solid #30363d;
                    color: #58a6ff;
                    padding: 6px 10px;
                    font-size: 11px;
                    font-weight: bold;
                    border-radius: 4px;
                    cursor: pointer;
                  ">
                    TRAVEL TO ERA
                  </button>
                `
                    : ''
                }
              `
                  : `
                <div style="text-align: right; font-size: 10px; color: #8b949e;">
                  <div>Cost: ${era.advancementCost.eraEnergy}⚡ | ${era.advancementCost.materials}📦 | ${era.advancementCost.titanCores}👑</div>
                  <button class="advance-era-btn" data-era="${eraId}" style="
                    background: #8957e5;
                    border: 1px solid #30363d;
                    color: #fff;
                    padding: 6px 12px;
                    font-size: 11px;
                    font-weight: bold;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 4px;
                  ">
                    ADVANCE TIMELINE
                  </button>
                </div>
              `
              }
            </div>
          </div>
        `;
      }).join("");

      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 8px; height: 100%; padding: 16px; overflow-y: auto;">
          <div style="font-size: 12px; color: #8b949e; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px;">
            🌟 <b>Idle Progression</b>: Upgraded Era-Generators produce Era-Energy and Era-specific Materials continuously, even across offline sessions!
          </div>
          ${eraCardsHtml}
        </div>
      `;
    }

    // 4. MEMORIES & TRAIT TREE TAB
    else if (activeTab === "memories") {
      headerTitle = `🧠 ANCESTRAL MEMORIES & COSMIC TRAIT TREES`;

      const memoriesHtml = ANCESTRAL_MEMORIES.map(mem => {
        const isUnlocked = gameState.unlockedMemories.has(mem.id);
        const canAfford = gameState.currencies.eraEnergy >= mem.cost.eraEnergy && gameState.currencies.echoFragments >= mem.cost.echoFragments;
        const lvlMet = hero.level >= mem.requiredHeroLevel;

        return `
          <div style="
            background: #161b22;
            border: 1px solid ${isUnlocked ? '#7ee787' : '#30363d'};
            border-radius: 6px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 6px;
          ">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight: bold; color: ${isUnlocked ? '#7ee787' : '#e6edf3'}; font-size: 12px;">${mem.name}</span>
                <span style="font-size: 10px; color: #8b949e;">Era: ${mem.era.toUpperCase()}</span>
              </div>
              <div style="font-size: 11px; color: #58a6ff; margin-top: 2px;">${mem.description}</div>
              <div style="font-size: 10px; color: #8b949e; font-style: italic; margin-top: 4px;">"${mem.loreSnippet}"</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #21262d; padding-top: 6px; margin-top: 4px;">
              <span style="font-size: 10px; color: #d2a8ff;">Req: Lvl ${mem.requiredHeroLevel} | ${mem.cost.eraEnergy}⚡ | ${mem.cost.echoFragments}🌀</span>
              ${
                isUnlocked
                  ? '<span style="color:#7ee787; font-size:10px; font-weight:bold;">AWAKENED</span>'
                  : `
                <button class="awaken-mem-btn" data-id="${mem.id}" style="
                  background: ${canAfford && lvlMet ? '#1f6feb' : '#21262d'};
                  border: 1px solid #30363d;
                  color: #fff;
                  padding: 3px 8px;
                  font-size: 10px;
                  font-weight: bold;
                  border-radius: 4px;
                  cursor: ${canAfford && lvlMet ? 'pointer' : 'not-allowed'};
                ">
                  AWAKEN MEMORY
                </button>
              `
              }
            </div>
          </div>
        `;
      }).join("");

      // Cosmic Traits
      const traitsForForce = COSMIC_TRAIT_TREE[gameState.cosmicAlignment] || [];
      const traitsHtml = traitsForForce
        .map(t => {
          const rank = gameState.traits[t.id] || 0;
          const cost = t.costPerRank * (rank + 1);
          const canAfford = gameState.currencies.eraEnergy >= cost;
          return `
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size: 22px;">${t.icon}</span>
              <div>
                <div style="font-weight: bold; color: #ffd700; font-size: 12px;">${t.name} <span style="color:#58a6ff;">(Rank ${rank}/${t.maxRank})</span></div>
                <div style="font-size: 10px; color: #8b949e;">${t.description}</div>
              </div>
            </div>
            <div>
              ${
                rank >= t.maxRank
                  ? '<span style="color:#7ee787; font-size:10px; font-weight:bold;">MAX RANK</span>'
                  : `
                <button class="upgrade-trait-btn" data-id="${t.id}" style="
                  background: ${canAfford ? '#238636' : '#21262d'};
                  border: 1px solid #30363d;
                  color: #fff;
                  padding: 4px 8px;
                  font-size: 10px;
                  font-weight: bold;
                  border-radius: 4px;
                  cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                ">
                  UPGRADE (${cost}⚡)
                </button>
              `
              }
            </div>
          </div>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 100%; padding: 16px; overflow: hidden;">
          <!-- Left: Ancestral Memories -->
          <div style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto;">
            <div style="font-size: 13px; font-weight: bold; color: #ffd700; border-bottom: 1px solid #30363d; padding-bottom: 4px;">
              ANCESTRAL MEMORIES CODEX (${gameState.unlockedMemories.size} Awakened)
            </div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
              ${memoriesHtml}
            </div>
          </div>

          <!-- Right: Cosmic Traits -->
          <div style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto;">
            <div style="font-size: 13px; font-weight: bold; color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 4px;">
              COSMIC FORCE: ${gameState.cosmicAlignment.toUpperCase()} MASTERY
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${traitsHtml}
            </div>
          </div>
        </div>
      `;
    }

    // 5. THE MYTHIC FORGE & CRAFTING
    else if (activeTab === "forge") {
      headerTitle = `🔨 THE MYTHIC FORGE & ANCESTRAL CRAFTING`;

      const eraItems = MASTER_GEAR_CATALOG.filter(item => gameState.unlockedEras.includes(item.era));

      const craftItemsHtml = eraItems
        .map(item => {
          const col = COLOR_MAP[item.rarity];
          const cost = item.cost || { eraEnergy: 50, materials: {} };
          const matEntries = Object.entries(cost.materials || {});
          const matStr = matEntries.map(([k, v]) => `${v} ${k.split("_")[0]}`).join(", ");
          const hasEnergy = gameState.currencies.eraEnergy >= cost.eraEnergy;
          const hasMats = matEntries.every(([k, v]) => (gameState.currencies.materials[k] || 0) >= v);
          const hasTitan = !cost.titanCores || gameState.currencies.titanCores >= cost.titanCores;
          const canCraft = hasEnergy && hasMats && hasTitan;

          return `
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-weight:bold; color:${col}; font-size:12px;">${item.name}</span>
                <span style="font-size:9px; color:#8b949e;">[${item.slot.toUpperCase()}]</span>
                <span style="font-size:9px; color:${col};">(${item.rarity})</span>
              </div>
              <div style="font-size:10px; color:#8b949e; margin-top:2px;">${item.flavor}</div>
              <div style="font-size:10px; color:#58a6ff; margin-top:2px;">
                Cost: ${cost.eraEnergy}⚡ ${matStr ? '| ' + matStr : ''} ${cost.titanCores ? '| ' + cost.titanCores + '👑' : ''}
              </div>
            </div>
            <div>
              <button class="craft-item-btn" data-id="${item.id}" style="
                background: ${canCraft ? '#238636' : '#21262d'};
                border: 1px solid #30363d;
                color: #fff;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: bold;
                border-radius: 4px;
                cursor: ${canCraft ? 'pointer' : 'not-allowed'};
              ">
                FORGE ITEM
              </button>
            </div>
          </div>
        `;
        })
        .join("");

      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 10px; height: 100%; padding: 16px; overflow-y: auto;">
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px; font-size: 11px; color: #8b949e;">
            ✨ <b>Mythic Forge</b>: Craft era-specific weapons, armors, and artifacts. All forged items are directly transferred to your Bag Storage.
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${craftItemsHtml}
          </div>
        </div>
      `;
    }

    // 6. LORE CODEX TAB
    else if (activeTab === "lore") {
      headerTitle = `📜 THE LORE CODEX OF HUMAN HISTORY`;

      const loreHtml = LORE_DATABASE.map(entry => {
        const isEraUnlocked = gameState.unlockedEras.includes(entry.era) || entry.unlocked;
        return `
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight: bold; color: #ffd700; font-size: 13px;">${entry.title}</span>
              <span style="font-size: 10px; color: #8b949e;">Category: ${entry.category} (${entry.era.toUpperCase()})</span>
            </div>
            <div style="font-size: 11px; color: #c9d1d9; line-height: 1.5; margin-top: 4px;">
              ${isEraUnlocked ? entry.content : '<span style="color:#da3633; font-style:italic;">[LOCKED IN TIME: ' + entry.unlockCondition + ']</span>'}
            </div>
          </div>
        `;
      }).join("");

      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 10px; height: 100%; padding: 16px; overflow-y: auto;">
          ${loreHtml}
        </div>
      `;
    }

    // 7. ASCENSION & SAVE TAB
    else if (activeTab === "ascension") {
      headerTitle = `🌌 COSMIC ASCENSION & DATA PERSISTENCE`;

      bodyHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 100%; padding: 16px; overflow-y: auto;">
          <!-- Left: Reincarnation / Ascension -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
            <div style="font-size: 14px; font-weight: bold; color: #d2a8ff; border-bottom: 1px solid #30363d; padding-bottom: 6px;">
              COSMIC ASCENSION (REINCARNATION)
            </div>
            <div style="font-size: 11px; color: #8b949e; line-height: 1.6;">
              Reincarnate the Mythic Avatar across the timeline. Reset hero level while permanently retaining:
              <ul style="margin-left: 20px; color: #7ee787; margin-top: 4px;">
                <li>All Awakened Ancestral Memories</li>
                <li>All Cosmic Force Trait Masteries</li>
                <li>All Unlocked Era Generators & Timelines</li>
              </ul>
              <div style="margin-top: 8px; color: #ffd700;">
                Ascension Payout: <b>+5 Titan Cores</b>, <b>+15 Mythic Shards</b>, <b>+30 Echo Fragments</b>!
              </div>
            </div>
            <button id="ascend-hero-btn" style="background: linear-gradient(180deg, #8957e5 0%, #6e40c9 100%); border: 1px solid #a371f7; color: #fff; padding: 10px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: auto;">
              🌌 ASCEND & REINCARNATE (Count: ${gameState.stats.reincarnations})
            </button>
          </div>

          <!-- Right: Save & Load -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 14px; font-weight: bold; color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 6px;">
              DATA PERSISTENCE & STATS
            </div>
            <div style="font-size: 11px; color: #8b949e; line-height: 1.6;">
              <div>Total Monsters Slain: <b style="color:#fff;">${gameState.stats.totalKills.toLocaleString()}</b></div>
              <div>Era Bosses Defeated: <b style="color:#ffd700;">${gameState.stats.bossKills.toLocaleString()}</b></div>
              <div>Total Era-Energy Generated: <b style="color:#7ee787;">${Math.floor(gameState.stats.totalEraEnergyEarned).toLocaleString()}⚡</b></div>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 6px;">
              <button id="manual-save-btn" style="background: #238636; border: 1px solid #30363d; color: #fff; padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">
                💾 MANUAL SAVE
              </button>
              <button id="export-save-btn" style="background: #1f6feb; border: 1px solid #30363d; color: #fff; padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; flex: 1;">
                📋 EXPORT SAVE
              </button>
            </div>
            <div style="margin-top: 8px;">
              <textarea id="save-data-box" placeholder="Paste save JSON string here to import..." style="width: 100%; height: 80px; background: #0d1117; border: 1px solid #30363d; border-radius: 4px; color: #e6edf3; font-size: 10px; font-family: monospace; padding: 6px; box-sizing: border-box; resize: none;"></textarea>
              <button id="import-save-btn" style="background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 6px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 4px;">
                📥 IMPORT SAVE DATA
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Quick Tab Switcher inside Modal
    const modalTabsList: Array<{ id: TabType; label: string; icon: string }> = [
      { id: "hero", label: "HERO & GEAR", icon: "👤" },
      { id: "combat", label: "BATTLE", icon: "⚡" },
      { id: "forge", label: "FORGE", icon: "🔨" },
      { id: "chi", label: "CHI / ANGEL", icon: "🪶" },
      { id: "rogue", label: "MINI-NINJAS", icon: "⚔️" },
      { id: "debts", label: "UNDERWORLD DEBT", icon: "🪙" },
      { id: "investigation", label: "MYSTERY", icon: "🔍" },
      { id: "timeline", label: "TIMELINE", icon: "🗺️" },
      { id: "memories", label: "MEMORIES", icon: "🧠" },
      { id: "lore", label: "LORE", icon: "📜" },
      { id: "ascension", label: "ASCENSION", icon: "🌌" }
    ];

    const modalNavPills = modalTabsList
      .map(
        t => `
      <button class="modal-tab-pill-btn" data-tab="${t.id}" style="
        background: ${activeTab === t.id ? '#1f6feb' : '#21262d'};
        border: 1px solid ${activeTab === t.id ? '#58a6ff' : '#30363d'};
        color: ${activeTab === t.id ? '#ffffff' : '#8b949e'};
        padding: 4px 8px;
        font-size: 10px;
        font-weight: 700;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transition: all 0.1s ease;
      ">
        <span>${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `
      )
      .join("");

    // Inject Modal DOM
    modalWindow.innerHTML = `
      <div style="display: flex; flex-direction: column; background: #161b22; border-bottom: 2px solid #30363d;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; border-bottom: 1px solid #21262d;">
          <span style="font-size: 13px; font-weight: 800; color: #e6edf3; letter-spacing: 0.5px;">${headerTitle}</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size: 10px; color: #8b949e;">Press <kbd style="background:#21262d; border:1px solid #30363d; border-radius:3px; padding:1px 4px; color:#c9d1d9;">ESC</kbd> to return to game</span>
            <button id="close-modal-btn" style="background: #da3633; border: 1px solid #f85149; color: #fff; padding: 4px 12px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <span>✕</span> <span>CLOSE</span>
            </button>
          </div>
        </div>
        <div style="display: flex; gap: 6px; padding: 6px 14px; overflow-x: auto; background: #0d1117;">
          ${modalNavPills}
        </div>
      </div>
      <div style="flex: 1; overflow: hidden; position: relative;">
        ${bodyHtml}
      </div>
    `;

    // Attach Event Listeners for Active Modal Elements
    modalWindow.querySelector("#close-modal-btn")?.addEventListener("click", () => {
      activeTab = null;
      modalWindow.style.display = "none";
      renderNavBar();
    });

    modalWindow.querySelectorAll(".modal-tab-pill-btn").forEach(pill => {
      pill.addEventListener("click", e => {
        const target = (pill as HTMLElement).getAttribute("data-tab") as TabType;
        if (target) {
          activeTab = target;
          renderModalContent();
          renderNavBar();
        }
      });
    });

    // 1. Hero Event Listeners
    if (activeTab === "hero") {
      modalWindow.querySelectorAll(".align-select-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const force = (btn as HTMLElement).getAttribute("data-force") as CosmicForce;
          gameState.cosmicAlignment = force;
          hero.cosmicAlignment = force;
          soundEngine.playLoot();
          renderModalContent();
          renderTopBar();
        });
      });

      modalWindow.querySelectorAll(".inv-equip-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = parseInt((btn as HTMLElement).getAttribute("data-idx")!);
          const item = hero.inventory[idx];
          if (item) {
            let slot = item.slot;
            if (slot === "finger1" || slot === "finger2") {
              slot = !hero.equipment.finger1 ? "finger1" : "finger2";
            } else if (slot === "ear1" || slot === "ear2") {
              slot = !hero.equipment.ear1 ? "ear1" : "ear2";
            }
            const old = hero.equipment[slot];
            hero.equipment[slot] = item;
            hero.inventory.splice(idx, 1);
            if (old) hero.inventory.push(old);
            soundEngine.playCraft();
            renderModalContent();
          }
        });
      });

      modalWindow.querySelectorAll(".inv-infuse-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = parseInt((btn as HTMLElement).getAttribute("data-idx")!);
          const item = hero.inventory[idx];
          if (item && gameState.currencies.mythicShards >= 2) {
            gameState.currencies.mythicShards -= 2;
            item.infusionLevel = (item.infusionLevel || 0) + 1;
            soundEngine.playLevelUp();
            renderModalContent();
            renderTopBar();
          }
        });
      });

      modalWindow.querySelectorAll(".inv-drop-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = parseInt((btn as HTMLElement).getAttribute("data-idx")!);
          hero.inventory.splice(idx, 1);
          renderModalContent();
        });
      });
    }

    // 2. Chi & Arc Angel Event Listeners
    else if (activeTab === "chi") {
      modalWindow.querySelectorAll(".form-card").forEach(card => {
        card.addEventListener("click", e => {
          const form = (card as HTMLElement).getAttribute("data-form") as any;
          if (form === "werewolf" && hero.level < 8) {
            alert("Lunar Werewolf transformation unlocks at Level 8!");
            return;
          }
          if (form === "mythic_drake" && hero.level < 20) {
            alert("Ancient Mythic Drake transformation unlocks at Level 20!");
            return;
          }
          hero.activeForm = form;
          soundEngine.playLoot();
          renderModalContent();
          renderTopBar();
        });
      });

      modalWindow.querySelector("#modal-transform-btn")?.addEventListener("click", () => {
        if (hero.isTransformed) {
          hero.revertTransform();
        } else {
          if (hero.canTransform(hero.activeForm)) {
            hero.transform(hero.activeForm, 25);
            soundEngine.playEraAdvance();
            logger.printLine(`*** CHI SURGE! TRANSCENDED INTO ${hero.activeForm.toUpperCase()}! ***`, "#ffd700");
          } else {
            alert(`Need at least 50 Chi Force to transform (Current: ${Math.floor(hero.chi)})`);
          }
        }
        renderModalContent();
        renderTopBar();
      });

      modalWindow.querySelectorAll(".upgrade-chi-skill-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.upgradeChiSkill(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });
    }

    // 3. Rogue With The Dead Event Listeners
    else if (activeTab === "rogue") {
      modalWindow.querySelectorAll(".hire-troop-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.hireTroop(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });

      modalWindow.querySelectorAll(".expand-troop-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.expandTroopCapacity(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });

      modalWindow.querySelectorAll(".upgrade-troop-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.upgradeTroop(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });

      modalWindow.querySelectorAll(".upgrade-relic-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.upgradeRelic(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });
    }

    // 3B. Debts in the Depths Event Listeners
    else if (activeTab === "debts") {
      modalWindow.querySelectorAll(".repay-debt-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const amt = parseInt((btn as HTMLElement).getAttribute("data-amt") || "0");
          if (amt > 0) {
            const success = gameState.repayUnderworldDebt(amt);
            if (success) {
              logger.printLine(`*** Repaid ${amt.toLocaleString()} Obols toward Underworld Debt! ***`, "#ffd700");
              renderModalContent();
              renderTopBar();
            } else {
              logger.printLine(`Need more Era Energy to repay this amount.`, "#ff7b72");
            }
          }
        });
      });

      modalWindow.querySelectorAll(".buy-investment-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.buyDepthsInvestment(id);
          if (success) {
            logger.printLine(`Purchased underworld passive yield investment!`, "#7ee787");
            renderModalContent();
            renderTopBar();
          } else {
            logger.printLine(`Need more Era Energy to purchase this investment.`, "#ff7b72");
          }
        });
      });

      modalWindow.querySelectorAll(".hire-troop-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.hireTroop(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });

      modalWindow.querySelectorAll(".expand-troop-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.expandTroopCapacity(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });

      modalWindow.querySelectorAll(".upgrade-troop-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = (btn as HTMLElement).getAttribute("data-id")!;
          const success = gameState.upgradeTroop(id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });
    }

    // 4. Sherlock Holmes Investigation Event Listeners
    else if (activeTab === "investigation") {
      modalWindow.querySelectorAll(".inv-era-tab").forEach(btn => {
        btn.addEventListener("click", e => {
          activeInvestigationEra = (btn as HTMLElement).getAttribute("data-era")!;
          soundEngine.playLoot();
          renderModalContent();
        });
      });

      modalWindow.querySelectorAll(".clue-card").forEach(card => {
        card.addEventListener("click", e => {
          const era = (card as HTMLElement).getAttribute("data-era")!;
          const id = (card as HTMLElement).getAttribute("data-id")!;
          const success = gameState.uncoverInvestigationClue(era, id, hero);
          if (success) {
            renderModalContent();
            renderTopBar();
          }
        });
      });

      modalWindow.querySelectorAll(".star-point-svg").forEach(star => {
        star.addEventListener("click", e => {
          const era = (star as HTMLElement).getAttribute("data-era")!;
          const idx = parseInt((star as HTMLElement).getAttribute("data-idx")!);
          const res = gameState.clickInvestigationStar(era, idx);
          const loreBox = modalWindow.querySelector("#star-lore-display");
          if (loreBox) {
            loreBox.innerHTML = `✨ <b>Astrological Finding:</b> ${res.lore} ${res.wasNew ? '<span style="color:#7ee787;">(+50 Energy!)</span>' : ''}`;
          }
          renderTopBar();
        });
      });

      modalWindow.querySelectorAll(".deduction-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const era = (btn as HTMLElement).getAttribute("data-era")!;
          const idx = parseInt((btn as HTMLElement).getAttribute("data-idx")!);
          const res = gameState.solveInvestigationDeduction(era, idx, hero);
          if (res.success) {
            alert(`🎉 ELEMENTARY DEDUCTION SOLVED!\n\n${res.explanation}\n\nRewards: +500 Energy, +2 Titan Cores, +10 Soul Diamonds, +100 Chi!`);
            renderModalContent();
            renderTopBar();
          } else {
            alert(`❌ INCORRECT DEDUCTION:\n\n${res.explanation}\n\nReview the clues and try another hypothesis!`);
          }
        });
      });
    }

    // 2. Combat Event Listeners
    else if (activeTab === "combat") {
      modalWindow.querySelector("#toggle-autocast")?.addEventListener("click", () => {
        combatEngine.autoCastAbilities = !combatEngine.autoCastAbilities;
        renderModalContent();
      });

      modalWindow.querySelector("#modal-boss-toggle")?.addEventListener("click", () => {
        combatEngine.bossMode = !combatEngine.bossMode;
        if (combatEngine.bossMode && combatEngine.activeEnemy && !combatEngine.activeEnemy.isBoss) {
          combatEngine.activeEnemy = null;
        }
        renderModalContent();
        renderTopBar();
      });

      modalWindow.querySelectorAll(".toggle-ability-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const abId = (btn as HTMLElement).getAttribute("data-id")!;
          if (hero.equippedAbilities.includes(abId)) {
            if (hero.equippedAbilities.length > 1) {
              hero.equippedAbilities = hero.equippedAbilities.filter(id => id !== abId);
            }
          } else {
            hero.equippedAbilities.push(abId);
          }
          soundEngine.playHit();
          renderModalContent();
        });
      });
    }

    // 3. Timeline Event Listeners
    else if (activeTab === "timeline") {
      modalWindow.querySelectorAll(".upgrade-gen-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const eraId = (btn as HTMLElement).getAttribute("data-era") as EraId;
          gameState.upgradeGenerator(eraId);
          renderModalContent();
          renderTopBar();
        });
      });

      modalWindow.querySelectorAll(".switch-era-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const eraId = (btn as HTMLElement).getAttribute("data-era") as EraId;
          gameState.currentEra = eraId;
          combatEngine.activeEnemy = null;
          soundEngine.playLoot();
          renderModalContent();
          renderTopBar();
        });
      });

      modalWindow.querySelectorAll(".advance-era-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const eraId = (btn as HTMLElement).getAttribute("data-era") as EraId;
          const res = gameState.advanceEra(eraId);
          if (res) {
            combatEngine.activeEnemy = null;
            renderModalContent();
            renderTopBar();
          } else {
            const check = gameState.canAdvanceEra(eraId);
            alert(check.reason || "Cannot advance era yet.");
          }
        });
      });
    }

    // 4. Memories & Traits Event Listeners
    else if (activeTab === "memories") {
      modalWindow.querySelectorAll(".awaken-mem-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const memId = (btn as HTMLElement).getAttribute("data-id")!;
          gameState.unlockMemory(memId, hero.level);
          renderModalContent();
          renderTopBar();
        });
      });

      modalWindow.querySelectorAll(".upgrade-trait-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const traitId = (btn as HTMLElement).getAttribute("data-id")!;
          gameState.upgradeTrait(traitId, gameState.cosmicAlignment);
          renderModalContent();
          renderTopBar();
        });
      });
    }

    // 5. Forge Event Listeners
    else if (activeTab === "forge") {
      modalWindow.querySelectorAll(".craft-item-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const itemId = (btn as HTMLElement).getAttribute("data-id")!;
          const itemProto = MASTER_GEAR_CATALOG.find(i => i.id === itemId);
          if (itemProto && hero.inventory.length < 24) {
            const cost = itemProto.cost || { eraEnergy: 50, materials: {} };
            const matEntries = Object.entries(cost.materials || {});
            const hasEnergy = gameState.currencies.eraEnergy >= cost.eraEnergy;
            const hasMats = matEntries.every(([k, v]) => (gameState.currencies.materials[k] || 0) >= v);
            const hasTitan = !cost.titanCores || gameState.currencies.titanCores >= cost.titanCores;

            if (hasEnergy && hasMats && hasTitan) {
              gameState.currencies.eraEnergy -= cost.eraEnergy;
              matEntries.forEach(([k, v]) => {
                gameState.currencies.materials[k] -= v;
              });
              if (cost.titanCores) gameState.currencies.titanCores -= cost.titanCores;

              hero.inventory.push({ ...itemProto });
              soundEngine.playCraft();
              renderModalContent();
              renderTopBar();
            }
          }
        });
      });
    }

    // 7. Ascension Event Listeners
    else if (activeTab === "ascension") {
      modalWindow.querySelector("#ascend-hero-btn")?.addEventListener("click", () => {
        if (confirm("Ascend your Mythic Avatar? Hero level will reset to 1, while retaining all memories, traits, generators, and timelines!")) {
          gameState.reincarnate();
          hero.level = 1;
          hero.xp = 0;
          hero.maxXp = 100;
          hero.hp = hero.getEffectiveMaxHp();
          renderModalContent();
          renderTopBar();
        }
      });

      modalWindow.querySelector("#manual-save-btn")?.addEventListener("click", () => {
        gameState.save();
        alert("Game saved successfully!");
      });

      modalWindow.querySelector("#export-save-btn")?.addEventListener("click", () => {
        const json = gameState.exportSave();
        const box = modalWindow.querySelector("#save-data-box") as HTMLTextAreaElement;
        if (box) box.value = json;
        navigator.clipboard?.writeText(json);
        alert("Save data exported to clipboard!");
      });

      modalWindow.querySelector("#import-save-btn")?.addEventListener("click", () => {
        const box = modalWindow.querySelector("#save-data-box") as HTMLTextAreaElement;
        if (box && box.value) {
          const success = gameState.importSave(box.value);
          if (success) {
            alert("Save loaded successfully!");
            renderModalContent();
            renderTopBar();
          } else {
            alert("Invalid save data format.");
          }
        }
      });
    }
  }

  // Tab Control Functions
  function openTab(tab: TabType) {
    activeTab = tab;
    if (tab) {
      modalWindow.style.display = "flex";
      renderModalContent();
    } else {
      modalWindow.style.display = "none";
    }
    renderNavBar();
  }

  function closeTab() {
    activeTab = null;
    modalWindow.style.display = "none";
    renderNavBar();
  }

  function toggleTab(tab: TabType) {
    if (activeTab === tab) {
      closeTab();
    } else {
      openTab(tab);
    }
  }

  // Keyboard shortcut: ESC to close any open modal
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && activeTab) {
      closeTab();
    }
  });

  // Attach to window object for header buttons or external triggers
  (window as any).mythicUI = {
    openTab,
    closeTab,
    toggleTab,
    getActiveTab: () => activeTab
  };

  // Initial render
  renderTopBar();
  renderNavBar();

  // Return live update hook and controls
  return {
    updateUI: () => {
      renderTopBar();
      if (activeTab) renderModalContent();
    },
    openTab,
    closeTab,
    toggleTab
  };
}
