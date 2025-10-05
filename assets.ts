
// Player Assets
export const PLAYER_GIFS = {
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

// RPG Scene Assets
export const DESK_ASSET = '/assets/scenes/desk.png';
export const LAPTOP_ASSET = '/assets/scenes/laptop.png';
export const WAREHOUSE_BG_ASSET = '/assets/scenes/warehouse_bg.png';
export const TERMINAL_INTERACT_ASSET = '/assets/scenes/terminal_interact.png';
export const CAFE_BG_ASSET = '/assets/scenes/cafe_bg.png';
export const CAFE_PC_ASSET = '/assets/scenes/cafe_pc.png';
export const WORLD_HUB_BG_ASSET = '/assets/scenes/world_hub_bg.png';
export const PORTAL_ASSET = '/assets/scenes/portal.png';
export const FBI_HQ_BG_ASSET = '/assets/scenes/fbi_hq_bg.png';
export const DATACENTER_BG_ASSET = '/assets/scenes/datacenter_bg.png';
export const MAINFRAME_ASSET = '/assets/scenes/mainframe.png';


// App Icons
export const NORMAL_APP_ICONS = {
    notes: '/assets/icons/normal/notes.png',
    calculator: '/assets/icons/normal/calculator.png',
    browser: '/assets/icons/normal/browser.png',
    gallery: '/assets/icons/normal/gallery.png',
    trash: '/assets/icons/normal/trash.png',
    secure_access: '/assets/icons/normal/secure_access.png',
};

export const FBI_APP_ICONS = {
    case_files: '/assets/icons/fbi/case_files.png',
    terminal: '/assets/icons/fbi/terminal.png',
    evidence_viewer: '/assets/icons/fbi/evidence_viewer.png',
    secure_messenger: '/assets/icons/fbi/secure_messenger.png',
};

// Other App Images
export const BROWSER_APP_IMAGES = {
    trip: "/assets/apps/browser/trip.jpg"
};

export const GALLERY_APP_IMAGES = {
    photo1: '/assets/apps/gallery/photo1.jpg',
    photo2: '/assets/apps/gallery/photo2.jpg',
    corrupted: '/assets/apps/gallery/corrupted.png',
    photo4: '/assets/apps/gallery/photo4.jpg',
    photo5: '/assets/apps/gallery/photo5.jpg',
    photo6: '/assets/apps/gallery/photo6.jpg',
};

export const EVIDENCE_VIEWER_IMAGES = {
    ev001: '/assets/apps/evidence/ev001.jpg',
    ev002: '/assets/apps/evidence/ev002.jpg',
    ev003: '/assets/apps/evidence/ev003.jpg',
    ev004: '/assets/apps/evidence/ev004.jpg',
    ev005: '/assets/apps/evidence/ev005.jpg',
    ev006: '/assets/apps/evidence/ev006.jpg',
}

// Audio Assets
export const AUDIO_ASSETS = {
    walk: '/assets/audio/walk.mp3',
};


// Combine all asset URLs into a single array for preloading
export const ALL_ASSET_URLS = [
    ...Object.values(PLAYER_GIFS),
    DESK_ASSET,
    LAPTOP_ASSET,
    WAREHOUSE_BG_ASSET,
    TERMINAL_INTERACT_ASSET,
    CAFE_BG_ASSET,
    CAFE_PC_ASSET,
    WORLD_HUB_BG_ASSET,
    PORTAL_ASSET,
    FBI_HQ_BG_ASSET,
    DATACENTER_BG_ASSET,
    MAINFRAME_ASSET,
    ...Object.values(NORMAL_APP_ICONS),
    ...Object.values(FBI_APP_ICONS),
    ...Object.values(BROWSER_APP_IMAGES),
    ...Object.values(GALLERY_APP_IMAGES),
    ...Object.values(EVIDENCE_VIEWER_IMAGES),
    ...Object.values(AUDIO_ASSETS),
];
