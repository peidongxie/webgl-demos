import { useCallback, useEffect, useRef } from 'react';

const useFrameRequest = (frameRequest: FrameRequestCallback | null): void => {
  const frameRequestRef = useRef<FrameRequestCallback | null>(null);
  const nextFrameRef = useRef<FrameRequestCallback | null>(null);

  const nextFrame = useCallback<FrameRequestCallback>((time) => {
    const frameRequest = frameRequestRef.current;
    if (frameRequest) {
      frameRequest(time);
      nextFrameRef.current = nextFrame;
      window.requestAnimationFrame(nextFrame);
    } else {
      nextFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    frameRequestRef.current = frameRequest;
    if (frameRequestRef.current && !nextFrameRef.current) {
      nextFrameRef.current = nextFrame;
      window.requestAnimationFrame(nextFrame);
    }
    return () => {
      frameRequestRef.current = null;
    };
  }, [frameRequest, nextFrame]);
};

export { useFrameRequest };
