import { useEffect, useMemo, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { useGuidance } from '../../context/GuidanceContext';
import { hasSeenTutorial } from '../../utils/controls';
import { Typewriter } from './Typewriter';
import '../../styles/Guidance.scss';

const KEY_ALIASES = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'w', W: 'w', a: 'a', A: 'a', s: 's', S: 's', d: 'd', D: 'd',
};

const STEPS = [
    {
        id: 'welcome',
        kicker: 'WELCOME',
        text: "Welcome to my little world! I'm Emna.\n\nThink of this house as my professional journey. Every door leads to a different chapter of my story.\n\nUse your keyboard arrows to explore, follow the little path, and approach any door to discover what's inside.\n\nNot a fan of exploring? No worries! You can also use the navigation menu to jump directly to any section.\n\nLet's take a look around!",
        next: 'Show me around',
    },
    {
        id: 'controls',
        kicker: 'MOVING AROUND',
        text: "Walk with the arrow keys, or W A S D if you prefer. Movement is slow and gentle, so take your time.\n\nStep left and right to line up with a door. Press ENTER when you are close enough to open it.",
        next: 'Got it',
    },
    {
        id: 'doors',
        kicker: 'THE DOORS',
        text: "Each door is a chapter. When you get close, it lights up and tells you what is inside.\n\nStart with Projects if you would like to see what I build. Or wander - every room is open.",
        next: "Let's explore",
    },
];

const ArrowKeys = ({ pressed }) => (
    <div className="keyboard-illustration" aria-hidden="true">
        <div className="keyboard-row">
            <span className={`keycap ${pressed.has('up') ? 'is-pressed' : ''}`}>↑</span>
        </div>
        <div className="keyboard-row">
            <span className={`keycap ${pressed.has('left') ? 'is-pressed' : ''}`}>←</span>
            <span className={`keycap ${pressed.has('down') ? 'is-pressed' : ''}`}>↓</span>
            <span className={`keycap ${pressed.has('right') ? 'is-pressed' : ''}`}>→</span>
        </div>
        <span className="keyboard-or">or</span>
        <div className="keyboard-row">
            <span className={`keycap ${pressed.has('w') ? 'is-pressed' : ''}`}>W</span>
        </div>
        <div className="keyboard-row">
            <span className={`keycap ${pressed.has('a') ? 'is-pressed' : ''}`}>A</span>
            <span className={`keycap ${pressed.has('s') ? 'is-pressed' : ''}`}>S</span>
            <span className={`keycap ${pressed.has('d') ? 'is-pressed' : ''}`}>D</span>
        </div>
    </div>
);

const DoorSketch = () => (
    <svg className="tutorial-door-sketch" viewBox="0 0 120 140" aria-hidden="true">
        <path d="M18 128V30l42-18 42 18v98" />
        <path d="M30 128V40l30-13 30 13v88" />
        <path d="M30 128h60" />
        <circle cx="80" cy="86" r="3" />
        <path d="M96 52c8 6 8 18 0 24" />
        <path d="M104 44c12 10 12 28 0 38" />
        <path d="M12 128h96" />
    </svg>
);

/**
 * TutorialOverlay - first-visit guided introduction, replayable from Help.
 */
const TutorialOverlay = () => {
    const { hasEntered, isInRoom } = useScene();
    const { tutorialOpen, openTutorial, closeTutorial } = useGuidance();
    const [step, setStep] = useState(0);
    const [pressed, setPressed] = useState(() => new Set());

    // Open automatically on the first visit, once the visitor is inside.
    useEffect(() => {
        if (!hasEntered || isInRoom) return undefined;
        if (hasSeenTutorial()) return undefined;
        const timer = setTimeout(() => openTutorial(), 1100);
        return () => clearTimeout(timer);
    }, [hasEntered, isInRoom, openTutorial]);

    // Restart from the first slide whenever the tutorial is (re)opened.
    useEffect(() => {
        if (tutorialOpen) setStep(0);
    }, [tutorialOpen]);

    // Live key highlighting.
    useEffect(() => {
        if (!tutorialOpen) return undefined;
        const handleDown = (event) => {
            const alias = KEY_ALIASES[event.key];
            if (!alias) return;
            event.preventDefault();
            setPressed(prev => {
                if (prev.has(alias)) return prev;
                const next = new Set(prev);
                next.add(alias);
                return next;
            });
        };
        const handleUp = (event) => {
            const alias = KEY_ALIASES[event.key];
            if (!alias) return;
            setPressed(prev => {
                if (!prev.has(alias)) return prev;
                const next = new Set(prev);
                next.delete(alias);
                return next;
            });
        };
        const clear = () => setPressed(new Set());
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        window.addEventListener('blur', clear);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
            window.removeEventListener('blur', clear);
        };
    }, [tutorialOpen]);

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    const handleNext = () => {
        if (isLast) {
            closeTutorial(true);
            return;
        }
        setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleSkip = () => closeTutorial(true);

    const stepLabel = useMemo(() => `${step + 1} / ${STEPS.length}`, [step]);

    if (!tutorialOpen) return null;

    return (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Welcome tutorial">
            <div className="tutorial-card">
                <div className="tutorial-card__header">
                    <span className="tutorial-card__kicker">{current.kicker}</span>
                    <div className="tutorial-card__header-right">
                        <span className="tutorial-card__progress">{stepLabel}</span>
                        <button type="button" className="tutorial-skip" onClick={handleSkip}>
                            Skip tutorial
                        </button>
                    </div>
                </div>

                <div className="tutorial-card__body">
                    {step === 1 && <ArrowKeys pressed={pressed} />}
                    {step === 2 && (
                        <div className="tutorial-door-wrap">
                            <DoorSketch />
                            <span className="keycap keycap--enter">ENTER</span>
                        </div>
                    )}

                    <Typewriter
                        key={current.id}
                        text={current.text}
                        speed={16}
                        className="tutorial-text"
                    />
                </div>

                {step === 2 && (
                    <p className="tutorial-recommendation">
                        Recommended first stop: <strong>Projects</strong> - the first door on your left.
                    </p>
                )}

                <div className="tutorial-card__footer">
                    <div className="tutorial-dots" aria-hidden="true">
                        {STEPS.map((item, index) => (
                            <span key={item.id} className={index === step ? 'is-active' : ''} />
                        ))}
                    </div>
                    <div className="tutorial-actions">
                        {step > 0 && (
                            <button type="button" className="tutorial-btn tutorial-btn--ghost" onClick={() => setStep(prev => prev - 1)}>
                                Back
                            </button>
                        )}
                        <button type="button" className="tutorial-btn" onClick={handleNext}>
                            {isLast ? "Let's explore" : current.next}
                        </button>
                    </div>
                </div>

                <p className="tutorial-card__footnote">
                    You can replay this anytime from the Help button.
                </p>
            </div>
        </div>
    );
};

export default TutorialOverlay;
