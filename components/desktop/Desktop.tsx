
import React from 'react';
import { AppDefinition, IconPositions } from '../../types';
import DesktopIcon from './Icon';

interface DesktopProps {
  onOpenApp: (appId: string) => void;
  apps: AppDefinition[];
  isLoggedIn: boolean;
  iconPositions: IconPositions;
}

const Desktop: React.FC<DesktopProps> = ({ onOpenApp, apps, isLoggedIn, iconPositions }) => {
  return (
    <>
      <div className="relative w-full h-full z-10">
        {apps.map(app => (
          <DesktopIcon
            key={app.id}
            app={app}
            onOpen={() => onOpenApp(app.id)}
            isLoggedIn={isLoggedIn}
            position={iconPositions[app.id] || { x: 50, y: 50 }}
          />
        ))}
      </div>
      {isLoggedIn && (
        <div className="absolute top-4 right-4 text-center z-10">
          <h1 className="text-5xl font-bold text-cyan-300 tracking-widest">[ F. B. I. VIRTUAL OS ]</h1>
          <p className="text-lg text-red-500">CLASSIFIED // FOR OFFICIAL USE ONLY</p>
        </div>
      )}
    </>
  );
};

export default Desktop;
