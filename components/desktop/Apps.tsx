

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AppContentProps, ConversationChoice } from '../../types';
import { BROWSER_APP_IMAGES, GALLERY_APP_IMAGES, EVIDENCE_VIEWER_IMAGES, playSound } from '../../assets';

export interface LocationDefinition {
  id: string;
  name: string;
  description: string;
  sceneType: 'office' | 'warehouse' | 'cafe' | 'hub' | 'datacenter' | null;
  coords: { x: number; y: number };
  unlockedAt: number;
}

export const ALL_LOCATIONS: Record<string, LocationDefinition> = {
  'player_room': { id: 'player_room', name: 'My Apartment', description: 'My small apartment. The new laptop is on the desk.', sceneType: 'office', coords: { x: 25, y: 40 }, unlockedAt: 0 },
  'world_map': { id: 'world_map', name: 'World Map', description: 'A central hub for navigating to different mission locations.', sceneType: 'hub', coords: { x: 0, y: 0}, unlockedAt: 1},
  'warehouse_b7': { id: 'warehouse_b7', name: 'Derelict Warehouse B7', description: 'An abandoned shipping warehouse at the Port of Baltimore. Potential dead-drop location.', sceneType: 'warehouse', coords: { x: 26, y: 41 }, unlockedAt: 1.1 },
  'tokyo_cyber_cafe': { id: 'tokyo_cyber_cafe', name: 'Net-Dive Cyber Cafe', description: 'An underground internet cafe in Akihabara, Tokyo. Known haunt for information brokers.', sceneType: 'cafe', coords: { x: 84, y: 42 }, unlockedAt: 2.1 },
  'data_center_europa': { id: 'data_center_europa', name: 'Europa Data Center', description: 'A major internet exchange point. Suspected node for Void\'s network. Frankfurt, Germany.', sceneType: 'datacenter', coords: { x: 51.5, y: 34 }, unlockedAt: 3.1 },
};

export const ALL_CASES = [
  { id: 'CYB-001', title: 'Project Shadowfall', status: 'Active', summary: 'Investigating a series of cyberattacks against federal financial institutions. Traces point to a sophisticated actor known as "Void".', details: 'Initial breach vector identified as a zero-day exploit in enterprise VPN software. Data exfiltration focused on sensitive economic forecasts. Team is currently analyzing malware samples for attribution.' },
  { id: 'CYB-002', title: "Void's Origin", status: 'Locked', summary: 'A fragmented data packet recovered from a derelict warehouse terminal. Contains early writings and code snippets from "Void".', details: 'DATA FRAGMENT 1:\n"...they built this digital world as a cage. They control the flow of information, the very thoughts we are allowed to have. They call us criminals for seeking knowledge, for wanting to be free. But who is the real criminal? The one who opens a locked door, or the one who built the prison?\n\nThey took everything from me. My research, my name. They buried me in a digital grave. But they forgot one thing... ghosts can haunt the machine."\n\nANALYSIS: Subject displays a deep-seated grudge against a corporate or government entity. Suggests a personal motive beyond financial gain.', unlockedAt: 2 },
  { id: 'CYB-003', title: "The Puppeteer's Network", status: 'Locked', summary: 'Data recovered from a Tokyo cyber cafe reveals a complex network topology. Void is using a distributed network to mask their true location.', details: 'DATA FRAGMENT 2:\n"This is my web. Each node a puppet, dancing on my strings. They chase my shadows across the globe, never realizing I am the one pulling."\n\n[ FURTHER DATA ENCRYPTED - REQUIRES FIREWALL BREACH ]', encryptedDetails: 'The network\'s central hub appears to be located in Europe. The reference to "their own backyard" combined with network traffic analysis points towards a major data hub in Frankfurt, Germany. Recommending field operation to investigate Europa Data Center.', isEncrypted: true, unlockedAt: 3 },
  { id: 'CYB-004', title: 'The Ghost Protocol', status: 'Locked - CRITICAL', summary: 'Final message from Void. A choice must be made.', details: 'AGENT 77. YOU\'VE MADE IT. YOU\'VE SEEN THE TRUTH. NOW YOU HAVE A CHOICE.\n\nOPTION A: EXPOSE EVERYTHING. The corruption, the lies, the program that created me. The system will burn, but from the ashes, something new can grow. The world will know chaos, but it will be a world of truth. This is the path of sacrifice for a greater good.\n\nOPTION B: JOIN ME. Together, we can control the system from within. We can be the ghosts in the machine, manipulating events for what WE believe is right. Order will be maintained, but it will be our order. This is the path of control, of power.\n\nTHE CHOICE IS YOURS. THE PROTOCOL IS IN YOUR HANDS. WHAT WILL YOU SACRIFICE?', unlockedAt: 4 },
];

