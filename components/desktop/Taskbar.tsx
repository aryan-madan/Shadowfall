
import React, { useState, useEffect } from 'react';
import { WindowInstance, AppDefinition } from '../../types';
import { playSound } from '../../assets';

interface TaskbarProps {
  openWindows: WindowInstance[];
  onFocusWindow: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  activeWindowId: string | null;
  isLoggedIn: boolean;
  onLogout?: () => void;
  onReturnToRoom?: () => void;
  apps: AppDefinition[];
  systemIntegrity?: number;
}

const Taskbar: React.FC<TaskbarProps> = ({ openWindows, onFocusWindow, onToggleMinimize, activeWindowId, isLoggedIn, onLogout, onReturnToRoom, apps, systemIntegrity = 100 }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskbarClick = (window: WindowInstance) => {
    playSound('ui_click');
    if (window.id === activeWindowId && !window.isMinimized) {
      onToggleMinimize(window.id);
    } else {
      onFocusWindow(window.id);
    }
  };
  
  const getIntegrityStyles = () => {
    if (systemIntegrity < 40) return 'text-red-500 animate-pulse';
    if (systemIntegrity < 70) return 'text-yellow-400';
    return 'text-cyan-300';
  }

  const fbiTheme = {
    bar: "bg-black/50 backdrop-blur-sm border-t border-cyan-500/50",
    buttonActive: "bg-cyan-500/30 border-b-2 border-cyan-400 text-white",
    buttonInactive: "bg-slate-700/50 hover:bg-slate-600/50 text-gray-200",
    iconFilter: "filter drop-shadow(0 0 2px #0ff) hue-rotate(180deg) brightness(1.5)",
    time: "text-cyan-300",
    logout: "bg-red-500/80 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-sm text-lg"
  };

  const normalTheme = {
      bar: "bg-white/50 backdrop-blur-md border-t border-gray-300/80",
      buttonActive: "bg-blue-200/80 border-b-2 border-blue-500 text-slate-800",
      buttonInactive: "bg-white/30 hover:bg-white/60 text-slate-700",
      iconFilter: "",
      time: "text-slate-800",
      logout: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-sm text-lg"
  }

  const theme = isLoggedIn ? fbiTheme : normalTheme;

  const handleLogoutClick = () => {
      playSound('ui_click');
      onLogout?.();
  }
  
  const handleReturnToRoomClick = () => {
      playSound('ui_click');
      onReturnToRoom?.();
  }

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-2 z-[9999] ${theme.bar}`}>
      <div className="flex items-center space-x-2 h-full py-1.5">
        {openWindows.map(win => {
          const app = apps.find(a => a.id === win.appId);
          if (!app) return null;
          
          const isActive = win.id === activeWindowId;
          const isMinimized = win.isMinimized;

          return (
            <button
              key={win.id}
              onClick={() => handleTaskbarClick(win)}
              className={`flex items-center space-x-2 px-3 h-full rounded-sm transition-colors duration-150 ${
                isActive && !isMinimized ? theme.buttonActive : theme.buttonInactive
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center`}>
                <img src={app.icon} alt={app.name} className={`w-full h-full pixelated ${theme.iconFilter}`} />
              </div>
              <span className="text-lg truncate max-w-28">{win.title}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center space-x-4">
        {isLoggedIn && (
            <div className={`text-lg font-bold transition-colors ${getIntegrityStyles()}`}>
                SYS-INTEGRITY: {systemIntegrity}%
            </div>
        )}
        {isLoggedIn && onLogout && <button onClick={handleLogoutClick} className={theme.logout}>LOGOUT</button>}
        {!isLoggedIn && onReturnToRoom && <button onClick={handleReturnToRoomClick} className={theme.logout}>Step Away</button>}
        <div className={`pr-2 text-lg ${theme.time}`}>
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
