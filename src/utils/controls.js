// Global control state shared by the 3D camera hook and the DOM UI.
// Kept outside React so the render loop can read it without re-rendering.

const locks = new Set();

export const lockControls = (reason) => {
    if (reason) locks.add(reason);
};

export const unlockControls = (reason) => {
    if (reason) locks.delete(reason);
};

export const isLocked = () => locks.size > 0;

// Virtual (touch) movement axis, values in [-1, 1]
const virtual = { forward: 0, strafe: 0 };

export const setVirtualAxis = (forward, strafe) => {
    virtual.forward = Math.max(-1, Math.min(1, forward || 0));
    virtual.strafe = Math.max(-1, Math.min(1, strafe || 0));
};

export const getVirtualAxis = () => virtual;

// Live movement state for the avatar guide (updated by the camera hook).
const movement = { moving: false, strafe: 0 };

export const setMovementState = (moving, strafe = 0) => {
    movement.moving = !!moving;
    movement.strafe = Math.max(-1, Math.min(1, strafe || 0));
};

export const getMovementState = () => movement;

// When a recruiter chooses a section from the landing nav, skip the cinematic intro.
let skipIntro = false;

export const setSkipIntro = (value) => {
    skipIntro = !!value;
};

export const shouldSkipIntro = () => skipIntro;

// Entrance door opening: hide the landing avatar while the camera flies in.
let entranceOpening = false;

export const setEntranceOpening = (value) => {
    entranceOpening = !!value;
};

export const isEntranceOpening = () => entranceOpening;

// The landing "enter" action can be clicked before the lazy 3D experience has
// mounted its entrance-door listener. Remember the request so the doors can
// act on it as soon as they are ready instead of dropping the click.
let enterHouseRequested = false;

export const requestEnterHouse = () => {
    enterHouseRequested = true;
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sketch-enter-house'));
    }
};

export const consumeEnterHouseRequest = () => {
    const requested = enterHouseRequested;
    enterHouseRequested = false;
    return requested;
};

// Cinematic intro: look back at the main entrance door first.
let introLookBack = false;
let introCameraBusy = false;

export const setIntroLookBack = (value) => {
    introLookBack = !!value;
};

export const isIntroLookBack = () => introLookBack;

export const setIntroCameraBusy = (value) => {
    introCameraBusy = !!value;
};

export const isIntroCameraBusy = () => introCameraBusy;

// First-person / eye-level preference
let povEnabled = false;
try {
    povEnabled = localStorage.getItem('sketch_pov') === '1';
} catch {
    povEnabled = false;
}

export const getPov = () => povEnabled;

export const setPov = (value) => {
    povEnabled = !!value;
    try {
        localStorage.setItem('sketch_pov', povEnabled ? '1' : '0');
    } catch {
        // Storage can be unavailable in private mode - ignore.
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('povchange', { detail: povEnabled }));
    }
};

// Tutorial completion flag
const TUTORIAL_KEY = 'sketch_tutorial_done';

export const hasSeenTutorial = () => {
    try {
        return localStorage.getItem(TUTORIAL_KEY) === '1';
    } catch {
        return false;
    }
};

export const markTutorialSeen = () => {
    try {
        localStorage.setItem(TUTORIAL_KEY, '1');
    } catch {
        // Ignore storage failures.
    }
};

export const resetTutorialSeen = () => {
    try {
        localStorage.removeItem(TUTORIAL_KEY);
    } catch {
        // Ignore storage failures.
    }
};
