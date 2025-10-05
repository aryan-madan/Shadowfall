import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppContentProps, DialogueChoice } from '../../types';
import { BROWSER_IMAGES, GALLERY_IMAGES, EVIDENCE_IMAGES, playSound } from '../../assets';

export interface Scene {
  id: string;
  name: string;
  description: string;
  worldType: 'office' | 'warehouse' | 'cafe' | null;
  mapCoordinates: { x: number; y: number };
  progressRequirement: number;
}

export const LOCATIONS: Record<string, Scene> = {
  'player_room': { id: 'player_room', name: 'My Apartment', description: 'My small apartment. The new laptop is on the desk.', worldType: 'office', mapCoordinates: { x: 25, y: 40 }, progressRequirement: 0 },
  'tokyo_cyber_cafe': { id: 'tokyo_cyber_cafe', name: 'Net-Dive Cyber Cafe', description: 'An underground internet cafe in Akihabara, Tokyo. Known haunt for information brokers.', worldType: 'cafe', mapCoordinates: { x: 84, y: 42 }, progressRequirement: 1.1 },
};

interface Sacrifice {
    id: string;
    text: string;
    consequence: string;
    healthCost: number;
}

export const CASES = [
  { id: 'CYB-001', title: 'Project Shadowfall', status: 'Active', briefing: 'Investigating a series of cyberattacks against federal financial institutions. Traces point to a sophisticated actor known as "Void".', fullReport: 'Initial breach vector identified as a zero-day exploit in enterprise VPN software. Data exfiltration focused on sensitive economic forecasts. Team is currently analyzing malware samples for attribution.' },
  { 
    id: 'CYB-002', 
    title: "Void's Network", 
    status: 'Locked', 
    briefing: "Data recovered from a Tokyo cyber cafe reveals Void's origins and a complex distributed network used to mask their location.", 
    fullReport: 'DATA FRAGMENT 1:\n"...they built this digital world as a cage. They control the flow of information, the very thoughts we are allowed to have. They call us criminals for seeking knowledge, for wanting to be free. But who is the real criminal? The one who opens a locked door, or the one who built the prison?\n\nThey took everything from me. My research, my name. They buried me in a digital grave. But they forgot one thing... ghosts can haunt the machine."\n\nANALYSIS: Subject displays a deep-seated grudge against a corporate or government entity.\n\nDATA FRAGMENT 2:\n"This is my web. Each node a puppet, dancing on my strings. They chase my shadows across the globe, never realizing I am the one pulling."\n\n[ FURTHER DATA REQUIRES SACRIFICE TO DECRYPT ]', 
    decryptedReport: "The network's central hub is well-hidden. With this decryption, the final protocol is now accessible in case file CYB-003. A final sacrifice will be required.", 
    isEncrypted: true, 
    progressRequirement: 2, 
    sacrifices: [
        { id: 'INTEGRITY_MONITOR', text: 'Sacrifice the System Integrity Monitor.', consequence: "Your system's health will be permanently hidden.", healthCost: 5 },
        { id: 'EVIDENCE_CACHE', text: 'Purge the Evidence Viewer Cache.', consequence: 'The Evidence Viewer will become unstable and glitchy.', healthCost: 10 },
    ] as Sacrifice[]
  },
  { 
    id: 'CYB-003', 
    title: 'The Ghost Protocol', 
    status: 'Locked - CRITICAL', 
    briefing: 'Final message from Void. A great sacrifice must be made to breach the final firewall.', 
    fullReport: "You have reached the core of Void's network. The final protocol is protected by one last layer of security. To proceed, you must sacrifice a core component of your OS, permanently.", 
    isEncrypted: true, 
    progressRequirement: 3.2,
    sacrifices: [
        { id: 'COMMS_UPLINK', text: 'Sacrifice the Secure Comms Uplink.', consequence: 'You will be cut off from Void forever.', healthCost: 20 },
        { id: 'OBJECTIVE_TRACKER', text: 'Sacrifice the Objective Tracker.', consequence: 'You will receive no further mission guidance.', healthCost: 15 },
    ] as Sacrifice[],
    decryptedReport: 'AGENT 77. YOU\'VE MADE IT. YOU\'VE SACRIFICED. NOW YOU HAVE A CHOICE.\n\nOPTION A: EXPOSE EVERYTHING. The corruption, the lies, the program that created me. The system will burn, but from the ashes, something new can grow. The world will know chaos, but it will be a world of truth. This is the path of sacrifice for a greater good.\n\nOPTION B: JOIN ME. Together, we can control the system from within. We can be the ghosts in the machine, manipulating events for what WE believe is right. Order will be maintained, but it will be our order. This is the path of control, of power.\n\nTHE CHOICE IS YOURS. THE PROTOCOL IS IN YOUR HANDS. WHAT WILL YOU SACRIFICE?', 
  },
];

