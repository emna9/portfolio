import { useScene } from '../../context/SceneContext';
import { useGalleryProjects, useAwards } from '../../hooks/useSanityData';
import { experienceCards } from '../../data/experience';
import { rewardCards } from '../../data/rewards';
import { extracurricularCards } from '../../data/extracurricular';
import '../../styles/ScreenReaderOverlay.scss';

/**
 * ScreenReaderOverlay — A7 Accessibility
 * 
 * Invisible HTML layer providing screen reader access to 3D canvas content.
 * Contains buttons/links matching interactive 3D elements (doors, rooms).
 * Visually hidden via .sr-only but fully accessible to assistive tech.
 */
const ScreenReaderOverlay = () => {
    const { hasEntered, isInRoom, currentRoom, teleportTo, requestExit } = useScene();

    // Pobieranie danych do wygenerowania niewidocznego HTML-a dla SEO / robotów
    const projects = useGalleryProjects();
    const awards = useAwards();

    const roomLabel = currentRoom === 'about' ? 'About' :
        currentRoom === 'gallery' ? 'Projects' :
            currentRoom === 'experience' ? 'Experience' :
                currentRoom === 'rewards' ? 'Rewards' :
                        currentRoom === 'contact' ? 'Contact' : currentRoom;

    return (
        <div className="sr-overlay" role="complementary" aria-label="Accessible navigation for 3D portfolio">
            {/* Skip to content link */}
            <a href="#sr-main-nav" className="sr-only sr-focusable">
                Skip to accessible navigation
            </a>

            {/* Main accessible navigation */}
            <nav id="sr-main-nav" className="sr-only" aria-label="Portfolio rooms">
                <h1>Emna Smaali — Software Engineering Student</h1>
                <h2>Portfolio Navigation</h2>

                {!hasEntered && (
                    <p>Welcome to Emna Smaali's interactive 3D portfolio. Click or press Enter on the doors to enter.</p>
                )}

                {hasEntered && !isInRoom && (
                    <>
                        <p>You are in the corridor. Choose a room to explore:</p>
                        <ul>
                            <li>
                                <button onClick={() => teleportTo('about')} type="button">
                                    About — My story, education, awards, and skills
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('gallery')} type="button">
                                    Projects — My selected projects
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('experience')} type="button">
                                    The Experience — My professional experience
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('rewards')} type="button">
                                    Rewards — Awards and recognition
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('extracurricular')} type="button">
                                    Extracurricular — Leadership and activities
                                </button>
                            </li>
                            <li>
                                <button onClick={() => teleportTo('contact')} type="button">
                                    Contact — Get in touch with me
                                </button>
                            </li>
                        </ul>
                    </>
                )}

                {hasEntered && isInRoom && (
                    <>
                        <p>You are in the {roomLabel} room.</p>
                        <button onClick={requestExit} type="button">
                            Go back to corridor
                        </button>

                        {/* Room-specific content descriptions */}
                        {currentRoom === 'about' && (
                            <div aria-label="About room content">
                                <h3>About Me</h3>
                                <p>This room contains my personal story, awards, education and internship milestones, and technical skills displayed as interactive balloons.</p>

                                {awards && (
                                    <section>
                                        <h4>My Awards & Recognition</h4>
                                        <ul>
                                            {awards.sotd && awards.sotd.items && awards.sotd.items.map((a, i) => (
                                                <li key={i}>{a.label} - {a.date}</li>
                                            ))}
                                            {awards.sotm && awards.sotm.items && awards.sotm.items.map((a, i) => (
                                                <li key={i}>{a.label} - {a.date}</li>
                                            ))}
                                            {awards.other && awards.other.items && awards.other.items.map((a, i) => (
                                                <li key={i}>{a.label} - {a.date}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        )}
                        {currentRoom === 'gallery' && (
                            <div aria-label="Gallery room content">
                                <h3>My Projects</h3>
                                <p>Browse through my selected projects displayed on paper cards. Click on a project card to read the details.</p>

                                {projects && projects.length > 0 && (
                                    <ul>
                                        {projects.map((p, i) => (
                                            <li key={i}>
                                                <h4>{p.title}</h4>
                                                <p>{p.description}</p>
                                                {p.url && <a href={p.url}>Visit {p.title}</a>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {currentRoom === 'experience' && (
                            <div aria-label="Experience room content">
                                <h3>Professional Experience</h3>
                                <p>Five internships displayed on paper cards. Click a card to read the role details.</p>
                                <ul>
                                    {experienceCards.map((item) => (
                                        <li key={item.id}>
                                            <h4>{item.title}</h4>
                                            <p>{item.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {currentRoom === 'rewards' && (
                            <div aria-label="Rewards room content">
                                <h3>Rewards</h3>
                                <p>My awards and hackathon placements displayed on paper cards.</p>
                                <ul>
                                    {rewardCards.map((item) => (
                                        <li key={item.id}>
                                            <h4>{item.title}</h4>
                                            <p>{item.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {currentRoom === 'extracurricular' && (
                            <div aria-label="Extracurricular room content">
                                <h3>Extracurricular</h3>
                                <p>My leadership roles displayed on paper cards.</p>
                                <ul>
                                    {extracurricularCards.map((item) => (
                                        <li key={item.id}>
                                            <h4>{item.title}</h4>
                                            <p>{item.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {currentRoom === 'contact' && (
                            <div aria-label="Contact room content">
                                <h3>Contact Me</h3>
                                <p>Find my social media links displayed as floating barrels. Click to visit my profiles on LinkedIn, GitHub, and other platforms.</p>
                            </div>
                        )}

                        {/* Quick navigation to other rooms */}
                        <h3>Quick Navigation</h3>
                        <ul>
                            {currentRoom !== 'about' && (
                                <li><button onClick={() => teleportTo('about')} type="button">Go to About</button></li>
                            )}
                            {currentRoom !== 'gallery' && (
                                <li><button onClick={() => teleportTo('gallery')} type="button">Go to Projects</button></li>
                            )}
                            {currentRoom !== 'experience' && (
                                <li><button onClick={() => teleportTo('experience')} type="button">Go to Experience</button></li>
                            )}
                            {currentRoom !== 'rewards' && (
                                <li><button onClick={() => teleportTo('rewards')} type="button">Go to Rewards</button></li>
                            )}
                            {currentRoom !== 'extracurricular' && (
                                <li><button onClick={() => teleportTo('extracurricular')} type="button">Go to Extracurricular</button></li>
                            )}
                            {currentRoom !== 'contact' && (
                                <li><button onClick={() => teleportTo('contact')} type="button">Go to Contact</button></li>
                            )}
                        </ul>
                    </>
                )}
            </nav>

            {/* Live region for state changes */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {isInRoom && `Entered ${roomLabel} room`}
            </div>
        </div>
    );
};

export default ScreenReaderOverlay;
