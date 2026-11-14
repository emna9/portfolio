import { useCallback, useEffect, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { useGuidance, useNearestDoor } from '../../context/GuidanceContext';
import { getDoorInfo } from '../../data/doorContent';
import { hasSeenTutorial, getMovementState } from '../../utils/controls';
import { Typewriter } from './Typewriter';
import { playWelcome } from '../../utils/sfx';
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
    const welcomedRef = useRef(false);
    const nearestRef = useRef(nearestDoor);

    const wave = useCallback(() => {
        setWaving(true);
        if (waveTimer.current) clearTimeout(waveTimer.current);
        waveTimer.current = setTimeout(() => setWaving(false), 2600);
    }, []);

    useEffect(() => () => {
        if (waveTimer.current) clearTimeout(waveTimer.current);
    }, []);

    // A soft welcome chime the first time she appears.
    useEffect(() => {
        if (hasEntered && !welcomedRef.current) {
            welcomedRef.current = true;
            playWelcome();
        }
    }, [hasEntered]);

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
        nearestRef.current = nearestDoor;
    }, [nearestDoor]);

    useEffect(() => {
        if (!hasEntered || isInRoom || tutorialOpen || helpOpen) return undefined;
        const maybeHelp = () => {
            if (helpedRef.current) return;
            if (getMovementState().moving) return;
            if (guideLine) return;
            if (nearestRef.current?.canEnter) return;
            helpedRef.current = true;
            showGuideLine({
                id: 'help',
                text: 'Need a little help? Follow the arrows on the floor, or open the map to jump anywhere.',
                canEnter: false,
            });
        };
        const timer = setInterval(maybeHelp, 5000);
        const initial = setTimeout(maybeHelp, 22000);
        return () => {
            clearInterval(timer);
            clearTimeout(initial);
        };
    }, [hasEntered, isInRoom, tutorialOpen, helpOpen, guideLine, showGuideLine]);

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
                                <stop offset="1" stopColor="#521b24" />
                            </linearGradient>
                            <linearGradient id="avatar-hair" gradientUnits="userSpaceOnUse" x1="0" y1="56" x2="0" y2="322">
                                <stop offset="0" stopColor="#4a2f26" />
                                <stop offset="1" stopColor="#2b1a15" />
                            </linearGradient>
                        </defs>

                        {/* shaped legs in dark tights */}
                        <g className="avatar-leg avatar-leg--l">
                            <path d="M93 292 C85 318 83 344 89 370 C86 390 85 412 90 430 L104 430 C102 410 102 390 103 370 C106 344 107 318 109 292 Z" fill="#f6ddcb" stroke="#241610" strokeWidth="3.5" strokeLinejoin="round" />
                            <path d="M90 370 C94 374 99 374 102 370" stroke="#e0b9a2" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M104 332 C102 362 102 392 104 420" stroke="#e0b9a2" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round" />
                            <path d="M89 428 L85 442 C83 448 87 452 94 452 L104 452 C108 452 110 449 110 445 L110 428 Z" fill="#b07a52" stroke="#241610" strokeWidth="3.5" strokeLinejoin="round" />
                            <path d="M90 429 L109 429" stroke="#f3e3c8" strokeWidth="2.5" strokeLinecap="round" />
                        </g>
                        <g className="avatar-leg avatar-leg--r">
                            <path d="M127 292 C135 318 137 344 131 370 C134 390 135 412 130 430 L116 430 C118 410 118 390 117 370 C114 344 113 318 111 292 Z" fill="#f6ddcb" stroke="#241610" strokeWidth="3.5" strokeLinejoin="round" />
                            <path d="M118 370 C121 374 126 374 130 370" stroke="#e0b9a2" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M116 332 C118 362 118 392 116 420" stroke="#e0b9a2" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round" />
                            <path d="M131 428 L135 442 C137 448 133 452 126 452 L116 452 C112 452 110 449 110 445 L110 428 Z" fill="#b07a52" stroke="#241610" strokeWidth="3.5" strokeLinejoin="round" />
                            <path d="M111 429 L130 429" stroke="#f3e3c8" strokeWidth="2.5" strokeLinecap="round" />
                        </g>

                        {/* fitted bodice and A-line skirt */}
                        <path d="M84 248 C80 276 70 306 62 334 L158 334 C150 306 140 276 136 248 Z" fill="url(#avatar-coat)" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                        <path d="M80 172 C74 196 74 226 84 250 L136 250 C146 226 146 196 140 172 C130 162 90 162 80 172 Z" fill="url(#avatar-coat)" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                        <path d="M64 332 C90 338 130 338 156 332" fill="none" stroke="#f3e3c8" strokeWidth="4" strokeLinecap="round" />

                        {/* belt */}
                        <rect x="83" y="244" width="54" height="10" rx="3" fill="#b08d57" stroke="#241610" strokeWidth="2.5" />

                        {/* back details */}
                        <g className="avatar-detail-back">
                            <path d="M110 176 L110 332" stroke="#4a1c24" strokeWidth="2.5" />
                            <path d="M90 300 C96 306 104 306 110 302 C116 306 124 306 130 300" fill="none" stroke="#4a1c24" strokeWidth="2.5" strokeLinecap="round" />
                        </g>

                        {/* front details */}
                        <g className="avatar-detail-front">
                            <rect x="104" y="241" width="12" height="16" rx="2" fill="#c9a227" stroke="#241610" strokeWidth="2" />
                            <circle cx="110" cy="196" r="2.6" fill="#d9b25f" stroke="#241610" strokeWidth="1.2" />
                            <circle cx="110" cy="214" r="2.6" fill="#d9b25f" stroke="#241610" strokeWidth="1.2" />
                            <circle cx="110" cy="232" r="2.6" fill="#d9b25f" stroke="#241610" strokeWidth="1.2" />
                        </g>

                        {/* long flowing hair behind the head and shoulders */}
                        <g className="avatar-hair-base" transform="translate(0,54) scale(1,0.8) translate(0,-54)">
                            <path d="M110 54 C84 54 70 74 70 98 C70 124 66 150 60 176 C54 202 54 232 58 258 C62 284 70 306 80 322 C90 334 100 326 104 316 L106 168 L114 168 L116 316 C120 326 130 334 140 322 C150 306 158 284 162 258 C166 232 166 202 160 176 C154 150 150 124 150 98 C150 74 136 54 110 54 Z" fill="url(#avatar-hair)" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M88 120 C82 170 80 220 76 270" stroke="#5a3a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M132 120 C138 170 140 220 144 270" stroke="#5a3a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M96 150 C102 200 100 250 94 300" stroke="#5a3a30" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                            <path d="M124 150 C118 200 120 250 126 300" stroke="#5a3a30" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                        </g>

                        {/* back view: solid flowing hair */}
                        <g className="avatar-back" transform="translate(0,54) scale(1,0.8) translate(0,-54)">
                            <path d="M110 54 C84 54 70 74 70 98 C70 124 66 150 60 176 C54 202 54 232 58 258 C62 284 70 306 80 322 C88 330 96 326 104 318 L116 318 C124 326 132 330 140 322 C150 306 158 284 162 258 C166 232 166 202 160 176 C154 150 150 124 150 98 C150 74 136 54 110 54 Z" fill="url(#avatar-hair)" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />
                            <path d="M88 120 C82 170 80 220 76 270" stroke="#5a3a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M132 120 C138 170 140 220 144 270" stroke="#5a3a30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M96 150 C102 200 100 250 94 300" stroke="#5a3a30" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                            <path d="M124 150 C118 200 120 250 126 300" stroke="#5a3a30" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                        </g>

                        {/* front view: visible neck, soft face, curtain bangs */}
                        <g className="avatar-front">
                            {/* neck */}
                            <path d="M101 130 L119 130 L121 164 C121 170 117 174 110 174 C103 174 99 170 99 164 Z" fill="#f6ddcb" stroke="#241610" strokeWidth="3" strokeLinejoin="round" />
                            <path d="M102 137 Q110 143 118 137" stroke="#e0b9a2" strokeWidth="3" fill="none" opacity="0.45" strokeLinecap="round" />


                            {/* ears and face */}
                            <circle cx="83" cy="104" r="5" fill="#f6ddcb" stroke="#241610" strokeWidth="3" />
                            <circle cx="137" cy="104" r="5" fill="#f6ddcb" stroke="#241610" strokeWidth="3" />
                            <path d="M84 100 C84 78 95 68 110 68 C125 68 136 78 136 100 C136 116 128 130 110 136 C92 130 84 116 84 100 Z" fill="#f6ddcb" stroke="#241610" strokeWidth="4" strokeLinejoin="round" />

                            {/* curtain bangs and long hair - one seamless mass */}
                            <path d="M110 56 C98 56 86 64 81 80 C78 94 82 108 76 126 C70 146 76 166 68 186 C63 202 66 218 72 230 C80 222 88 232 96 224 C91 208 95 192 90 176 C85 160 90 144 88 128 C86 112 90 100 96 88 C100 82 104 76 110 72 C116 76 120 82 124 88 C130 100 134 112 132 128 C130 144 135 160 130 176 C125 192 129 208 124 224 C132 232 140 222 148 230 C154 218 157 202 152 186 C144 166 150 146 144 126 C138 108 142 94 139 80 C134 64 122 56 110 56 Z" fill="url(#avatar-hair)" />
                            <path d="M100 70 C94 90 96 110 90 130 C84 150 90 170 84 190" stroke="#6b4a3a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
                            <path d="M120 70 C126 90 124 110 130 130 C136 150 130 170 136 190" stroke="#6b4a3a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
                            <path d="M86 100 C80 128 86 154 78 182 C73 200 78 214 72 222" stroke="#7a5544" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
                            <path d="M134 100 C140 128 134 154 142 182 C147 200 142 214 148 222" stroke="#7a5544" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
                            <path d="M94 122 C88 148 94 176 88 200" stroke="#7a5544" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
                            <path d="M126 122 C132 148 126 176 132 200" stroke="#7a5544" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />

                            {/* brows */}
                            <path d="M94 92 Q100 89 106 92" stroke="#6b4a3a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                            <path d="M114 92 Q120 89 126 92" stroke="#6b4a3a" strokeWidth="1.8" fill="none" strokeLinecap="round" />

                            {/* fresh, bright eyes with delicate lashes */}
                            <g className="avatar-eyes">
                                <path d="M94 104 C97 100 102 100 105 104 C102 108 97 108 94 104 Z" fill="#fffdf8" />
                                <path d="M115 104 C118 100 123 100 126 104 C123 108 118 108 115 104 Z" fill="#fffdf8" />
                                <circle cx="99.5" cy="104" r="2.8" fill="#5a3a30" />
                                <circle cx="120.5" cy="104" r="2.8" fill="#5a3a30" />
                                <circle cx="99.5" cy="104" r="1.3" fill="#241610" />
                                <circle cx="120.5" cy="104" r="1.3" fill="#241610" />
                                <circle cx="98.7" cy="103.2" r="0.9" fill="#fff" />
                                <circle cx="119.7" cy="103.2" r="0.9" fill="#fff" />
                                <path d="M94 104 C97 100.5 102 100.5 105 104" stroke="#3a241d" strokeWidth="1" fill="none" strokeLinecap="round" />
                                <path d="M115 104 C118 100.5 123 100.5 126 104" stroke="#3a241d" strokeWidth="1" fill="none" strokeLinecap="round" />
                                <path d="M94 104 L91.5 102" stroke="#3a241d" strokeWidth="1" strokeLinecap="round" />
                                <path d="M95.5 102 L93.5 100" stroke="#3a241d" strokeWidth="1" strokeLinecap="round" />
                                <path d="M126 104 L128.5 102" stroke="#3a241d" strokeWidth="1" strokeLinecap="round" />
                                <path d="M124.5 102 L126.5 100" stroke="#3a241d" strokeWidth="1" strokeLinecap="round" />
                            </g>

                            {/* nose, smile, blush */}
                            <path d="M110 110 Q112 116 108 118" stroke="#c98f79" strokeWidth="2" fill="none" strokeLinecap="round" />
                            <path d="M103 123 Q110 130 117 123" stroke="#a34a4a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                            <path d="M106 125 Q110 128 114 125" stroke="#d27b7b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                            <circle cx="124" cy="119" r="0.9" fill="#6b4533" opacity="0.7" />

                        </g>
                        {/* softly bent arms */}
                        <g className="avatar-arm avatar-arm--l">
                            <path d="M82 178 C72 196 66 220 68 244 C69 260 72 278 74 294 L86 292 C84 276 82 258 82 244 C82 224 86 202 92 184 Z" fill="#6a2731" stroke="#241610" strokeWidth="3.5" strokeLinejoin="round" />
                            <path d="M73 292 L87 290" stroke="#f3e3c8" strokeWidth="3" strokeLinecap="round" />
                            <ellipse cx="78" cy="301" rx="6" ry="7" fill="#f6ddcb" stroke="#241610" strokeWidth="3" />
                            <path d="M76 298 L76 304" stroke="#d9a98f" strokeWidth="1.2" strokeLinecap="round" />
                        </g>
                        <g className="avatar-arm avatar-arm--r">
                            <path d="M138 178 C148 194 152 216 151 238 L139 238 C138 216 134 198 128 184 Z" fill="#6a2731" stroke="#241610" strokeWidth="3.5" strokeLinejoin="round" />
                            <g className="avatar-forearm avatar-forearm--r">
                                <path d="M139 238 L151 238 C150 258 148 278 146 294 L134 292 C136 276 138 258 139 238 Z" fill="#6a2731" stroke="#241610" strokeWidth="3.5" strokeLinejoin="round" />
                                <path d="M133 290 L147 292" stroke="#f3e3c8" strokeWidth="3" strokeLinecap="round" />
                                <g className="avatar-hand avatar-hand--r">
                                    <ellipse cx="142" cy="301" rx="6" ry="7" fill="#f6ddcb" stroke="#241610" strokeWidth="3" />
                                    <path d="M144 298 L144 304" stroke="#d9a98f" strokeWidth="1.2" strokeLinecap="round" />
                                </g>
                            </g>
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
