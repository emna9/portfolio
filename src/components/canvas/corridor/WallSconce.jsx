import * as THREE from 'three';

// Warm halo around a wall sconce.
let sconceGlowTexture = null;
const getSconceGlowTexture = () => {
    if (sconceGlowTexture || typeof document === 'undefined') return sconceGlowTexture;
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(243, 235, 221, 0.9)');
    gradient.addColorStop(0.35, 'rgba(216, 201, 178, 0.4)');
    gradient.addColorStop(1, 'rgba(216, 201, 178, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    sconceGlowTexture = new THREE.CanvasTexture(canvas);
    return sconceGlowTexture;
};

/**
 * WallSconce - bronze arm, warm ivory shade and a soft halo.
 * Rendered on the corridor walls and beside every door.
 */
const WallSconce = ({ position = [0, 0.28, 0.05], scale = 1 }) => (
    <group position={position} scale={scale}>
        <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.09, 0.3, 0.02]} />
            <meshBasicMaterial color="#3E2A24" />
        </mesh>
        <mesh position={[0, -0.03, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.22, 8]} />
            <meshBasicMaterial color="#3E2A24" />
        </mesh>
        <mesh position={[0, 0.06, 0.22]}>
            <cylinderGeometry args={[0.095, 0.07, 0.22, 18, 1, true]} />
            <meshBasicMaterial color="#F7E9CE" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.06, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.075, 16]} />
            <meshBasicMaterial color="#FBF4E8" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.06, 0.23]}>
            <planeGeometry args={[0.95, 0.95]} />
            <meshBasicMaterial
                map={getSconceGlowTexture()}
                color="#F3EBDD"
                transparent
                opacity={0.45}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    </group>
);

export default WallSconce;
