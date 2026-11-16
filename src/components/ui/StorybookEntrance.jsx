import { useCallback, useEffect, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { useAudio } from '../../context/AudioManager';
import '../../styles/StorybookEntrance.scss';

const Ornament = () => (
    <svg className="storybook__ornament" viewBox="0 0 120 18" aria-hidden="true">
        <path d="M2 9h34" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M118 9H84" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M60 3c-6 0-9 3-9 6 0 3 3 6 9 6s9-3 9-6c0-3-3-6-9-6Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M51 9c-5-4-9-4-12-1 3 4 8 5 12 1Z" fill="currentColor" opacity="0.55" />
        <path d="M69 9c5-4 9-4 12-1-3 4-8 5-12 1Z" fill="currentColor" opacity="0.55" />
        <circle cx="60" cy="9" r="1.8" fill="currentColor" />
    </svg>
);

const SoundIcon = ({ muted }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        {muted ? (
            <path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
            <>
                <path d="M16 8.5c1.6 1 2.4 2.1 2.4 3.5s-.8 2.5-2.4 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M18.5 6c2.2 1.5 3.3 3.5 3.3 6s-1.1 4.5-3.3 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
            </>
        )}
    </svg>
);

/**
 * StorybookEntrance - hand-illustrated Dordogne-style courtyard for the landing.
 * It covers the 3D entrance until the visitor enters, then fades into the hall.
 */
const StorybookEntrance = () => {
    const { hasEntered } = useScene();
    const { isMuted, toggleMute } = useAudio();
    const [entering, setEntering] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [done, setDone] = useState(false);
    const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);

    const enter = useCallback(() => {
        setEntering(prev => {
            if (prev) return prev;
            window.dispatchEvent(new CustomEvent('sketch-enter-house'));
            return true;
        });
    }, []);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Enter') enter();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [enter]);

    useEffect(() => {
        if (!hasEntered) return undefined;
        setLeaving(true);
        const timer = setTimeout(() => setDone(true), 1000);
        return () => clearTimeout(timer);
    }, [hasEntered]);

    useEffect(() => {
        const onResize = () => setNarrow(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        document.body.classList.add('storybook-open');
        return () => document.body.classList.remove('storybook-open');
    }, []);

    if (done) return null;

    return (
        <div className={`storybook ${entering ? 'is-entering' : ''} ${leaving ? 'is-leaving' : ''}`}>
            <svg
                className="storybook__scene"
                viewBox={narrow ? '760 0 780 900' : '0 0 1600 900'}
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#F8F0E0" />
                        <stop offset="0.45" stopColor="#F3EBDD" />
                        <stop offset="0.75" stopColor="#EFE2C9" />
                        <stop offset="1" stopColor="#E7D6B8" />
                    </linearGradient>
                    <linearGradient id="sb-stone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#EFE1C9" />
                        <stop offset="0.55" stopColor="#E6D5BA" />
                        <stop offset="1" stopColor="#D8C6A8" />
                    </linearGradient>
                    <linearGradient id="sb-door" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#743347" />
                        <stop offset="0.55" stopColor="#632B3B" />
                        <stop offset="1" stopColor="#4E1F2C" />
                    </linearGradient>
                    <linearGradient id="sb-path" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#D8C9B2" />
                        <stop offset="0.4" stopColor="#C9B79C" />
                        <stop offset="1" stopColor="#A58E77" />
                    </linearGradient>
                    <linearGradient id="sb-hair" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#4A3026" />
                        <stop offset="0.6" stopColor="#3E2A24" />
                        <stop offset="1" stopColor="#2E1D1B" />
                    </linearGradient>
                    <radialGradient id="sb-glow">
                        <stop offset="0" stopColor="#F7E9CE" stopOpacity="0.9" />
                        <stop offset="1" stopColor="#F7E9CE" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="sb-sun" x1="0" y1="0" x2="0.4" y2="1">
                        <stop offset="0" stopColor="#F7E9CE" stopOpacity="0.7" />
                        <stop offset="1" stopColor="#A58E77" stopOpacity="0.25" />
                    </linearGradient>
                    <radialGradient id="sb-vignette" cx="50%" cy="46%" r="72%">
                        <stop offset="0.55" stopColor="#422A28" stopOpacity="0" />
                        <stop offset="1" stopColor="#422A28" stopOpacity="0.22" />
                    </radialGradient>
                    <pattern id="sb-stones" width="120" height="46" patternUnits="userSpaceOnUse">
                        <rect width="120" height="46" fill="none" />
                        <path d="M0 45.5h120M0 0h120M60 0v46" stroke="#A89478" strokeWidth="1.2" opacity="0.75" />
                        <path d="M0 23h120" stroke="#A89478" strokeWidth="0.9" opacity="0.45" />
                    </pattern>
                    <pattern id="sb-cobbles" width="90" height="60" patternUnits="userSpaceOnUse">
                        <rect width="90" height="60" fill="#C9B79C" />
                        <path d="M5 6c9-3 19-3 27 0 2 6 2 13 0 18-9 3-18 3-27 0-2-6-2-12 0-18Z" fill="#C2B097" />
                        <path d="M36 4c8-2 18-2 24 2 2 6 1 13-1 17-8 3-17 2-23-1-2-6-2-13 0-18Z" fill="#D8C9B2" />
                        <path d="M64 7c7-3 15-3 21 0 2 6 1 12-1 16-7 2-14 2-20-1-2-5-2-11 0-15Z" fill="#B8A58C" />
                        <path d="M4 33c9-3 19-3 27 0 2 6 2 12-1 17-9 3-18 2-26-1-2-5-2-11 0-16Z" fill="#D8C9B2" />
                        <path d="M35 31c8-3 18-2 24 1 2 6 1 12-1 16-8 3-17 2-23-1-2-6-2-11 0-16Z" fill="#B8A995" />
                        <path d="M64 35c7-3 15-2 21 1 2 5 1 11-1 15-7 2-14 2-20-1-2-5-2-10 0-15Z" fill="#C9B79C" />
                        <path d="M0 0h90v60H0z" fill="none" stroke="#8E7A63" strokeWidth="0.6" opacity="0.2" />
                    </pattern>
                    <filter id="sb-soft" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="7" />
                    </filter>
                    <filter id="sb-soft-small" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="2.2" />
                    </filter>
                    <filter id="sb-grain" x="0" y="0" width="100%" height="100%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feComponentTransfer>
                            <feFuncA type="table" tableValues="0 0.07" />
                        </feComponentTransfer>
                    </filter>
                </defs>

                {/* Sky and clouds */}
                <rect width="1600" height="900" fill="url(#sb-sky)" />
                <g fill="#FBF5E9" opacity="0.75" filter="url(#sb-soft)">
                    <ellipse cx="260" cy="150" rx="120" ry="34" />
                    <ellipse cx="350" cy="130" rx="80" ry="26" />
                    <ellipse cx="560" cy="100" rx="100" ry="30" />
                    <ellipse cx="980" cy="120" rx="110" ry="28" />
                    <ellipse cx="1180" cy="90" rx="90" ry="24" />
                </g>

                {/* Distant hills and cypresses */}
                <path d="M0 470c180-40 360-15 540-40 200-28 420 20 640-5 180-20 300 5 420-10v315H0Z" fill="#9A9C7B" opacity="0.45" />
                <path d="M0 525c180-38 340-16 520-38 180-24 340 22 520 2 180-20 360 18 560-8v299H0Z" fill="#85896A" opacity="0.55" />
                <g fill="#5F6647">
                    <path d="M560 500c-10-60-6-150 8-190 12 40 16 130 6 190Z" />
                    <path d="M606 500c-12-80-8-190 10-240 14 50 18 160 6 240Z" />
                    <path d="M654 500c-9-55-5-140 8-178 11 38 15 123 5 178Z" />
                    <path d="M702 500c-11-70-7-170 9-214 13 44 16 144 5 214Z" />
                </g>

                {/* House */}
                <g className="storybook__house">
                    <path d="M600 235 1600 92v84L600 305Z" fill="#7B523D" />
                    <path d="M600 235 1600 92v22L600 258Z" fill="#8C6048" opacity="0.8" />
                    <path d="M600 250 1600 108v8L600 266Z" fill="#422A28" opacity="0.25" />
                    <path d="M600 305 1600 176v524H600Z" fill="url(#sb-stone)" />
                    <path d="M600 305 1600 176v524H600Z" fill="url(#sb-stones)" opacity="0.8" />
                    <path d="M600 305 1600 176v26L600 331Z" fill="#422A28" opacity="0.18" />
                    <path d="M600 305 1600 176v6L600 311Z" fill="#F3EBDD" opacity="0.35" />
                    <path d="M600 620 1600 500v200H600Z" fill="#422A28" opacity="0.12" />
                    <path d="M600 305 640 300v400H600Z" fill="#422A28" opacity="0.14" />
                    <path d="M600 305 1600 176v524H600Z" fill="url(#sb-vignette)" opacity="0.4" />

                    {/* Roof tiles */}
                    <g stroke="#6B4531" strokeWidth="1.2" opacity="0.5">
                        <path d="M620 245 1600 106M640 258 1600 120M660 270 1600 133M680 282 1600 147M600 258 1600 120M610 270 1600 133M630 283 1600 146M650 295 1600 159" opacity="0.9" />
                        <path d="M600 298 1600 168" stroke="#422A28" strokeWidth="6" opacity="0.55" />
                        <path d="M600 306 1600 176" stroke="#F3EBDD" strokeWidth="2" opacity="0.4" />
                    </g>

                    {/* Ivy along the upper facade */}
                    <g>
                        <path d="M720 300c-10-24-6-50 12-68M760 300c-6-30 2-56 22-72M800 305c-4-28 4-52 20-66" stroke="#6B7057" strokeWidth="3" fill="none" />
                        <g fill="#777B5B">
                            <ellipse cx="726" cy="288" rx="12" ry="6" transform="rotate(-30 726 288)" />
                            <ellipse cx="742" cy="268" rx="12" ry="6" transform="rotate(-50 742 268)" />
                            <ellipse cx="756" cy="246" rx="11" ry="6" transform="rotate(-70 756 246)" />
                            <ellipse cx="766" cy="288" rx="12" ry="6" transform="rotate(-20 766 288)" />
                            <ellipse cx="784" cy="264" rx="12" ry="6" transform="rotate(-40 784 264)" />
                            <ellipse cx="800" cy="244" rx="11" ry="6" transform="rotate(-60 800 244)" />
                            <ellipse cx="806" cy="292" rx="12" ry="6" transform="rotate(-10 806 292)" />
                            <ellipse cx="820" cy="270" rx="11" ry="6" transform="rotate(-30 820 270)" />
                        </g>
                        <g fill="#B77F7D">
                            <circle cx="738" cy="274" r="6" />
                            <circle cx="778" cy="252" r="6" />
                            <circle cx="812" cy="278" r="6" />
                        </g>
                    </g>

                    {/* Upper left window */}
                    <g>
                        <rect x="820" y="262" width="178" height="196" rx="3" fill="#B8A995" />
                        <rect x="830" y="272" width="158" height="176" fill="#D8C9B2" />
                        <rect x="830" y="272" width="158" height="176" fill="none" stroke="#8E7A63" strokeWidth="3" />
                        <path d="M909 272v176M830 360h158" stroke="#8E7A63" strokeWidth="4" />
                        <rect x="830" y="272" width="158" height="176" fill="#F3EBDD" opacity="0.25" />
                        <path d="M836 440 900 272h34L848 440Z" fill="#FBF5E9" opacity="0.25" />
                        <rect x="830" y="272" width="158" height="30" fill="#422A28" opacity="0.16" />
                        <rect x="830" y="272" width="20" height="176" fill="#422A28" opacity="0.1" />
                        {/* shutters */}
                        <rect x="784" y="262" width="34" height="196" fill="#8C9275" />
                        <rect x="1000" y="262" width="34" height="196" fill="#8C9275" />
                        <path d="M790 272h22v176h-22zM1006 272h22v176h-22z" fill="#777B5B" opacity="0.6" />
                        <path d="M790 290h22M790 320h22M790 350h22M790 380h22M790 410h22M1006 290h22M1006 320h22M1006 350h22M1006 380h22M1006 410h22" stroke="#5F6647" strokeWidth="1.5" opacity="0.55" />
                        <rect x="812" y="456" width="194" height="10" fill="#C9B79C" />
                    </g>

                    {/* Lower left window */}
                    <g>
                        <rect x="690" y="462" width="184" height="196" rx="3" fill="#B8A995" />
                        <rect x="700" y="472" width="164" height="176" fill="#D8C9B2" />
                        <rect x="700" y="472" width="164" height="176" fill="none" stroke="#8E7A63" strokeWidth="3" />
                        <path d="M782 472v176M700 560h164" stroke="#8E7A63" strokeWidth="4" />
                        <rect x="700" y="472" width="164" height="176" fill="#F3EBDD" opacity="0.22" />
                        <path d="M706 640 770 472h34L718 640Z" fill="#FBF5E9" opacity="0.22" />
                        <rect x="700" y="472" width="164" height="28" fill="#422A28" opacity="0.14" />
                        <rect x="700" y="472" width="20" height="176" fill="#422A28" opacity="0.1" />
                        <rect x="652" y="462" width="36" height="196" fill="#8C9275" />
                        <rect x="876" y="462" width="36" height="196" fill="#8C9275" />
                        <path d="M658 472h24v176h-24zM882 472h24v176h-24z" fill="#777B5B" opacity="0.6" />
                        <path d="M658 492h24M658 522h24M658 552h24M658 582h24M658 612h24M882 492h24M882 522h24M882 552h24M882 582h24M882 612h24" stroke="#5F6647" strokeWidth="1.5" opacity="0.55" />
                        {/* flower box */}
                        <rect x="694" y="656" width="176" height="26" rx="4" fill="#805B46" />
                        <g fill="#B77F7D">
                            <circle cx="714" cy="650" r="8" />
                            <circle cx="736" cy="644" r="7" />
                            <circle cx="758" cy="651" r="8" />
                            <circle cx="782" cy="643" r="7" />
                            <circle cx="806" cy="650" r="8" />
                            <circle cx="830" cy="644" r="7" />
                            <circle cx="852" cy="650" r="8" />
                        </g>
                        <g fill="#777B5B">
                            <ellipse cx="724" cy="656" rx="12" ry="5" />
                            <ellipse cx="770" cy="658" rx="13" ry="5" />
                            <ellipse cx="818" cy="656" rx="12" ry="5" />
                            <ellipse cx="846" cy="658" rx="11" ry="5" />
                        </g>
                    </g>

                    {/* Right window */}
                    <g>
                        <rect x="1432" y="250" width="168" height="220" rx="3" fill="#B8A995" />
                        <rect x="1442" y="260" width="148" height="200" fill="#D8C9B2" />
                        <rect x="1442" y="260" width="148" height="200" fill="none" stroke="#8E7A63" strokeWidth="3" />
                        <path d="M1516 260v200M1442 360h148" stroke="#8E7A63" strokeWidth="4" />
                        <rect x="1442" y="260" width="148" height="200" fill="#F3EBDD" opacity="0.24" />
                    </g>

                    {/* Door arch and entrance */}
                    <g>
                        <path d="M1108 700V392c0-62 50-112 112-112s112 50 112 112v308Z" fill="#C9B79C" stroke="#B8A995" strokeWidth="3" />
                        <path d="M1122 700V398c0-54 44-98 98-98s98 44 98 98v302Z" fill="#D8C9B2" />
                        <g stroke="#B8A995" strokeWidth="2" opacity="0.8">
                            <path d="M1130 370c14-36 44-60 90-60s76 24 90 60" fill="none" />
                            <path d="M1142 386c12-28 38-48 78-48s66 20 78 48" fill="none" />
                        </g>
                        <path d="M1144 700V400c0-42 34-76 76-76s76 34 76 76v300Z" fill="#3A1D26" />
                        {/* fanlight */}
                        <path d="M1148 404c0-40 32-72 72-72s72 32 72 72Z" fill="#3A1D26" />
                        <path d="M1148 404c0-40 32-72 72-72s72 32 72 72Z" fill="#632B3B" opacity="0.5" />
                        <g stroke="#8E7A63" strokeWidth="2.5" opacity="0.8">
                            <path d="M1220 332v72M1188 338l18 66M1252 338l-18 66M1162 354l34 50M1278 354l-34 50" />
                        </g>
                        {/* door leaves */}
                        <g className="door-leaf door-leaf--left">
                            <path d="M1150 700V406c0-32 24-58 56-62v356Z" fill="url(#sb-door)" />
                            <path d="M1158 436h40v72h-40zM1158 528h40v82h-40z" fill="#4E1F2C" opacity="0.7" stroke="#7A3A4C" strokeWidth="1.5" />
                            <path d="M1162 440h32v64h-32zM1162 532h32v74h-32z" fill="none" stroke="#8C4557" strokeWidth="1" opacity="0.6" />
                            <circle cx="1204" cy="540" r="4.5" fill="#D8C9B2" stroke="#8E7A63" strokeWidth="1" />
                        </g>
                        <g className="door-leaf door-leaf--right">
                            <path d="M1290 700V406c0-32-24-58-56-62v356Z" fill="url(#sb-door)" />
                            <path d="M1242 436h40v72h-40zM1242 528h40v82h-40z" fill="#4E1F2C" opacity="0.7" stroke="#7A3A4C" strokeWidth="1.5" />
                            <path d="M1246 440h32v64h-32zM1246 532h32v74h-32z" fill="none" stroke="#8C4557" strokeWidth="1" opacity="0.6" />
                            <circle cx="1236" cy="540" r="4.5" fill="#D8C9B2" stroke="#8E7A63" strokeWidth="1" />
                        </g>
                        {/* lantern */}
                        <g>
                            <circle cx="1104" cy="316" r="64" fill="url(#sb-glow)" opacity="0.9" />
                            <path d="M1104 300v18" stroke="#422A28" strokeWidth="3" />
                            <path d="M1090 316h28l-4 30h-20Z" fill="#422A28" />
                            <path d="M1094 322h20l-3 20h-14Z" fill="#F3EBDD" />
                            <path d="M1090 316h28" stroke="#422A28" strokeWidth="3" />
                        </g>
                        {/* steps */}
                        <path d="M1104 700h232v16h-232z" fill="#B8A995" />
                        <path d="M1118 716h204v14H1118z" fill="#C9B79C" />
                        <path d="M1132 730h176v12h-176z" fill="#B8A995" />
                    </g>

                    {/* Climbing roses around the arch */}
                    <g>
                        <g stroke="#6B7057" strokeWidth="3" fill="none">
                            <path d="M1150 380c-30-40-34-90-12-124M1290 380c30-44 34-94 10-128M1144 470c-34-8-52-26-58-48M1296 470c34-8 52-26 58-48" />
                        </g>
                        <g fill="#777B5B">
                            <ellipse cx="1146" cy="356" rx="12" ry="6" transform="rotate(-30 1146 356)" />
                            <ellipse cx="1128" cy="318" rx="12" ry="6" transform="rotate(-50 1128 318)" />
                            <ellipse cx="1138" cy="286" rx="11" ry="6" transform="rotate(-70 1138 286)" />
                            <ellipse cx="1294" cy="350" rx="12" ry="6" transform="rotate(30 1294 350)" />
                            <ellipse cx="1310" cy="310" rx="12" ry="6" transform="rotate(50 1310 310)" />
                            <ellipse cx="1300" cy="278" rx="11" ry="6" transform="rotate(70 1300 278)" />
                            <ellipse cx="1120" cy="440" rx="11" ry="5" />
                            <ellipse cx="1320" cy="440" rx="11" ry="5" />
                        </g>
                        <g fill="#B77F7D">
                            <circle cx="1144" cy="342" r="8" />
                            <circle cx="1126" cy="304" r="7" />
                            <circle cx="1136" cy="272" r="7" />
                            <circle cx="1296" cy="336" r="8" />
                            <circle cx="1312" cy="296" r="7" />
                            <circle cx="1302" cy="264" r="7" />
                            <circle cx="1114" cy="426" r="6" />
                            <circle cx="1326" cy="426" r="6" />
                        </g>
                        <g fill="#D8C9B2">
                            <circle cx="1144" cy="342" r="3" />
                            <circle cx="1296" cy="336" r="3" />
                        </g>
                    </g>
                </g>

                {/* Warm sunlight and watercolour washes */}
                <g filter="url(#sb-soft)" pointerEvents="none">
                    <path d="M980 0h620v620L1080 470Z" fill="#F7E9CE" opacity="0.16" />
                    <ellipse cx="860" cy="410" rx="240" ry="150" fill="#D8C9B2" opacity="0.14" />
                    <ellipse cx="1260" cy="520" rx="200" ry="150" fill="#B77F7D" opacity="0.06" />
                    <ellipse cx="480" cy="650" rx="280" ry="130" fill="#777B5B" opacity="0.1" />
                </g>

                {/* Garden wall and gate on the left */}
                <g>
                    <path d="M0 548h210v220H0Z" fill="#C9B79C" />
                    <path d="M0 548h210v220H0Z" fill="url(#sb-stones)" opacity="0.7" />
                    <path d="M0 548h210v14H0Z" fill="#B8A995" />
                    <path d="M150 506h58v42h-58Z" fill="#D8C9B2" />
                    <path d="M144 498h70v12h-70Z" fill="#B8A995" />
                    <g stroke="#422A28" strokeWidth="3" opacity="0.85">
                        <path d="M8 560v190M28 560v190M48 560v190M68 560v190M88 560v190" />
                        <path d="M4 600h92M4 660h92" />
                        <path d="M6 560c14-28 28-40 44-40s30 12 44 40" fill="none" />
                    </g>
                </g>

                {/* Garden shrubs and flowers */}
                <g filter="url(#sb-soft-small)" opacity="0.6">
                    <path d="M210 720c26-84 102-116 176-94 34-64 118-74 182-32 52-44 128-22 168 22 54-12 108 22 118 64 42 2 74 32 84 64H210Z" fill="#5F6647" />
                </g>
                <g filter="url(#sb-soft-small)">
                    <path d="M230 720c20-70 70-96 120-84 26-58 92-72 138-44 40-40 108-34 142 8 44-20 94 2 108 42 40-6 74 20 84 52 26 10 38 36 30 62H230Z" fill="#6B7057" />
                    <path d="M300 712c16-46 54-64 90-54 22-40 74-46 108-22 34-26 82-16 104 18 34-10 66 12 72 42 24 8 34 30 26 52H300Z" fill="#777B5B" />
                    <path d="M420 716c14-34 44-48 74-38 18-28 58-32 84-14 28-16 62-6 76 20 26-4 46 14 50 36 14 6 20 22 14 38H420Z" fill="#8C9271" />
                    <path d="M700 720c12-28 40-40 66-30 18-24 54-26 76-10 24-12 54-2 66 20 22-2 38 14 42 34 10 6 16 20 10 34H700Z" fill="#777B5B" />
                </g>
                <g>
                    <g fill="#B77F7D">
                        <circle cx="286" cy="690" r="7" />
                        <circle cx="308" cy="676" r="6" />
                        <circle cx="332" cy="690" r="7" />
                        <circle cx="368" cy="676" r="6" />
                        <circle cx="396" cy="690" r="7" />
                        <circle cx="430" cy="674" r="6" />
                        <circle cx="470" cy="688" r="7" />
                        <circle cx="512" cy="674" r="6" />
                        <circle cx="556" cy="688" r="7" />
                        <circle cx="604" cy="676" r="6" />
                        <circle cx="650" cy="690" r="7" />
                        <circle cx="700" cy="678" r="6" />
                        <circle cx="742" cy="690" r="7" />
                        <circle cx="790" cy="676" r="6" />
                        <circle cx="838" cy="690" r="7" />
                    </g>
                    <g fill="#C98F8A">
                        <circle cx="298" cy="702" r="5" />
                        <circle cx="348" cy="700" r="5" />
                        <circle cx="410" cy="702" r="5" />
                        <circle cx="482" cy="700" r="5" />
                        <circle cx="540" cy="702" r="5" />
                        <circle cx="620" cy="700" r="5" />
                        <circle cx="680" cy="702" r="5" />
                        <circle cx="760" cy="700" r="5" />
                        <circle cx="820" cy="702" r="5" />
                    </g>
                    <g fill="#D8C9B2">
                        <circle cx="320" cy="684" r="3" />
                        <circle cx="380" cy="700" r="3" />
                        <circle cx="450" cy="684" r="3" />
                        <circle cx="530" cy="700" r="3" />
                        <circle cx="590" cy="684" r="3" />
                        <circle cx="670" cy="700" r="3" />
                        <circle cx="730" cy="684" r="3" />
                        <circle cx="800" cy="700" r="3" />
                    </g>
                </g>

                {/* Garden highlights */}
                <g stroke="#9AA07C" strokeWidth="3" strokeLinecap="round" opacity="0.6" fill="none">
                    <path d="M330 690c8-18 18-30 32-38M360 696c6-16 14-26 26-34M600 690c8-18 18-28 30-36M630 696c6-14 12-24 22-32M840 690c8-16 16-26 28-34" />
                </g>
                <g fill="#B77F7D">
                    <circle cx="360" cy="648" r="5" />
                    <circle cx="378" cy="656" r="4" />
                    <circle cx="620" cy="650" r="5" />
                    <circle cx="640" cy="658" r="4" />
                    <circle cx="820" cy="652" r="5" />
                    <circle cx="838" cy="660" r="4" />
                </g>

                {/* Potted plants by the door */}
                <g>
                    <path d="M1050 700h56l-8 56h-40Z" fill="#B77F7D" />
                    <path d="M1054 700h48" stroke="#8E5F5D" strokeWidth="4" />
                    <g fill="#777B5B">
                        <ellipse cx="1066" cy="668" rx="16" ry="9" transform="rotate(-30 1066 668)" />
                        <ellipse cx="1088" cy="660" rx="16" ry="9" transform="rotate(25 1088 660)" />
                        <ellipse cx="1078" cy="640" rx="14" ry="8" transform="rotate(-10 1078 640)" />
                    </g>
                    <path d="M1340 700h50l-7 52h-36Z" fill="#B77F7D" />
                    <g fill="#777B5B">
                        <ellipse cx="1354" cy="672" rx="14" ry="8" transform="rotate(-30 1354 672)" />
                        <ellipse cx="1374" cy="666" rx="14" ry="8" transform="rotate(25 1374 666)" />
                    </g>
                </g>

                {/* Bench and mailbox */}
                <g>
                    <ellipse cx="1420" cy="792" rx="130" ry="16" fill="#422A28" opacity="0.16" filter="url(#sb-soft-small)" />
                    <g fill="#805B46">
                        <rect x="1310" y="688" width="220" height="14" rx="4" />
                        <rect x="1310" y="708" width="220" height="10" rx="3" />
                        <rect x="1316" y="724" width="208" height="10" rx="3" />
                        <rect x="1324" y="740" width="192" height="10" rx="3" />
                    </g>
                    <g fill="#6B4531">
                        <rect x="1322" y="660" width="16" height="120" rx="3" />
                        <rect x="1502" y="660" width="16" height="120" rx="3" />
                        <rect x="1322" y="672" width="196" height="8" rx="3" />
                    </g>
                    <g>
                        <rect x="1390" y="600" width="8" height="90" fill="#422A28" />
                        <rect x="1368" y="556" width="54" height="46" rx="4" fill="#632B3B" />
                        <rect x="1378" y="566" width="34" height="8" rx="2" fill="#F3EBDD" opacity="0.7" />
                        <path d="M1422 562h14v18h-14Z" fill="#B77F7D" />
                    </g>
                </g>

                {/* Path */}
                <g>
                    <path d="M0 700h1600v200H0Z" fill="url(#sb-path)" />
                    <path d="M0 700h1600v200H0Z" fill="url(#sb-cobbles)" opacity="0.9" />
                    <path d="M0 700h1600v200H0Z" fill="url(#sb-vignette)" opacity="0.5" />
                    <path d="M600 700 1600 700 1600 900 900 900Z" fill="#422A28" opacity="0.06" />
                    <path d="M0 700h1600" stroke="#B8A995" strokeWidth="10" opacity="0.6" />
                    <path d="M0 700h1600v200H0Z" fill="url(#sb-sun)" opacity="0.35" />
                    <g fill="#777B5B" opacity="0.35" filter="url(#sb-soft-small)">
                        <ellipse cx="120" cy="760" rx="90" ry="20" />
                        <ellipse cx="1460" cy="780" rx="110" ry="24" />
                        <ellipse cx="800" cy="880" rx="150" ry="26" />
                    </g>
                </g>

                {/* Character and cat */}
                <g transform="translate(-58 0)">
                <g className="storybook__character">
                    <ellipse cx="1006" cy="838" rx="68" ry="12" fill="#422A28" opacity="0.15" filter="url(#sb-soft-small)" />

                    {/* legs */}
                    <path d="M978 700c-4 42-8 80-10 116h34c2-36 6-78 10-116Z" fill="#EFE3CD" />
                    <path d="M1014 700c2 40 6 80 8 116h34c-4-36-8-78-10-116Z" fill="#F6EDDC" />
                    <path d="M1004 704c-2 36-4 70-4 102" stroke="#D8C9B2" strokeWidth="2" opacity="0.5" />

                    {/* shoes */}
                    <path d="M964 816h36c5 0 8 4 8 9 0 4-3 7-7 7h-37Z" fill="#FBF5E9" stroke="#B8A995" strokeWidth="1.3" />
                    <path d="M1018 816h36c5 0 8 4 8 9 0 4-3 7-7 7h-37Z" fill="#FBF5E9" stroke="#B8A995" strokeWidth="1.3" />

                    {/* torso */}
                    <path d="M980 616c8-16 28-26 48-24 18 2 32 12 38 28l6 78c-26 10-62 10-88 0Z" fill="#632B3B" />
                    <path d="M990 628c8 16 32 22 58 14" stroke="#7A3A4C" strokeWidth="2.2" fill="none" opacity="0.6" />
                    <path d="M992 642c6 4 10 8 12 14M1002 646c5 3 9 6 11 11M1012 648c5 2 9 5 11 9" stroke="#7A3A4C" strokeWidth="1.2" fill="none" opacity="0.35" />

                    {/* left arm raised toward the face, looking up */}
                    <path d="M984 622c-16 4-26 18-24 34 2 12 10 18 20 18l8-12c-8-4-12-10-10-18 2-6 6-10 12-12Z" fill="#5A2635" stroke="#4E1F2C" strokeWidth="1.2" />
                    <path d="M984 638c-10 6-14 16-10 26 4 8 10 12 18 12" fill="none" stroke="#4E1F2C" strokeWidth="1.2" opacity="0.7" />
                    <circle cx="1002" cy="604" r="8.5" fill="#E8C4A8" />
                    <path d="M996 598c4-4 10-4 14 0" stroke="#B77F7D" strokeWidth="1.4" fill="none" opacity="0.7" />

                    {/* right arm */}
                    <path d="M1060 630c12 10 16 26 14 42l-6 28-16-4 4-26c0-10-4-18-10-24Z" fill="#5A2635" stroke="#4E1F2C" strokeWidth="1.2" />
                    <circle cx="1056" cy="704" r="8" fill="#E8C4A8" />

                    {/* hair mass behind */}
                    <path d="M990 570c-6-32 8-56 30-60 22-4 40 12 42 36 2 20-2 38 0 58 2 22 8 44 6 64-20 12-46 12-62 2-4-26 0-48-4-68-2-12-8-22-12-32Z" fill="url(#sb-hair)" />

                    {/* head and profile */}
                    <ellipse cx="1016" cy="558" rx="25" ry="30" fill="#E8C4A8" />
                    <path d="M1034 534c8 0 14 6 14 14 0 4-2 6-2 10 0 6 4 8 4 12 0 5-4 7-7 10-2 4 0 8-3 12-4 6-10 8-16 6" fill="#E8C4A8" />
                    <path d="M1040 558c3 0 5 2 5 4 0 2-2 3-5 3" fill="none" stroke="#B77F7D" strokeWidth="1.4" />
                    <path d="M1038 578c4 2 8 2 10-1" stroke="#B77F7D" strokeWidth="1.2" fill="none" />
                    <circle cx="1038" cy="552" r="1.8" fill="#422A28" />

                    {/* front fringe */}
                    <path d="M994 556c-2-24 12-42 32-44 16-2 28 6 34 18-10 2-20 10-24 22-4 12-4 24-2 36-14-6-28-18-40-32Z" fill="url(#sb-hair)" />
                    <path d="M1000 548c-2 20 2 38 6 54M1010 538c-2 26 2 46 6 66M1024 534c0 20 4 38 8 54" stroke="#5A3B2E" strokeWidth="2" fill="none" opacity="0.55" />

                    {/* tote bag */}
                    <path d="M1052 684c14-2 24 6 24 20v34c0 8-6 14-14 14h-14c-8 0-14-6-14-14v-30" fill="#EFE3CD" stroke="#B8A995" strokeWidth="1.3" />
                    <path d="M1042 684c-2-18 8-30 20-30s22 12 20 30" fill="none" stroke="#B8A995" strokeWidth="1.8" />
                    <g fill="#B77F7D">
                        <circle cx="1056" cy="710" r="4" />
                        <circle cx="1064" cy="718" r="3" />
                        <circle cx="1050" cy="720" r="3" />
                    </g>

                    {/* cat */}
                    <g>
                        <ellipse cx="930" cy="820" rx="34" ry="9" fill="#422A28" opacity="0.14" filter="url(#sb-soft-small)" />
                        <path d="M900 800c0-14 12-24 28-24 18 0 30 10 30 24 0 14-12 22-30 22-16 0-28-8-28-22Z" fill="#FBF5E9" />
                        <path d="M910 780c-6-12-4-22 2-26 6-4 12 0 16 10M942 780c6-12 4-22-2-26-6-4-12 0-16 10" fill="#FBF5E9" stroke="#B8A995" strokeWidth="1.4" />
                        <path d="M914 790c8-6 18-6 26 0" stroke="#B77F7D" strokeWidth="6" opacity="0.8" fill="none" />
                        <path d="M958 802c14-4 22-14 22-26" stroke="#FBF5E9" strokeWidth="7" fill="none" strokeLinecap="round" />
                        <path d="M908 816v10M920 816v10M940 816v10M952 816v10" stroke="#B8A995" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="908" cy="794" r="2.2" fill="#422A28" />
                        <circle cx="930" cy="794" r="2.2" fill="#422A28" />
                    </g>
                </g>
                </g>

                {/* Foreground foliage */}
                <g filter="url(#sb-soft-small)" opacity="0.9">
                    <path d="M0 860c30-40 70-50 110-34 20-30 62-34 88-10 24-18 58-12 74 10 22-4 42 8 48 28H0Z" fill="#6B7057" />
                    <path d="M1600 850c-30-38-68-48-108-32-20-28-60-32-86-8-24-18-56-12-72 10-22-4-40 8-46 28h312Z" fill="#777B5B" />
                    <g fill="#B77F7D">
                        <circle cx="54" cy="842" r="8" />
                        <circle cx="86" cy="854" r="6" />
                        <circle cx="150" cy="848" r="7" />
                        <circle cx="1544" cy="838" r="8" />
                        <circle cx="1512" cy="852" r="6" />
                        <circle cx="1466" cy="846" r="7" />
                    </g>
                </g>

                <rect width="1600" height="900" fill="url(#sb-vignette)" />
                <rect width="1600" height="900" filter="url(#sb-grain)" opacity="0.85" />
            </svg>

            <aside className="storybook__panel">
                <h1>Welcome to my world.</h1>
                <Ornament />
                <h2>Emna Smaali</h2>
                <p className="storybook__role">Software Engineering Student</p>
                <p className="storybook__focus">Applied AI · Generative AI · Intelligent Software</p>
                <p className="storybook__note">A little world of ideas, projects, and things I've built.</p>
                <button type="button" className="storybook__enter" onClick={enter} disabled={entering}>
                    <span className="storybook__spark" aria-hidden="true">✦</span>
                    Let's explore my world
                    <span aria-hidden="true">→</span>
                </button>
                <a className="storybook__cv" href="Emna_Smaali_CV.pdf" target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true">▤</span>
                    View my CV
                </a>
            </aside>

            <button
                type="button"
                className="storybook__mute"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            >
                <SoundIcon muted={isMuted} />
            </button>

            <div className="storybook__hint">
                <span className="storybook__keys" aria-hidden="true">← ↑ ↓ →</span>
                Use arrow keys to walk
            </div>
        </div>
    );
};

export default StorybookEntrance;
