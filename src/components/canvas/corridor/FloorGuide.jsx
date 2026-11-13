import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../../../context/SceneContext';
import { useGuidance } from '../../../context/GuidanceContext';
import { getMovementState } from '../../../utils/controls';

const ARROW_COUNT = 7;
const SPACING = 2.1;
const FLOOR_Y = -1.734;
const BASE_OPACITY = 0.55;

/**
 * FloorGuide
 *
 * A subtle trail of hand-drawn chevrons on the corridor floor. It flows in the
 * walking direction and leans toward the door the visitor is approaching.
 */
const FloorGuide = () => {
    const { camera } = useThree();
    const { hasEntered, isInRoom, isTeleporting } = useScene();
    const { nearestDoorRef } = useGuidance();

    const groupRef = useRef();
    const meshRefs = useRef([]);
    const timeRef = useRef(0);
    const angleRef = useRef(0);

    const arrowGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.32);
        shape.lineTo(0.22, 0.04);
        shape.lineTo(0.08, 0.04);
        shape.lineTo(0.08, -0.24);
        shape.lineTo(-0.08, -0.24);
        shape.lineTo(-0.08, 0.04);
        shape.lineTo(-0.22, 0.04);
        shape.closePath();
        return new THREE.ShapeGeometry(shape);
    }, []);

    useFrame((state, delta) => {
        const group = groupRef.current;
        if (!group) return;

        const visible = hasEntered && !isInRoom && !isTeleporting;
        group.visible = visible;
        if (!visible) return;

        timeRef.current += delta;
        group.position.z = camera.position.z;

        const nearestDoor = nearestDoorRef.current;
        const distance = nearestDoor?.distance ?? Infinity;
        const nearFactor = Number.isFinite(distance) ? Math.max(0, 1 - distance / 13) : 0;
        const movement = getMovementState();

        // The trail lives under the avatar, not at the camera centre.
        const avatarX = camera.position.x * 0.55;
        const sideLean = nearestDoor?.side === 'left' ? -0.28 : nearestDoor?.side === 'right' ? 0.28 : 0;
        const targetX = avatarX + 0.62 + sideLean * nearFactor;
        group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, 0.08);

        // Point the chevrons toward the door she is approaching, otherwise
        // lean slightly in the direction she is strafing.
        let targetAngle = movement.strafe * 0.14;
        if (nearestDoor && nearFactor > 0.15 && Number.isFinite(nearestDoor.worldX)) {
            const dx = nearestDoor.worldX - avatarX;
            const dz = nearestDoor.worldZ - camera.position.z;
            if (Math.abs(dz) > 0.001) {
                targetAngle = THREE.MathUtils.clamp(Math.atan2(-dx, -dz), -0.55, 0.55);
            }
        }
        angleRef.current = THREE.MathUtils.lerp(angleRef.current, targetAngle, 0.09);

        const t = timeRef.current;
        for (let i = 0; i < ARROW_COUNT; i += 1) {
            const mesh = meshRefs.current[i];
            if (!mesh) continue;

            // Chevrons flow away from the camera, then fade in near the front.
            const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.85);
            const fade = Math.min(1, (ARROW_COUNT - i) / 3);
            mesh.material.opacity = BASE_OPACITY * (0.35 + 0.65 * pulse) * fade;
            const scale = 0.92 + 0.1 * pulse;
            mesh.scale.setScalar(scale);
            if (mesh.parent) mesh.parent.rotation.y = angleRef.current;
        }
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: ARROW_COUNT }).map((_, i) => (
                <group key={i} position={[0, FLOOR_Y, -2.6 - i * SPACING]}>
                    <mesh
                        ref={(node) => { meshRefs.current[i] = node; }}
                        geometry={arrowGeometry}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <meshBasicMaterial
                            color="#ffe9bd"
                            transparent
                            opacity={BASE_OPACITY}
                            depthWrite={false}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

export default FloorGuide;
