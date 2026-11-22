import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext';

/**
 * useDocumentMeta — Dynamic Meta Tags & Virtual Routing (History API)
 */

const BASE = import.meta.env.BASE_URL || '/';
const withBase = (path) => `${BASE.replace(/\/$/, '')}${path}`;

const ROOM_META = {
    null: {
        path: '/',
        title: 'Emna Smaali — Software Engineering Student | Applied AI & GenAI',
        description: 'Portfolio of Emna Smaali, a Software Engineering student at MedTech–SMU focused on applied AI, LLMs, RAG systems, and full stack development.',
    },
    about: {
        path: '/about',
        title: 'About — Emna Smaali',
        description: 'Learn about Emna Smaali — Software Engineering student, Applied AI & GenAI, based in Tunis, Tunisia.',
    },
    gallery: {
        path: '/gallery',
        title: 'Projects — Emna Smaali',
        description: 'Selected projects by Emna Smaali: Smart Matching Platform, AI-Powered Ecommerce, and Mental Health Risk Prediction.',
    },
    experience: {
        path: '/experience',
        title: 'Experience — Emna Smaali',
        description: 'Professional experience: Dar Blockchain, South Mediterranean University, COMAR Assurances, Forvia Informatique and Dracode.',
    },
    rewards: {
        path: '/rewards',
        title: 'Rewards — Emna Smaali',
        description: 'Awards and recognition: 1st Place Senior Project Competition, 3rd Place Cr4ck0ut Hackathon and 4th Place She Helps Hackathon.',
    },
    extracurricular: {
        path: '/extracurricular',
        title: 'Extracurricular — Emna Smaali',
        description: 'Leadership roles at Enactus SMU and Securinets SMU.',
    },
    contact: {
        path: '/contact',
        title: 'Contact — Emna Smaali',
        description: 'Get in touch with Emna Smaali for software engineering internships and applied AI projects.',
    },
};

// Map URL paths back to room IDs for deep linking
const PATH_TO_ROOM = {
    '/': null,
    '/about': 'about',
    '/gallery': 'gallery',
    '/experience': 'experience',
    '/rewards': 'rewards',
    '/extracurricular': 'extracurricular',
    '/contact': 'contact',
    // Backwards-compatible alias for the old Studio URL
    '/studio': 'experience',
};

export function getInitialRoomFromUrl() {
    const base = import.meta.env.BASE_URL || '/';
    const baseNoSlash = base.replace(/\/$/, '');
    let path = window.location.pathname;
    if (baseNoSlash && path.startsWith(baseNoSlash)) {
        path = path.slice(baseNoSlash.length) || '/';
    }
    path = path.replace(/\/+$/, '') || '/';
    return PATH_TO_ROOM[path] !== undefined ? PATH_TO_ROOM[path] : null;
}

export function useDocumentMeta() {
    const { currentRoom, teleportTo, hasEntered, initialRoom } = useScene();
    const isHandlingPopState = useRef(false);
    const lastPushedRoom = useRef(undefined); // Track what we last pushed to avoid duplicates

    // Update document meta and URL when room changes
    useEffect(() => {
        const roomKey = currentRoom === null ? 'null' : currentRoom;
        const meta = ROOM_META[roomKey] || ROOM_META['null'];

        // Update the page title
        document.title = meta.title;

        // Update meta description
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) {
            descTag.setAttribute('content', meta.description);
        }

        // Update OG meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', meta.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', meta.description);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `${window.location.origin}${withBase(meta.path)}`);

        // Update canonical link (created on first run when no static tag exists)
        let canonicalTag = document.querySelector('link[rel="canonical"]');
        if (!canonicalTag) {
            canonicalTag = document.createElement('link');
            canonicalTag.rel = 'canonical';
            document.head.appendChild(canonicalTag);
        }
        canonicalTag.setAttribute('href', `${window.location.origin}${withBase(meta.path)}`);

        // Push to browser history
        if (lastPushedRoom.current === undefined && initialRoom && currentRoom === null) {
            // Keep the deep-link URL intact until the section teleport runs.
            lastPushedRoom.current = currentRoom;
        } else if (!isHandlingPopState.current && lastPushedRoom.current !== currentRoom) {
            if (lastPushedRoom.current === undefined) {
                window.history.replaceState({ room: currentRoom }, '', withBase(meta.path));
            } else {
                window.history.pushState({ room: currentRoom }, '', withBase(meta.path));
            }
            lastPushedRoom.current = currentRoom;
        }
        isHandlingPopState.current = false;
    }, [currentRoom, initialRoom]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (e) => {
            const room = e.state ? e.state.room : null;
            if (room !== undefined) {
                isHandlingPopState.current = true;
                lastPushedRoom.current = room;
                teleportTo(room);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [teleportTo]);
}
