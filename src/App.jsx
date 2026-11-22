import { useState, Suspense, useEffect, useCallback, lazy } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { Preload, useTexture } from '@react-three/drei';
import * as THREE from 'three';

import Preloader from './components/dom/Preloader';
import PaperTransition from './components/dom/PaperTransition';
import SceneFallback from './components/dom/SceneFallback';
import ErrorBoundary from './components/ErrorBoundary';
import { AudioProvider, useAudio } from './context/AudioManager';
import { PerformanceProvider, usePerformance } from './context/PerformanceContext';
import { SceneProvider, useScene } from './context/SceneContext';
import NavigationUI from './components/ui/NavigationUI';
import GlobalOverlay from './components/ui/GlobalOverlay';
import ScreenReaderOverlay from './components/ui/ScreenReaderOverlay';
import GuidanceUI from './components/ui/GuidanceUI';
import TopNav from './components/ui/TopNav';
import AvatarGuide from './components/ui/AvatarGuide';
import { GuidanceProvider, useGuidance } from './context/GuidanceContext';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { initSfx } from './utils/sfx';

// Lazy load the heavy 3D experience
const Experience = lazy(() => import('./components/canvas/Experience'));

import './styles/main.scss';

import { 
  ENTRANCE_TEXTURES, 
  CORRIDOR_TEXTURES, 
  UI_TEXTURES,
  ABOUT_TEXTURES,
  GALLERY_TEXTURES,
  CONTACT_TEXTURES,
  STUDIO_TEXTURES,
  IMAGE_ASSETS,
  filterTexturesByDevice
} from './config/texturePreloadList';
import { TextureLoader } from 'three';

// Standard Browser-level Image Preloader (for <img> tags)
const preloadBrowserImage = (path) => {
  if (typeof window === 'undefined') return;
  const img = new Image();
  img.src = path;
};

const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
const isWeakCPU = typeof navigator.hardwareConcurrency !== 'undefined' && navigator.hardwareConcurrency <= 4;
const isLowRAM = typeof navigator.deviceMemory !== 'undefined' && navigator.deviceMemory <= 4;
const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 450;
const isLowEnd = isMobileDevice || isWeakCPU || isLowRAM || isSmallScreen;

const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

// three.js r185 needs WebGL2. Detecting it up front avoids leaving visitors on
// a preloader forever when WebGL is disabled or blocklisted (common in Firefox
// with strict privacy settings or without hardware acceleration).
const supportsWebGL2 = () => {
  if (typeof document === 'undefined') return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
};

// The landing and the corridor are the only scenes that must be ready before
// the visitor can walk. Room textures stream in afterwards (and are also
// kicked off on demand when a section is chosen).
const CRITICAL_TEXTURES = filterTexturesByDevice(
  [...ENTRANCE_TEXTURES, ...CORRIDOR_TEXTURES, ...UI_TEXTURES],
  supportsHover
);

const DEFERRED_TEXTURES = filterTexturesByDevice(
  [...GALLERY_TEXTURES, ...CONTACT_TEXTURES, ...ABOUT_TEXTURES, ...STUDIO_TEXTURES],
  supportsHover
);

const preloadTexture = (path) => {
  try {
    useTexture.preload(path);
    useLoader.preload(TextureLoader, path);
  } catch {
    // Ignore invalid paths
  }
};

CRITICAL_TEXTURES.forEach(preloadTexture);

