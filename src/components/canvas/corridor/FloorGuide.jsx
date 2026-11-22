import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../../../context/SceneContext';

const FLOOR_Y = -1.734;

// One arrow on the left (walk forward) and one on the right (walk backward),
// placed on the floor far enough ahead to stay in frame past the avatar guide.
const ARROW_DEPTH = -6;
const ARROW_OFFSET_X = 0.95;

const CORE_COLOR = '#FFB300';
const HOT_COLOR = '#FFF4C2';
const BEAM_COLOR = '#FFD27A';

const createArrowGeometry = (flipped = false) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.4);
    shape.lineTo(0.28, 0.06);
    shape.lineTo(0.105, 0.06);
    shape.lineTo(0.105, -0.3);
    shape.lineTo(-0.105, -0.3);
    shape.lineTo(-0.105, 0.06);
    shape.lineTo(-0.28, 0.06);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    if (flipped) geometry.scale(1, -1, 1);
    return geometry;
};

// Soft round pool of light that sits under each arrow.
const createPoolTexture = () => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 244, 200, 0.95)');
    gradient.addColorStop(0.35, 'rgba(255, 214, 122, 0.5)');
    gradient.addColorStop(0.7, 'rgba(255, 190, 90, 0.16)');
    gradient.addColorStop(1, 'rgba(255, 190, 90, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
};

// Vertical gradient for the light shaft rising from the floor, with soft
// horizontal edges so the sprite reads as a column and not a rectangle.
const createBeamTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 256, 0, 0);
    gradient.addColorStop(0, 'rgba(255, 240, 190, 0.95)');
    gradient.addColorStop(0.35, 'rgba(255, 216, 130, 0.45)');
    gradient.addColorStop(0.75, 'rgba(255, 205, 110, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 205, 110, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fade the left and right edges out.
    const horizontal = ctx.createLinearGradient(0, 0, canvas.width, 0);
    horizontal.addColorStop(0, 'rgba(0, 0, 0, 0)');
    horizontal.addColorStop(0.28, 'rgba(0, 0, 0, 1)');
    horizontal.addColorStop(0.72, 'rgba(0, 0, 0, 1)');
    horizontal.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = horizontal;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
};

/**
 * FloorGuide
 *
 * Two glowing arrows cast on the corridor floor: one points forward, one
 * points backward. Each is a small light beam (hot core, halo, floor pool and
 * a soft rising shaft) that pulses gently so it stays visible on the paper
 * floor without breaking the hand-drawn look.
 */