export const MESSAGES = [
    { author: 'CONTROL', text: 'Agent 77, what is your status?', timestamp: '14:32', align: 'left' },
    { author: 'AGENT_77', text: 'Control, I am in position.', timestamp: '14:33', align: 'right' },
    { author: 'CONTROL', text: 'Copy that. Maintain radio silence.', timestamp: '14:33', align: 'left' },
    { author: 'UNKNOWN', text: '...can you hear me?...', timestamp: '15:01', align: 'center', progressRequirement: 1.1, isGlitched: true },
    { author: 'VOID', text: 'Finally. I\'ve bypassed their firewalls. We can speak freely now, Agent 77.', timestamp: '15:02', align: 'left', progressRequirement: 1.1 },
    { dialogueId: 'c0', progressRequirement: 1.1, choices: [
        { id: 'c0a', dialogueId: 'c0', text: 'Who is this? Identify yourself.', healthChange: -5, progressChange: 0.1 },
        { id: 'c0b', dialogueId: 'c0', text: 'How did you get this number?', healthChange: 0, progressChange: 0.1 },
        { id: 'c0c', dialogueId: 'c0', text: '[Say nothing and attempt to trace]', healthChange: 5, progressChange: 0.1 },
    ]},
    { author: 'VOID', text: 'Clever. But you can\'t trace a ghost.', timestamp: '15:03', align: 'left', progressRequirement: 1.2, requiresChoice: 'c0c' },
    { author: 'VOID', text: 'Call me Void. I know you\'ve been looking for me. But you\'re just a pawn in their game, chasing shadows they want you to see.', timestamp: '15:03', align: 'left', progressRequirement: 1.2, requiresChoice: 'c0' },
    { author: 'VOID', text: 'You want to find the truth? Go where the sun rises. Look for the Net-Dive. Your move, Agent. - V', timestamp: '15:04', align: 'left', progressRequirement: 1.2, requiresChoice: 'c0' },
    { author: 'SYSTEM', text: '*** TRACE FAILED | SOURCE UNKNOWN ***', timestamp: '15:06', align: 'center', progressRequirement: 1.2, requiresChoice: 'c0' },
    { author: 'VOID', text: 'Persistent. The Agency preaches sacrifice for the greater good, but it is always someone else\'s sacrifice. Never their own.', timestamp: '18:15', align: 'left', progressRequirement: 2.1 },
    { author: 'VOID', text: 'To find the real truth, sometimes you have to sacrifice a piece of yourself. Are you ready?', timestamp: '18:16', align: 'left', progressRequirement: 2.1 },
     { dialogueId: 'c1', progressRequirement: 2.1, choices: [
        { id: 'c1a', dialogueId: 'c1', text: 'I am an FBI agent. I serve my country.', healthChange: 0, progressChange: 0.1 },
        { id: 'c1b', dialogueId: 'c1', text: 'What do you want from me?', healthChange: -5, progressChange: 0.1 },
        { id: 'c1c', dialogueId: 'c1', text: 'I\'m starting to understand.', healthChange: 10, progressChange: 0.1 },
    ]},
    { author: 'VOID', text: 'The final piece is within your grasp. Access your case files. The heart of the machine awaits your sacrifice.', timestamp: '18:18', align: 'left', progressRequirement: 3.1, requiresChoice: 'c1' },
] as const;

