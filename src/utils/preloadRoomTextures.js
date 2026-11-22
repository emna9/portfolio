import { useTexture } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import {
    filterTexturesByDevice,
    GALLERY_TEXTURES,
    ABOUT_TEXTURES,
    CONTACT_TEXTURES,
} from '../config/texturePreloadList';

const supportsHover = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: hover)').matches;

// The gallery component renders projects, experience, rewards and
// extracurricular cards, so they share the same texture set.
const ROOM_TEXTURES = {
    gallery: GALLERY_TEXTURES,
    experience: GALLERY_TEXTURES,
    rewards: GALLERY_TEXTURES,
    extracurricular: GALLERY_TEXTURES,
    about: ABOUT_TEXTURES,
    contact: CONTACT_TEXTURES,
};

const started = new Set();

/**
 * Kick off the textures of a room as soon as the visitor asks for it, so the
 * door can wait for a real room instead of opening onto an empty stage.
 */
export const preloadRoomTextures = (roomId) => {
    const list = ROOM_TEXTURES[roomId];
    if (!list) return;

    filterTexturesByDevice(list, supportsHover).forEach((path) => {
        if (started.has(path)) return;
        started.add(path);
        try {
            useTexture.preload(path);
            useLoader.preload(TextureLoader, path);
        } catch {
            // Ignore paths that are not valid textures.
        }
    });
};
