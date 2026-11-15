import { useMemo, useState, useRef, useEffect } from 'react';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import '../shaders/RevealMaterial';
import { isTouchDevice } from '../../../utils/deviceDetect';
import { getGardenTexture, getSunGlowTexture } from '../../../utils/gardenTexture';
/**
 * CorridorDecorations - Dekoracje korytarza.
 * 
 * Proste płaskie plane'y z teksturami - styl rysunkowy 2D w świecie 3D.
 * 
 * Korytarz (per segment, 80 units):
 *   Drzwi: relZ -18 (left), -32 (right), -48 (left), -62 (right)
 *   corridorWidth: ~3.5 per side
 *   corridorHeight: 3.5
 *   Bezpieczne strefy dekoracji: -5 do -15, -20 do -30, -34 do -46, -50 do -60, -64 do -75
 */

// Globalne zmienne dla useFrame, aby uniknąć alokacji pamięci w każdej klatce i zapobiec ścinkom (GC stalls)
const tempPos = new THREE.Vector3();
const tempRot = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const tempCamDir = new THREE.Vector3();
const tempEuler = new THREE.Euler();
const tempQuat = new THREE.Quaternion();


const CABIN_SKETCH_URL = 'fonts/CabinSketch-Regular.ttf';

// Soft ivory halo used by the ceiling pendants.
let lampGlowTexture = null;
const getLampGlowTexture = () => {
    if (lampGlowTexture || typeof document === 'undefined') return lampGlowTexture;
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(243, 235, 221, 0.85)');
    gradient.addColorStop(0.45, 'rgba(216, 201, 178, 0.35)');
    gradient.addColorStop(1, 'rgba(216, 201, 178, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    lampGlowTexture = new THREE.CanvasTexture(canvas);
    return lampGlowTexture;
};

const PictureContent = ({ imagePath, imagePaintedPath, width, height, isPainted }) => {
    const texture = useTexture(imagePath);
    // Render nothing if no painted path, but we still call the hook unconditionally to respect hook rules
    const paintedTexture = useTexture(imagePaintedPath || imagePath);

    const materialRef = useRef();

    useEffect(() => {
        if (!materialRef.current || !imagePaintedPath) return;

        if (isPainted) {
            gsap.to(materialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        } else {
            gsap.to(materialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
    }, [isPainted, imagePaintedPath]);

    return (
        <group position={[0, 0, 0.01]}> {/* Lekko przed ramką */}
            {imagePaintedPath && (
                <mesh position={[0, 0, -0.001]}>
                    <planeGeometry args={[width, height]} />
                    <meshBasicMaterial color="#F3EBDD"
                        map={paintedTexture}
                        transparent={true}
                        alphaTest={0.5}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                    />
                </mesh>
            )}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[width, height]} />
                {imagePaintedPath ? (
                    <revealMaterial color="#F3EBDD"
                        ref={materialRef}
                        map={texture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                        uProgress={0.0}
                    />
                ) : (
                    <meshBasicMaterial color="#F3EBDD"
                        map={texture}
                        transparent={true}
                        alphaTest={0.1} // KLUCZOWE: Naprawia przezroczystość (wycina tło)
                        side={THREE.DoubleSide}
                        roughness={0.5}
                    />
                )}
            </mesh>
        </group>
    );
};

const InspectableFrame = ({ frame, wallX, frameTexture, framePaintedTexture, CABIN_SKETCH_URL, setCameraOverride }) => {
    const { camera, viewport } = useThree();
    const groupRef = useRef();
    const frameMaterialRef = useRef();
    const framePaintedRef = useRef();
    const compileFramesRef = useRef(0);
    const hideDelayRef = useRef();

    // Zapisujemy oryginalną pozycję i rotację na ścianie
    const originalPos = useMemo(() => new THREE.Vector3(
        frame.side === 'left' ? -wallX + (frame.offsetFromWall || 0) : wallX - (frame.offsetFromWall || 0),
        frame.y,
        frame.z
    ), [frame, wallX]);

    const originalRot = useMemo(() => new THREE.Euler(
        0, frame.side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0
    ), [frame.side]);

    const [isHovered, setIsHovered] = useState(false);
    const [isInspected, setIsInspected] = useState(false);

    // Sprawdzamy czy to urządzenie dotykowe (telefon/tablet) by całkowicie wyłączyć efekt hover i podnieść wydajność
    const isTouch = useMemo(() => isTouchDevice(), []);
    // Zostawiamy też stary mechanizm żeby odłączyć na ekstremalnie wąskich ekranach w ogóle inspected
    const isMobile = viewport.width < 5 || viewport.aspect < 0.8 || isTouch;

    // Kiedy komponent znika, na wszelki wypadek wyłączamy override
    useEffect(() => {
        return () => {
            if (isInspected) {
                if (setCameraOverride) setCameraOverride(false);
                window.dispatchEvent(new CustomEvent('inspectChange', { detail: false }));
            }
        };
    }, [isInspected, setCameraOverride]);

    useEffect(() => {
        if (isHovered && !isMobile) document.body.style.cursor = 'pointer';
        else document.body.style.cursor = 'auto';
    }, [isHovered, isMobile]);

    useEffect(() => {
        if (!frameMaterialRef.current) return;

        const shouldBePainted = isHovered || isInspected;

        if (shouldBePainted) {
            if (hideDelayRef.current) hideDelayRef.current.kill();
            if (framePaintedRef.current) framePaintedRef.current.visible = true;

            gsap.to(frameMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        } else {
            gsap.to(frameMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });

            hideDelayRef.current = gsap.delayedCall(0.55, () => {
                if (framePaintedRef.current) framePaintedRef.current.visible = false;
            });
        }

        return () => {
            if (hideDelayRef.current) hideDelayRef.current.kill();
        };
    }, [isHovered, isInspected]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (compileFramesRef.current < 2) {
            compileFramesRef.current++;
            if (compileFramesRef.current === 2) {
                if (!isHovered && !isInspected && framePaintedRef.current) {
                    framePaintedRef.current.visible = false;
                }
            }
        }

        if (isInspected) {
            // Pozycja przed kamerą (bliżej)
            camera.getWorldDirection(tempCamDir);

            // Obliczamy responsywny dystans (fluid responsive)
            // Gdy aspekt (szerokość/wysokość) jest mniejszy (wąskie ekrany np. laptopy max 1.3), odsuwamy obraz dalej (np. 2.2)
            // Gdy aspekt jest duży (ultrawide, 16:9 ~ 1.77), przysuwamy obraz bliżej (np. 1.5)
            // clamp(1.5, 2.8)
            const baseDistance = 1.3;
            // Im mniejszy aspekt (węższy ekran), tym większa odległość
            const aspectOffset = Math.max(0, 1.8 - viewport.aspect) * 1.5;
            const distance = Math.min(2.8, Math.max(1.5, baseDistance + aspectOffset));

            // Punkt tuż przed kamerą (zwiększony dynamicznie - im więcej, tym dalej)
            tempPos.copy(camera.position).add(tempCamDir.multiplyScalar(distance));

            // Rotacja zwracająca obraz bezpośrednio do kamery
            tempRot.copy(camera.quaternion);

            // Efekt "3D Karty" na podstawie myszki
            const tiltX = -state.pointer.y * 0.3;
            const tiltY = state.pointer.x * 0.3;
            tempEuler.set(tiltX, tiltY, 0);
            tempQuat.setFromEuler(tempEuler);

            tempRot.multiply(tempQuat);

            // Lekko powiększamy obraz dla detalu
            tempScale.set(1.2, 1.2, 1.2);
        } else {
            // Powrót na ścianę
            tempPos.copy(originalPos);
            tempRot.setFromEuler(originalRot);
            tempScale.set(1, 1, 1);
        }

        // Płynna interpolacja (lerp/slerp) w każdym oknie renderowania
        const factor = delta * 6;
        groupRef.current.position.lerp(tempPos, factor);
        groupRef.current.quaternion.slerp(tempRot, factor);
        groupRef.current.scale.lerp(tempScale, factor);
    });

    return (
        <group
            ref={groupRef}
            position={originalPos}
            rotation={originalRot}
        >
            {/* INVISIBLE HITBOX to catch pointer events smoothly and prevent raycaster from jumping between meshes */}
            <mesh
                position={[0, 0, 0.05]}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) return; // Całkowite wyłączenie na mobile
                    setIsInspected((prev) => {
                        const next = !prev;
                        if (setCameraOverride) setCameraOverride(next); // Blokowanie / odblokowanie poruszania kamerą
                        window.dispatchEvent(new CustomEvent('inspectChange', { detail: next }));
                        return next;
                    });
                    setIsHovered(false);
                }}
                onPointerEnter={(e) => {
                    e.stopPropagation();
                    if (!isInspected && !isMobile) setIsHovered(true);
                }}
                onPointerLeave={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                }}
            >
                <planeGeometry args={[frame.width, frame.height]} />
                <meshBasicMaterial color="#F3EBDD" transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* RAMKA PAINTED (behind sketch) */}
            {!isTouch && (
                <mesh ref={framePaintedRef} position={[0, 0, -0.001]} scale={[0.98, 0.98, 1]}>
                    <planeGeometry args={[frame.width, frame.height]} />
                    <meshBasicMaterial color="#F3EBDD"
                        map={framePaintedTexture}
                        transparent={true}
                        alphaTest={0.5}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                    />
                </mesh>
            )}

            {/* RAMKA SKETCH OVERLAY (front) */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[frame.width, frame.height]} />
                <revealMaterial color="#F3EBDD"
                    ref={frameMaterialRef}
                    map={frameTexture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    roughness={0.9}
                    uProgress={0.0}
                />
            </mesh>

            {/* OBRAZEK WEWNĄTRZ */}
            {frame.image && (
                <PictureContent
                    imagePath={frame.image}
                    imagePaintedPath={!isTouch ? frame.imagePainted : null}
                    width={frame.imageWidth || frame.width * 0.7}
                    height={frame.imageHeight || frame.height * 0.7}
                    isPainted={isHovered || isInspected}
                />
            )}

            {/* PODPIS */}
            {frame.signature && (
                <Text
                    position={[
                        frame.signatureX !== undefined ? frame.signatureX : (frame.width / 2 - 0.1),
                        frame.signatureY !== undefined ? frame.signatureY : (-frame.height / 2 + 0.15),
                        0.02
                    ]}
                    fontSize={frame.signatureSize || 0.12}
                    font={CABIN_SKETCH_URL}
                    color={frame.signatureColor || "#333333"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {frame.signature}
                </Text>
            )}
        </group>
    );
};