export const CaseFilesApp: React.FC<AppContentProps> = ({ story = 0, onChoice, onDisableSystem, onAdvanceStory }) => {
  const files = useMemo(() => CASES.filter(f => !f.progressRequirement || story >= f.progressRequirement), [story]);
  const [file, setFile] = useState(files[0]);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  
  const sacrifice = (s: Sacrifice) => {
    playSound('decryption_success');
    onDisableSystem?.(s.id, s.healthCost);
    if (file?.id) {
        setKeys(p => ({ ...p, [file.id]: true }));
        if (file.id === 'CYB-002') onAdvanceStory?.(1.1);
        else if (file.id === 'CYB-003') onAdvanceStory?.(0.8);
    }
  };

  const finalChoice = (c: DialogueChoice) => { playSound('ui_click'); onChoice?.(c); };
  
  const renderSacrifices = (title: string, options: Sacrifice[]) => (
    <div className="mt-4 p-4 border border-dashed border-red-500/50 bg-red-900/20">
        <h4 className="text-red-400 font-bold mb-3 text-xl">{title}</h4>
        <div className="space-y-3">
            {options.map(s => (
                <button key={s.id} onClick={() => sacrifice(s)} className="w-full text-left bg-slate-700 hover:bg-red-800/70 p-3 rounded transition-colors">
                    <p className="font-bold text-lg">{s.text}</p>
                    <p className="text-gray-400 text-base">{s.consequence}</p>
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <div className="h-full flex text-lg bg-black/20 text-cyan-300">
      <div className="w-1/3 border-r border-cyan-700/50 overflow-y-auto">
        <div className="p-2 bg-slate-800 border-b border-cyan-700/50 font-bold">CASE FILES</div>
        <ul>{files.map(f => (<li key={f.id} onClick={() => setFile(f)} className={`p-2 cursor-pointer border-b border-slate-700 hover:bg-cyan-800/50 ${file?.id === f.id ? 'bg-cyan-600/30' : ''}`}><div className="font-bold">{f.id}</div><div className="text-base text-gray-400">{f.title}</div><div className={`text-base mt-1 font-bold ${f.status.includes('Active') ? 'text-red-500' : 'text-green-500'}`}>{f.status}</div></li>))}</ul>
      </div>
      <div className="w-2/3 p-4 overflow-y-auto">
        {file ? (
          <div>
            <h2 className="text-3xl font-bold">{file.id}: {file.title}</h2>
            <p className={`my-2 text-2xl ${file.status.includes('Active') ? 'text-red-400' : 'text-green-400'}`}>STATUS: {file.status}</p>
            <div className="mt-4"><h3 className="font-bold border-b border-cyan-700/50 pb-1 mb-2">SUMMARY</h3><p className="text-gray-300">{file.briefing}</p></div>
            <div className="mt-6">
              <h3 className="font-bold border-b border-cyan-700/50 pb-1 mb-2">DETAILS</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{file.fullReport}</p>
              {file.id === 'CYB-003' && onChoice && story >= 4 && (
                <div className="mt-6">
                    <p className="text-gray-300 whitespace-pre-wrap mt-2">{file.decryptedReport}</p>
                    <div className="mt-6 flex space-x-4">
                    <button onClick={() => finalChoice({ id: 'A', dialogueId: 'final_choice', text: 'Expose' })} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-4 rounded transition-colors text-xl">EXPOSE EVERYTHING</button>
                    <button onClick={() => finalChoice({ id: 'B', dialogueId: 'final_choice', text: 'Join' })} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded transition-colors text-xl">JOIN VOID</button>
                    </div>
                </div>
              )}
              {file.isEncrypted && !keys[file.id] && file.sacrifices && renderSacrifices('CHOOSE SACRIFICE TO PROCEED:', file.sacrifices)}
              {file.isEncrypted && keys[file.id] && file.id !== 'CYB-003' && (
                <div className="mt-4 p-4 border border-dashed border-green-500/50 bg-green-900/20"><p className="text-green-400 font-bold">[ DECRYPTION COMPLETE ]</p><p className="text-gray-300 whitespace-pre-wrap mt-2">{file.decryptedReport}</p></div>
              )}
            </div>
          </div>
        ) : (<div className="flex items-center justify-center h-full">Select a case file.</div>)}
      </div>
    </div>
  );
};

const evidence = [
  { id: 'EV-001', type: 'image', title: 'Satellite Imagery - Compound', url: EVIDENCE_IMAGES.ev001 },
  { id: 'EV-002', type: 'image', title: 'Recovered Hard Drive', url: EVIDENCE_IMAGES.ev002 },
  { id: 'EV-003', type: 'image', title: 'CCTV - Suspect Vehicle', url: EVIDENCE_IMAGES.ev003 },
  { id: 'EV-004', type: 'image', title: 'Crime Scene Photo A', url: EVIDENCE_IMAGES.ev004 },
  { id: 'EV-005', type: 'image', title: 'Decrypted File Fragment', url: EVIDENCE_IMAGES.ev005 },
  { id: 'EV-006', type: 'image', title: 'Facial Recognition Match', url: EVIDENCE_IMAGES.ev006 },
];

export const EvidenceViewerApp: React.FC<AppContentProps> = ({ disabledSystems = [] }) => {
  const [item, setItem] = useState(evidence[0]);
  const isUnstable = disabledSystems.includes('EVIDENCE_CACHE');

  return (
    <div className="h-full flex flex-col bg-black/30 relative">
      {isUnstable && <div className="absolute inset-0 scanlines z-10 pointer-events-none" style={{ animationDuration: '1s', opacity: 0.5}} />}
      <div className="flex-grow flex">
        <div className="w-1/4 border-r border-cyan-700/50 overflow-y-auto">
          <div className="p-2 bg-slate-800 border-b border-cyan-700/50 font-bold text-cyan-300">EVIDENCE LOCKER</div>
          <ul>{evidence.map(i => (<li key={i.id} onClick={() => setItem(i)} className={`p-2 cursor-pointer border-b border-slate-700 hover:bg-cyan-800/50 ${item.id === i.id ? 'bg-cyan-600/30' : ''}`}><div className="font-bold text-cyan-400">{i.id}</div><div className="text-base text-gray-300">{i.title}</div></li>))}</ul>
        </div>
        <div className={`w-3/4 p-4 flex items-center justify-center bg-black relative`}>
          {isUnstable && <div className="absolute inset-0 glitch-bg z-20 pointer-events-none" />}
          {item && (<img src={item.url} alt={item.title} className="max-w-full max-h-full object-contain"/>)}
        </div>
      </div>
      <div className="h-12 bg-slate-800 border-t border-cyan-700/50 flex items-center px-4 text-lg">
        {item && (<p className="text-cyan-300 font-bold">Displaying: <span className="text-white">{item.id} - {item.title}</span></p>)}
        {isUnstable && <p className="ml-auto text-red-500 font-bold animate-pulse">CACHE UNSTABLE</p>}
      </div>
      <style>{`@keyframes glitch-bg-anim{0%{clip-path:inset(45% 0 56% 0)}20%{clip-path:inset(5% 0 90% 0)}40%{clip-path:inset(23% 0 33% 0)}60%{clip-path:inset(80% 0 10% 0)}80%{clip-path:inset(40% 0 45% 0)}100%{clip-path:inset(50% 0 30% 0)}}.glitch-bg::after{content:'';position:absolute;inset:0;background:rgba(100,0,0,0.1);animation:glitch-bg-anim 3s infinite linear alternate-reverse}`}</style>
    </div>
  );
};

const Bubble: React.FC<{msg: any}> = ({ msg }) => {
    if (msg.align === 'center') return <div className={`text-center my-2 text-base font-bold ${msg.isGlitched ? 'glitch text-red-500' : 'text-cyan-400'}`} data-text={msg.text}>{msg.text}</div>
    const isPlayer = msg.align === 'right';
    return (<div className={`flex flex-col my-2 ${isPlayer ? 'items-end' : 'items-start'}`}><div className={`rounded-lg px-3 py-2 max-w-xs md:max-w-md ${isPlayer ? 'bg-cyan-800' : 'bg-slate-700'}`}><p className={`font-bold text-lg ${isPlayer ? 'text-cyan-200' : 'text-gray-200'}`}>{msg.author}</p><p className="text-white text-xl whitespace-pre-wrap">{msg.text}</p><div className="flex justify-end items-center mt-1"><p className="text-base text-gray-400 text-right">{msg.timestamp}</p></div></div></div>);
};

const Choices: React.FC<{options: readonly DialogueChoice[], onSelect: (c: DialogueChoice) => void}> = ({ options, onSelect }) => {
    const select = (c: DialogueChoice) => { playSound('ui_click'); onSelect(c); }
    return (<div className="my-4 border-t border-b border-cyan-700/50 py-2"><p className="text-center text-cyan-300 font-bold mb-2">Respond:</p><div className="flex flex-col items-center space-y-2">{options.map(c => (<button key={c.id} onClick={() => select(c)} className="w-full text-left bg-slate-700 hover:bg-cyan-800/70 p-2 rounded transition-colors text-lg">{c.text}</button>))}</div></div>);
}

export const SecureMessengerApp: React.FC<AppContentProps> = ({ story = 0, choices = {}, onChoice, disabledSystems = [] }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);
  const isOffline = disabledSystems.includes('COMMS_UPLINK');

  const chat = useMemo(() => {
    const history: any[] = [];
    let showNext = true;
    for (const msg of MESSAGES) {
      if (isOffline && 'author' in msg && msg.author === 'VOID' && 'progressRequirement' in msg && msg.progressRequirement > 3.2) continue;
      if ('progressRequirement' in msg && msg.progressRequirement && story < msg.progressRequirement) continue;
      if ('choices' in msg) {
        const picked = choices[msg.dialogueId];
        if (picked) {
            const opt = msg.choices.find(c => c.id === picked);
            if (opt) history.push({ author: 'AGENT_77', text: opt.text, timestamp: '', align: 'right' });
            showNext = true;
        } else {
          history.push({ options: msg.choices, dialogueId: msg.dialogueId });
          showNext = false;
        }
      } else {
        if ('requiresChoice' in msg && msg.requiresChoice) {
            if (!choices[msg.requiresChoice] && !Object.values(choices).includes(msg.requiresChoice)) continue;
        }
        if (showNext) history.push(msg);
      }
    }
    if (isOffline) history.push({ author: 'SYSTEM', text: '*** SECURE UPLINK SEVERED ***', timestamp: '', align: 'center', isGlitched: true });
    return history;
  }, [story, choices, isOffline]);
  
  useEffect(() => {
      const last = chat.length > 0 ? chat[chat.length-1] : null;
      if (chat.length > prevCount.current && last && !('options' in last)) playSound('new_message', 0.7);
      prevCount.current = chat.length;
      setTimeout(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100); 
  }, [chat]);

  return (
    <div className="h-full flex flex-col bg-slate-800 text-white">
      <div className="h-12 bg-slate-900 border-b border-cyan-700 flex items-center px-4"><h2 className="font-bold text-cyan-300">SECURE COMMS - CH: 7 (ENCRYPTED)</h2></div>
      <div className="flex-grow p-4 overflow-y-auto bg-slate-900/50">
        {chat.map((item, i) => ('options' in item) ? (onChoice ? <Choices key={i} options={item.options} onSelect={onChoice} /> : null) : <Bubble key={i} msg={item} />)}
        <div ref={endRef} />
      </div>
      <div className="h-16 bg-slate-900 border-t border-cyan-700 flex items-center p-2">
        <input type="text" placeholder={isOffline ? 'CONNECTION TERMINATED' : "Message transmission disabled..."} disabled className="w-full bg-slate-700 rounded p-2 text-gray-400 focus:outline-none" />
        <button disabled className="ml-2 bg-cyan-700/50 text-white font-bold py-2 px-4 rounded cursor-not-allowed">SEND</button>
      </div>
    </div>
  );
};

export const NotesApp: React.FC<AppContentProps> = ({ password }) => {
  return (<div className="h-full w-full bg-yellow-100 text-black p-4 text-xl"><h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">To-Do List</h2><ul className="list-disc list-inside space-y-2"><li>Pick up dry cleaning</li><li>Finish quarterly report</li><li className="font-bold">IMPORTANT: Finalize details for project <span className="bg-yellow-300 px-1 rounded">{password}</span> - critical deadline!</li><li>Call mom</li></ul><p className="mt-6 text-lg text-gray-600">Don't forget the password for the secure server.</p></div>);
};

export const BrowserApp: React.FC = () => {
  return (
    <div className="h-full w-full bg-white text-black flex flex-col">
      <div className="h-14 bg-gray-200 border-b border-gray-300 flex items-center p-2 space-x-2"><div className="flex space-x-1.5"><div className="w-3 h-3 rounded-full bg-gray-400"></div><div className="w-3 h-3 rounded-full bg-gray-400"></div><div className="w-3 h-3 rounded-full bg-gray-400"></div></div><div className="flex-grow bg-white rounded-full h-8 flex items-center px-4 text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><span>https://my-personal-space.web/home</span></div></div>
      <div className="flex-grow p-8 overflow-y-auto"><h1 className="text-6xl font-bold text-gray-800 mb-4">Welcome to my Homepage!</h1><p className="text-2xl text-gray-600 mb-6">Just a little corner of the internet I call my own.</p><div className="bg-gray-100 p-6 rounded-lg shadow"><h2 className="text-4xl font-semibold mb-2">About Me</h2><p className="text-gray-700 text-lg">I'm just a regular person, trying to make my way in the world. I enjoy hiking, photography, and spending time with my family. This desktop is mostly for work, but I like to keep a few personal things on here too.</p></div><div className="mt-8"><h3 className="text-3xl font-semibold mb-4">My Latest Trip</h3><img src={BROWSER_IMAGES.trip} alt="Vacation" className="rounded-lg shadow-lg w-full" /><p className="text-center text-gray-500 italic mt-2 text-lg">A beautiful view from the mountains last summer.</p></div><div className="mt-12 border-t pt-8"><h3 className="text-2xl font-semibold mb-4 text-gray-700">Comments (1)</h3><div className="bg-red-50 border border-red-200 p-4 rounded-lg"><p className="font-bold text-red-800">Void</p><p className="text-red-700 mt-1">Nice little homepage. A perfect cage you've built for yourself. Do you ever wonder what's outside the walls?</p><p className="text-sm text-gray-500 mt-2">1 hour ago</p></div></div></div>
    </div>
  );
};

const btnStyle = "bg-gray-200 hover:bg-gray-300 rounded-md text-3xl font-semibold text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400";
const opStyle = "bg-orange-400 hover:bg-orange-500 text-white";
const fnStyle = "bg-gray-400 hover:bg-gray-500 text-white";

export const CalculatorApp: React.FC = () => {
    const [val, setVal] = useState('0');
    const [prev, setPrev] = useState<string | null>(null);
    const [op, setOp] = useState<string | null>(null);

    useEffect(() => { if (val === '31337') setVal('GHOST'); }, [val]);

    const num = (n: string) => { (val === 'GHOST' || val === 'ERROR' || (val === '0' && n !== '.')) ? setVal(n) : setVal(p => p + n); };
    const oper = (o: string) => { if (prev) eq(); setPrev(val); setVal('0'); setOp(o); };
    const eq = () => {
        if (!op || prev === null) return;
        const a = parseFloat(val);
        const b = parseFloat(prev);

        if (op === '+' && ((a === 6 && b === 7) || (a === 7 && b === 6))) {
            playSound('sixtyseven', 1);
            setVal('67');
            setPrev(null);
            setOp(null);
            return;
        }

        let c: number;
        switch(op) {
            case '+': c = b + a; break;
            case '-': c = b - a; break;
            case '*': c = b * a; break;
            case '/': c = b / a; break;
            default: return;
        }
        setVal(String(isFinite(c) ? c : 'ERROR'));
        setPrev(null);
        setOp(null);
    };
    const clear = () => { setVal('0'); setPrev(null); setOp(null); };
    const sign = () => { setVal(p => String(parseFloat(p) * -1)); };
    const perc = () => { setVal(p => String(parseFloat(p) / 100)); };
    const dot = () => { if (!val.includes('.')) setVal(p => p + '.'); }
    const click = (action: () => void) => { playSound('ui_click'); action(); }

    const getDisplayFontSize = () => {
        const len = val.length;
        if (len > 14) return 'text-4xl';
        if (len > 10) return 'text-5xl';
        if (len > 7) return 'text-6xl';
        return 'text-7xl';
    };

    return (
        <div className="h-full w-full bg-gray-800 flex flex-col p-2">
            <div className="h-1/5 bg-gray-700 text-white text-right px-4 py-2 rounded-t-md flex items-end justify-end overflow-hidden">
                <p className={`${getDisplayFontSize()} leading-none`}>{val}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 flex-grow mt-2">
                <button className={`${btnStyle} ${fnStyle}`} onClick={() => click(clear)}>AC</button>
                <button className={`${btnStyle} ${fnStyle}`} onClick={() => click(sign)}>+/-</button>
                <button className={`${btnStyle} ${fnStyle}`} onClick={() => click(perc)}>%</button>
                <button className={`${btnStyle} ${opStyle}`} onClick={() => click(() => oper('/'))}>÷</button>
                <button className={btnStyle} onClick={() => click(() => num('7'))}>7</button>
                <button className={btnStyle} onClick={() => click(() => num('8'))}>8</button>
                <button className={btnStyle} onClick={() => click(() => num('9'))}>9</button>
                <button className={`${btnStyle} ${opStyle}`} onClick={() => click(() => oper('*'))}>×</button>
                <button className={btnStyle} onClick={() => click(() => num('4'))}>4</button>
                <button className={btnStyle} onClick={() => click(() => num('5'))}>5</button>
                <button className={btnStyle} onClick={() => click(() => num('6'))}>6</button>
                <button className={`${btnStyle} ${opStyle}`} onClick={() => click(() => oper('-'))}>−</button>
                <button className={btnStyle} onClick={() => click(() => num('1'))}>1</button>
                <button className={btnStyle} onClick={() => click(() => num('2'))}>2</button>
                <button className={btnStyle} onClick={() => click(() => num('3'))}>3</button>
                <button className={`${btnStyle} ${opStyle}`} onClick={() => click(() => oper('+'))}>+</button>
                <button className={`${btnStyle} col-span-2`} onClick={() => click(() => num('0'))}>0</button>
                <button className={btnStyle} onClick={() => click(dot)}>.</button>
                <button className={`${btnStyle} ${opStyle}`} onClick={() => click(eq)}>=</button>
            </div>
        </div>
    );
};

const pics = [
  { id: 1, title: 'Mountain Sunrise', url: GALLERY_IMAGES.photo1 }, { id: 2, title: 'City at Night', url: GALLERY_IMAGES.photo2 },
  { id: 3, title: '[DATA_CORRUPTED]', url: GALLERY_IMAGES.corrupted }, { id: 4, title: 'Beach Sunset', url: GALLERY_IMAGES.photo4 },
  { id: 5, title: 'Abstract Shapes', url: GALLERY_IMAGES.photo5 }, { id: 6, title: 'Cute Puppy', url: GALLERY_IMAGES.photo6 },
];

export const GalleryApp: React.FC = () => {
  const [pic, setPic] = useState(pics[0]);
  return (<div className="h-full flex flex-col bg-gray-100"><div className="flex-grow flex"><div className="w-1/3 border-r border-gray-300 overflow-y-auto bg-white"><div className="p-3 bg-gray-200 border-b border-gray-300 font-bold text-gray-700">My Photos</div><div className="grid grid-cols-2 gap-1 p-1">{pics.map(p => (<div key={p.id} onClick={() => setPic(p)} className={`cursor-pointer border-2 ${pic.id === p.id ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400`}><img src={p.url} alt={p.title} className="w-full h-full object-cover"/></div>))}</div></div><div className="w-2/3 p-4 flex items-center justify-center bg-gray-200">{pic && (<img src={pic.url} alt={pic.title} className="max-w-full max-h-full object-contain rounded-md shadow-lg"/>)}</div></div><div className="h-10 bg-gray-200 border-t border-gray-300 flex items-center px-4 text-lg">{pic && (<p className="text-gray-800 font-semibold">Viewing: <span className="font-normal text-gray-600">{pic.title}</span></p>)}</div></div>);
};

const TrashSVG: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className}><rect width="256" height="256" fill="none"/><line x1="216" y1="56" x2="40" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="104" y1="104" x2="104" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><line x1="152" y1="104" x2="152" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/><path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/></svg> );

export const TrashApp: React.FC = () => {
  const [clicks, setClicks] = useState(0);
  const [found, setFound] = useState(false);
  const click = () => { playSound('ui_click'); if (found) return; const n = clicks + 1; setClicks(n); if (n >= 7) setFound(true); };
  return (
    <div className="h-full w-full bg-gray-100 text-black p-4 text-lg flex flex-col items-center justify-center text-center">
      {!found ? (<><TrashSVG className="w-24 h-24 text-gray-400 mb-4" /><h2 className="text-3xl font-bold mb-2">Trash</h2><p className="text-gray-600 mb-6">This folder is empty.</p><button onClick={click} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">Empty Trash</button><p className="text-sm text-gray-400 mt-4">Clicks: {clicks}</p></>) : (<div className="bg-black p-6 rounded-md border border-red-500/50 shadow-2xl shadow-black/50 animate-pulse-slow"><h3 className="text-red-500 text-2xl mb-4">[ CORRUPTED_THOUGHT.TXT ]</h3><p className="text-gray-300 whitespace-pre-wrap">{`They think this is my whole world... \njust work and family photos. \n\nThey don't see the real me. \nThey never will. \n\nNot until it's too late.`}</p></div>)}
      <style>{`@keyframes pulse-slow { 50% { opacity: .85; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); } } .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`}</style>
    </div>
  );
};