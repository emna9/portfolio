import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { isIntroLookBack, setIntroCameraBusy } from '../../../utils/controls';

const INTRO_POSITION = new THREE.Vector3(0, 0.2, 15.5);
const INTRO_LOOK_AT = new THREE.Vector3(0, 0.8, 22);
const INTRO_DURATION = 1.1;

/**
 * IntroCamera
 *
 * For the first introduction, turns the camera around to show the avatar
 * standing in front of the big inside main door. When the tour closes it
 * smoothly turns back to the corridor and releases camera control.
 */
const IntroCamera = ({ setCameraOverride, cancel = false }) => {
    const { camera } = useThree();
    const active = useRef(false);
    const phase = useRef(null);
    const elapsed = useRef(0);
    const savedPosition = useRef(new THREE.Vector3());
    const savedQuaternion = useRef(new THREE.Quaternion());
    const targetQuaternion = useRef(new THREE.Quaternion());
    const lookMatrix = useRef(new THREE.Matrix4());

    useFrame((state, delta) => {
        // A teleport can start while the introduction is still looking back at
        // the entrance. If we keep animating, the intro writes the camera back
        // to the corridor and the room entry lands in the wrong place. Stop at
        // once and let the teleport/door code own the camera.
        if (cancel) {
            if (active.current) {
                active.current = false;
                phase.current = null;
                setIntroCameraBusy(false);
            }
            return;
        }

        const lookBack = isIntroLookBack();
        const dt = delta || 0.016;

        if (lookBack && !active.current) {
            active.current = true;
            phase.current = 'in';
            elapsed.current = 0;
            savedPosition.current.copy(camera.position);
            savedQuaternion.current.copy(camera.quaternion);
            setCameraOverride?.(true);
            setIntroCameraBusy(true);

            lookMatrix.current.lookAt(INTRO_POSITION, INTRO_LOOK_AT, camera.up);
            targetQuaternion.current.setFromRotationMatrix(lookMatrix.current);
        }

        if (!active.current) return;

        if (lookBack && phase.current === 'in') {
            elapsed.current += dt;
            const t = Math.min(1, elapsed.current / INTRO_DURATION);
            const eased = t * t * (3 - 2 * t);
            camera.position.lerpVectors(savedPosition.current, INTRO_POSITION, eased);
            camera.quaternion.slerpQuaternions(savedQuaternion.current, targetQuaternion.current, eased);
            if (t >= 1) phase.current = 'hold';
            return;
        }

        if (lookBack && phase.current === 'hold') {
            camera.position.copy(INTRO_POSITION);
            camera.quaternion.copy(targetQuaternion.current);
            return;
        }

        if (!lookBack) {
            if (phase.current !== 'out') {
                phase.current = 'out';
                elapsed.current = 0;
                setIntroCameraBusy(true);
            }

            elapsed.current += dt;
            const t = Math.min(1, elapsed.current / INTRO_DURATION);
            const eased = t * t * (3 - 2 * t);
            camera.position.lerpVectors(INTRO_POSITION, savedPosition.current, eased);
            camera.quaternion.slerpQuaternions(targetQuaternion.current, savedQuaternion.current, eased);

            if (t >= 1) {
                camera.position.copy(savedPosition.current);
                camera.quaternion.copy(savedQuaternion.current);
                setCameraOverride?.(false);
                setIntroCameraBusy(false);
                active.current = false;
                phase.current = null;
            }
        }
    });

    return null;
};

export default IntroCamera;
