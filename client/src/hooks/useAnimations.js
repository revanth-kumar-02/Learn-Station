import { useEffect, useRef, useState } from 'react';

/**
 * Scroll reveal hook using IntersectionObserver.
 * Returns a ref to attach to the element and a boolean `revealed`.
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options;
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, revealed };
}

/**
 * Mouse position tracker relative to an element.
 * Returns x, y normalized to [-1, 1] range.
 */
export function useMousePosition(elementRef) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = elementRef?.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setPosition({ x, y });
    };

    const handleLeave = () => setPosition({ x: 0, y: 0 });

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [elementRef]);

  return position;
}

/**
 * Animated count-up hook.
 * Animates from 0 (or previous value) to target.
 */
export function useCountUp(target, options = {}) {
  const { duration = 2000, enabled = true, startFrom = 0 } = options;
  const [value, setValue] = useState(startFrom);
  const prevTarget = useRef(startFrom);

  useEffect(() => {
    if (!enabled) return;

    const from = prevTarget.current;
    const diff = target - from;
    if (diff === 0) return;

    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + diff * eased);

      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, enabled]);

  return value;
}

/**
 * Typewriter effect hook.
 */
export function useTypewriter(text, options = {}) {
  const { speed = 30, delay = 0, enabled = true } = options;
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled || !text) return;

    setDisplayText('');
    setIsComplete(false);
    let index = 0;
    let timeout;

    const type = () => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
        timeout = setTimeout(type, speed);
      } else {
        setIsComplete(true);
      }
    };

    timeout = setTimeout(type, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, enabled]);

  return { displayText, isComplete };
}
