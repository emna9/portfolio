import { useCallback, useEffect, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { useGuidance, useNearestDoor } from '../../context/GuidanceContext';
import { getDoorInfo } from '../../data/doorContent';
import { hasSeenTutorial, getMovementState } from '../../utils/controls';
import { Typewriter } from './Typewriter';
import '../../styles/AvatarGuide.scss';

const INTRO_STEPS = [
    {
        id: 'hello',
        kicker: 'A LITTLE HELLO',
        text: "Oh, hello! Welcome to my little world! I'm Emna, a Software Engineering student passionate about AI, technology, and building creative things. Let me show you around!",
        next: 'Show me around',
    },
    {
        id: 'walk',
        kicker: 'MOVING AROUND',
        text: 'Walk with the arrow keys, or W A S D if you prefer. Movement is slow and gentle, so take your time. Step left and right to line up with a door.',
        next: 'Got it',
    },
    {
        id: 'doors',
        kicker: 'THE DOORS',
        text: 'Each door is a chapter. When you get close, it lights up and tells you what is inside. Start with Projects, the first door on your left - or wander freely, every room is open.',
        next: "Let's explore",
    },
];

const MiniKeys = () => (
    <div className="avatar-mini-keys" aria-hidden="true">
        <div className="avatar-mini-keys__row">
            <span className="avatar-key">↑</span>
        </div>
        <div className="avatar-mini-keys__row">
            <span className="avatar-key">←</span>
            <span className="avatar-key">↓</span>
            <span className="avatar-key">→</span>
        </div>
        <span className="avatar-mini-keys__or">or</span>
        <div className="avatar-mini-keys__row">
            <span className="avatar-key">W</span>
        </div>
        <div className="avatar-mini-keys__row">
            <span className="avatar-key">A</span>
            <span className="avatar-key">S</span>
            <span className="avatar-key">D</span>
        </div>
    </div>
);

const MiniDoor = () => (
    <svg className="avatar-mini-door" viewBox="0 0 90 110" aria-hidden="true">
        <path d="M12 100V24l33-14 33 14v76" />
        <path d="M22 100V32l23-10 23 10v68" />
        <circle cx="62" cy="66" r="2.4" />
        <path d="M70 40c6 5 6 14 0 19" />
        <path d="M7 100h76" />
    </svg>
);

/**
 * AvatarGuide
 *
 * Minimal illustrated guide with long wavy hair. She walks ahead of the
 * visitor, turns, waves and speaks in short vintage speech bubbles.
 */
const AvatarGuide = () => {
    const { hasEntered, isInRoom } = useScene();
    const {
        avatarRef,
        avatarTalkingRef,
        setAvatarSpeaking,
        tutorialOpen,
        openTutorial,
        closeTutorial,
        guideLine,
        clearGuideLine,
        showGuideLine,
        openDoor,
        helpOpen,
    } = useGuidance();
    const nearestDoor = useNearestDoor();

    const [step, setStep] = useState(0);
    const [waving, setWaving] = useState(false);
    const waveTimer = useRef(null);
    const spokeRooms = useRef(new Set());
    const wasInRoom = useRef(false);
    const helpedRef = useRef(false);

    const wave = useCallback(() => {
        setWaving(true);
        if (waveTimer.current) clearTimeout(waveTimer.current);
        waveTimer.current = setTimeout(() => setWaving(false), 2600);
    }, []);

    useEffect(() => () => {
        if (waveTimer.current) clearTimeout(waveTimer.current);
    }, []);

    // First visit: she walks in, stops, turns, waves, then introduces herself.
    useEffect(() => {
        if (!hasEntered || isInRoom) return undefined;
        if (hasSeenTutorial()) return undefined;
        const timer = setTimeout(() => openTutorial(), 2400);
        return () => clearTimeout(timer);
    }, [hasEntered, isInRoom, openTutorial]);

    useEffect(() => {
        if (tutorialOpen) {
            setStep(0);
            wave();
        }
    }, [tutorialOpen, wave]);

    useEffect(() => {
        if (guideLine) wave();
    }, [guideLine, wave]);

    // Tell the 3D anchor to face the visitor while a bubble is open.
    const bubbleVisible = Boolean(hasEntered && !isInRoom && !helpOpen && (tutorialOpen || guideLine));
    useEffect(() => {
        avatarTalkingRef.current = bubbleVisible;
        setAvatarSpeaking(bubbleVisible);
        return () => {
            avatarTalkingRef.current = false;
            setAvatarSpeaking(false);
        };
    }, [bubbleVisible, avatarTalkingRef, setAvatarSpeaking]);

    // Auto-hide contextual lines.
    useEffect(() => {
        if (!guideLine || tutorialOpen) return undefined;
        const timer = setTimeout(() => clearGuideLine(), 6500);
        return () => clearTimeout(timer);
    }, [guideLine, tutorialOpen, clearGuideLine]);

    // Introduce each section the first time the visitor is close enough.
    useEffect(() => {
        if (!hasEntered || isInRoom || tutorialOpen || helpOpen) return;
        if (!nearestDoor || !nearestDoor.canEnter) return;
        if (spokeRooms.current.has(nearestDoor.roomId)) return;
        const info = getDoorInfo(nearestDoor.roomId);
        if (!info?.guide) return;
        spokeRooms.current.add(nearestDoor.roomId);
        showGuideLine({
            id: nearestDoor.roomId,
            text: info.guide,
            canEnter: true,
            doorKey: nearestDoor.key,
        });
    }, [hasEntered, isInRoom, tutorialOpen, helpOpen, nearestDoor, showGuideLine]);

    // Back to the hall: a short welcome line.
    useEffect(() => {
        if (isInRoom) {
            wasInRoom.current = true;
            clearGuideLine();
            return undefined;
        }
        if (wasInRoom.current && hasEntered && !tutorialOpen) {
            wasInRoom.current = false;
            const timer = setTimeout(() => {
                showGuideLine({
                    id: 'return',
                    text: 'Back to the main hall! Where shall we go next?',
                    canEnter: false,
                });
            }, 1200);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [isInRoom, hasEntered, tutorialOpen, showGuideLine, clearGuideLine]);

    // If the visitor hesitates for a while, offer one gentle hint.
    useEffect(() => {
        if (!hasEntered || isInRoom || tutorialOpen || helpOpen) return undefined;
        const timer = setInterval(() => {
            if (helpedRef.current) return;
            if (getMovementState().moving) return;
            if (guideLine) return;
            if (nearestDoor?.canEnter) return;
            helpedRef.current = true;
            showGuideLine({
                id: 'help',
                text: 'Need a little help? Follow the arrows on the floor, or open the map to jump anywhere.',
                canEnter: false,
            });
        }, 5000);
        const initial = setTimeout(() => {
            if (helpedRef.current) return;
            if (getMovementState().moving) return;
            if (guideLine) return;
            if (nearestDoor?.canEnter) return;
            helpedRef.current = true;
            showGuideLine({
                id: 'help',
                text: 'Need a little help? Follow the arrows on the floor, or open the map to jump anywhere.',
                canEnter: false,
            });
        }, 22000);
        return () => {
            clearInterval(timer);
            clearTimeout(initial);
        };
    }, [hasEntered, isInRoom, tutorialOpen, helpOpen, guideLine, nearestDoor, showGuideLine]);

    const currentStep = INTRO_STEPS[step];
    const isLast = step === INTRO_STEPS.length - 1;

    const handleNext = () => {
        if (isLast) {
            closeTutorial(true);
            return;
        }
        setStep(prev => Math.min(prev + 1, INTRO_STEPS.length - 1));
    };

    return (
        <div
            ref={avatarRef}
            className={`avatar-guide ${waving ? 'is-waving' : ''} ${bubbleVisible ? 'is-talking' : ''}`}
            data-moving="false"
            data-view="back"
            data-facing="center"
            aria-hidden={!hasEntered}
        >
            <div className="avatar-guide__figure">
                <div className="avatar-guide__pose">
                    <svg className="avatar-svg" viewBox="0 0 220 460" aria-hidden="true">
                        <defs>
                            <linearGradient id="avatar-coat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#7d333d" />
                                <stop offset="1" stopColor="#551d26" />
                            </linearGradient>
                        </defs>

                        {/* legs and boots */}
                        <g className="avatar-leg avatar-leg--l">
                            <path d="M94 300 L88 404 L102 404 L106 300 Z" fill="#8a5a44" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M86 404 L86 424 L108 424 L106 404 Z" fill="#b07a52" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M86 405 L107 405" stroke="#f3e3c8" strokeWidth="3" strokeLinecap="round" />
                        </g>
                        <g className="avatar-leg avatar-leg--r">
                            <path d="M114 300 L118 404 L132 404 L126 300 Z" fill="#8a5a44" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M112 404 L114 424 L136 424 L134 404 Z" fill="#b07a52" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M113 405 L134 405" stroke="#f3e3c8" strokeWidth="3" strokeLinecap="round" />
                        </g>

                        {/* coat / dress */}
                        <path d="M78 158 C70 210 68 258 62 306 L158 306 C152 258 150 210 142 158 Z" fill="url(#avatar-coat)" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                        <path d="M64 303 C90 308 130 308 156 303" fill="none" stroke="#f3e3c8" strokeWidth="4" strokeLinecap="round" />
                        <path d="M78 158 C88 176 96 184 110 184 C124 184 132 176 142 158" fill="none" stroke="#4a1c24" strokeWidth="3" />

                        {/* belt */}
                        <rect x="70" y="236" width="80" height="12" rx="4" fill="#b08d57" stroke="#241610" strokeWidth="3" />
                        <rect x="102" y="232" width="16" height="20" rx="3" fill="#c9a227" stroke="#241610" strokeWidth="3" />

                        {/* back details */}
                        <g className="avatar-detail-back">
                            <path d="M110 184 L110 300" stroke="#4a1c24" strokeWidth="3" />
                            <path d="M86 300 L82 322 M134 300 L138 322" stroke="#4a1c24" strokeWidth="3" />
                        </g>

                        {/* front details */}
                        <g className="avatar-detail-front">
                            <path d="M110 186 L110 300" stroke="#4a1c24" strokeWidth="3" />
                            <circle cx="110" cy="202" r="3" fill="#d9b25f" stroke="#241610" strokeWidth="1.4" />
                            <circle cx="110" cy="222" r="3" fill="#d9b25f" stroke="#241610" strokeWidth="1.4" />
                            <circle cx="110" cy="242" r="3" fill="#d9b25f" stroke="#241610" strokeWidth="1.4" />
                            <path d="M92 152 L110 180 L128 152 L120 144 L110 160 L100 144 Z" fill="#f3e3c8" stroke="#241610" strokeWidth="3" strokeLinejoin="round" />
                        </g>

                        {/* neck */}
                        <rect x="101" y="126" width="18" height="30" fill="#f0cdb6" stroke="#241610" strokeWidth="3" />

                        {/* back of the head - long wavy hair */}
                        <g className="avatar-back">
                            <path d="M74 96 C64 52 84 30 110 30 C136 30 156 52 146 96 C154 150 156 214 164 276 C150 268 140 284 126 274 L120 128 L100 128 L94 274 C80 284 70 268 56 276 C64 214 66 150 74 96 Z" fill="#3b2620" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M84 120 C80 170 78 220 72 258" stroke="#2a1915" strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M136 120 C140 170 142 220 148 258" stroke="#2a1915" strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M96 150 C102 190 100 230 94 264" stroke="#5a3a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M124 150 C118 190 120 230 126 264" stroke="#5a3a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </g>

                        {/* arms */}
                        <g className="avatar-arm avatar-arm--l">
                            <path d="M80 168 C64 196 60 236 66 266 L80 264 C76 236 78 202 90 178 Z" fill="#6a2731" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <circle cx="73" cy="272" r="8" fill="#f0cdb6" stroke="#241610" strokeWidth="3" />
                        </g>
                        <g className="avatar-arm avatar-arm--r">
                            <path d="M140 168 C156 196 160 236 154 266 L140 264 C144 236 142 202 130 178 Z" fill="#6a2731" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <circle cx="147" cy="272" r="8" fill="#f0cdb6" stroke="#241610" strokeWidth="3" />
                        </g>

                        {/* face and front hair */}
                        <g className="avatar-front">
                            <circle cx="75" cy="102" r="6" fill="#f0cdb6" stroke="#241610" strokeWidth="3" />
                            <circle cx="145" cy="102" r="6" fill="#f0cdb6" stroke="#241610" strokeWidth="3" />
                            <ellipse cx="110" cy="98" rx="35" ry="42" fill="#f3d7c4" stroke="#241610" strokeWidth="4" />

                            <path d="M74 96 C70 54 88 32 110 32 C132 32 150 54 146 96 C140 76 128 66 110 66 C92 66 80 76 74 96 Z" fill="#3b2620" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M74 92 C66 140 68 196 58 246 C72 240 82 252 90 244 L88 118 Z" fill="#3b2620" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M146 92 C154 140 152 196 162 246 C148 240 138 252 130 244 L132 118 Z" fill="#3b2620" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M82 122 C76 162 78 200 70 232" stroke="#5a3a30" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M138 122 C144 162 142 200 150 232" stroke="#5a3a30" strokeWidth="2" fill="none" strokeLinecap="round" />

                            <path d="M92 86 Q98 82 104 86" stroke="#241610" strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M116 86 Q122 82 128 86" stroke="#241610" strokeWidth="3" fill="none" strokeLinecap="round" />

                            <g className="avatar-eyes">
                                <ellipse cx="98" cy="99" rx="3.4" ry="4.6" fill="#241610" />
                                <ellipse cx="122" cy="99" rx="3.4" ry="4.6" fill="#241610" />
                                <circle cx="99" cy="97" r="1" fill="#fff" />
                                <circle cx="123" cy="97" r="1" fill="#fff" />
                            </g>

                            <path d="M110 103 Q113 110 108 113" stroke="#c98f79" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M101 121 Q110 128 119 121" stroke="#a34a4a" strokeWidth="3" fill="#c96b6b" strokeLinecap="round" />

                            <ellipse cx="88" cy="113" rx="7" ry="4" fill="#e7a9a0" opacity="0.45" />
                            <ellipse cx="132" cy="113" rx="7" ry="4" fill="#e7a9a0" opacity="0.45" />
                            <circle cx="75" cy="112" r="2.4" fill="#c9a227" />
                            <circle cx="145" cy="112" r="2.4" fill="#c9a227" />
                        </g>
                    </svg>
                </div>
            </div>

            {bubbleVisible && (
                <div className="avatar-speech" role="status" aria-live="polite">
                    <span className="avatar-speech__tail" aria-hidden="true" />

                    {tutorialOpen ? (
                        <>
                            <div className="avatar-speech__head">
                                <span className="avatar-speech__kicker">{currentStep.kicker}</span>
                                <div className="avatar-speech__head-right">
                                    <span className="avatar-speech__count">{step + 1} / {INTRO_STEPS.length}</span>
                                    <button type="button" className="avatar-speech__skip" onClick={() => closeTutorial(true)}>
                                        Skip
                                    </button>
                                </div>
                            </div>

                            <div className="avatar-speech__body">
                                {step === 1 && <MiniKeys />}
                                {step === 2 && <MiniDoor />}
                                <Typewriter
                                    key={currentStep.id}
                                    text={currentStep.text}
                                    speed={15}
                                    className="avatar-speech__text"
                                />
                            </div>

                            {step === 2 && (
                                <p className="avatar-speech__note">
                                    Recommended first stop: <strong>Projects</strong> - the first door on your left.
                                </p>
                            )}

                            <div className="avatar-speech__footer">
                                <div className="avatar-speech__dots" aria-hidden="true">
                                    {INTRO_STEPS.map((item, index) => (
                                        <span key={item.id} className={index === step ? 'is-active' : ''} />
                                    ))}
                                </div>
                                <div className="avatar-speech__actions">
                                    {step > 0 && (
                                        <button type="button" className="avatar-btn avatar-btn--ghost" onClick={() => setStep(prev => prev - 1)}>
                                            Back
                                        </button>
                                    )}
                                    <button type="button" className="avatar-btn" onClick={handleNext}>
                                        {isLast ? "Let's explore" : currentStep.next}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="avatar-speech__head">
                                <span className="avatar-speech__kicker">EMNA</span>
                            </div>
                            <Typewriter
                                key={guideLine.id}
                                text={guideLine.text}
                                speed={20}
                                className="avatar-speech__text"
                            />
                            {guideLine.canEnter && (
                                <button
                                    type="button"
                                    className="avatar-speech__enter"
                                    onClick={() => {
                                        clearGuideLine();
                                        openDoor(guideLine.doorKey);
                                    }}
                                >
                                    <span className="avatar-key avatar-key--wide">ENTER</span>
                                    <span>explore</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AvatarGuide;
