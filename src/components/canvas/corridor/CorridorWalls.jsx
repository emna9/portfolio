import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

// Import constants to match CorridorSegment logic
// Note: In a real project these might be in a shared config file.
// For now, we duplicate the values to avoid circular dependencies or complex imports if check is not rigorous.
const WALL_X_OUTER = 3.5;
const WALL_X_INNER = 1.7;
// Note: DOOR_Z_SPAN = 4 (from CorridorSegment)


let warmGlowTexture = null;
const getWarmGlowTexture = () => {
    if (warmGlowTexture || typeof document === 'undefined') return warmGlowTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, 'rgba(243, 235, 221, 0)');
    gradient.addColorStop(0.5, 'rgba(243, 235, 221, 0.5)');
    gradient.addColorStop(1, 'rgba(243, 235, 221, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 8, 128);
    warmGlowTexture = new THREE.CanvasTexture(canvas);
    return warmGlowTexture;
};


let wallPanelTexture = null;
const getWallPanelTexture = () => {
    if (wallPanelTexture || typeof document === 'undefined') return wallPanelTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 348;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 348);

    const x = 44;
    const y = 38;
    const w = 424;
    const h = 272;

    // Faint recess so the panel still has depth without a white frame.
    const recess = ctx.createLinearGradient(0, y, 0, y + h);
    recess.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    recess.addColorStop(0.25, 'rgba(0, 0, 0, 0.03)');
    recess.addColorStop(1, 'rgba(243, 235, 221, 0.03)');
    ctx.fillStyle = recess;
    ctx.fillRect(x, y, w, h);

    // Thin lines that read like light, matching the ceiling coffers.
    ctx.save();
    ctx.shadowColor = 'rgba(243, 235, 221, 0.85)';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(243, 235, 221, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(243, 235, 221, 0.5)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(216, 201, 178, 0.26)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 9, y + 9, w - 18, h - 18);
    ctx.restore();

    wallPanelTexture = new THREE.CanvasTexture(canvas);
    wallPanelTexture.wrapS = THREE.RepeatWrapping;
    wallPanelTexture.wrapT = THREE.ClampToEdgeWrapping;
    return wallPanelTexture;
};

// Vertical corner shading: dark at both ends of a wall panel, clear in the middle.
let wallEdgeShadeTexture = null;
const getWallEdgeShadeTexture = () => {
    if (wallEdgeShadeTexture || typeof document === 'undefined') return wallEdgeShadeTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 128, 0);
    gradient.addColorStop(0, 'rgba(16, 8, 6, 0.6)');
    gradient.addColorStop(0.12, 'rgba(16, 8, 6, 0)');
    gradient.addColorStop(0.88, 'rgba(16, 8, 6, 0)');
    gradient.addColorStop(1, 'rgba(16, 8, 6, 0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 8);
    wallEdgeShadeTexture = new THREE.CanvasTexture(canvas);
    wallEdgeShadeTexture.wrapS = THREE.ClampToEdgeWrapping;
    wallEdgeShadeTexture.wrapT = THREE.ClampToEdgeWrapping;
    return wallEdgeShadeTexture;
};