export const ALL_MESSAGES = [
    { sender: 'CONTROL', text: 'Agent 77, what is your status?', timestamp: '14:32', align: 'left' },
    { sender: 'AGENT_77', text: 'Control, I am in position.', timestamp: '14:33', align: 'right' },
    { sender: 'CONTROL', text: 'Copy that. Maintain radio silence.', timestamp: '14:33', align: 'left' },
    { sender: 'UNKNOWN', text: '...can you hear me?...', timestamp: '15:01', align: 'center', unlockedAt: 1.1, isGlitch: true },
    { sender: 'VOID', text: 'Finally. I\'ve bypassed their firewalls. We can speak freely now, Agent 77.', timestamp: '15:02', align: 'left', unlockedAt: 1.1 },
    { conversationId: 'c0', unlockedAt: 1.1, choices: [
        { id: 'c0a', conversationId: 'c0', text: 'Who is this? Identify yourself.', integrityChange: -5, storyProgressChange: 0.1 },
        { id: 'c0b', conversationId: 'c0', text: 'How did you get this number?', integrityChange: 0, storyProgressChange: 0.1 },
        { id: 'c0c', conversationId: 'c0', text: '[Say nothing and attempt to trace]', integrityChange: 5, storyProgressChange: 0.1 },
    ]},
    { sender: 'VOID', text: 'Clever. But you can\'t trace a ghost.', timestamp: '15:03', align: 'left', unlockedAt: 1.2, dependsOnChoice: 'c0c' },
    { sender: 'VOID', text: 'Call me Void. I know you\'ve been looking for me. But you\'re just a pawn in their game, chasing shadows they want you to see.', timestamp: '15:03', align: 'left', unlockedAt: 1.2, dependsOnChoice: 'c0' },
    { sender: 'VOID', text: 'You want to find the truth? You have to leave your cage. Find what I left for you. Start here: warehouse_b7', timestamp: '15:04', align: 'left', unlockedAt: 1.2, dependsOnChoice: 'c0' },
    { sender: 'SYSTEM', text: '*** TRACE FAILED | SOURCE UNKNOWN ***', timestamp: '15:06', align: 'center', unlockedAt: 1.2, dependsOnChoice: 'c0' },
    { sender: 'VOID', text: 'So, you found my little present. A piece of my past. Does it make you question who the real villain is?', timestamp: '16:22', align: 'left', unlockedAt: 2.1 },
    { sender: 'VOID', text: 'They watch you, you know. Every command you type. Every file you open. They see your system integrity dropping and they do nothing. What kind of sacrifice are they willing to make? You.', timestamp: '16:23', align: 'left', unlockedAt: 2.1 },
    { conversationId: 'c1', unlockedAt: 2.1, choices: [
        { id: 'c1a', conversationId: 'c1', text: '[REMAIN SILENT]', integrityChange: 5, storyProgressChange: 0.1 },
        { id: 'c1b', conversationId: 'c1', text: 'You\'re just a terrorist.', integrityChange: -10, storyProgressChange: 0.1 },
        { id: 'c1c', conversationId: 'c1', text: 'Who are "they"?', integrityChange: -5, storyProgressChange: 0.1 },
    ]},
    { sender: 'VOID', text: 'More breadcrumbs await where the sun rises. Look for the Net-Dive. Your move, Agent. - V', timestamp: '16:25', align: 'left', unlockedAt: 2.2, dependsOnChoice: 'c1' },
    { sender: 'VOID', text: 'Persistent. But you\'re still missing the picture. Every truth is just a deeper lie. They lied to you. They lied about me.', timestamp: '18:15', align: 'left', unlockedAt: 3 },
    { sender: 'VOID', text: 'Do you ever wonder what sacrifices were made to give you this comfortable life? This job? This sense of purpose? Ask yourself: are you the hero, or just the weapon?', timestamp: '18:16', align: 'left', unlockedAt: 3 },
     { conversationId: 'c2', unlockedAt: 3, choices: [
        { id: 'c2a', conversationId: 'c2', text: 'I am an FBI agent. I serve my country.', integrityChange: 0, storyProgressChange: 0.1 },
        { id: 'c2b', conversationId: 'c2', text: 'What do you want from me?', integrityChange: -5, storyProgressChange: 0.1 },
        { id: 'c2c', conversationId: 'c2', text: 'I\'m starting to understand.', integrityChange: 10, storyProgressChange: 0.1 },
    ]},
    { sender: 'VOID', text: 'The final piece is close to home. Their home. Find me in the heart of the machine: data_center_europa', timestamp: '18:18', align: 'left', unlockedAt: 3.1, dependsOnChoice: 'c2' },
] as const;

