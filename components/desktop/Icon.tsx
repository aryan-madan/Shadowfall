import React from 'react';
import { AppDefinition } from '../../types';
import { playSound } from '../../assets';

interface IconProps {
  app: AppDefinition;
  onOpen: () => void;
  isAgentDesktop: boolean;
  pos: { x: number, y: number };
}

const Icon: React.FC<IconProps> = ({ app, onOpen, isAgentDesktop, pos }) => {

  const agentTheme = {
    container: "hover:bg-cyan-400/20 focus:bg-cyan-400/30",
    icon: "filter drop-shadow(0 0 4px #0ff) hue-rotate(190deg) brightness(1.7)",
    text: "text-cyan-200"
  };

  const personalTheme = {
    container: "hover:bg-blue-200/50 focus:bg-blue-200/80",
    icon: "",
    text: "text-slate-800"
  };

  const theme = isAgentDesktop ? agentTheme : personalTheme;

  const handleOpen = () => {
    playSound('ui_click');
    onOpen();
  };

  return (
    <div
      className={`absolute flex flex-col items-center p-2 w-28 h-28 justify-start text-center cursor-pointer rounded-md transition-all duration-150 ${theme.container}`}
      style={{ left: pos.x, top: pos.y }}
      onDoubleClick={handleOpen}
      onClick={handleOpen}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
    >
      <div className={`w-12 h-12 mb-2 flex items-center justify-center`}>
        <img 
            src={app.iconUrl} 
            alt={app.name} 
            className={`w-full h-full pixel-art ${theme.icon}`}
            draggable="false"
        />
      </div>
      <span className={`text-lg break-words leading-tight ${theme.text}`}>{app.name}</span>
    </div>
  );
};

export default Icon;