// Walnut basket-weave parquet, generated once and shared.
let parquetTexture = null;
const getParquetTexture = () => {
    if (parquetTexture || typeof document === 'undefined') return parquetTexture;
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const squares = 4;
    const square = size / squares;
    const tones = ['#7E5A43', '#87614A', '#75513C', '#8C6650'];

    const drawPlank = (x, y, w, h, color, horizontal) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);

        const grad = horizontal
            ? ctx.createLinearGradient(0, y, 0, y + h)
            : ctx.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, 'rgba(243, 235, 221, 0.14)');
        grad.addColorStop(0.55, 'rgba(243, 235, 221, 0.02)');
        grad.addColorStop(1, 'rgba(66, 42, 40, 0.16)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'rgba(66, 42, 40, 0.10)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 3; g += 1) {
            ctx.beginPath();
            if (horizontal) {
                const gy = y + 4 + Math.random() * Math.max(1, h - 8);
                ctx.moveTo(x + 2, gy);
                ctx.bezierCurveTo(x + w * 0.3, gy + 2, x + w * 0.6, gy - 2, x + w - 2, gy);
            } else {
                const gx = x + 4 + Math.random() * Math.max(1, w - 8);
                ctx.moveTo(gx, y + 2);
                ctx.bezierCurveTo(gx + 2, y + h * 0.3, gx - 2, y + h * 0.6, gx, y + h - 2);
            }
            ctx.stroke();
        }
    };

    const planks = 4;
    const gap = 1.5;
    for (let i = 0; i < squares; i += 1) {
        for (let j = 0; j < squares; j += 1) {
            const x = i * square;
            const y = j * square;
            const horizontal = (i + j) % 2 === 0;

            if (horizontal) {
                for (let p = 0; p < planks; p += 1) {
                    drawPlank(
                        x,
                        y + p * (square / planks) + gap / 2,
                        square,
                        square / planks - gap,
                        tones[(i * 3 + j + p) % tones.length],
                        true
                    );
                }
            } else {
                for (let p = 0; p < planks; p += 1) {
                    drawPlank(
                        x + p * (square / planks) + gap / 2,
                        y,
                        square / planks - gap,
                        square,
                        tones[(i + j * 2 + p) % tones.length],
                        false
                    );
                }
            }

            ctx.strokeStyle = 'rgba(66, 42, 40, 0.2)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 0.75, y + 0.75, square - 1.5, square - 1.5);
        }
    }

    parquetTexture = new THREE.CanvasTexture(canvas);
    parquetTexture.wrapS = THREE.RepeatWrapping;
    parquetTexture.wrapT = THREE.RepeatWrapping;
    parquetTexture.colorSpace = THREE.SRGBColorSpace;
    return parquetTexture;
};

// Quiet ivory ceiling with faint plaster panels (no light fixtures baked in).
let ceilingPanelTexture = null;
const getCeilingTexture = () => {
    if (ceilingPanelTexture || typeof document === 'undefined') return ceilingPanelTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#4A322B';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(216, 201, 178, 0.14)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 232, 232);
    ctx.strokeStyle = 'rgba(216, 201, 178, 0.07)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 216, 216);

    ceilingPanelTexture = new THREE.CanvasTexture(canvas);
    ceilingPanelTexture.wrapS = THREE.RepeatWrapping;
    ceilingPanelTexture.wrapT = THREE.RepeatWrapping;
    ceilingPanelTexture.colorSpace = THREE.SRGBColorSpace;
    return ceilingPanelTexture;
};

// Soft corner shading used to add depth to the walls.
let wallShadeTexture = null;
const getWallShadeTexture = () => {
    if (typeof document === 'undefined') return null;
    if (wallShadeTexture) return wallShadeTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, 'rgba(43, 26, 20, 0)');
    gradient.addColorStop(1, 'rgba(43, 26, 20, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 4, 128);
    wallShadeTexture = new THREE.CanvasTexture(canvas);
    return wallShadeTexture;
};

/**
 * DoorWallSegment - Dynamic wall segment that tilts towards camera
 * Used for the angled walls next to doors
 */
const DoorWallSegment = ({ position, baseRotationY, width, corridorHeight, wallTexture, side }) => {
    const meshRef = useRef();
    const { camera } = useThree();

    // Tilt state
    const currentTilt = useRef(0);

    // Tilt parameters - adjust these to change the effect
    const BASE_TILT = 0.02;   // ~1 degree base tilt
    const MAX_TILT = 0.20;    // ~12 degrees max tilt when camera is close
    const TILT_START = 12;    // Start tilting when camera is 12 units away
    const TILT_PEAK = 2;      // Max tilt at 2 units

    useFrame(() => {
        if (!meshRef.current) return;

        const distance = Math.abs(camera.position.z - position[2]);
        let targetTilt = BASE_TILT;

        if (distance < TILT_START && distance > TILT_PEAK) {
            // Approaching: ramp up tilt
            const t = (TILT_START - distance) / (TILT_START - TILT_PEAK);
            const easedT = t * (2 - t); // easeOutQuad
            targetTilt = BASE_TILT + (MAX_TILT - BASE_TILT) * easedT;
        } else if (distance <= TILT_PEAK) {
            // Very close: max tilt
            targetTilt = MAX_TILT;
        }

        // Smooth interpolation
        currentTilt.current = THREE.MathUtils.lerp(currentTilt.current, targetTilt, 0.06);

        // Apply tilt - direction based on side
        const tiltDirection = side === 'left' ? -1 : 1;
        meshRef.current.rotation.y = baseRotationY + (currentTilt.current * tiltDirection);
    });

    // Clone texture for independent repeat
    const segTexture = useMemo(() => {
        const tex = wallTexture.clone();
        tex.needsUpdate = true;
        tex.repeat.set(width / 2, corridorHeight / 2);
        return tex;
    }, [wallTexture, width, corridorHeight]);

    return (
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={[width, corridorHeight]} />
            <meshBasicMaterial color="#4A322B" map={segTexture} roughness={1} metalness={0} />
        </mesh>
    );
};

