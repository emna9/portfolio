import { useEffect, useMemo, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { useGuidance, useNearestDoor } from '../../context/GuidanceContext';
import { getDoorInfo } from '../../data/doorContent';
import { Typewriter } from './Typewriter';
import VirtualPad from './VirtualPad';
import '../../styles/Guidance.scss';

/**
 * GuidanceUI
 *
 * DOM layer of the guided experience:
 * - floating door bubble + ENTER prompt
 * - room welcome toast
 * - persistent CV shortcut
 * - ENTER / ESC shortcuts
 */
const GuidanceUI = () => {
    const { hasEntered, isInRoom, currentRoom, isTeleporting, requestExit } = useScene();
    const {
        openDoor,
        tutorialOpen,
        helpOpen,
        setHelpOpen,
        avatarSpeaking,
    } = useGuidance();
    const nearestDoor = useNearestDoor();

    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    // Contextual welcome when a room opens.
    useEffect(() => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        if (!isInRoom || !currentRoom) {
            setToast(null);
            return undefined;
        }
        const info = getDoorInfo(currentRoom);
        if (!info) return undefined;
        setToast(info.intro);
        toastTimer.current = setTimeout(() => setToast(null), 7000);
        return () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        };
    }, [currentRoom, isInRoom]);

    // ENTER to open the nearby door, ESC to leave a room or close Help.
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (helpOpen) {
                    setHelpOpen(false);
                    return;
                }
                if (!tutorialOpen && isInRoom) {
                    requestExit();
                }
                return;
            }

            if (event.key !== 'Enter') return;
            const tag = event.target?.tagName;
            if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (tutorialOpen || helpOpen || isInRoom || isTeleporting) return;
            if (nearestDoor?.canEnter) {
                event.preventDefault();
                openDoor(nearestDoor.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [helpOpen, tutorialOpen, isInRoom, isTeleporting, nearestDoor, openDoor, requestExit, setHelpOpen]);

    const bubble = useMemo(() => {
        if (!hasEntered || isInRoom || isTeleporting || tutorialOpen || helpOpen || avatarSpeaking || !nearestDoor) return null;
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        const margin = viewportWidth < 640 ? 135 : 170;
        // Keep the bubble clear of the permanent top navigation bar.
        const minY = viewportWidth < 640 ? 220 : 245;
        const x = Math.min(Math.max(nearestDoor.screen.x, margin), viewportWidth - margin);
        const y = Math.min(Math.max(nearestDoor.screen.y - 30, minY), viewportHeight - 40);
        return { ...nearestDoor, x, y };
    }, [hasEntered, isInRoom, isTeleporting, tutorialOpen, helpOpen, avatarSpeaking, nearestDoor]);

    const showChrome = !isTeleporting;

    return (
        <div className="guidance-ui">
            {/* Floating door bubble */}
            {bubble && (
                <div
                    className={`door-bubble ${bubble.canEnter ? 'is-near' : ''}`}
                    style={{ left: `${bubble.x}px`, top: `${bubble.y}px` }}
                    role="status"
                >
                    <span className="door-bubble__pin" aria-hidden="true" />
                    <div className="door-bubble__head">
                        <span className="door-bubble__title">{bubble.title}</span>
                        {bubble.recommended && <span className="door-bubble__tag">START HERE</span>}
                    </div>
                    <Typewriter
                        key={bubble.key}
                        text={bubble.description}
                        speed={20}
                        className="door-bubble__text"
                    />
                    {bubble.canEnter ? (
                        <button
                            type="button"
                            className="door-bubble__enter"
                            onClick={() => openDoor(bubble.key)}
                        >
                            <span className="keycap keycap--inline">ENTER</span>
                            <span>explore</span>
                        </button>
                    ) : (
                        <span className="door-bubble__hint">Walk closer to open</span>
                    )}
                </div>
            )}

            {/* Contextual room welcome */}
            {toast && isInRoom && (
                <div className="room-toast" role="status">
                    <Typewriter key={toast} text={toast} speed={24} />
                </div>
            )}

            {/* Always-available CV shortcut */}
            {showChrome && (
                <a
                    className="cv-shortcut"
                    href="Emna_Smaali_CV.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Emna Smaali's CV"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6M9 13h6M9 17h6" />
                    </svg>
                    <span>VIEW CV</span>
                </a>
            )}

            {/* Touch controls */}
            <VirtualPad
                visible={hasEntered && !isInRoom && !tutorialOpen && !helpOpen && !isTeleporting}
                canEnter={Boolean(nearestDoor?.canEnter)}
                onEnter={() => nearestDoor && openDoor(nearestDoor.key)}
            />
        </div>
    );
};

export default GuidanceUI;
