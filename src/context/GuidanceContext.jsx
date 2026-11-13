import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { lockControls, unlockControls, setPov as persistPov, getPov, hasSeenTutorial, markTutorialSeen, resetTutorialSeen } from '../utils/controls';

// Stable actions / flags. This context does NOT change while walking.
const GuidanceContext = createContext(null);
// High-frequency door proximity data, kept separate so only the UI that needs it re-renders.
const NearestDoorContext = createContext(null);

export const useGuidance = () => {
    const ctx = useContext(GuidanceContext);
    if (!ctx) throw new Error('useGuidance must be used within a GuidanceProvider');
    return ctx;
};

export const useNearestDoor = () => useContext(NearestDoorContext);

/**
 * GuidanceProvider
 *
 * Shared state for the guided experience:
 * - door registry (3D doors register themselves so the DOM layer can guide to them)
 * - nearest door (published by DoorProximityManager)
 * - tutorial / help panels
 * - first-person preference
 */
export const GuidanceProvider = ({ children }) => {
    const doorsRef = useRef(new Map());
    const nearestDoorRef = useRef(null);
    const [nearestDoorState, setNearestDoorState] = useState(null);
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [pov, setPovState] = useState(getPov);

    // Keep the non-React control state in sync with the panels.
    useEffect(() => {
        if (tutorialOpen) lockControls('tutorial');
        else unlockControls('tutorial');
        return () => unlockControls('tutorial');
    }, [tutorialOpen]);

    useEffect(() => {
        if (helpOpen) lockControls('help');
        else unlockControls('help');
        return () => unlockControls('help');
    }, [helpOpen]);

    useEffect(() => {
        persistPov(pov);
    }, [pov]);

    const setNearestDoor = useCallback((payload) => {
        nearestDoorRef.current = payload;
        setNearestDoorState(payload);
    }, []);

    const registerDoor = useCallback((key, data) => {
        doorsRef.current.set(key, data);
        return () => {
            doorsRef.current.delete(key);
            if (nearestDoorRef.current && nearestDoorRef.current.key === key) {
                nearestDoorRef.current = null;
                setNearestDoorState(null);
            }
        };
    }, []);

    const openDoor = useCallback((key) => {
        const door = doorsRef.current.get(key);
        if (door && typeof door.open === 'function') {
            door.open();
            return true;
        }
        return false;
    }, []);

    const openTutorial = useCallback(() => {
        setHelpOpen(false);
        setTutorialOpen(true);
    }, []);

    const closeTutorial = useCallback((completed = true) => {
        if (completed) markTutorialSeen();
        setTutorialOpen(false);
    }, []);

    const replayTutorial = useCallback(() => {
        resetTutorialSeen();
        setHelpOpen(false);
        setTutorialOpen(true);
    }, []);

    const setPov = useCallback((value) => {
        setPovState(!!value);
    }, []);

    const togglePov = useCallback(() => {
        setPovState(prev => !prev);
    }, []);

    const value = useMemo(() => ({
        doorsRef,
        nearestDoorRef,
        setNearestDoor,
        registerDoor,
        openDoor,
        tutorialOpen,
        setTutorialOpen,
        openTutorial,
        closeTutorial,
        replayTutorial,
        helpOpen,
        setHelpOpen,
        pov,
        setPov,
        togglePov,
        hasSeenTutorial,
    }), [
        setNearestDoor,
        registerDoor,
        openDoor,
        tutorialOpen,
        openTutorial,
        closeTutorial,
        replayTutorial,
        helpOpen,
        pov,
        setPov,
        togglePov,
    ]);

    return (
        <GuidanceContext.Provider value={value}>
            <NearestDoorContext.Provider value={nearestDoorState}>
                {children}
            </NearestDoorContext.Provider>
        </GuidanceContext.Provider>
    );
};

export default GuidanceContext;
