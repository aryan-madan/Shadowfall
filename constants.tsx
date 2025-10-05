import React from 'react';
import { AppDefinition } from './types';
import { PERSONAL_APP_ICONS, AGENT_APP_ICONS } from './assets';
import {
    CaseFilesApp,
    EvidenceViewerApp,
    SecureMessengerApp,
    NotesApp,
    CalculatorApp,
    BrowserApp,
    GalleryApp,
    TrashApp,
} from './components/desktop/Apps';

export const HOME_APPS: AppDefinition[] = [
  {
    id: 'notes',
    name: 'Notes',
    iconUrl: PERSONAL_APP_ICONS.notes,
    Component: NotesApp,
    initialSize: { width: 350, height: 400 },
  },
  {
    id: 'calculator',
    name: 'Calculator',
    iconUrl: PERSONAL_APP_ICONS.calculator,
    Component: CalculatorApp,
    initialSize: { width: 300, height: 450 },
  },
  {
    id: 'browser',
    name: 'Web Browser',
    iconUrl: PERSONAL_APP_ICONS.browser,
    Component: BrowserApp,
    initialSize: { width: 800, height: 600 },
  },
  {
    id: 'gallery',
    name: 'Photos',
    iconUrl: PERSONAL_APP_ICONS.gallery,
    Component: GalleryApp,
    initialSize: { width: 600, height: 500 },
  },
  {
    id: 'trash',
    name: 'Trash',
    iconUrl: PERSONAL_APP_ICONS.trash,
    Component: TrashApp,
    initialSize: { width: 400, height: 300 },
  },
  {
    id: 'secure_access',
    name: 'Secure Access',
    iconUrl: PERSONAL_APP_ICONS.secure_access,
    Component: () => <></>,
  },
];


export const WORK_APPS: AppDefinition[] = [
  {
    id: 'case_files',
    name: 'Case Files',
    iconUrl: AGENT_APP_ICONS.case_files,
    Component: CaseFilesApp,
    initialSize: { width: 700, height: 500 },
  },
  {
    id: 'evidence_viewer',
    name: 'Evidence Viewer',
    iconUrl: AGENT_APP_ICONS.evidence_viewer,
    Component: EvidenceViewerApp,
    initialSize: { width: 800, height: 600 },
  },
  {
    id: 'secure_messenger',
    name: 'Secure Messenger',
    iconUrl: AGENT_APP_ICONS.secure_messenger,
    Component: SecureMessengerApp,
    initialSize: { width: 450, height: 650 },
  }
];

export const MISSIONS = [
    { text: "System online. Familiarize yourself with the OS by opening **all available applications**.", progressRequirement: 1 },
    { text: "Good. Now check your **Secure Messenger** for an incoming transmission.", progressRequirement: 1.1 },
    { text: "You have your first destination. Use **Fast Travel** to get to the `Net-Dive Cyber Cafe`.", progressRequirement: 1.2 },
    { text: "You've recovered the data fragments. Check your **Case Files** for the intel.", progressRequirement: 2 },
    { text: "Void has sent another message. Open your **Secure Messenger**.", progressRequirement: 2.1 },
    { text: "The first sacrifice is required. Access **Case File CYB-002** to proceed.", progressRequirement: 3.1 },
    { text: "You've decrypted the file. A great sacrifice is needed to proceed. Go to **Case File CYB-003**.", progressRequirement: 3.2 },
    { text: "The system is yours. The final choice awaits in **Case File CYB-003**.", progressRequirement: 4 },
];