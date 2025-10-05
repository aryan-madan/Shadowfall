import React, { useState, useEffect } from 'react';
import { WindowInstance, AppDefinition } from '../../types';
import { playSound } from '../../assets';

interface TaskbarProps {
  windows: WindowInstance[];
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  activeId: string | null;
  isAgentDesktop: boolean;
  onLogout?: () => void;
  onExit?: () => void;
  apps: AppDefinition[];
  health?: number;
  disabledSystems?: string[];
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onFocus, onMinimize, activeId, isAgentDesktop, onLogout, onExit, apps, health = 100, disabledSystems = [] }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = (win: WindowInstance) => {
    playSound('ui_click');
    if (win.id === activeId && !win.isMinimized) onMinimize(win.id);
    else onFocus(win.id);
  };
  
  const healthStyle = () => {
    if (health < 40) return 'text-red-500 animate-pulse';
    if (health < 70) return 'text-yellow-400';
    return 'text-cyan-300';
  }

  const agentTheme = {
    bar: "bg-black/50 backdrop-blur-sm border-t border-cyan-500/50",
    buttonActive: "bg-cyan-500/30 border-b-2 border-cyan-400 text-white",
    buttonInactive: "bg-slate-700/50 hover:bg-slate-600/50 text-gray-200",
    iconFilter: "filter drop-shadow(0 0 2px #0ff) hue-rotate(180deg) brightness(1.5)",
    time: "text-cyan-300",
    logout: "bg-red-500/80 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-sm text-lg"
  };

  const personalTheme = {
      bar: "bg-white/50 backdrop-blur-md border-t border-gray-300/80",
      buttonActive: "bg-blue-200/80 border-b-2 border-blue-500 text-slate-800",
      buttonInactive: "bg-white/30 hover:bg-white/60 text-slate-700",
      iconFilter: "",
      time: "text-slate-800",
      logout: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-sm text-lg"
  }

  const theme = isAgentDesktop ? agentTheme : personalTheme;
  const isHealthOffline = disabledSystems.includes('INTEGRITY_MONITOR');

  const handleLogout = () => { playSound('ui_click'); onLogout?.(); }
  const handleExit = () => { playSound('ui_click'); onExit?.(); }

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-2 z-[9999] ${theme.bar}`}>
      <div className="flex items-center space-x-2 h-full py-1.5">
        {windows.map(win => {
          const app = apps.find(a => a.id === win.appId);
          if (!app) return null;
          const isActive = win.id === activeId && !win.isMinimized;
          return (
            <button key={win.id} onClick={() => handleClick(win)} className={`flex items-center space-x-2 px-3 h-full rounded-sm transition-colors duration-150 ${isActive ? theme.buttonActive : theme.buttonInactive}`}>
              <div className={`w-5 h-5 flex items-center justify-center`}>
                <img src={app.iconUrl} alt={app.name} className={`w-full h-full pixel-art ${theme.iconFilter}`} />
              </div>
              <span className="text-lg truncate max-w-28">{win.title}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center space-x-4">
        {isAgentDesktop && (
            <div className={`text-lg font-bold transition-colors ${isHealthOffline ? 'text-red-500 glitch' : healthStyle()}`} data-text="SYS-INTEGRITY: UNKNOWN">
                {isHealthOffline ? 'SYS-INTEGRITY: UNKNOWN' : `SYS-INTEGRITY: ${health}%`}
            </div>
        )}
        {isAgentDesktop && onLogout && <button onClick={handleLogout} className={theme.logout}>LOGOUT</button>}
        {!isAgentDesktop && onExit && <button onClick={handleExit} className={theme.logout}>Step Away</button>}
        <div className={`pr-2 text-lg ${theme.time}`}>{time.toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default Taskbar;