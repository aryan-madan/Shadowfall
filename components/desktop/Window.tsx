import React, { useMemo } from 'react';
import { WindowInstance, AppDefinition, AppContentProps, DialogueChoice } from '../../types';
import { useDrag } from '../../hooks/useDraggable';

interface WindowProps {
  win: WindowInstance;
  app: AppDefinition;
  onClose: (id: string) => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  setWindows: React.Dispatch<React.SetStateAction<WindowInstance[]>>;
  isActive: boolean;
  isAgentDesktop: boolean;
  story?: number;
  onClueFound?: (clueId: string) => void;
  locationId?: string;
  sysHealth?: number;
  choices?: Record<string, string>;
  onChoice?: (choice: DialogueChoice) => void;
  onAdvanceStory?: (amount: number) => void;
  password?: string;
  disabledSystems?: string[];
  onDisableSystem?: (systemId: string, cost: number) => void;
}

const agentTheme = {
  window: "bg-slate-900/80 backdrop-blur-md shadow-2xl shadow-black/50 text-gray-200",
  headerActive: "bg-cyan-800/80 border-cyan-500",
  headerInactive: "bg-slate-800/80 border-slate-600",
  borderActive: "rgb(103 232 249)",
  borderInactive: "#475569",
  shadowActive: '0 0 20px rgba(103, 232, 249, 0.5)',
  shadowInactive: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
};

const personalTheme = {
    window: "bg-gray-100/90 backdrop-blur-md shadow-xl text-black",
    headerActive: "bg-blue-500 border-blue-600 text-white",
    headerInactive: "bg-gray-400 border-gray-500 text-gray-800",
    borderActive: "#2563eb",
    borderInactive: "#9ca3af",
    shadowActive: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    shadowInactive: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

const WindowHeader: React.FC<{ title: string; onDragStart: (e: React.MouseEvent<HTMLDivElement>) => void; onClose: () => void; onMinimize: () => void; isActive: boolean; isAgentDesktop: boolean; }> = ({ title, onDragStart, onClose, onMinimize, isActive, isAgentDesktop }) => {
    const theme = isAgentDesktop ? agentTheme : personalTheme;
    const headerClasses = isActive ? theme.headerActive : theme.headerInactive;
    return (
    <div onMouseDown={onDragStart} className={`h-8 flex items-center justify-between px-2 border-b cursor-move ${headerClasses}`}>
        <span className="font-bold truncate">{title}</span>
        <div className="flex items-center space-x-2">
            <button onClick={onMinimize} className="w-4 h-4 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors"></button>
            <button onClick={onClose} className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-400 transition-colors"></button>
        </div>
    </div>
)};

const Window: React.FC<WindowProps> = (props) => {
  const { 
      win, app, onClose, onRemove, onFocus, onMinimize, setWindows, 
      isActive, isAgentDesktop, story, onClueFound, locationId,
      sysHealth, choices, onChoice, onAdvanceStory,
      password, disabledSystems, onDisableSystem
  } = props;

  const { id, pos, size, zIndex, isClosing } = win;
  const { onDragStart } = useDrag({ id, initialPos: pos, setWindows });

  const App = useMemo(() => app.Component, [app.Component]);
  const theme = isAgentDesktop ? agentTheme : personalTheme;

  const appProps: AppContentProps = {
    story, onClueFound, locationId, sysHealth, choices, onChoice: onChoice,
    onAdvanceStory, password, disabledSystems, onDisableSystem,
  };
  
  const onAnimEnd = (e: React.AnimationEvent) => { if (e.animationName === 'win-scale-down') onRemove(id); }
  
  return (
    <div
      className={`absolute rounded-md border flex flex-col ${theme.window} ${isClosing ? 'win-exit' : 'win-enter'}`}
      style={{
        left: `${pos.x}px`, top: `${pos.y}px`,
        width: `${size.width}px`, height: `${size.height}px`,
        zIndex: zIndex,
        borderColor: isActive ? theme.borderActive : theme.borderInactive,
        boxShadow: isActive ? theme.shadowActive : theme.shadowInactive,
      }}
      onMouseDown={() => onFocus(id)}
      onAnimationEnd={onAnimEnd}
    >
      <WindowHeader title={win.title} onDragStart={onDragStart} onClose={() => onClose(id)} onMinimize={() => onMinimize(id)} isActive={isActive} isAgentDesktop={isAgentDesktop} />
      <div className="flex-grow p-0.5 overflow-auto">
        <App {...appProps} />
      </div>
    </div>
  );
};

export default Window;