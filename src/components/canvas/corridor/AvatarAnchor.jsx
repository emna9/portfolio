import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../../../context/SceneContext';
import { useGuidance } from '../../../context/GuidanceContext';
import { getMovementState } from '../../../utils/controls';

const FEET_Y = -1.74;
const FIGURE_HEIGHT = 1.75;
const REST_DISTANCE = 3.8;
const FIGURE_VIEWBOX_HEIGHT = 460;

/**
 * AvatarAnchor
 *
 * Keeps the DOM avatar in sync with the 3D world: projects her feet/head to
 * screen space, drives the walk/idle/turn state and the approach animation.
 * Runs every frame but only touches one DOM node (no React re-renders).
 */
const AvatarAnchor = () => {
    const { camera } = useThree();
    const { hasEntered, isInRoom, isTeleporting } = useScene();
    const { avatarRef, avatarTalkingRef, nearestDoorRef } = useGuidance();

    const smoothX = useRef(0);
    const idleSince = useRef(0);
    const view = useRef('back');
    const spawnAt = useRef(0);
    const wasVisible = useRef(false);
    const feet = useRef(new THREE.Vector3());
    const head = useRef(new THREE.Vector3());

    useEffect(() => {
        // Reset the entrance walk-in when the experience restarts.
        if (!hasEntered) {
            wasVisible.current = false;
            spawnAt.current = 0;
        }
    }, [hasEntered]);

    useFrame((state) => {
        const node = avatarRef.current;
        if (!node) return;

        const visible = hasEntered && !isInRoom && !isTeleporting;
        if (!visible) {
            node.style.opacity = '0';
            node.dataset.moving = 'false';
            node.dataset.view = 'back';
            wasVisible.current = false;
            return;
        }

        const now = state.clock.elapsedTime;
        if (!wasVisible.current) {
            wasVisible.current = true;
            spawnAt.current = now;
        }

        const movement = getMovementState();
        const nearest = nearestDoorRef.current;
        const nearFactor = nearest ? Math.max(0, 1 - nearest.distance / 13) : 0;
        const side = nearest?.side;

        // Walk in from a little further away after entering / leaving a room.
        const spawnT = Math.min(1, Math.max(0, (now - spawnAt.current) / 1.5));
        const easedSpawn = spawnT * (2 - spawnT);
        const mobileOffset = window.innerWidth < 640 ? 1.2 : 0;
        const distance = 5.6 + (REST_DISTANCE - 5.6) * easedSpawn + mobileOffset;
        const approaching = spawnT < 1;

        // Softly follow the camera and lean toward the door being approached.
        const targetX = camera.position.x * 0.55
            + (side === 'left' ? -0.38 : side === 'right' ? 0.38 : 0) * nearFactor;
        smoothX.current = THREE.MathUtils.lerp(smoothX.current, targetX, 0.07);

        const talking = avatarTalkingRef.current;
        if (movement.moving || approaching) {
            idleSince.current = now;
            view.current = 'back';
        } else if (talking || now - idleSince.current > 0.65) {
            view.current = 'front';
        }

        let facing = 'center';
        if (movement.strafe > 0.15) facing = 'right';
        else if (movement.strafe < -0.15) facing = 'left';
        else if (side && nearFactor > 0.3) facing = side;

        const z = camera.position.z - distance;
        feet.current.set(smoothX.current, FEET_Y, z);
        head.current.set(smoothX.current, FEET_Y + FIGURE_HEIGHT, z);

        feet.current.project(camera);
        head.current.project(camera);

        const width = window.innerWidth;
        const height = window.innerHeight;
        const x = (feet.current.x * 0.5 + 0.5) * width;
        const feetY = (-feet.current.y * 0.5 + 0.5) * height;
        const headY = (-head.current.y * 0.5 + 0.5) * height;
        const pixelHeight = Math.max(30, feetY - headY);
        const scale = pixelHeight / FIGURE_VIEWBOX_HEIGHT;

        node.style.left = `${x.toFixed(1)}px`;
        node.style.top = `${feetY.toFixed(1)}px`;
        node.style.setProperty('--avatar-scale', scale.toFixed(3));

        // Keep the speech bubble inside the viewport.
        const bubbleHalf = Math.min(width < 640 ? 155 : 180, width * 0.46);
        let bubbleShift = 0;
        if (x < bubbleHalf) bubbleShift = bubbleHalf - x;
        else if (x > width - bubbleHalf) bubbleShift = (width - bubbleHalf) - x;
        node.style.setProperty('--bubble-shift', `${bubbleShift.toFixed(0)}px`);

        node.style.opacity = '1';
        node.dataset.moving = movement.moving || approaching ? 'true' : 'false';
        node.dataset.view = view.current;
        node.dataset.facing = facing;
    });

    return null;
};

export default AvatarAnchor;
