
import React from 'react';
import { AppDefinition } from './types';
import { NORMAL_APP_ICONS, FBI_APP_ICONS } from './assets';
import {
    CaseFilesApp,
    TerminalApp,
    EvidenceViewerApp,
    SecureMessengerApp,
    NotesApp,
    CalculatorApp,
    BrowserApp,
    GalleryApp,
    TrashApp,
} from './components/desktop/Apps';

export const NORMAL_APPS: AppDefinition[] = [
  {
    id: 'notes',
    name: 'Notes',
    icon: NORMAL_APP_ICONS.notes,
    component: NotesApp,
    defaultSize: { width: 350, height: 400 },
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: NORMAL_APP_ICONS.calculator,
    component: CalculatorApp,
    defaultSize: { width: 300, height: 450 },
  },
  {
    id: 'browser',
    name: 'Web Browser',
    icon: NORMAL_APP_ICONS.browser,
    component: BrowserApp,
    defaultSize: { width: 800, height: 600 },
  },
  {
    id: 'gallery',
    name: 'Photos',
    icon: NORMAL_APP_ICONS.gallery,
    component: GalleryApp,
    defaultSize: { width: 600, height: 500 },
  },
  {
    id: 'trash',
    name: 'Trash',
    icon: NORMAL_APP_ICONS.trash,
    component: TrashApp,
    defaultSize: { width: 400, height: 300 },
  },
  {
    id: 'secure_access',
    name: 'Secure Access',
    icon: NORMAL_APP_ICONS.secure_access,
    component: () => <></>,
  },
];


export const FBI_APPS: AppDefinition[] = [
  {
    id: 'case_files',
    name: 'Case Files',
    icon: FBI_APP_ICONS.case_files,
    component: CaseFilesApp,
    defaultSize: { width: 700, height: 500 },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: FBI_APP_ICONS.terminal,
    component: TerminalApp,
    defaultSize: { width: 600, height: 400 },
  },
  {
    id: 'evidence_viewer',
    name: 'Evidence Viewer',
    icon: FBI_APP_ICONS.evidence_viewer,
    component: EvidenceViewerApp,
    defaultSize: { width: 800, height: 600 },
  },
  {
    id: 'secure_messenger',
    name: 'Secure Messenger',
    icon: FBI_APP_ICONS.secure_messenger,
    component: SecureMessengerApp,
    defaultSize: { width: 450, height: 650 },
  }
];

export const ALL_OBJECTIVES = [
    { text: "System online. Familiarize yourself with the OS by opening **all available applications**.", requiredProgress: 1 },
    { text: "Good. Now check your **Secure Messenger** for an incoming transmission.", requiredProgress: 1.1 },
    { text: "You have your first destination. Exit the office and use the **World Map** portal to travel to `warehouse_b7`.", requiredProgress: 1.2 },
    { text: "Good. You found the first piece. Now check your **Case Files** for the truth I unlocked.", requiredProgress: 2 },
    { text: "You have a new message. Open **Secure Messenger**.", requiredProgress: 2.1 },
    { text: "Time for your next move. I sent you a new location in **Secure Messenger**. Use the **World Map** to get there.", requiredProgress: 2.2 },
    { text: "Another breadcrumb. Decrypt the file in **Case Files**.", requiredProgress: 3 },
    { text: "The final piece is close. Travel to the **Europa Data Center** and connect to the core network.", requiredProgress: 3.1 },
    { text: "Connection established. Return to your FBI OS and use command `breach firewall_europa` in the **Terminal**.", requiredProgress: 3.2 },
    { text: "The system is ours. Access the final **Case File** and make your choice.", requiredProgress: 4 },
];
