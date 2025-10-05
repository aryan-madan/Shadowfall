import React from 'react';
import { AppDefinition, IconPositions } from '../../types';
import Icon from './Icon';

interface DesktopProps {
  onOpen: (appId: string) => void;
  apps: AppDefinition[];
  isAgentDesktop: boolean;
  iconPositions: IconPositions;
}

const Desktop: React.FC<DesktopProps> = ({ onOpen, apps, isAgentDesktop, iconPositions }) => {
  return (
    <>
      <div className="relative w-full h-full z-10">
        {apps.map(app => (
          <Icon
            key={app.id}
            app={app}
            onOpen={() => onOpen(app.id)}
            isAgentDesktop={isAgentDesktop}
            pos={iconPositions[app.id] || { x: 50, y: 50 }}
          />
        ))}
      </div>
      {isAgentDesktop && (
        <div className="absolute top-4 right-4 text-center z-10">
          <h1 className="text-5xl font-bold text-cyan-300 tracking-widest glitch" data-text="[ F. B. I. VIRTUAL OS ]">[ F. B. I. VIRTUAL OS ]</h1>
          <p className="text-lg text-red-500">CLASSIFIED // FOR OFFICIAL USE ONLY</p>
        </div>
      )}
    </>
  );
};

export default Desktop;