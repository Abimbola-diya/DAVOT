import type { LegacyAnimationControls } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import type {
  ForwardedRef,
  MouseEventHandler,
} from 'react';
import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UseIconAnimationOptions {
  controls: LegacyAnimationControls;
  loops?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  ref: ForwardedRef<AnimatedIconHandle>;
}

export function useIconAnimation({
  controls,
  loops = false,
  onMouseEnter,
  onMouseLeave,
  ref,
}: UseIconAnimationOptions) {
  const shouldReduceMotion = useReducedMotion();
  const isControlledRef = useRef(false);
  const isPlayingRef = useRef(false);
  const runRef = useRef(0);

  const startAnimation = useCallback(() => {
    if (shouldReduceMotion || isPlayingRef.current) return;

    isPlayingRef.current = true;
    const run = ++runRef.current;
    controls.set('normal');
    void controls.start('animate').then(() => {
      if (runRef.current === run) isPlayingRef.current = false;
    });
  }, [controls, shouldReduceMotion]);

  const stopAnimation = useCallback(() => {
    if (!loops) return;

    runRef.current++;
    isPlayingRef.current = false;
    void controls.start('normal');
  }, [controls, loops]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let mounted = true;

    const triggerLoop = async () => {
      if (!mounted || shouldReduceMotion) return;
      isPlayingRef.current = true;
      const run = ++runRef.current;
      controls.set('normal');
      await controls.start('animate');
      if (runRef.current === run) isPlayingRef.current = false;
      if (mounted && loops) {
        timeoutId = setTimeout(triggerLoop, 2200);
      }
    };

    if (loops) {
      triggerLoop();
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [controls, loops, shouldReduceMotion]);

  useImperativeHandle(
    ref,
    () => {
      isControlledRef.current = true;
      return { startAnimation, stopAnimation };
    },
    [startAnimation, stopAnimation]
  );

  const handleMouseEnter = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      onMouseEnter?.(event);
      if (!isControlledRef.current && !loops) startAnimation();
    },
    [onMouseEnter, startAnimation, loops]
  );

  const handleMouseLeave = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      onMouseLeave?.(event);
      if (!isControlledRef.current && !loops) stopAnimation();
    },
    [onMouseLeave, stopAnimation, loops]
  );

  return { handleMouseEnter, handleMouseLeave };
}
