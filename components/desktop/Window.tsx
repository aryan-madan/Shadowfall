
import React, { useMemo } from 'react';
import { WindowInstance, AppDefinition, AppContentProps, RiskyActionConfig, ConversationChoice } from '../../types';
import { useDraggable } from '../../hooks/useDraggable';

interface WindowProps {
  instance: WindowInstance;
  app: AppDefinition;
  onClose: (id: string) => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  setWindows: React.Dispatch<React.SetStateAction<WindowInstance[]>>;
  isActive: boolean;
  isLoggedIn: boolean;
  storyProgress?: number;
  onFindClue?: (clueId: string) => void;
  currentLocationId?: string;
  systemIntegrity?: number;
  onRiskyAction?: (config: RiskyActionConfig) => boolean;
  onRepairSystem?: (amount: number) => void;
  madeChoices?: Record<string, string>;
  onChoice?: (choice: ConversationChoice) => void;
  onAdvanceStory?: (amount: number) => void;
  password?: string;
}

const fbiTheme = {
  window: "bg-slate-900/80 backdrop-blur-md shadow-2xl shadow-black/50 text-gray-200",
  headerActive: "bg-cyan-800/80 border-cyan-500",
  headerInactive: "bg-slate-800/80 border-slate-600",
  borderActive: "rgb(103 232 249)",
  borderInactive: "#475569",
  shadowActive: '0 0 20px rgba(103, 232, 249, 0.5)',
  shadowInactive: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
};

const normalTheme = {
    window: "bg-gray-100/90 backdrop-blur-md shadow-xl text-black",
    headerActive: "bg-blue-500 border-blue-600 text-white",
    headerInactive: "bg-gray-400 border-gray-500 text-gray-800",
    borderActive: "#2563eb",
    borderInactive: "#9ca3af",
    shadowActive: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    shadowInactive: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

const WindowHeader: React.FC<{
    title: string;
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    onClose: () => void;
    onMinimize: () => void;
    isActive: boolean;
    isLoggedIn: boolean;
}> = ({ title, onMouseDown, onClose, onMinimize, isActive, isLoggedIn }) => {
    const theme = isLoggedIn ? fbiTheme : normalTheme;
    const headerClasses = isActive ? theme.headerActive : theme.headerInactive;
    return (
    <div
        onMouseDown={onMouseDown}
        className={`h-8 flex items-center justify-between px-2 border-b cursor-move ${headerClasses}`}
    >
        <span className="font-bold truncate">{title}</span>
        <div className="flex items-center space-x-2">
            <button onClick={onMinimize} className="w-4 h-4 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors"></button>
            <button onClick={onClose} className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-400 transition-colors"></button>
        </div>
    </div>
)};

const Window: React.FC<WindowProps> = (props) => {
  const { 
      instance, app, onClose, onRemove, onFocus, onMinimize, setWindows, 
      isActive, isLoggedIn, storyProgress, onFindClue, currentLocationId,
      systemIntegrity, onRiskyAction, onRepairSystem, madeChoices, onChoice, onAdvanceStory,
      password,
  } = props;

  const { id, position, size, zIndex, isClosing } = instance;
  const { handleMouseDown } = useDraggable({ id, initialPosition: position, setWindows });

  const AppContent = useMemo(() => app.component, [app.component]);
  const theme = isLoggedIn ? fbiTheme : normalTheme;

  const appContentProps: AppContentProps = {
    storyProgress,
    onFindClue,
    currentLocationId,
    systemIntegrity,
    onRiskyAction,
    onRepairSystem,
    madeChoices,
    onChoice,
    onAdvanceStory,
    password,
  };
  
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === 'scale-down') {
        onRemove(id);
    }
  }
  
  const animationClass = isClosing ? 'window-exit' : 'window-enter';

  return (
    <div
      className={`absolute rounded-md border flex flex-col ${theme.window} ${animationClass}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex,
        borderColor: isActive ? theme.borderActive : theme.borderInactive,
        boxShadow: isActive ? theme.shadowActive : theme.shadowInactive,
      }}
      onMouseDown={() => onFocus(id)}
      onAnimationEnd={handleAnimationEnd}
    >
      <WindowHeader 
        title={instance.title}
        onMouseDown={handleMouseDown}
        onClose={() => onClose(id)}
        onMinimize={() => onMinimize(id)}
        isActive={isActive}
        isLoggedIn={isLoggedIn}
      />
      <div className="flex-grow p-0.5 overflow-auto">
        <AppContent {...appContentProps} />
      </div>
    </div>
  );
};

export default Window;
