import React from 'react';

export interface RiskyActionConfig {
  successChance: number; // 0.0 to 1.0
  integrityCostSuccess: number;
  integrityCostFailure: number;
}

export interface ConversationChoice {
    id: string;
    conversationId: string;
    text: string;
    integrityChange?: number;
    storyProgressChange?: number;
}

export interface AppContentProps {
  storyProgress?: number;
  systemIntegrity?: number;
  onFindClue?: (clueId: string) => void;
  onRiskyAction?: (config: RiskyActionConfig) => boolean;
  onRepairSystem?: (amount: number) => void;
  currentLocationId?: string;
  madeChoices?: Record<string, string>;
  onChoice?: (choice: ConversationChoice) => void;
  onAdvanceStory?: (amount: number) => void;
  password?: string;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string; // URL to pixel art icon
  component: React.ComponentType<AppContentProps>;
  defaultSize?: { width: number, height: number };
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isClosing?: boolean;
}

export type IconPositions = Record<string, { x: number; y: number }>;

export type AppState = 'start_menu' | 'normal_desktop' | 'rpg' | 'fbi_desktop' | 'ending';

export interface GameState {
  appState: AppState;
  storyProgress: number;
  systemIntegrity: number;
  madeChoices: Record<string, string>;
  password?: string;
  currentLocationId: string;
  openedFbiApps?: string[];
}