const CorridorDecorations = ({ segmentLength, zOffset, corridorWidth = 4, corridorHeight = 3.5, zClip = 100000, setCameraOverride, segmentIndex = 0 }) => {

    const wallX = corridorWidth / 2 - 0.01;
    const floorY = -corridorHeight / 2;
    const ceilingY = corridorHeight / 2;

    // =============================================
    // TEKSTURY DEKORACJI
    // =============================================
    const frameTexture = useTexture('textures/corridor/ramkanazdjecieduza.webp');
    const framePaintedTexture = useTexture('textures/corridor/ramkanazdjecieduza_painted.webp');
    const standingFrameTexture = useTexture('textures/corridor/ramkanazdjeciemala.webp');
    const treeTexture = useTexture('textures/corridor/drzewkowdoniczce_pot_sage.webp');
    const windowTexture = useTexture('textures/entrance/window_sketch.webp');
    const grateTexture = useTexture('textures/corridor/kratkawentylacyjna.webp');
    const flowerTexture = useTexture('textures/corridor/kwiatekwdoniczce.webp');

    const lights = useMemo(() => {
        const items = [];
        // ===== REGULACJA ŚWIATEŁ =====
        const LIGHT_SPACING = 15;      // Odstęp między lampami
        const LIGHT_START_OFFSET = -5;  // Start z zapasem od początku (bo tam są drzwi poprzedniego segmentu)

        const startZ = zOffset + LIGHT_START_OFFSET;
        const endZ = zOffset - segmentLength + 10; // Zapas od końca (SegmentDoors jest na -75)

        for (let z = startZ; z > endZ; z -= LIGHT_SPACING) {
            items.push({ z });
        }
        return items;
    }, [segmentLength, zOffset]);

    // =============================================
    // RAMKI NA ZDJĘCIA (PICTURE FRAMES)
    // =============================================
    // Płaskie plane'y na ścianach z teksturą ramki.
    // Wewnątrz ramki można później dodać plakaty/zdjęcia.
    //
    // USTAWIENIA DO RĘCZNEJ REGULACJI:
    // - z: pozycja Z (gdzie na osi korytarza), obliczana jako zOffset - wartość
    // - side: 'left' lub 'right'
    // - width/height: rozmiar ramki
    // - y: pozycja Y (wysokość na ścianie, 0 = środek)
    const frames = useMemo(() => [
        {
            z: zOffset - 25,         // Between Gallery and Rewards
            side: 'left',
            width: 2.5,
            height: 2.5 / 1.785,
            y: 0.2,
            id: 'frame-2',
            image: 'textures/corridor/rysuneknaobrazek3.webp',
            imageWidth: 1.7,
            imageHeight: 1,
            offsetFromWall: 0.1
        },
        {
            z: zOffset - 57,         // Between About and Extracurricular
            side: 'right',
            width: 2.5,
            height: 2.5 / 1.785,
            y: 0.25,
            id: 'frame-3',
            signature: "Empty canvas!\nWant your art here?\nContact me!",
            signatureX: 0,
            signatureY: 0,
            signatureSize: 0.12,
            signatureColor: '#333333'
        },
        {
            z: zOffset - 46,         // Between Rewards and Contact
            side: 'left',
            width: 2.5,
            height: 2.5 / 1.785,
            y: 0.35,
            id: 'frame-4',
            signature: "Empty canvas!\nWant your art here?\nContact me!",
            signatureX: 0,
            signatureY: 0,
            signatureSize: 0.12,
            signatureColor: '#333333'
        },
    ], [zOffset]);

    // =============================================
    // STOLIK (TABLE)
    // =============================================
    const woodTexture = useTexture('textures/corridor/texturadrewnadonozekbiurka.webp');
    const tableTopTexture = useTexture('textures/corridor/gorastolika.webp');

    // Tekstury szafki
    const cabinetFrontTexture = useTexture('textures/corridor/szafkaprzod.webp');
    const cabinetRestTexture = useTexture('textures/corridor/szafkaprzodgora.webp');

    // Klonujemy teksturę dla nóg, żeby ją obrócić (bo user mówi że jest poziomo a ma być pionowo)
    const legTexture = useMemo(() => {
        const tex = woodTexture.clone();
        tex.rotation = Math.PI / 2;
        tex.center.set(0.5, 0.5);
        return tex;
    }, [woodTexture]);

    // Konfiguracja stolika
    // Obrócony 90° i przyciągnięty do lewej ściany
    const showTables = false;
    const tableConfigs = useMemo(() => [-30, -42, -65].map((z) => ({
        z: zOffset + z,
        width: 2.0,
        depth: 0.8,
        height: 1.0,
        legRadius: 0.08,
        topThickness: 0.08,
        x: -wallX + 0.42,
    })), [zOffset, wallX]);

    return (
        <group>
            {/* === CEILING PENDANTS (ivory shades, soft warm-white light) === */}
            {lights.filter(light => light.z <= zClip).map((light, i) => (
                <group key={`light-${i}`} position={[0, ceilingY, light.z]}>
                    {/* Ceiling rose */}
                    <mesh position={[0, -0.02, 0]}>
                        <cylinderGeometry args={[0.13, 0.16, 0.04, 24]} />
                        <meshBasicMaterial color="#B8A995" />
                    </mesh>

                    {/* Suspension cord */}
                    <mesh position={[0, -0.3, 0]}>
                        <cylinderGeometry args={[0.012, 0.012, 0.56, 8]} />
                        <meshBasicMaterial color="#422A28" />
                    </mesh>

                    {/* Ivory shade */}
                    <mesh position={[0, -0.63, 0]}>
                        <coneGeometry args={[0.26, 0.22, 28, 1, true]} />
                        <meshBasicMaterial color="#F3EBDD" side={THREE.DoubleSide} />
                    </mesh>

                    {/* Warm-white bulb glow under the shade */}
                    <mesh position={[0, -0.735, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.17, 24]} />
                        <meshBasicMaterial color="#FBF4E8" toneMapped={false} side={THREE.DoubleSide} />
                    </mesh>

                    {/* Soft halo cast downward */}
                    <mesh position={[0, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[1.7, 1.7]} />
                        <meshBasicMaterial
                            map={getLampGlowTexture()}
                            transparent
                            opacity={0.3}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Gentle wash on the ceiling */}
                    <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[1.9, 1.9]} />
                        <meshBasicMaterial
                            map={getLampGlowTexture()}
                            transparent
                            opacity={0.18}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </group>
            ))}

            {/* === TABLES (3) === */}
            {showTables && tableConfigs.map((tableConfig, tableIndex) => (
                <group key={`table-${tableIndex}`} position={[tableConfig.x, floorY, tableConfig.z]} rotation={[0, Math.PI / 2, 0]}>
                    {/* Nogi stolika */}
                    {[
                        [-tableConfig.width / 2 + 0.1, -tableConfig.depth / 2 + 0.1],
                        [tableConfig.width / 2 - 0.1, -tableConfig.depth / 2 + 0.1],
                        [-tableConfig.width / 2 + 0.1, tableConfig.depth / 2 - 0.1],
                        [tableConfig.width / 2 - 0.1, tableConfig.depth / 2 - 0.1],
                    ].map((pos, i) => (
                        <mesh key={`leg-${i}`} position={[pos[0], tableConfig.height / 2, pos[1]]}>
                            <boxGeometry args={[tableConfig.legRadius * 2, tableConfig.height, tableConfig.legRadius * 2]} />
                            <meshBasicMaterial color="#c89a6e" map={legTexture} roughness={0.8} />
                        </mesh>
                    ))}

                    {/* Blat stolika */}
                    <mesh position={[0, tableConfig.height + tableConfig.topThickness / 2, 0]}>
                        <boxGeometry args={[tableConfig.width, tableConfig.topThickness, tableConfig.depth]} />
                        <meshBasicMaterial color="#d9b08c" attach="material-0" map={woodTexture} />
                        <meshBasicMaterial color="#d9b08c" attach="material-1" map={woodTexture} />
                        <meshBasicMaterial color="#c89a6e" attach="material-2" map={tableTopTexture} roughness={0.5} />
                        <meshBasicMaterial attach="material-3" color="#F3EBDD" />
                        <meshBasicMaterial color="#d9b08c" attach="material-4" map={woodTexture} />
                        <meshBasicMaterial color="#d9b08c" attach="material-5" map={woodTexture} />
                    </mesh>

                    {/* KWIATEK NA STOLE */}
                    <mesh
                        position={[0, tableConfig.height + tableConfig.topThickness + 0.2, 0]}
                        rotation={[0, -Math.PI / 4, 0]}
                    >
                        <planeGeometry args={[0.3, 0.3 / 0.758]} />
                        <meshBasicMaterial color="#F3EBDD"
                            map={flowerTexture}
                            transparent={true}
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                            roughness={0.8}
                        />
                    </mesh>
                </group>
            ))}

            {/* =============================================
                RAMKI NA ZDJĘCIA NA ŚCIANACH
                =============================================
                Każda ramka to płaski plane z teksturą "ramka na zdjecie.png".
                Są przyczepione do ścian na przemian (lewa/prawa).
                
                Żeby zmienić pozycję/rozmiar konkretnej ramki,
                edytuj odpowiedni obiekt w tablicy 'frames' powyżej.
            */}
            {/* === SZAFKA (CABINET) === */}
            {/* Prosty box jako placeholder, naprzeciwko drzwi About (Left -48) -> więc szafka na Right -51 */}
            <mesh
                position={[wallX - 0.26, floorY + 0.5, zOffset - 51]}
            // X: wallX - (depth/2) - mały margin
            // Y: floorY + (height/2)
            // Z: zOffset - 51 (blisko drzwi About)
            >
                {/* Wymiary: X=0.5 (głębokość od ściany), Y=1.0 (wysokość), Z=0.8 (szerokość wzdłuż ściany) */}
                <boxGeometry args={[0.5, 1.0, 1.0 * 0.8]} />
                {/* 
                    Materials for BoxGeometry:
                    0: Right (+x) - Wall side
                    1: Left (-x) - Corridor side (FRONT of cabinet) -> szafkaprzod.png
                    2: Top (+y) -> szafkaprzodgora.png
                    3: Bottom (-y) -> szafkaprzodgora.png (as requested)
                    4: Front (+z) -> szafkaprzodgora.png (side)
                    5: Back (-z) -> szafkaprzodgora.png (side)
                */}
                <meshBasicMaterial color="#d9b28c" attach="material-0" map={cabinetRestTexture} />
                <meshBasicMaterial color="#d9b28c" attach="material-1" map={cabinetFrontTexture} />
                <meshBasicMaterial color="#d9b28c" attach="material-2" map={cabinetRestTexture} />
                <meshBasicMaterial color="#d9b28c" attach="material-3" map={cabinetRestTexture} />
                <meshBasicMaterial color="#d9b28c" attach="material-4" map={cabinetRestTexture} />
                <meshBasicMaterial color="#d9b28c" attach="material-5" map={cabinetRestTexture} />
            </mesh>

            {/* === POTTED PLANTS (3) — sage green === */}
            {[
                { z: -20, side: 'left' },
                { z: -40, side: 'right' },
                { z: -60, side: 'left' },
            ].map((plant, i) => {
                const isLeft = plant.side === 'left';
                return (
                    <mesh
                        key={`plant-${i}`}
                        position={[isLeft ? -wallX + 0.8 : wallX - 0.8, floorY + 1.5, zOffset + plant.z]}
                        rotation={[0, isLeft ? Math.PI / 4 : -Math.PI / 4, 0]}
                    >
                        <planeGeometry args={[1.8, 1.8 / 0.602]} />
                        <meshBasicMaterial color="#ffffff"
                            map={treeTexture}
                            transparent={true}
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                            roughness={0.8}
                        />
                    </mesh>
                );
            })}

            {/* === WINDOWS INSIDE THE CORRIDOR === */}
            {[
                { z: -35, side: 'right' },
                { z: -48, side: 'left' },
                { z: -57, side: 'right' },
            ].map((win, i) => {
                const isLeft = win.side === 'left';
                return (
                    <group
                        key={`window-${i}`}
                        position={[isLeft ? -wallX + 0.01 : wallX - 0.01, 0.5, zOffset + win.z]}
                        rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
                    >
                        <mesh position={[0, 0, -0.008]}>
                            <planeGeometry args={[1.4, 1.4]} />
                            <meshBasicMaterial map={getGardenTexture()} side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, 0, -0.004]}>
                            <planeGeometry args={[1.4, 1.4]} />
                            <meshBasicMaterial color="#4a2c22" transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, 0, -0.006]}>
                            <planeGeometry args={[1.4, 1.4]} />
                            <meshBasicMaterial map={getSunGlowTexture()} color="#F3EBDD" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, 0, -0.002]}>
                            <planeGeometry args={[2.2, 2.2]} />
                            <meshBasicMaterial map={getSunGlowTexture()} color="#D8C9B2" transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, -2.25, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[1.8, 1.2]} />
                            <meshBasicMaterial map={getSunGlowTexture()} color="#D8C9B2" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
                        </mesh>
                        <mesh position={[0, 0.72, 0.01]}><planeGeometry args={[1.5, 0.08]} /><meshBasicMaterial color="#4a2c22" side={THREE.DoubleSide} /></mesh>
                        <mesh position={[0, -0.72, 0.01]}><planeGeometry args={[1.5, 0.08]} /><meshBasicMaterial color="#4a2c22" side={THREE.DoubleSide} /></mesh>
                        <mesh position={[-0.72, 0, 0.01]}><planeGeometry args={[0.08, 1.5]} /><meshBasicMaterial color="#4a2c22" side={THREE.DoubleSide} /></mesh>
                        <mesh position={[0.72, 0, 0.01]}><planeGeometry args={[0.08, 1.5]} /><meshBasicMaterial color="#4a2c22" side={THREE.DoubleSide} /></mesh>
                        <mesh position={[0, 0, 0.01]}><planeGeometry args={[0.055, 1.42]} /><meshBasicMaterial color="#4a2c22" side={THREE.DoubleSide} /></mesh>
                        <mesh position={[0, 0, 0.01]}><planeGeometry args={[1.42, 0.055]} /><meshBasicMaterial color="#4a2c22" side={THREE.DoubleSide} /></mesh>
                    </group>
                );
            })}

            {/* === KRATKI WENTYLACYJNE (VENTILATION GRATES) === */}
            {/* Generujemy kratkę na przeciwległej ścianie dla każdego obrazu */}
            {frames.map((frame, i) => {
                const isFrameLeft = frame.side === 'left';
                const grateSide = isFrameLeft ? 'right' : 'left';

                return (
                    <mesh
                        key={`grate-${i}`}
                        position={[
                            grateSide === 'left' ? -wallX + 0.01 : wallX - 0.01,
                            ceilingY - 0.6, // Wysoko, tak jak ta pierwsza
                            frame.z // Ta sama pozycja Z co obrazu
                        ]}
                        rotation={[0, grateSide === 'left' ? Math.PI / 2 : -Math.PI / 2, 0]}
                    >
                        <planeGeometry args={[0.8, 0.8 / 1.968]} />
                        <meshBasicMaterial color="#F3EBDD"
                            map={grateTexture}
                            transparent={true}
                            alphaTest={0.1}
                            side={THREE.DoubleSide}
                            roughness={0.8}
                        />
                    </mesh>
                );
            })}

        </group >
    );
};

export default CorridorDecorations;