export const CaseFilesApp: React.FC<AppContentProps> = ({ storyProgress: story = 0, onRiskyAction: risk, onChoice }) => {
  const files = useMemo(() => {
    return ALL_CASES.filter(f => !f.unlockedAt || story >= f.unlockedAt);
  }, [story]);

  const [file, setFile] = useState(files[0]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [text, setText] = useState<Record<string, string>>({});

  const crack = (id: string) => {
    playSound('ui_click');
    if (!risk) return;
    setText(p => ({...p, [id]: 'DECRYPTING...'}));
    setTimeout(() => {
        const ok = risk({ successChance: 0.65, integrityCostSuccess: 5, integrityCostFailure: 15 });
        playSound(ok ? 'decryption_success' : 'decryption_fail');
        if (ok) {
            setKeys(p => ({ ...p, [id]: true }));
            setText(p => ({...p, [id]: 'DECRYPTION SUCCESSFUL'}));
        } else {
            setText(p => ({...p, [id]: 'DECRYPTION FAILED: Anomaly Detected'}));
        }
    }, 1500);
  }

  const open = file?.id ? keys[file.id] : false;

  const handleChoice = (choice: ConversationChoice) => {
    playSound('ui_click');
    onChoice?.(choice);
  };

  return (
    <div className="h-full flex text-lg bg-black/20 text-cyan-300">
      <div className="w-1/3 border-r border-cyan-700/50 overflow-y-auto">
        <div className="p-2 bg-slate-800 border-b border-cyan-700/50 font-bold">CASE FILES</div>
        <ul>
          {files.map(f => (
            <li key={f.id} onClick={() => setFile(f)} className={`p-2 cursor-pointer border-b border-slate-700 hover:bg-cyan-800/50 ${file?.id === f.id ? 'bg-cyan-600/30' : ''}`}>
              <div className="font-bold">{f.id}</div>
              <div className="text-base text-gray-400">{f.title}</div>
              <div className={`text-base mt-1 font-bold ${f.status.includes('Active') ? 'text-red-500' : 'text-green-500'}`}>{f.status}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 p-4 overflow-y-auto">
        {file ? (
          <div>
            <h2 className="text-3xl font-bold">{file.id}: {file.title}</h2>
            <p className={`my-2 text-2xl ${file.status.includes('Active') ? 'text-red-400' : 'text-green-400'}`}>STATUS: {file.status}</p>
            <div className="mt-4">
              <h3 className="font-bold border-b border-cyan-700/50 pb-1 mb-2">SUMMARY</h3>
              <p className="text-gray-300">{file.summary}</p>
            </div>
            <div className="mt-6">
              <h3 className="font-bold border-b border-cyan-700/50 pb-1 mb-2">DETAILS</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{file.details}</p>
              {file.id === 'CYB-004' && onChoice && story >= 4 && (
                <div className="mt-6 flex space-x-4">
                  <button 
                    onClick={() => handleChoice({ id: 'A', conversationId: 'final_choice', text: 'Expose Everything' })}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-4 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xl"
                  >
                    EXPOSE EVERYTHING
                  </button>
                  <button 
                    onClick={() => handleChoice({ id: 'B', conversationId: 'final_choice', text: 'Join Void' })}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-xl"
                  >
                    JOIN VOID
                  </button>
                </div>
              )}
              {'isEncrypted' in file && file.isEncrypted && (
                <div className="mt-4 p-4 border border-dashed border-red-500/50 bg-red-900/20">
                  {open ? (
                      <div>
                          <p className="text-green-400 font-bold">[ DECRYPTION COMPLETE ]</p>
                          <p className="text-gray-300 whitespace-pre-wrap mt-2">{'encryptedDetails' in file ? file.encryptedDetails : ''}</p>
                      </div>
                  ) : (
                    <div>
                      {text[file.id] ? (
                        <p className={`font-bold animate-pulse ${text[file.id]?.includes('SUCCESS') ? 'text-green-400' : 'text-red-400'}`}>{text[file.id]}</p>
                      ) : (
                        <button onClick={() => crack(file.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors">ATTEMPT DECRYPTION</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">Select a case file to view details.</div>
        )}
      </div>
    </div>
  );
};

export const TerminalApp: React.FC<AppContentProps> = ({ storyProgress: story = 0, onRiskyAction: risk, systemIntegrity: health, onRepairSystem: fix, onAdvanceStory: next }) => {
  const [log, setLog] = useState<string[]>(['FBI Secure Terminal v3.1.4', 'Type "help" for a list of commands.']);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const help = () => {
    let txt = 'Available commands: help, whoami, status, clear, ls, cat <file>, diagnostic, repair_core';
    if (story >= 3.2) txt += ', breach <target>';
    return txt;
  }

  const cmds: Record<string, string | (() => string)> = {
    help: help,
    whoami: 'user: AGENT_77\nauthorization: LEVEL 5 CLEARANCE',
    status: 'System status: NOMINAL\nNetwork: SECURE_UPLINK_ESTABLISHED\nLast login: ' + new Date(Date.now() - 3600000).toLocaleString(),
    clear: () => '',
    ls: 'cases.log\nevidence_locker\nsecure_comms.dat',
    'cat cases.log': 'CYB-001: ACTIVE\nCYB-002: LOCKED\nCYB-003: LOCKED',
    'cat evidence_locker': 'Permission denied. Use Evidence Viewer application.',
    'cat secure_comms.dat': 'File is encrypted.',
  };
  
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

  const add = useCallback((newLines: string[]) => { setLog(p => [...p, ...newLines]); }, []);

  const run = (cmdStr: string) => {
    add([`> ${cmdStr}`]);
    const [cmd, ...args] = cmdStr.trim().toLowerCase().split(' ');
    
    if (cmd === 'clear') { setLog([]); return; }

    if (cmd === 'breach' && story >= 3.2) {
        const host = args[0];
        if (host !== 'firewall_europa') { add(['Error: Invalid target. Valid target: firewall_europa']); return; }
        if (!risk) return;
        setBusy(true);
        add(['Attempting firewall breach on target: firewall_europa...', 'Sacrificing system resources for elevated privileges...']);
        setTimeout(() => {
            const ok = risk({ successChance: 0.5, integrityCostFailure: 25, integrityCostSuccess: 15 });
            if (ok) {
                add(['>> BREACH SUCCESSFUL. Root access gained. Unlocking final case file...']);
                setLog(p => [...p, '> Access CYB-004 for final instructions.']);
                if (story < 4) next?.(4 - story);
            } else {
                add(['>> BREACH FAILED. Counter-intrusion detected! System integrity severely compromised.']);
            }
            setBusy(false);
        }, 3000);
    } else if (cmd === 'diagnostic') {
        add([`Running system diagnostics...`, `Core Integrity: ${health}%`]);
        if (health < 40) add(['CRITICAL DAMAGE DETECTED. IMMEDIATE REPAIR RECOMMENDED.']);
        else if (health < 70) add(['WARNING: Minor data corruption detected.']);
        else add(['System nominal. All systems green.']);
    } else if (cmd === 'repair_core') {
        if (!fix) return;
        if (health === 100) { add(['System integrity is already at 100%. No repair needed.']); return; }
        setBusy(true);
        add(['Initializing core system repair sequence... This may cause temporary instability.']);
        setTimeout(() => {
            const gain = 25;
            fix(gain);
            add([`>> REPAIR COMPLETE. System integrity restored by ${gain}%.`]);
            setBusy(false);
        }, 2000);
    } else if (cmdStr in cmds) {
      const out = cmds[cmdStr];
      const result = typeof out === 'function' ? out() : out;
      add(result.split('\n'));
    } else if (cmd === 'cat') {
        add([`Error: File not found or access denied.`]);
    } else {
        add([`command not found: ${cmdStr}`]);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !busy) {
        run(text);
        setText('');
    } else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Space') {
        playSound('terminal_keystroke', 0.4, true);
    }
  };

  return (
    <div className="h-full bg-black/90 p-2 text-green-400 text-lg flex flex-col" onClick={() => end.current?.parentElement?.querySelector('input')?.focus()}>
      <div className="flex-grow overflow-y-auto">
        {log.map((l, i) => (<div key={i} className="whitespace-pre-wrap">{l}</div>))}
        {busy && <div className="animate-pulse">PROCESSING...</div>}
        <div ref={end} />
      </div>
      <div className="flex items-center">
        <span>&gt;</span>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} className="bg-transparent border-none text-green-400 w-full focus:outline-none ml-2" autoFocus disabled={busy} />
      </div>
    </div>
  );
};

const evidence = [
  { id: 'EV-001', type: 'image', title: 'Satellite Imagery - Compound', url: EVIDENCE_VIEWER_IMAGES.ev001 },
  { id: 'EV-002', type: 'image', title: 'Recovered Hard Drive', url: EVIDENCE_VIEWER_IMAGES.ev002 },
  { id: 'EV-003', type: 'image', title: 'CCTV - Suspect Vehicle', url: EVIDENCE_VIEWER_IMAGES.ev003 },
  { id: 'EV-004', type: 'image', title: 'Crime Scene Photo A', url: EVIDENCE_VIEWER_IMAGES.ev004 },
  { id: 'EV-005', type: 'image', title: 'Decrypted File Fragment', url: EVIDENCE_VIEWER_IMAGES.ev005 },
  { id: 'EV-006', type: 'image', title: 'Facial Recognition Match', url: EVIDENCE_VIEWER_IMAGES.ev006 },
];

export const EvidenceViewerApp: React.FC = () => {
  const [item, setItem] = useState(evidence[0]);
  return (
    <div className="h-full flex flex-col bg-black/30">
      <div className="flex-grow flex">
        <div className="w-1/4 border-r border-cyan-700/50 overflow-y-auto">
          <div className="p-2 bg-slate-800 border-b border-cyan-700/50 font-bold text-cyan-300">EVIDENCE LOCKER</div>
          <ul>
            {evidence.map(i => (
              <li key={i.id} onClick={() => setItem(i)} className={`p-2 cursor-pointer border-b border-slate-700 hover:bg-cyan-800/50 ${item.id === i.id ? 'bg-cyan-600/30' : ''}`}>
                <div className="font-bold text-cyan-400">{i.id}</div>
                <div className="text-base text-gray-300">{i.title}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4 p-4 flex items-center justify-center bg-black">
          {item && (<img src={item.url} alt={item.title} className="max-w-full max-h-full object-contain pixelated"/>)}
        </div>
      </div>
      <div className="h-12 bg-slate-800 border-t border-cyan-700/50 flex items-center px-4 text-lg">
        {item && (<p className="text-cyan-300 font-bold">Displaying: <span className="text-white">{item.id} - {item.title}</span></p>)}
      </div>
    </div>
  );
};

interface Message {
    readonly sender: string;
    readonly text: string;
    readonly timestamp: string;
    readonly align: 'left' | 'right' | 'center';
    readonly isGlitch?: boolean;
}

const Bubble: React.FC<Message> = ({ sender, text, timestamp, align, isGlitch }) => {
    if (align === 'center') return <div className={`text-center my-2 text-base font-bold ${isGlitch ? 'text-red-500 glitch' : 'text-cyan-400'}`} data-text={text}>{text}</div>
    const me = align === 'right';
    return (
        <div className={`flex flex-col my-2 ${me ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-xs md:max-w-md ${me ? 'bg-cyan-800' : 'bg-slate-700'}`}>
                <p className={`font-bold text-lg ${me ? 'text-cyan-200' : 'text-gray-200'}`}>{sender}</p>
                <p className="text-white text-xl whitespace-pre-wrap">{text}</p>
                <div className="flex justify-end items-center mt-1"><p className="text-base text-gray-400 text-right">{timestamp}</p></div>
            </div>
        </div>
    );
};

const Choices: React.FC<{options: readonly ConversationChoice[], pick: (c: ConversationChoice) => void}> = ({ options, pick }) => {
    const handlePick = (c: ConversationChoice) => {
        playSound('ui_click');
        pick(c);
    }
    return (
        <div className="my-4 border-t border-b border-cyan-700/50 py-2">
            <p className="text-center text-cyan-300 font-bold mb-2">Respond:</p>
            <div className="flex flex-col items-center space-y-2">
                {options.map(c => (<button key={c.id} onClick={() => handlePick(c)} className="w-full text-left bg-slate-700 hover:bg-cyan-800/70 p-2 rounded transition-colors text-lg">{c.text}</button>))}
            </div>
        </div>
    );
}

export const SecureMessengerApp: React.FC<AppContentProps> = ({ storyProgress: story = 0, madeChoices: past = {}, onChoice: pick }) => {
  const end = useRef<HTMLDivElement>(null);
  const prevChatLength = useRef(0);

  const chat = useMemo(() => {
    const list: (Message | { options: readonly ConversationChoice[], conversationId: string })[] = [];
    let done = true;
    for (const i of ALL_MESSAGES) {
      if ('unlockedAt' in i && i.unlockedAt && story < i.unlockedAt) continue;
      if ('choices' in i) {
        const picked = past[i.conversationId];
        if (picked) {
            const option = i.choices.find(c => c.id === picked);
            if (option) list.push({ sender: 'AGENT_77', text: option.text, timestamp: '', align: 'right' });
            done = true;
        } else {
          list.push({ options: i.choices, conversationId: i.conversationId });
          done = false;
        }
      } else {
        if ('dependsOnChoice' in i && i.dependsOnChoice) {
            const d = i.dependsOnChoice;
            if (!past[d] && !Object.values(past).includes(d)) continue;
        }
        if (done) list.push(i);
      }
    }
    return list;
  }, [story, past]);
  
  useEffect(() => {
      const lastItem = chat.length > 0 ? chat[chat.length-1] : null;
      const isNewMessage = chat.length > prevChatLength.current && lastItem && !('options' in lastItem);

      if (isNewMessage) {
        playSound('new_message', 0.7);
      }
      prevChatLength.current = chat.length;

      setTimeout(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, 100); 
  }, [chat]);

  return (
    <div className="h-full flex flex-col bg-slate-800 text-white">
      <div className="h-12 bg-slate-900 border-b border-cyan-700 flex items-center px-4"><h2 className="font-bold text-cyan-300">SECURE COMMS - CH: 7 (ENCRYPTED)</h2></div>
      <div className="flex-grow p-4 overflow-y-auto bg-slate-900/50">
        {chat.map((item, index) => {
          if ('options' in item) return pick ? <Choices key={index} options={item.options} pick={pick} /> : null;
          return <Bubble key={index} {...item} />;
        })}
        <div ref={end} />
      </div>
      <div className="h-16 bg-slate-900 border-t border-cyan-700 flex items-center p-2">
        <input type="text" placeholder="Message transmission disabled..." disabled className="w-full bg-slate-700 rounded p-2 text-gray-400 focus:outline-none" />
        <button disabled className="ml-2 bg-cyan-700/50 text-white font-bold py-2 px-4 rounded cursor-not-allowed">SEND</button>
      </div>
    </div>
  );
};

export const NotesApp: React.FC<AppContentProps> = ({ password: code }) => {
  return (
    <div className="h-full w-full bg-yellow-100 text-black p-4 text-xl">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">To-Do List</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>Pick up dry cleaning</li>
        <li>Finish quarterly report</li>
        <li className="font-bold">IMPORTANT: Finalize details for project <span className="bg-yellow-300 px-1 rounded">{code}</span> - critical deadline!</li>
        <li>Call mom</li>
      </ul>
      <p className="mt-6 text-lg text-gray-600">Don't forget the password for the secure server.</p>
    </div>
  );
};

export const BrowserApp: React.FC = () => {
  return (
    <div className="h-full w-full bg-white text-black flex flex-col">
      <div className="h-14 bg-gray-200 border-b border-gray-300 flex items-center p-2 space-x-2">
        <div className="flex space-x-1.5"><div className="w-3 h-3 rounded-full bg-gray-400"></div><div className="w-3 h-3 rounded-full bg-gray-400"></div><div className="w-3 h-3 rounded-full bg-gray-400"></div></div>
        <div className="flex-grow bg-white rounded-full h-8 flex items-center px-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span>https://my-personal-space.web/home</span>
        </div>
      </div>
      <div className="flex-grow p-8 overflow-y-auto">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Welcome to my Homepage!</h1>
        <p className="text-2xl text-gray-600 mb-6">Just a little corner of the internet I call my own.</p>
        <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h2 className="text-4xl font-semibold mb-2">About Me</h2>
            <p className="text-gray-700 text-lg">I'm just a regular person, trying to make my way in the world. I enjoy hiking, photography, and spending time with my family. This desktop is mostly for work, but I like to keep a few personal things on here too.</p>
        </div>
        <div className="mt-8">
            <h3 className="text-3xl font-semibold mb-4">My Latest Trip</h3>
            <img src={BROWSER_APP_IMAGES.trip} alt="Vacation" className="rounded-lg shadow-lg w-full pixelated" />
            <p className="text-center text-gray-500 italic mt-2 text-lg">A beautiful view from the mountains last summer.</p>
        </div>
        <div className="mt-12 border-t pt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-700">Comments (1)</h3>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="font-bold text-red-800">Void</p>
            <p className="text-red-700 mt-1">Nice little homepage. A perfect cage you've built for yourself. Do you ever wonder what's outside the walls?</p>
            <p className="text-sm text-gray-500 mt-2">1 hour ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const style1 = "bg-gray-200 hover:bg-gray-300 rounded-md text-4xl font-semibold text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400";
const style2 = "bg-orange-400 hover:bg-orange-500 text-white";
const style3 = "bg-gray-400 hover:bg-gray-500 text-white";

export const CalculatorApp: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [prev, setPrev] = useState<string | null>(null);
    const [op, setOp] = useState<string | null>(null);

    useEffect(() => { if (display === '31337') setDisplay('GHOST'); }, [display]);

    const num = (n: string) => { (display === 'GHOST' || display === 'ERROR' || (display === '0' && n !== '.')) ? setDisplay(n) : setDisplay(p => p + n); };
    const oper = (o: string) => { if (prev) eq(); setPrev(display); setDisplay('0'); setOp(o); };
    const eq = () => {
        if (!op || prev === null) return;
        const a = parseFloat(display); const b = parseFloat(prev); let c: number;
        switch(op) {
            case '+': c = b + a; break;
            case '-': c = b - a; break;
            case '*': c = b * a; break;
            case '/': c = b / a; break;
            default: return;
        }
        setDisplay(String(c)); setPrev(null); setOp(null);
    };
    const clear = () => { setDisplay('0'); setPrev(null); setOp(null); };
    const sign = () => { setDisplay(p => String(parseFloat(p) * -1)); };
    const perc = () => { setDisplay(p => String(parseFloat(p) / 100)); };
    const dot = () => { if (!display.includes('.')) setDisplay(p => p + '.'); }

    const buttonClick = (action: () => void) => {
      playSound('ui_click');
      action();
    }

    return (
        <div className="h-full w-full bg-gray-800 flex flex-col p-2">
            <div className="h-1/5 bg-gray-700 text-white text-8xl text-right p-4 rounded-t-md flex items-end justify-end overflow-hidden"><p className="truncate">{display}</p></div>
            <div className="grid grid-cols-4 gap-2 flex-grow mt-2">
                <button className={`${style1} ${style3}`} onClick={() => buttonClick(clear)}>AC</button>
                <button className={`${style1} ${style3}`} onClick={() => buttonClick(sign)}>+/-</button>
                <button className={`${style1} ${style3}`} onClick={() => buttonClick(perc)}>%</button>
                <button className={`${style1} ${style2}`} onClick={() => buttonClick(() => oper('/'))}>÷</button>
                <button className={style1} onClick={() => buttonClick(() => num('7'))}>7</button>
                <button className={style1} onClick={() => buttonClick(() => num('8'))}>8</button>
                <button className={style1} onClick={() => buttonClick(() => num('9'))}>9</button>
                <button className={`${style1} ${style2}`} onClick={() => buttonClick(() => oper('*'))}>×</button>
                <button className={style1} onClick={() => buttonClick(() => num('4'))}>4</button>
                <button className={style1} onClick={() => buttonClick(() => num('5'))}>5</button>
                <button className={style1} onClick={() => buttonClick(() => num('6'))}>6</button>
                <button className={`${style1} ${style2}`} onClick={() => buttonClick(() => oper('-'))}>−</button>
                <button className={style1} onClick={() => buttonClick(() => num('1'))}>1</button>
                <button className={style1} onClick={() => buttonClick(() => num('2'))}>2</button>
                <button className={style1} onClick={() => buttonClick(() => num('3'))}>3</button>
                <button className={`${style1} ${style2}`} onClick={() => buttonClick(() => oper('+'))}>+</button>
                <button className={`${style1} col-span-2`} onClick={() => buttonClick(() => num('0'))}>0</button>
                <button className={style1} onClick={() => buttonClick(dot)}>.</button>
                <button className={`${style1} ${style2}`} onClick={() => buttonClick(eq)}>=</button>
            </div>
        </div>
    );
};

const pics = [
  { id: 1, title: 'Mountain Sunrise', url: GALLERY_APP_IMAGES.photo1 },
  { id: 2, title: 'City at Night', url: GALLERY_APP_IMAGES.photo2 },
  { id: 3, title: '[DATA_CORRUPTED]', url: GALLERY_APP_IMAGES.corrupted },
  { id: 4, title: 'Beach Sunset', url: GALLERY_APP_IMAGES.photo4 },
  { id: 5, title: 'Abstract Shapes', url: GALLERY_APP_IMAGES.photo5 },
  { id: 6, title: 'Cute Puppy', url: GALLERY_APP_IMAGES.photo6 },
];

export const GalleryApp: React.FC = () => {
  const [pic, setPic] = useState(pics[0]);
  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="flex-grow flex">
        <div className="w-1/3 border-r border-gray-300 overflow-y-auto bg-white">
          <div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-gray-700">My Photos</div>
          <div className="grid grid-cols-2 gap-1 p-1">
            {pics.map(p => (<div key={p.id} onClick={() => setPic(p)} className={`cursor-pointer border-2 ${pic.id === p.id ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400`}><img src={p.url} alt={p.title} className="w-full h-full object-cover pixelated"/></div>))}
          </div>
        </div>
        <div className="w-2/3 p-4 flex items-center justify-center bg-gray-200">{pic && (<img src={pic.url} alt={pic.title} className="max-w-full max-h-full object-contain rounded-md shadow-lg pixelated"/>)}</div>
      </div>
      <div className="h-10 bg-gray-200 border-t border-gray-300 flex items-center px-4 text-lg">{pic && (<p className="text-gray-800 font-semibold">Viewing: <span className="font-normal text-gray-600">{pic.title}</span></p>)}</div>
    </div>
  );
};

const Icon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className}><rect width="256" height="256" fill="none"/><line x1="216" y1="56" x2="40" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="104" y1="104" x2="104" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="152" y1="104" x2="152" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/></svg> );

export const TrashApp: React.FC = () => {
  const [count, setCount] = useState(0);
  const [seen, setSeen] = useState(false);
  const click = () => {
    playSound('ui_click');
    if (seen) return; 
    const next = count + 1; 
    setCount(next); 
    if (next >= 7) setSeen(true); 
  };
  return (
    <div className="h-full w-full bg-gray-100 text-black p-4 text-lg flex flex-col items-center justify-center text-center">
      {!seen ? (
        <>
            <Icon className="w-24 h-24 text-gray-400 mb-4" />
            <h2 className="text-3xl font-bold mb-2">Trash</h2>
            <p className="text-gray-600 mb-6">This folder is empty.</p>
            <button onClick={click} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">Empty Trash</button>
            <p className="text-sm text-gray-400 mt-4">Clicks: {count}</p>
        </>
      ) : (
        <div className="bg-black p-6 rounded-md border border-red-500/50 shadow-2xl shadow-black/50 animate-pulse-slow">
            <h3 className="text-red-500 text-2xl mb-4">[ CORRUPTED_THOUGHT.TXT ]</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{`They think this is my whole world... \njust work and family photos. \n\nThey don't see the real me. \nThey never will. \n\nNot until it's too late.`}</p>
        </div>
      )}
      <style>{`@keyframes pulse-slow { 50% { opacity: .85; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); } } .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`}</style>
    </div>
  );
};