const FloorGuide = () => {
    const { camera } = useThree();
    const { hasEntered, isInRoom, isTeleporting } = useScene();

    const groupRef = useRef();
    const itemsRef = useRef([]);
    const timeRef = useRef(0);

    const reducedMotion = useMemo(() => (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ), []);

    const forwardGeometry = useMemo(() => createArrowGeometry(false), []);
    const backwardGeometry = useMemo(() => createArrowGeometry(true), []);
    const poolTexture = useMemo(createPoolTexture, []);
    const beamTexture = useMemo(createBeamTexture, []);

    useFrame((_state, delta) => {
        const group = groupRef.current;
        if (!group) return;

        const visible = hasEntered && !isInRoom && !isTeleporting;
        group.visible = visible;
        if (!visible) return;

        timeRef.current += delta;
        group.position.z = camera.position.z;
        group.position.x = THREE.MathUtils.lerp(group.position.x, 0, 0.1);
        group.rotation.y = 0;

        const t = reducedMotion ? 0 : timeRef.current;
        itemsRef.current.forEach((item, index) => {
            if (!item?.core || !item.arrows) return;

            const pulse = 0.5 + 0.5 * Math.sin(t * 1.8 + index * Math.PI);

            item.core.opacity = 0.78 + 0.22 * pulse;
            item.hot.opacity = 0.5 + 0.4 * pulse;
            item.halo.opacity = 0.18 + 0.18 * pulse;
            item.pool.opacity = 0.24 + 0.2 * pulse;
            item.beam.opacity = 0.35 + 0.28 * pulse;

            const scale = 1.2 + 0.07 * pulse;
            item.arrows.scale.setScalar(scale);
        });
    });

    const arrows = [
        { key: 'forward', x: -ARROW_OFFSET_X, z: ARROW_DEPTH, geometry: forwardGeometry },
        { key: 'backward', x: ARROW_OFFSET_X, z: ARROW_DEPTH, geometry: backwardGeometry },
    ];

    return (
        <group ref={groupRef}>
            {arrows.map((arrow, index) => (
                <group key={arrow.key} position={[arrow.x, FLOOR_Y, arrow.z]}>
                    {/* Pool of light on the floor */}
                    <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0.005, 0]}
                        renderOrder={2}
                    >
                        <planeGeometry args={[2, 2]} />
                        <meshBasicMaterial
                            ref={(node) => {
                                if (node) itemsRef.current[index] = { ...itemsRef.current[index], pool: node };
                            }}
                            map={poolTexture}
                            transparent
                            opacity={0.3}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </mesh>

                    {/* Rising shaft of light */}
                    <sprite position={[0, 0.95, 0]} scale={[1.35, 2.1, 1]} renderOrder={2}>
                        <spriteMaterial
                            ref={(node) => {
                                if (node) itemsRef.current[index] = { ...itemsRef.current[index], beam: node };
                            }}
                            map={beamTexture}
                            transparent
                            opacity={0.5}
                            color={BEAM_COLOR}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </sprite>

                    <group
                        ref={(node) => {
                            if (node) itemsRef.current[index] = { ...itemsRef.current[index], arrows: node };
                        }}
                    >
                        {/* Halo: a wider, softer copy of the arrow */}
                        <mesh
                            geometry={arrow.geometry}
                            rotation={[-Math.PI / 2, 0, 0]}
                            position={[0, 0.02, 0]}
                            scale={[1.65, 1.65, 1]}
                            renderOrder={3}
                        >
                            <meshBasicMaterial
                                ref={(node) => {
                                    if (node) itemsRef.current[index] = { ...itemsRef.current[index], halo: node };
                                }}
                                color={BEAM_COLOR}
                                transparent
                                opacity={0.3}
                                blending={THREE.AdditiveBlending}
                                depthWrite={false}
                                side={THREE.DoubleSide}
                                toneMapped={false}
                            />
                        </mesh>

                        {/* Main amber arrow */}
                        <mesh
                            geometry={arrow.geometry}
                            rotation={[-Math.PI / 2, 0, 0]}
                            position={[0, 0.025, 0]}
                            renderOrder={4}
                        >
                            <meshBasicMaterial
                                ref={(node) => {
                                    if (node) itemsRef.current[index] = { ...itemsRef.current[index], core: node };
                                }}
                                color={CORE_COLOR}
                                transparent
                                opacity={0.92}
                                depthWrite={false}
                                side={THREE.DoubleSide}
                                toneMapped={false}
                            />
                        </mesh>

                        {/* White-hot centre line so it reads as light, not paint */}
                        <mesh
                            geometry={arrow.geometry}
                            rotation={[-Math.PI / 2, 0, 0]}
                            position={[0, 0.03, 0]}
                            scale={[0.52, 0.8, 1]}
                            renderOrder={5}
                        >
                            <meshBasicMaterial
                                ref={(node) => {
                                    if (node) itemsRef.current[index] = { ...itemsRef.current[index], hot: node };
                                }}
                                color={HOT_COLOR}
                                transparent
                                opacity={0.85}
                                blending={THREE.AdditiveBlending}
                                depthWrite={false}
                                side={THREE.DoubleSide}
                                toneMapped={false}
                            />
                        </mesh>
                    </group>
                </group>
            ))}
        </group>
    );
};

export default FloorGuide;
