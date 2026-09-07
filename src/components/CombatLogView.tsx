import React, { useEffect, useState, useRef } from 'react';

export const CombatLogView: React.FC = () => {
  const [logs, setLogs] = useState<{ time: string; message: string; color: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLogs = () => {
      setLogs([...(window.mythicLogHistory || [])]);
    };
    
    // Initial fetch
    updateLogs();

    // Subscribe to updates
    if (!window.mythicLogListeners) window.mythicLogListeners = [];
    window.mythicLogListeners.push(updateLogs);

    return () => {
      window.mythicLogListeners = window.mythicLogListeners.filter(l => l !== updateLogs);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#0d1117]/80 rounded-xl border border-[#30363d] overflow-hidden shadow-lg backdrop-blur text-[11px] font-mono">
      <div className="bg-[#161b22] border-b border-[#30363d] px-3 py-2 flex justify-between items-center text-[#8b949e] font-bold text-[10px] tracking-wide select-none">
        <span className="text-[#58a6ff]">📜 COMBAT & CHRONICLES LOG</span>
      </div>
      <div ref={containerRef} className="p-2 overflow-y-auto flex-1 flex flex-col gap-1">
        {logs.length === 0 ? (
          <div className="text-neutral-500 italic text-center py-4">No events recorded yet.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="leading-tight">
              <span className="text-[#6e7681] text-[9px] mr-1">[{log.time}]</span>
              <span style={{ color: log.color }} dangerouslySetInnerHTML={{ __html: log.message }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
