export function createMythicLog(wrapper: HTMLDivElement) {
  const logBox = document.createElement("div");
  logBox.id = "mythic-combat-log";
  logBox.style.cssText = `
    position: absolute;
    bottom: 60px;
    left: 16px;
    width: 380px;
    height: 140px;
    background: rgba(13, 17, 23, 0.88);
    border: 1px solid #30363d;
    border-radius: 6px;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    font-size: 11px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    z-index: 90;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(4px);
  `;
  wrapper.appendChild(logBox);

  const header = document.createElement("div");
  header.style.cssText = `
    background: #161b22;
    border-bottom: 1px solid #30363d;
    padding: 3px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 10px;
    color: #8b949e;
    cursor: pointer;
    user-select: none;
  `;
  header.innerHTML = `
    <span style="color:#58a6ff;">📜 COMBAT & CHRONICLES LOG</span>
    <span id="log-toggle-btn" style="color:#8b949e;">[-]</span>
  `;
  logBox.appendChild(header);

  const container = document.createElement("div");
  container.style.cssText = `
    padding: 6px 8px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  `;
  logBox.appendChild(container);

  let isMinimized = false;
  const originalHeight = "140px";
  header.addEventListener("click", () => {
    isMinimized = !isMinimized;
    logBox.style.height = isMinimized ? "24px" : originalHeight;
    container.style.display = isMinimized ? "none" : "flex";
    const btn = header.querySelector("#log-toggle-btn");
    if (btn) btn.textContent = isMinimized ? "[+]" : "[-]";
  });

  const history: string[] = [];

  function printLine(message: string, color: string = "#c9d1d9") {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const cleanMsg = `<div><span style="color:#6e7681; font-size:9px;">[${timeStr}]</span> <span style="color:${color};">${message}</span></div>`;
    history.push(cleanMsg);
    if (history.length > 50) history.shift();
    container.innerHTML = history.join("");
    container.scrollTop = container.scrollHeight;
  }

  return { printLine };
}
