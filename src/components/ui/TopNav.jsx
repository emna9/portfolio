import { useEffect, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { useGuidance } from '../../context/GuidanceContext';
import { setSkipIntro } from '../../utils/controls';
import '../../styles/TopNav.scss';

const SECTIONS = [
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'extracurricular', label: 'Extracurricular' },
    { id: 'contact', label: 'Contact' },
];

/**
 * TopNav - permanent, modern editorial navigation for the house.
 * On the landing page, choosing a section enters the house and goes straight there.
 */
const TopNav = () => {
    const { hasEntered, currentRoom, isInRoom, isTeleporting, teleportTo, requestExit, deeplinkHandled } = useScene();
    const { closeTutorial } = useGuidance();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pendingRef = useRef(null);

    // If a section was chosen from the landing page, enter and go there directly.
    useEffect(() => {
        if (!hasEntered || !pendingRef.current) return undefined;
        const target = pendingRef.current;
        const timer = setTimeout(() => {
            if (pendingRef.current !== target) return;
            pendingRef.current = null;
            closeTutorial(true);
            teleportTo(target);
        }, 1600);
        return () => clearTimeout(timer);
    }, [hasEntered, closeTutorial, teleportTo]);

    const goTo = (roomId) => {
        setMobileOpen(false);
        if (!hasEntered) {
            // A section chosen from the landing takes priority over any deep link.
            deeplinkHandled.current = true;
            pendingRef.current = roomId;
            setSkipIntro(true);
            window.dispatchEvent(new CustomEvent('sketch-enter-house'));
            return;
        }
        if (roomId === currentRoom) return;
        closeTutorial(true);
        teleportTo(roomId);
    };

    const goHome = () => {
        setMobileOpen(false);
        if (hasEntered && isInRoom) {
            requestExit();
            return;
        }
        window.location.href = import.meta.env.BASE_URL;
    };

    const homeActive = !hasEntered;

    return (
        <header className={`top-nav ${mobileOpen ? 'is-open' : ''}`}>
            <div className="top-nav__inner">
                <button type="button" className="top-nav__brand" onClick={goHome}>
                    <span className="top-nav__brand-name">Emna Smaali</span>
                    <span className="top-nav__brand-role">Software Engineering</span>
                </button>

                <nav className="top-nav__links" aria-label="Portfolio sections">
                    <button
                        type="button"
                        className={`top-nav__link ${homeActive ? 'is-active' : ''}`}
                        onClick={goHome}
                    >
                        Home
                    </button>
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            type="button"
                            className={`top-nav__link ${currentRoom === section.id ? 'is-active' : ''}`}
                            onClick={() => goTo(section.id)}
                            disabled={isTeleporting}
                        >
                            {section.label}
                        </button>
                    ))}
                    <a
                        className="top-nav__cv"
                        href="Emna_Smaali_CV.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        CV
                    </a>
                </nav>

                <button
                    type="button"
                    className="top-nav__menu"
                    onClick={() => setMobileOpen(prev => !prev)}
                    aria-label="Open navigation menu"
                    aria-expanded={mobileOpen}
                >
                    <span />
                    <span />
                </button>
            </div>

            <div className="top-nav__mobile">
                <button type="button" className={`top-nav__mobile-link ${homeActive ? 'is-active' : ''}`} onClick={goHome}>
                    Home
                </button>
                {SECTIONS.map(section => (
                    <button
                        key={section.id}
                        type="button"
                        className={`top-nav__mobile-link ${currentRoom === section.id ? 'is-active' : ''}`}
                        onClick={() => goTo(section.id)}
                    >
                        {section.label}
                    </button>
                ))}
                <a
                    className="top-nav__mobile-cv"
                    href="Emna_Smaali_CV.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View CV
                </a>
            </div>
        </header>
    );
};

export default TopNav;
