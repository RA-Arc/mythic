declare global {
  interface Window {
    mythicLogHistory: { time: string; message: string; color: string }[];
    mythicLogListeners: Array<() => void>;
  }
}

window.mythicLogHistory = window.mythicLogHistory || [];
window.mythicLogListeners = window.mythicLogListeners || [];

export function createMythicLog(wrapper?: HTMLDivElement) {
  function printLine(message: string, color: string = "#c9d1d9") {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    window.mythicLogHistory.push({ time: timeStr, message, color });
    
    if (window.mythicLogHistory.length > 100) {
      window.mythicLogHistory.shift();
    }
    
    window.mythicLogListeners.forEach(listener => listener());
  }

  return { printLine };
}
