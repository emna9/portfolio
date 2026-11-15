import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../../../context/SceneContext';
import { useGuidance } from '../../../context/GuidanceContext';
import { getMovementState, isIntroCameraBusy, isIntroLookBack, isEntranceOpening } from '../../../utils/controls';
import { playFootstep } from '../../../utils/sfx';

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
    const { avatarRef, avatarTalkingRef, nearestDoorRef, tutorialOpen } = useGuidance();

    const smoothX = useRef(0);
    const idleSince = useRef(0);
    const view = useRef('back');
    const spawnAt = useRef(0);
    const firstEntryAt = useRef(0);
    const currentDistance = useRef(6.2);
    const wasVisible = useRef(false);
    const stepAccum = useRef(0);
    const prevView = useRef('back');
    const turnUntil = useRef(0);
    const entranceHideAt = useRef(0);
    const feet = useRef(new THREE.Vector3());
    const head = useRef(new THREE.Vector3());

    useEffect(() => {
        // Reset the entrance walk-in when the experience restarts.
        if (!hasEntered) {
            wasVisible.current = false;
            spawnAt.current = 0;
        }
    }, [hasEntered]);

    useFrame((state, delta) => {
        const node = avatarRef.current;
        if (!node) return;

        if (!hasEntered) {
            const landingNow = state.clock.elapsedTime;
            if (isEntranceOpening()) {
                // Let her finish the welcoming wave for a moment as the door opens.
                if (entranceHideAt.current === 0) entranceHideAt.current = landingNow + 0.9;
                if (landingNow >= entranceHideAt.current) {
                    node.style.opacity = '0';
                    node.dataset.moving = 'false';
                    return;
                }
            } else if (entranceHideAt.current !== 0) {
                entranceHideAt.current = 0;
            }

            // Landing pose: standing on the path beside the main door.
            feet.current.set(1.85, FEET_Y, 23.4);
            head.current.set(1.85, FEET_Y + FIGURE_HEIGHT, 23.4);
            feet.current.project(camera);
            head.current.project(camera);

            const width = window.innerWidth;
            const height = window.innerHeight;
            const projectedX = (feet.current.x * 0.5 + 0.5) * width;
            // On narrow screens, keep her inside the frame beside the door.
            const x = width < 640
                ? Math.min(Math.max(projectedX, 72), width - 72)
                : projectedX;
            const feetY = (-feet.current.y * 0.5 + 0.5) * height;
            const headY = (-head.current.y * 0.5 + 0.5) * height;
            const pixelHeight = Math.max(30, feetY - headY);
            const scale = pixelHeight / FIGURE_VIEWBOX_HEIGHT;

            node.style.left = `${x.toFixed(1)}px`;
            node.style.top = `${feetY.toFixed(1)}px`;
            node.style.setProperty('--avatar-scale', scale.toFixed(3));

            const bubbleHalf = Math.min(width < 640 ? 155 : 180, width * 0.46);
            let bubbleShift = 0;
            if (x < bubbleHalf) bubbleShift = bubbleHalf - x;
            else if (x > width - bubbleHalf) bubbleShift = (width - bubbleHalf) - x;
            node.style.setProperty('--bubble-shift', `${bubbleShift.toFixed(0)}px`);

            node.style.opacity = '1';
            node.dataset.moving = 'false';
            node.dataset.view = 'front';
            node.dataset.facing = 'center';
            node.dataset.turning = 'false';
            return;
        }

        const visible = hasEntered && !isInRoom && !isTeleporting;
        const introBusy = isIntroCameraBusy();
        const introLook = isIntroLookBack();
        if (visible && introBusy && !introLook) {
            node.style.opacity = '0';
            node.dataset.moving = 'false';
            return;
        }
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
            firstEntryAt.current = now;
            currentDistance.current = 6.2;
        }

        const movement = getMovementState();
        if (movement.moving && !isInRoom) {
            stepAccum.current += delta || 0.016;
            if (stepAccum.current > 0.36) {
                playFootstep();
                stepAccum.current = 0;
            }
        } else {
            stepAccum.current = 0;
        }

        // During the introduction she stands in front of the main inside door,
        // then walks closer once the tour is dismissed.
        const holdIntro = (tutorialOpen || isIntroLookBack()) && now - firstEntryAt.current < 40;
        const mobileOffset = window.innerWidth < 640 ? 1.2 : 0;
        const targetDistance = (holdIntro ? 5.4 : REST_DISTANCE) + mobileOffset;
        currentDistance.current = THREE.MathUtils.lerp(currentDistance.current, targetDistance, 0.035);
        const distance = currentDistance.current;
        const approaching = Math.abs(currentDistance.current - targetDistance) > 0.05;

        // Stay on the central path, regardless of camera parallax.
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        smoothX.current = THREE.MathUtils.lerp(smoothX.current, 0, 0.07);

        const talking = avatarTalkingRef.current;
        if (movement.moving || approaching) {
            idleSince.current = now;
            view.current = 'back';
        } else if (talking || now - idleSince.current > 0.45) {
            view.current = 'front';
        }

        const facing = 'center';

        const z = camera.position.z + forward.z * distance;
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
        if (view.current !== prevView.current) {
            prevView.current = view.current;
            turnUntil.current = now + 0.32;
        }
        node.dataset.view = view.current;
        node.dataset.facing = facing;
        node.dataset.turning = now < turnUntil.current ? 'true' : 'false';
    });

    return null;
};

export default AvatarAnchor;
