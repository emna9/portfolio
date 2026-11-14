import { useCallback, useEffect, useRef, useState } from 'react';
import { setVirtualAxis } from '../../utils/controls';

/**
 * VirtualPad - touch-friendly direction pad for phones and tablets.
 * It feeds the same movement state as the keyboard, so behaviour stays identical.
 */
const VirtualPad = ({ visible, canEnter, onEnter }) => {
    const [isTouch, setIsTouch] = useState(false);
    const axis = useRef({ forward: 0, strafe: 0 });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const query = window.matchMedia('(pointer: coarse)');
        const update = () => setIsTouch(query.matches);
        update();
        query.addEventListener?.('change', update);
        return () => query.removeEventListener?.('change', update);
    }, []);

    const apply = useCallback(() => {
        setVirtualAxis(axis.current.forward, axis.current.strafe);
    }, []);

    const release = useCallback((event) => {
        event?.preventDefault?.();
        axis.current = { forward: 0, strafe: 0 };
        apply();
    }, [apply]);

    useEffect(() => {
        if (!visible) {
            axis.current = { forward: 0, strafe: 0 };
            apply();
        }
    }, [visible, apply]);

    useEffect(() => () => {
        setVirtualAxis(0, 0);
    }, []);

    const press = (forward, strafe) => (event) => {
        event.preventDefault();
        event.stopPropagation();
        axis.current = { forward, strafe };
        apply();
    };

    if (!isTouch) return null;

    return (
        <div className={`virtual-pad ${visible ? 'is-visible' : ''}`} aria-hidden={!visible}>
            <div className="virtual-pad__grid">
                <button
                    type="button"
                    className="virtual-pad__key virtual-pad__key--up"
                    aria-label="Walk forward"
                    onPointerDown={press(1, 0)}
                    onPointerUp={release}
                    onPointerLeave={release}
                    onPointerCancel={release}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </button>
                <button
                    type="button"
                    className="virtual-pad__key virtual-pad__key--down"
                    aria-label="Walk backward"
                    onPointerDown={press(-1, 0)}
                    onPointerUp={release}
                    onPointerLeave={release}
                    onPointerCancel={release}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                </button>
            </div>

            {canEnter && (
                <button type="button" className="virtual-pad__enter" onClick={onEnter}>
                    OPEN
                </button>
            )}
        </div>
    );
};

export default VirtualPad;
