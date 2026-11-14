// Lightweight sound effects for the guided experience.
// Kept separate from the background-music manager so footsteps and doors can
// play while the music remains off.

let ctx = null;
let footstepBuffer = null;

let enabled = true;
try {
    enabled = localStorage.getItem('sketch_sfx_v2') !== '0';
} catch {
    enabled = true;
}

export const isSfxEnabled = () => enabled;

export const setSfxEnabled = (value) => {
    enabled = !!value;
    try {
        localStorage.setItem('sketch_sfx_v2', enabled ? '1' : '0');
    } catch {
        // Ignore storage failures.
    }
    if (enabled) initSfx();
};

export const initSfx = () => {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        try {
            ctx = new AudioCtx();
        } catch {
            return null;
        }
    }
    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }
    return ctx;
};

const getFootstepBuffer = (audioContext) => {
    if (footstepBuffer) return footstepBuffer;
    const length = Math.floor(audioContext.sampleRate * 0.11);
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
        const t = i / length;
        // Short soft tap: filtered noise with a quick decay.
        const envelope = Math.pow(1 - t, 3);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.55;
    }
    footstepBuffer = buffer;
    return buffer;
};

export const playFootstep = () => {
    if (!enabled) return;
    const audioContext = initSfx();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});

    try {
        const source = audioContext.createBufferSource();
        source.buffer = getFootstepBuffer(audioContext);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 480;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.22, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        source.start();
    } catch {
        // Audio is a bonus; never break the walk.
    }
};

export const playWelcome = () => {
    if (!enabled) return;
    const audioContext = initSfx();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});

    try {
        const now = audioContext.currentTime;
        const notes = [
            { freq: 523.25, at: 0, dur: 0.35 },
            { freq: 659.25, at: 0.12, dur: 0.4 },
            { freq: 783.99, at: 0.24, dur: 0.55 },
        ];

        notes.forEach(({ freq, at, dur }) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const start = now + at;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(start);
            osc.stop(start + dur + 0.05);
        });
    } catch {
        // Ignore audio failures.
    }
};

const getDoorAudio = (path, volume, ref) => {
    if (ref.current) return ref.current;
    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = volume;
    ref.current = audio;
    return audio;
};

const openAudioRef = { current: null };
const closeAudioRef = { current: null };

export const playDoorOpen = () => {
    if (!enabled) return;
    initSfx();
    try {
        const audio = getDoorAudio('sounds/otwarciedrzwi.mp3', 0.55, openAudioRef);
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch {
        // Ignore audio failures.
    }
};

export const playDoorClose = () => {
    if (!enabled) return;
    initSfx();
    try {
        const audio = getDoorAudio('sounds/zamknieciedrzwi.mp3', 0.4, closeAudioRef);
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch {
        // Ignore audio failures.
    }
};

