import { useCallback, useEffect, useRef, useState } from 'react';

type NumberArray = number[] | NumberArray[];

const flatArray = (data: number | NumberArray, mask?: number[]): number[] => {
  if (!Array.isArray(data)) {
    return [data];
  }
  if (data.every((value) => !Array.isArray(value))) {
    return (data as number[]).filter((_, index) => (mask ? mask[index] : true));
  }
  return data.map((value) => flatArray(value, mask)).flat();
};

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

const useImage = (src: string): HTMLImageElement | null => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const loader = new Image();
    const listener = () => setImage(loader);
    loader.addEventListener('load', listener);
    loader.src = src;
    return () => loader.removeEventListener('load', listener);
  }, [src]);

  return image;
};

export { flatArray, useFrameRequest, useImage };
