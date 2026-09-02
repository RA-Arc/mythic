export function createEverQuestLog(wrapper: HTMLDivElement) {
  const logBox = document.createElement("div");
  logBox.style.cssText = "position:absolute; bottom:10px; left:10px; width:420px; height:160px; background:rgba(12,15,20,0.92); border:2px solid #5a4a35; border-radius:3px; color:#d1c4b2; font-family:'Courier New',monospace; font-size:11px; overflow-y:auto; box-shadow:inset 0 0 10px #000; z-index:90; box-sizing:border-box;";
  wrapper.appendChild(logBox);

  const container = document.createElement("div");
  container.style.padding = "6px";
  logBox.appendChild(container);

  const history: string[] = [];

  function printLine(message: string, color: string = "#d1c4b2") {
    const cleanMsg = `<span style="color:${color};">[${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}] ${message}</span>`;
    history.push(cleanMsg);
    if (history.length > 40) history.shift();
    container.innerHTML = history.join("<br/>");
    logBox.scrollTop = logBox.scrollHeight;
  }

  return { printLine };
}
