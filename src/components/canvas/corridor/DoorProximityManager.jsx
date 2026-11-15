import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGuidance } from '../../../context/GuidanceContext';
import { useScene } from '../../../context/SceneContext';
import { getDoorInfo, RECOMMENDED_ROOM } from '../../../data/doorContent';
import { playDoorChime } from '../../../utils/sfx';

const tmpVector = new THREE.Vector3();
const doorVector = new THREE.Vector3();
const bestVector = new THREE.Vector3();
const cameraForward = new THREE.Vector3();

// How close (in corridor units) the visitor must be to interact.
const ENTER_DISTANCE = 6;
// Doors further than this are ignored entirely.
const AWARE_DISTANCE = 12;

/**
 * DoorProximityManager
 *
 * Runs inside the Canvas, finds the door closest to the camera and publishes
 * its screen position + description to the DOM guidance layer (throttled).
 */
const DoorProximityManager = () => {
    const { camera } = useThree();
    const { doorsRef, setNearestDoor } = useGuidance();
    const { hasEntered, isInRoom, isTeleporting } = useScene();
    const lastPublish = useRef(0);
    const chimedKey = useRef(null);
    const lastPayload = useRef(null);

    useFrame(() => {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (now - lastPublish.current < 90) return;
        lastPublish.current = now;

        const clearPublished = () => {
            if (lastPayload.current !== null) {
                lastPayload.current = null;
                setNearestDoor(null);
            }
        };

        if (!hasEntered || isInRoom || isTeleporting) {
            clearPublished();
            return;
        }

        let best = null;
        let bestDistance = Infinity;
        cameraForward.set(0, 0, -1).applyQuaternion(camera.quaternion);

        for (const door of doorsRef.current.values()) {
            if (!door) continue;
            // Prefer the live world position of the door mesh (it tilts as you approach).
            let hasPosition = false;
            if (typeof door.getPosition === 'function') {
                hasPosition = Boolean(door.getPosition(doorVector));
            } else if (door.position) {
                doorVector.copy(door.position);
                hasPosition = true;
            }
            if (!hasPosition) continue;

            const dz = Math.abs(camera.position.z - doorVector.z);
            if (dz > AWARE_DISTANCE) continue;

            // Skip doors behind the visitor so the next door ahead takes over smoothly.
            tmpVector.copy(doorVector).sub(camera.position);
            if (tmpVector.dot(cameraForward) <= 0.25) continue;

            const dx = camera.position.x - doorVector.x;
            const distance = Math.sqrt(dx * dx + dz * dz);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = door;
                bestVector.copy(doorVector);
            }
        }

        if (!best) {
            chimedKey.current = null;
            clearPublished();
            return;
        }

        if (bestDistance <= 5 && chimedKey.current !== best.key) {
            chimedKey.current = best.key;
            playDoorChime();
        } else if (bestDistance > 7) {
            chimedKey.current = null;
        }

        // Anchor the bubble a little above the door.
        tmpVector.copy(bestVector);
        tmpVector.y += 1.75;
        tmpVector.project(camera);
        const screenX = (tmpVector.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-tmpVector.y * 0.5 + 0.5) * window.innerHeight;

        // Skip off-screen doors (with a small margin).
        if (screenX < -80 || screenX > window.innerWidth + 80) {
            clearPublished();
            return;
        }

        const info = getDoorInfo(best.roomId);
        const distanceBucket = Math.round(bestDistance * 2) / 2;
        const roundedX = Math.round(screenX / 8) * 8;
        const roundedY = Math.round(screenY / 8) * 8;

        const prev = lastPayload.current;
        const unchanged = prev
            && prev.key === best.key
            && prev.distanceBucket === distanceBucket
            && Math.abs(prev.screenX - roundedX) < 8
            && Math.abs(prev.screenY - roundedY) < 8;

        if (unchanged) return;

        lastPayload.current = {
            key: best.key,
            distanceBucket,
            screenX: roundedX,
            screenY: roundedY,
        };

        setNearestDoor({
            key: best.key,
            roomId: best.roomId,
            side: best.side,
            title: info?.title || best.label || 'ROOM',
            description: info?.description || 'Step inside to discover more.',
            recommended: best.roomId === RECOMMENDED_ROOM,
            distance: bestDistance,
            canEnter: bestDistance <= ENTER_DISTANCE,
            screen: { x: screenX, y: screenY },
            worldX: bestVector.x,
            worldZ: bestVector.z,
        });
    });

    return null;
};

export default DoorProximityManager;