/**
 * CorridorWalls Component
 * 
 * Renders the floor, ceiling, and the Sawtooth Walls.
 * 
 * @param {Array} doorPositions - Array of door objects with { relativeZ, side, ... }
 * @param {number} zClip - Optional Z value to clip geometry (hide anything with Z > zClip)
 */
const CorridorWalls = ({ zStart = 10, length = 80, doorPositions = [], zClip = 100000 }) => {
    const corridorHeight = 3.5;

    // =============================================
    // USTAWIENIA PODŁOGI (FLOOR SETTINGS)
    // =============================================
    // Tekstura kawałka podłogi - ręcznie rysowane deski
    const floorTexture = getParquetTexture();

    // Tekstura listwy przypodłogowej (baseboards)
    // Wymiary obrazka: 1582 x 94 px → aspect ratio 16.83:1
    const baseboardTexture = useTexture('textures/corridor/texturadoprogow.webp');
    baseboardTexture.wrapS = baseboardTexture.wrapT = THREE.RepeatWrapping;
    baseboardTexture.colorSpace = THREE.SRGBColorSpace;

    // Load wall texture
    const wallTexture = useTexture('textures/corridor/wall_texture.webp');
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;

    // Load ceiling texture
    const ceilingTexture = getCeilingTexture();

    // Calculate effective geometry based on clipping
    // We only render from Math.min(zStart, zClip) down to (zStart - length)
    const effectiveStart = Math.min(zStart, zClip);
    const effectiveLength = effectiveStart - (zStart - length);
    const zCenter = effectiveStart - effectiveLength / 2;

    // If fully clipped, render nothing
    if (effectiveLength <= 0) return null;

    // =============================================
    // REGULACJA PRZYCIĘCIA LISTWY PRZY DRZWIACH
    // =============================================
    // O ile (w unitach 3D) skrócić listwę z każdej strony przy ramce drzwi.
    // Zwiększ wartość → większa przerwa między listwą a drzwiami.
    // Zmniejsz wartość → listwa bliżej drzwi (może najeżdżać na ramkę).
    const BASEBOARD_DOOR_MARGIN = 0.5;

    // Helper to generate wall segments for a side ('left' or 'right')
    const generateWallSegments = (side) => {
        const segments = [];
        const isLeft = side === 'left';
        const baseX = isLeft ? -WALL_X_OUTER : WALL_X_OUTER;
        const innerX = isLeft ? -WALL_X_INNER : WALL_X_INNER;

        // We build the wall from Start (High Z) to End (Low Z).
        // Current 'cursor' for Z
        let currentZ = effectiveStart;
        const endZ = effectiveStart - effectiveLength;

        // Sort doors by relativeZ descending (closest to start first) if needed
        // relativeZ is negative (-18, -32...). -18 > -32.
        const sideDoors = doorPositions
            .filter(d => d.side === side)
            .sort((a, b) => b.relativeZ - a.relativeZ);

        sideDoors.forEach(door => {
            const doorZ = zStart + door.relativeZ; // Use original zStart for correct world position
            const doorStartZ = doorZ + 2.0; // Start of angled section
            const doorEndZ = doorZ - 2.0;   // End of angled section

            // Skip doors that are completely clipped (starts "behind" us)
            if (doorStartZ > currentZ) return;
            // Also skip if door is fully "ahead" of us (shouldn't happen with standard logic but safe)
            if (doorEndZ < endZ) return;

            // 1. Straight Filler Segment (from currentZ to doorStartZ)
            if (currentZ > doorStartZ) {
                const segLength = currentZ - doorStartZ;
                const segCenterZ = currentZ - segLength / 2;
                segments.push({
                    type: 'filler',
                    position: [baseX, 0, segCenterZ],
                    rotation: [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0],
                    width: segLength,
                    isLeft,
                    // Ten segment kończy się przy drzwiach (od strony niższego Z)
                    trimLowZ: true
                });
            }

            // 2. Connector (Step Out) - The wall that faces the camera
            // Wait, if we are at baseX (Outer), and we want to start angled wall?
            // Actually, the angled wall GOES from Outer to Inner.
            // So we are rightfully at Outer.
            // Wait, the "Filler" is at Outer (Recessed).
            // So we are already at the start point of the angled wall.
            // No connector needed BEFORE the door?
            // Let's trace Left Wall (-X):
            // Filler is at x = -3.5.
            // Angled wall starts at x = -3.5.
            // Angled wall ends at x = -1.7.
            // So continuous join. Good.

            // 3. Angled Wall (Door holder)
            // From (baseX, doorStartZ) to (innerX, doorEndZ).
            const dx = innerX - baseX;
            const dz = doorEndZ - doorStartZ; // Negative (-4)
            const dist = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dx, dz); // Angle relative to Z axis?
            // atan2(dx, dz). Left: dx = 1.8, dz = -4. Angle ~ 155 deg.
            // Standard wall normal is 90 deg.
            // We want rotation around Y.
            // Center of segment:
            const midX = (baseX + innerX) / 2;
            const midZ = (doorStartZ + doorEndZ) / 2;

            // Rotation:
            // Plane defaults to facing +Z (if simple plane)? No planeGeometry defaults to XY plane.
            // LookAt approach is easiest.
            // Wall normal should point inwards?
            // Actually simpler: Position geometry center and rotate.
            // Vector from Start to End: (dx, 0, dz).
            // Rotation Y = -atan2(dz, dx).
            // Left: dx=1.8, dz=-4. atan2(-4, 1.8) = -1.14 rad ~ -65 deg.
            // -(-65) = 65 deg.
            // Check: 0 deg = +X alignment. 90 deg = -Z alignment.
            // 65 deg = Pointing mostly +X, slightly -Z.
            // This aligns with vector.
            // Normal is +90 deg from that?
            // Left: dx=1.8, dz=-4. atan2(-4, 1.8) = -1.14 rad. -(-1.14) = +1.14. 
            // Normal (+0.9, +0.4) -> Right/Back. Correct for Left Wall.
            // Right: dx=-1.8, dz=-4. atan2(-4, -1.8) = -1.9 rad (-110deg). -(-1.9) = +1.9. 
            // Normal (+0.3, -0.9)? No. Check Math.
            // We need Right Wall Normal to point (-X, +Z). 
            // Adding PI fixes the backface issue.

            const baseRotation = -Math.atan2(dz, dx);
            const finalRotation = isLeft ? baseRotation : baseRotation + Math.PI;

            segments.push({
                type: 'door',
                position: [midX, 0, midZ],
                rotationY: finalRotation,
                width: dist,
                side: side  // For dynamic tilt direction
            });

            // 4. Reset Connector (The hidden face)
            // We are now at (innerX, doorEndZ).
            // We need to return to (baseX, doorEndZ).
            // Or (baseX, doorEndZ - eps).
            // This is a straight wall segment facing AWAY (-Z direction).
            // Left: From -1.7 to -3.5. Vector (-1.8, 0).
            // Facing -Z? Normal should be -Z.
            // Only need to render it.
            const connWidth = Math.abs(baseX - innerX);
            const connX = (innerX + baseX) / 2;

            segments.push({
                type: 'connector',
                position: [connX, 0, doorEndZ],
                rotation: [0, 0, 0], // Plane facing +Z.
                // If Face +Z, and we view from +Z, we see it.
                // We want it facing -Z (Away).
                // So Rotation Y = PI.
                rotationY: Math.PI,
                width: connWidth
            });

            currentZ = doorEndZ;
        });

        // Final filler segment
        if (currentZ > endZ) {
            const segLength = currentZ - endZ;
            const segCenterZ = currentZ - segLength / 2;
            segments.push({
                type: 'filler',
                position: [baseX, 0, segCenterZ],
                rotation: [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0],
                width: segLength,
                isLeft,
                // Ten segment zaczyna się zaraz po drzwiach (od strony wyższego Z)
                trimHighZ: currentZ !== effectiveStart
            });
        }

        return segments;
    };

    const leftSegments = useMemo(() => generateWallSegments('left'), [effectiveStart, effectiveLength, doorPositions]);
    const rightSegments = useMemo(() => generateWallSegments('right'), [effectiveStart, effectiveLength, doorPositions]);

    return (
        <group>
            {/* =============================================
                PODŁOGA - Kafelki (FLOOR TILES)
                =============================================
                Każdy kafelek jest płaskim plane z teksturą kawalekpodlogi.png
                Co drugi kafelek jest obrócony o 180° i lustrzanie odbity
                żeby fajnie się łączyły ze sobą.
                
                USTAWIENIA DO RĘCZNEJ REGULACJI:
                - TILE_LENGTH: długość jednego kafelka (w unitach 3D)
                - TILE_WIDTH: szerokość (powinna pasować do korytarza = 7)
                - FLOOR_START_OFFSET: przesunięcie startu podłogi
            */}
            {(() => {
                // ===== REGULACJA KAFELKÓW PODŁOGI =====
                const TILE_LENGTH = 10;          // Długość jednego kafelka wzdłuż korytarza
                const CENTER_WIDTH = 5;          // Szerokość środkowego pasa (węższe deski = ładniej)
                const SIDE_WIDTH = 1;            // Szerokość bocznych pasów po lewej i prawej
                const FLOOR_START_OFFSET = 2;    // Offset startu (+ = dalej, - = bliżej kamery)

                // Parquet UVs: one texture tile covers 2 x 2 units of floor.
                const centerTexture = floorTexture.clone();
                centerTexture.needsUpdate = true;
                centerTexture.repeat.set(TILE_LENGTH / 2, CENTER_WIDTH / 2);

                const leftSideTexture = floorTexture.clone();
                leftSideTexture.needsUpdate = true;
                leftSideTexture.repeat.set(TILE_LENGTH / 2, SIDE_WIDTH / 2);

                const rightSideTexture = leftSideTexture.clone();
                rightSideTexture.needsUpdate = true;

                const tiles = [];
                const floorY = -corridorHeight / 2;
                const segmentEndZ = effectiveStart - effectiveLength;

                const firstTileIndex = Math.floor(effectiveStart / TILE_LENGTH);
                let tileZ = firstTileIndex * TILE_LENGTH - TILE_LENGTH / 2 + FLOOR_START_OFFSET;

                while (tileZ + TILE_LENGTH / 2 > segmentEndZ) {
                    const globalTileIndex = Math.round(tileZ / TILE_LENGTH);
                    const isMirrored = Math.abs(globalTileIndex) % 2 === 1;

                    // --- Środkowy pas podłogi ---
                    tiles.push(
                        <mesh
                            key={`floor-center-${tileZ.toFixed(1)}`}
                            position={[0, floorY, tileZ]}
                            rotation={[-Math.PI / 2, 0, Math.PI / 2 + (isMirrored ? Math.PI : 0)]}
                            scale={[isMirrored ? -1 : 1, 1, 1]}
                        >
                            <planeGeometry args={[TILE_LENGTH, CENTER_WIDTH]} />
                            <meshBasicMaterial color="#FFFFFF"
                                map={centerTexture}
                                side={THREE.DoubleSide}
                                roughness={1}
                                metalness={0}
                            />
                        </mesh>
                    );

                    // --- Lewy pas podłogi (przycięta tekstura, nie rozciągnięta!) ---
                    tiles.push(
                        <mesh
                            key={`floor-left-${tileZ.toFixed(1)}`}
                            position={[-(CENTER_WIDTH / 2 + SIDE_WIDTH / 2), floorY, tileZ]}
                            rotation={[-Math.PI / 2, 0, Math.PI / 2 + (isMirrored ? Math.PI : 0)]}
                            scale={[isMirrored ? -1 : 1, 1, 1]}
                        >
                            <planeGeometry args={[TILE_LENGTH, SIDE_WIDTH]} />
                            <meshBasicMaterial color="#B8A995"
                                map={leftSideTexture}
                                side={THREE.DoubleSide}
                                roughness={1}
                                metalness={0}
                            />
                        </mesh>
                    );

                    // --- Prawy pas podłogi (przycięta tekstura, nie rozciągnięta!) ---
                    tiles.push(
                        <mesh
                            key={`floor-right-${tileZ.toFixed(1)}`}
                            position={[(CENTER_WIDTH / 2 + SIDE_WIDTH / 2), floorY, tileZ]}
                            rotation={[-Math.PI / 2, 0, Math.PI / 2 + (isMirrored ? Math.PI : 0)]}
                            scale={[isMirrored ? -1 : 1, 1, 1]}
                        >
                            <planeGeometry args={[TILE_LENGTH, SIDE_WIDTH]} />
                            <meshBasicMaterial color="#B8A995"
                                map={rightSideTexture}
                                side={THREE.DoubleSide}
                                roughness={1}
                                metalness={0}
                            />
                        </mesh>
                    );

                    tileZ -= TILE_LENGTH;
                }
                return tiles;
            })()}


            {/* Ceiling with texture - alternating tiles for seamless pattern */}
            {(() => {
                const tileLength = 10; // Match floor tile length
                const tileWidth = 7;   // Ceiling width (matching corridor)
                const tiles = [];
                const ceilingY = corridorHeight / 2;
                const ceilingTex = ceilingTexture.clone();
                ceilingTex.needsUpdate = true;
                ceilingTex.repeat.set(tileWidth / 3.4, tileLength / 3.4);

                // Use same global Z alignment as floor
                const segmentEndZ = effectiveStart - effectiveLength;

                // First tile position with fine-tuned offset (same as floor)
                const CEILING_START_OFFSET = 2; // Match floor offset
                const firstTileIndex = Math.floor(effectiveStart / tileLength);
                let tileZ = firstTileIndex * tileLength - tileLength / 2 + CEILING_START_OFFSET;

                while (tileZ + tileLength / 2 > segmentEndZ) {
                    // Use global tile index for alternating pattern
                    const globalTileIndex = Math.round(tileZ / tileLength);
                    const isMirrored = Math.abs(globalTileIndex) % 2 === 1;

                    tiles.push(
                        <mesh
                            key={`ceiling-tile-${tileZ.toFixed(1)}`}
                            position={[0, ceilingY, tileZ]}
                            rotation={[Math.PI / 2, 0, isMirrored ? Math.PI : 0]}
                            scale={[isMirrored ? -1 : 1, 1, 1]}
                        >
                            <planeGeometry args={[tileWidth, tileLength]} />
                            <meshBasicMaterial color="#FFFFFF"
                                map={ceilingTex}
                                side={THREE.DoubleSide}
                                roughness={1}
                                metalness={0}
                            />
                        </mesh>
                    );
                    tileZ -= tileLength;
                }
                return tiles;
            })()}

            {/* Render Wall Segments with texture */}
            {/* Skip 'connector' and 'door' segments - door segments are now handled by DoorSection */}
            {[...leftSegments, ...rightSegments]
                .filter(seg => seg.type === 'filler')
                .map((seg, i) => {
                    // Wall texture clone (same pattern for wall + baseboard)
                    const segTexture = wallTexture.clone();
                    segTexture.needsUpdate = true;
                    segTexture.repeat.set(seg.width / 2, corridorHeight / 2);

                    // Boiserie paneling tiled along this wall segment
                    const panelTexture = getWallPanelTexture().clone();
                    panelTexture.needsUpdate = true;
                    panelTexture.repeat.set(Math.max(1, seg.width / 2.2), 1);

                    // Baseboard texture clone
                    // Texture: 1582x94 px. Natural tile = (1582/94)*0.15 = 2.524 units wide
                    const bbTexture = baseboardTexture.clone();
                    bbTexture.needsUpdate = true;
                    bbTexture.wrapS = bbTexture.wrapT = THREE.RepeatWrapping;
                    bbTexture.rotation = 0; // CRITICAL: reset rotation (shared texture may have PI/2 from threshold)
                    bbTexture.offset.set(0, 0);
                    const NATURAL_TILE_W = (1582 / 94) * 0.15;
                    bbTexture.repeat.set(seg.width / NATURAL_TILE_W, 1);

                    // =============================================
                    // PRZYCINANIE LISTWY PRZY DRZWIACH
                    // =============================================
                    // Listwa jest węższa o BASEBOARD_DOOR_MARGIN z każdej strony
                    // gdzie segment sąsiaduje z drzwiami (trimStart / trimEnd).
                    // Środek listwy jest przesunięty, żeby wyrównać do ściany.
                    // trimHighZ = przytnij od strony wyższego Z (gdzie zaczyna się wnęka drzwi)
                    // trimLowZ  = przytnij od strony niższego Z  (gdzie kończy się wnęka drzwi)
                    const bbMarginHighZ = seg.trimHighZ ? BASEBOARD_DOOR_MARGIN : 0;
                    const bbMarginLowZ = seg.trimLowZ ? BASEBOARD_DOOR_MARGIN : 0;
                    const bbWidth = seg.width - bbMarginHighZ - bbMarginLowZ;

                    // Przesunięcie środka listwy wzdłuż osi lokalnej (X w przestrzeni grupy)
                    // Segment jest obrócony, więc lokalna oś X = wzdłuż ściany.
                    // Po rotacji +PI/2 (lewa ściana): lokalna oś +X → świat -Z (niższy Z)
                    // Po rotacji -PI/2 (prawa ściana): lokalna oś +X → świat +Z (wyższy Z)
                    // Dlatego offset jest odwrócony między lewą a prawą ścianą.
                    let bbOffsetX;
                    if (seg.isLeft) {
                        // +X lokalny = -Z świat = strona lowZ
                        bbOffsetX = (bbMarginLowZ - bbMarginHighZ) / 2;
                    } else {
                        // +X lokalny = +Z świat = strona highZ
                        bbOffsetX = (bbMarginHighZ - bbMarginLowZ) / 2;
                    }

                    return (
                        <group key={i} position={seg.position} rotation={seg.rotation || [0, seg.rotationY, 0]}>
                            {/* Main Wall Segment */}
                            <mesh>
                                <planeGeometry args={[seg.width, corridorHeight]} />
                                <meshBasicMaterial color="#4A322B"
                                    map={segTexture}
                                    roughness={1}
                                    metalness={0}
                                />
                            </mesh>

                            {/* Baseboard (Listwa przypodłogowa) - przycięta przy drzwiach */}
                            <mesh position={[bbOffsetX, -corridorHeight / 2 + 0.075, 0.01]}>
                                <planeGeometry args={[bbWidth, 0.15]} />
                                <meshBasicMaterial color="#3E2A24"
                                    map={bbTexture}
                                    roughness={0.8}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>

                            {/* Corner depth - soft dark gradient at the floor line */}
                            <mesh position={[0, -corridorHeight / 2 + 0.42, 0.008]}>
                                <planeGeometry args={[seg.width, 0.84]} />
                                <meshBasicMaterial
                                    map={getWallShadeTexture()}
                                    transparent
                                    opacity={0.38}
                                    depthWrite={false}
                                />
                            </mesh>

                            {/* Boiserie paneling: evenly spaced frames along the wall */}
                            <mesh position={[0, -0.22, 0.003]}>
                                <planeGeometry args={[seg.width, 1.5]} />
                                <meshBasicMaterial
                                    map={panelTexture}
                                    transparent
                                    opacity={0.96}
                                    depthWrite={false}
                                />
                            </mesh>

                            {/* Corner shadows where this panel meets the next wall */}
                            <mesh position={[0, 0, 0.004]}>
                                <planeGeometry args={[seg.width, corridorHeight]} />
                                <meshBasicMaterial
                                    map={getWallEdgeShadeTexture()}
                                    transparent
                                    opacity={0.5}
                                    depthWrite={false}
                                />
                            </mesh>

                            {/* Chair rail molding above the paneling */}
                            <mesh position={[0, 0.56, 0.006]}>
                                <planeGeometry args={[seg.width, 0.035]} />
                                <meshBasicMaterial color="#B8A995" transparent opacity={0.75} depthWrite={false} />
                            </mesh>

                            {/* Warm ambient light along the ceiling edge */}
                            <mesh position={[0, corridorHeight / 2 - 0.34, 0.007]}>
                                <planeGeometry args={[seg.width, 0.62]} />
                                <meshBasicMaterial
                                    map={getWarmGlowTexture()}
                                    color="#F3EBDD"
                                    transparent
                                    opacity={0.16}
                                    depthWrite={false}
                                    blending={THREE.AdditiveBlending}
                                />
                            </mesh>

                            {/* Ceiling shadow */}
                            <mesh position={[0, corridorHeight / 2 - 0.36, 0.008]} rotation={[0, 0, Math.PI]}>
                                <planeGeometry args={[seg.width, 0.72]} />
                                <meshBasicMaterial
                                    map={getWallShadeTexture()}
                                    transparent
                                    opacity={0.2}
                                    depthWrite={false}
                                />
                            </mesh>
                        </group>
                    );
                })}



            {/* Baseboards (Approximated or skip for complex geo for now) */}
            {/* Simplified: Just skip baseboards on zigzag for MVP efficiency */}
        </group>
    );
};

export default CorridorWalls;
