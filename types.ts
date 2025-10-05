import React from 'react';

export interface RiskyAction {
  chanceOfSuccess: number;
  healthCostOnSuccess: number;
  healthCostOnFailure: number;
}

export interface DialogueChoice {
    id: string;
    dialogueId: string;
    text: string;
    healthChange?: number;
    progressChange?: number;
}

export interface AppContentProps {
  story?: number;
  sysHealth?: number;
  onClueFound?: (clueId: string) => void;
  onPerformRiskyAction?: (action: RiskyAction) => boolean;
  onRepairSystem?: (amount: number) => void;
  locationId?: string;
  choices?: Record<string, string>;
  onChoice?: (choice: DialogueChoice) => void;
  onAdvanceStory?: (amount: number) => void;
  password?: string;
  disabledSystems?: string[];
  onDisableSystem?: (systemName: string, healthCost: number) => void;
}

export interface AppDefinition {
  id: string;
  name: string;
  iconUrl: string;
  Component: React.ComponentType<AppContentProps>;
  initialSize?: { width: number, height: number };
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isClosing?: boolean;
}

export type IconPositions = Record<string, { x: number; y: number }>;

export type GameScreen = 'main_menu' | 'personal_desktop' | 'game_world' | 'agent_desktop' | 'game_ending';

export interface SaveFile {
  screen: GameScreen;
  story: number;
  sysHealth: number;
  choices: Record<string, string>;
  password?: string;
  locationId: string;
  openedApps?: string[];
  disabledSystems?: string[];
}