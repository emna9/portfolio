import { useEffect, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { useGuidance } from '../../context/GuidanceContext';
import { useAchievements, ACHIEVEMENTS } from '../../context/AchievementsContext';
import { DOOR_INFO, ROOM_ORDER } from '../../data/doorContent';
import { isSfxEnabled, setSfxEnabled, playWelcome } from '../../utils/sfx';
import '../../styles/Guidance.scss';

const HELP_ROOMS = ROOM_ORDER.map(id => ({ id, ...DOOR_INFO[id] }));

/**
 * HelpPanel - the permanent "never feel lost" interface.
 * Lists every section, explains the controls, offers the CV and replays the intro.
 */
const HelpPanel = ({ isOpen, onClose }) => {
    const { teleportTo, currentRoom, isTeleporting, requestExit, isInRoom } = useScene();
    const { replayTutorial, pov, togglePov, setHelpOpen } = useGuidance();
    const { completed } = useAchievements();
    const [sfxOn, setSfxOn] = useState(isSfxEnabled);
    const closeRef = useRef(null);
    const panelRef = useRef(null);

    // Freeze walking and hide the door bubble while Help is open.
    useEffect(() => {
        setHelpOpen(isOpen);
        return () => setHelpOpen(false);
    }, [isOpen, setHelpOpen]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => closeRef.current?.focus(), 120);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [isOpen]);

    const handleRoom = (roomId) => {
        onClose?.();
        if (roomId === currentRoom) return;
        teleportTo(roomId);
    };

    return (
        <div
            className={`help-panel ${isOpen ? 'open' : ''}`}
            inert={!isOpen ? true : undefined}
            role="dialog"
            aria-label="Help and navigation"
            ref={panelRef}
        >
            <div className="help-card">
                <div className="help-header">
                    <h3>HELP &amp; GUIDE</h3>
                    <button
                        ref={closeRef}
                        type="button"
                        className="help-close"
                        onClick={onClose}
                        aria-label="Close help"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <section className="help-section">
                    <h4>Jump to a section</h4>
                    <div className="help-room-grid">
                        {HELP_ROOMS.map(room => (
                            <button
                                key={room.id}
                                type="button"
                                className={`help-room ${currentRoom === room.id ? 'is-current' : ''}`}
                                onClick={() => handleRoom(room.id)}
                                disabled={isTeleporting}
                            >
                                <span>{room.title}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="help-section">
                    <h4>How to explore</h4>
                    <ul className="help-list">
                        <li><span className="keycap keycap--tiny">↑</span><span className="keycap keycap--tiny">W</span> walk forward</li>
                        <li><span className="keycap keycap--tiny">↓</span><span className="keycap keycap--tiny">S</span> walk backward</li>
                        <li><span className="keycap keycap--tiny">ENTER</span> opens the door you are facing</li>
                        <li><span className="keycap keycap--tiny">ESC</span> leaves a room or closes a panel</li>
                        <li>The path is one straight line down the middle of the house.</li>
                    </ul>
                </section>

                <section className="help-section">
                    <h4>Comfort</h4>
                    <button
                        type="button"
                        className={`help-toggle ${pov ? 'is-on' : ''}`}
                        onClick={togglePov}
                        aria-pressed={pov}
                    >
                        <span className="help-toggle__dot" aria-hidden="true" />
                        <span>First-person eye level</span>
                        <span className="help-toggle__state">{pov ? 'On' : 'Off'}</span>
                    </button>
                    <button
                        type="button"
                        className={`help-toggle ${sfxOn ? 'is-on' : ''}`}
                        onClick={() => {
                            const next = !sfxOn;
                            setSfxOn(next);
                            setSfxEnabled(next);
                            if (next) playWelcome();
                        }}
                        aria-pressed={sfxOn}
                    >
                        <span className="help-toggle__dot" aria-hidden="true" />
                        <span>Sound effects</span>
                        <span className="help-toggle__state">{sfxOn ? 'On' : 'Off'}</span>
                    </button>
                    <p className="help-note">
                        Music stays off. Footsteps, doors and the welcome chime can be muted here.
                    </p>
                </section>

                <section className="help-section">
                    <h4>Shortcuts</h4>
                    <div className="help-actions">
                        <button
                            type="button"
                            className="help-action"
                            onClick={() => { onClose?.(); replayTutorial(); }}
                        >
                            Replay introduction
                        </button>
                        <a
                            className="help-action help-action--cv"
                            href="Emna_Smaali_CV.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View / download CV
                        </a>
                        {isInRoom && (
                            <button
                                type="button"
                                className="help-action help-action--ghost"
                                onClick={() => { onClose?.(); requestExit(); }}
                            >
                                Back to the house
                            </button>
                        )}
                    </div>
                </section>

                <section className="help-section help-section--progress">
                    <h4>Exploration</h4>
                    <p className="help-progress">
                        {completed.length} / {Object.keys(ACHIEVEMENTS).length} moments discovered
                    </p>
                    <ul className="help-progress-list">
                        {Object.values(ACHIEVEMENTS).map(item => (
                            <li key={item.id} className={completed.includes(item.id) ? 'is-done' : ''}>
                                <span aria-hidden="true">{completed.includes(item.id) ? '✓' : '○'}</span>
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default HelpPanel;
