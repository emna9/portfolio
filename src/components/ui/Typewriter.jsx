import { useEffect, useState, useCallback } from 'react';

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * useTypewriter - reveals text letter by letter.
 * - Cancels cleanly when the text changes.
 * - Instantly reveals everything for reduced-motion users.
 */
export const useTypewriter = (text = '', { speed = 26, startDelay = 0, enabled = true } = {}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!text) {
            setCount(0);
            return undefined;
        }

        if (!enabled || prefersReducedMotion()) {
            setCount(text.length);
            return undefined;
        }

        setCount(0);
        let index = 0;
        let intervalId;
        const timeoutId = setTimeout(() => {
            intervalId = setInterval(() => {
                index += 1;
                setCount(index);
                if (index >= text.length) {
                    clearInterval(intervalId);
                }
            }, speed);
        }, startDelay);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [text, speed, startDelay, enabled]);

    const finish = useCallback(() => {
        setCount(text.length);
    }, [text]);

    return {
        displayed: text.slice(0, count),
        done: count >= text.length,
        finish,
    };
};

/**
 * Typewriter - accessible animated text.
 * Clicking it (or pressing Enter/Space while focused) reveals the full sentence.
 */
export const Typewriter = ({
    text = '',
    speed = 26,
    startDelay = 0,
    className = '',
    cursor = true,
    as: Tag = 'span',
    onClick,
    ...rest
}) => {
    const { displayed, done, finish } = useTypewriter(text, { speed, startDelay });

    const handleClick = (event) => {
        if (!done) finish();
        onClick?.(event);
    };

    return (
        <Tag
            className={`typewriter ${className}`.trim()}
            onClick={handleClick}
            onKeyDown={(event) => {
                if (!done && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    finish();
                }
            }}
            {...rest}
        >
            <span aria-hidden="true">
                {displayed}
                {cursor && !done && <span className="typewriter-cursor">|</span>}
            </span>
            <span className="sr-only">{text}</span>
        </Tag>
    );
};

export default Typewriter;
