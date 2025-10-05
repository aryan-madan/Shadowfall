export const PLAYER_SPRITES = {
    up: '/assets/player/walkingup.gif',
    topleft: '/assets/player/walkingupleft.gif',
    left: '/assets/player/walkingleft.gif',
    bottomleft: '/assets/player/walkingdownleft.gif',
    down: '/assets/player/walkingdown.gif',
    bottomright: '/assets/player/walkingdownright.gif',
    right: '/assets/player/walkingright.gif',
    topright: '/assets/player/walkingupright.gif',
    idle: '/assets/player/idle.gif',
};

export const DESK_IMAGE = '/assets/scenes/desk.png';
export const LAPTOP_IMAGE = '/assets/scenes/laptop.png';
export const CAFE_BACKGROUND_IMAGE = '/assets/scenes/cafe_bg.png';
export const TRAVEL_MENU_BACKGROUND_IMAGE = '/assets/scenes/world_map_bg.png';
export const EXIT_PORTAL_IMAGE = '/assets/scenes/portal.png';
export const APARTMENT_BACKGROUND_IMAGE = '/assets/scenes/apartment.png';

export const PERSONAL_APP_ICONS = {
    notes: '/assets/icons/normal/notes.png',
    calculator: '/assets/icons/normal/calculator.png',
    browser: '/assets/icons/normal/browser.png',
    gallery: '/assets/icons/normal/gallery.png',
    trash: '/assets/icons/normal/trash.png',
    secure_access: '/assets/icons/normal/secure_access.png',
};

export const AGENT_APP_ICONS = {
    case_files: '/assets/icons/fbi/case_files.png',
    evidence_viewer: '/assets/icons/fbi/evidence_viewer.png',
    secure_messenger: '/assets/icons/fbi/secure_messenger.png',
};

export const BROWSER_IMAGES = {
    trip: "https://source.unsplash.com/800x600/?nature,mountain"
};

export const GALLERY_IMAGES = {
    photo1: 'https://source.unsplash.com/400x400/?sunrise,mountain',
    photo2: 'https://source.unsplash.com/400x400/?city,night',
    corrupted: '/assets/apps/gallery/corrupted.png',
    photo4: 'https://source.unsplash.com/400x400/?beach,sunset',
    photo5: 'https://source.unsplash.com/400x400/?abstract',
    photo6: 'https://source.unsplash.com/400x400/?puppy',
};

export const EVIDENCE_IMAGES = {
    ev001: 'https://source.unsplash.com/600x400/?satellite,compound',
    ev002: 'https://source.unsplash.com/600x400/?technology,harddrive',
    ev003: 'https://source.unsplash.com/600x400/?car,cctv',
    ev004: 'https://source.unsplash.com/600x400/?crime,scene',
    ev005: 'https://source.unsplash.com/600x400/?code,binary',
    ev006: 'https://source.unsplash.com/600x400/?person,surveillance',
}

export const SFX = {
    walk: '/assets/audio/walk.mp3',
    ui_click: '/assets/audio/ui_click.mp3',
    window_open: '/assets/audio/window_open.mp3',
    window_close: '/assets/audio/window_close.mp3',
    window_minimize: '/assets/audio/window_minimize.mp3',
    terminal_keystroke: '/assets/audio/terminal_keystroke.mp3',
    new_message: '/assets/audio/new_message.mp3',
    new_objective: '/assets/audio/new_objective.mp3',
    login_success: '/assets/audio/login_success.mp3',
    login_fail: '/assets/audio/login_fail.mp3',
    logout: '/assets/audio/logout.mp3',
    decryption_success: '/assets/audio/decryption_success.mp3',
    decryption_fail: '/assets/audio/decryption_fail.mp3',
    system_damage: '/assets/audio/system_damage.mp3',
    system_crash: '/assets/audio/system_crash.mp3',
    pause_in: '/assets/audio/pause_in.mp3',
    pause_out: '/assets/audio/pause_out.mp3',
    rpg_interact: '/assets/audio/rpg_interact.mp3',
    rpg_portal: '/assets/audio/rpg_portal.mp3',
    bg_music: '/assets/audio/bg_music.mp3',
    sixtyseven: '/assets/audio/sixtyseven.mp3',
};

export const ASSET_URLS = [
    ...Object.values(PLAYER_SPRITES),
    DESK_IMAGE,
    LAPTOP_IMAGE,
    CAFE_BACKGROUND_IMAGE,
    TRAVEL_MENU_BACKGROUND_IMAGE,
    EXIT_PORTAL_IMAGE,
    APARTMENT_BACKGROUND_IMAGE,
    ...Object.values(PERSONAL_APP_ICONS),
    ...Object.values(AGENT_APP_ICONS),
    ...Object.values(BROWSER_IMAGES),
    ...Object.values(GALLERY_IMAGES),
    ...Object.values(EVIDENCE_IMAGES),
    ...Object.values(SFX),
];

const soundCache: Partial<Record<keyof typeof SFX, HTMLAudioElement>> = {};
const soundPool: Partial<Record<keyof typeof SFX, HTMLAudioElement[]>> = {};
const SOUND_POOL_SIZE = 5;

const getSoundFromCache = (sound: keyof typeof SFX): HTMLAudioElement | null => {
    if (soundCache[sound]) {
        return soundCache[sound];
    }
    const soundUrl = SFX[sound];
    if (soundUrl) {
        const soundElement = new Audio(soundUrl);
        soundCache[sound] = soundElement;
        return soundElement;
    }
    console.error(`Sound file not found for: ${sound}`);
    return null;
}

const getSoundFromPool = (sound: keyof typeof SFX): HTMLAudioElement | null => {
    const soundUrl = SFX[sound];
    if (!soundUrl) {
        console.error(`Sound file not found for: ${sound}`);
        return null;
    }

    if (!soundPool[sound]) {
        soundPool[sound] = Array.from({ length: SOUND_POOL_SIZE }, () => new Audio(soundUrl));
    }
    
    const pool = soundPool[sound]!;
    const availableSound = pool.find(audio => audio.paused);

    if (availableSound) {
        return availableSound;
    }
    
    const recycledSound = pool.shift();
    if(recycledSound) pool.push(recycledSound);
    return recycledSound ?? null;
}

export const playSound = (sound: keyof typeof SFX, volume: number = 0.5, usePool: boolean = false) => {
     try {
        const audio = usePool ? getSoundFromPool(sound) : getSoundFromCache(sound);
        if (audio) {
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(e => {}); 
        }
     } catch (e) {
         console.error("Error playing sound", e);
     }
};