// Helper component to handle global audio enable on interaction
const GlobalAudioEnabler = () => {
  const { enableAudio } = useAudio();
  useEffect(() => {
    const handleInteraction = () => enableAudio();
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [enableAudio]);
  return null;
};

// Bridge component to handle dynamic meta tags + deep link auto-teleport
function DocumentMetaBridge() {
  useDocumentMeta();
  const { initialRoom, deeplinkHandled, hasEntered, teleportTo } = useScene();
  const { closeTutorial } = useGuidance();

  useEffect(() => {
    if (!initialRoom || !hasEntered || deeplinkHandled.current) return undefined;

    // Give the entrance introduction a moment to settle and close its overlay
    // before the deep link takes over the camera. Otherwise the intro and the
    // teleport fight for control and the room never opens.
    const timer = setTimeout(() => {
      if (deeplinkHandled.current) return;
      deeplinkHandled.current = true;
      closeTutorial(true);
      teleportTo(initialRoom);
    }, 1200);

    return () => clearTimeout(timer);
  }, [initialRoom, hasEntered, teleportTo, deeplinkHandled, closeTutorial]);

  return null;
}

function AppContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(() => !supportsWebGL2());
  const { settings, downgradeTier, tier } = usePerformance();

  // NOTE: background music is initialised lazily by playBackgroundMusic()
  // when the visitor enters, or by initAudio() on the first gesture. Loading
  // its 1.8 MB file during the preloader delayed the first render for nothing.

  // Once the preloader is gone, quietly warm the room textures in small idle
  // batches. They are not needed for the landing or corridor, so they must
  // never delay the first render.
  useEffect(() => {
    if (!isLoaded) return undefined;

    let cancelled = false;
    const queue = [...DEFERRED_TEXTURES];

    const runBatch = () => {
      if (cancelled) return;
      queue.splice(0, 8).forEach(path => {
        preloadTexture(path);
      });
      if (queue.length) {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(runBatch, { timeout: 1500 });
        } else {
          setTimeout(runBatch, 150);
        }
      }
    };

    // Map images used by the navigation UI.
    IMAGE_ASSETS.forEach(preloadBrowserImage);

    const first = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(runBatch, { timeout: 2000 })
      : setTimeout(runBatch, 300);

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(first);
      } else {
        clearTimeout(first);
      }
    };
  }, [isLoaded]);

  const handleSceneReady = useCallback(() => {
    requestAnimationFrame(() => {
      setSceneReady(true);
    });
  }, []);

  return (
    <AudioProvider>
      <SceneProvider>
        <GuidanceProvider>
        <DocumentMetaBridge />
        <GlobalAudioEnabler />
        <div className="app">
          {/* Full screen 3D Canvas */}
          <div className="canvas-wrapper">
            {sceneFailed ? (
              <SceneFallback />
            ) : (
              <ErrorBoundary
                onError={() => setSceneFailed(true)}
                fallback={<SceneFallback />}
              >
                <Canvas
                  camera={{
                    position: [0, 0.2, 28],
                    fov: 60,
                    near: 0.1,
                    far: 150
                  }}
                  gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance",
                    localClippingEnabled: true,
                    failIfMajorPerformanceCaveat: false
                  }}
                  onCreated={({ gl }) => {
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

                    gl.domElement.addEventListener(
                      'webglcontextlost',
                      (event) => {
                        event.preventDefault();
                        setSceneFailed(true);
                      },
                      { once: true }
                    );
                  }}
                  dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2)]}
                  shadows={settings.shadows}
                >
                  <color attach="background" args={['#fdf8e2']} /> {/* TINTED TO DEEP PURPLE */}
                  <fog attach="fog" args={['#fdf8e2', 15, 50]} /> {/* FOG TINTED TO DEEP PURPLE */}

                  <Suspense fallback={null}>
                    <Experience
                      isLoaded={isLoaded}
                      onSceneReady={handleSceneReady}
                      performanceTier={tier}
                    />
                    <Preload all />
                  </Suspense>
                </Canvas>
              </ErrorBoundary>
            )}
          </div>

          {/* Navigation UI - Hamburger, Map, Back, Audio */}
          {isLoaded && (
            <>
              <TopNav />
              <NavigationUI />
              <GlobalOverlay />
              <PaperTransition />
              <ScreenReaderOverlay />
              <AvatarGuide />
              <GuidanceUI />
            </>
          )}

          {/* 2D Preloader */}
          <Preloader
            ready={sceneReady || sceneFailed}
            onComplete={() => setIsLoaded(true)}
          />
        </div>
        </GuidanceProvider>
      </SceneProvider>
    </AudioProvider>
  );
}

import { AchievementsProvider } from './context/AchievementsContext';

export default function App() {
  // Browsers require a gesture before audio can start.
  useEffect(() => {
    const unlock = () => initSfx();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('touchstart', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('touchstart', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);

  return (
    <PerformanceProvider>
      <AchievementsProvider>
        <ErrorBoundary fallback={<SceneFallback />}>
          <AppContent />
        </ErrorBoundary>
      </AchievementsProvider>
    </PerformanceProvider>
  );
}
