import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * MainDoorInterior
 *
 * The inside face of the main entrance: a small vestibule with the big double
 * door and the `while (true) { explore(); }` sign above it. The intro camera
 * turns around to show the avatar standing here before the tour starts.
 */
const MainDoorInterior = () => {
    const floorTexture = useTexture('textures/corridor/kawalekpodlogi.webp');
    const wallTexture = useTexture('textures/corridor/wall_texture.webp');
    const frameTexture = useTexture('textures/doors/frame_sketch.webp');
    const doorTexture = useTexture('textures/doors/door_main_clean.webp');

    const materials = useMemo(() => {
        const floor = floorTexture.clone();
        floor.needsUpdate = true;
        floor.wrapS = floor.wrapT = THREE.RepeatWrapping;
        floor.repeat.set(2, 4);

        const wall = wallTexture.clone();
        wall.needsUpdate = true;
        wall.wrapS = wall.wrapT = THREE.RepeatWrapping;
        wall.repeat.set(4, 2);

        return {
            floor: new THREE.MeshBasicMaterial({ map: floor, color: '#d8b08c', side: THREE.DoubleSide }),
            wall: new THREE.MeshBasicMaterial({ map: wall, color: '#f3dfcd', side: THREE.DoubleSide }),
            ceiling: new THREE.MeshBasicMaterial({ color: '#fbf3e4', side: THREE.DoubleSide }),
            frame: new THREE.MeshBasicMaterial({ map: frameTexture, color: '#422A28', transparent: true, alphaTest: 0.1, side: THREE.DoubleSide }),
            door: new THREE.MeshBasicMaterial({ map: doorTexture, color: '#3E2A24', side: THREE.DoubleSide }),
            sign: new THREE.MeshBasicMaterial({ color: '#F3EBDD', side: THREE.DoubleSide }),
        };
    }, [floorTexture, wallTexture, frameTexture, doorTexture]);

    return (
        <group>
            {/* vestibule floor / walls / ceiling between the corridor and the main door */}
            <mesh position={[0, -1.75, 16]} rotation={[-Math.PI / 2, 0, 0]} material={materials.floor}>
                <planeGeometry args={[7, 12]} />
            </mesh>
            <mesh position={[-3.5, 0, 16]} rotation={[0, Math.PI / 2, 0]} material={materials.wall}>
                <planeGeometry args={[12, 3.5]} />
            </mesh>
            <mesh position={[3.5, 0, 16]} rotation={[0, -Math.PI / 2, 0]} material={materials.wall}>
                <planeGeometry args={[12, 3.5]} />
            </mesh>
            <mesh position={[0, 1.75, 16]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceiling}>
                <planeGeometry args={[7, 12]} />
            </mesh>

            {/* main double door, inside face */}
            <mesh position={[0, -0.35, 21.99]} rotation={[0, Math.PI, 0]} material={materials.frame}>
                <planeGeometry args={[2.3, 2.8]} />
            </mesh>
            <mesh position={[-0.475, -0.55, 21.98]} rotation={[0, Math.PI, 0]} material={materials.door}>
                <planeGeometry args={[0.95, 2.4]} />
            </mesh>
            <mesh position={[0.475, -0.55, 21.98]} rotation={[0, Math.PI, 0]} material={materials.door}>
                <planeGeometry args={[0.95, 2.4]} />
            </mesh>

            {/* brass handles */}
            <mesh position={[-0.08, -0.55, 21.94]}>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshBasicMaterial color="#c9a227" />
            </mesh>
            <mesh position={[0.08, -0.55, 21.94]}>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshBasicMaterial color="#c9a227" />
            </mesh>

            {/* while-loop sign above the main door */}
            <mesh position={[0, 0.95, 21.9]} rotation={[0, Math.PI, 0]} material={materials.sign}>
                <planeGeometry args={[1.7, 0.32]} />
            </mesh>
            <Text
                position={[0, 1.02, 21.89]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.08}
                color="#4a2c22"
                anchorX="center"
                anchorY="middle"
                font="fonts/CabinSketch-Bold.ttf"
            >
                while (true) {'{'}
            </Text>
            <Text
                position={[0, 0.88, 21.89]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.08}
                color="#4a2c22"
                anchorX="center"
                anchorY="middle"
                font="fonts/CabinSketch-Bold.ttf"
            >
                explore(); {'}'}
            </Text>
        </group>
    );
};

export default MainDoorInterior;
