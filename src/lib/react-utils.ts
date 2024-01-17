import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const useUint8Array = (data: NumberArray, mask?: number[]) => {
  return useMemo(() => new Uint8Array(flatArray(data, mask)), [data, mask]);
};

const useUint16Array = (data: NumberArray, mask?: number[]) => {
  return useMemo(() => new Uint16Array(flatArray(data, mask)), [data, mask]);
};

const useFloat32Array = (data: NumberArray, mask?: number[]) => {
  return useMemo(() => new Float32Array(flatArray(data, mask)), [data, mask]);
};

const useFrameRequest = (frameRequest: FrameRequestCallback | null): void => {
  const frameRequestRef = useRef<FrameRequestCallback | null>(null);
  const nextFrameRef = useRef<FrameRequestCallback | null>(null);

  const nextFrame = useCallback<FrameRequestCallback>((time) => {
    const frameRequest = frameRequestRef.current;
    if (frameRequest) {
      frameRequest(time);
      nextFrameRef.current = nextFrame;
      requestAnimationFrame(nextFrame);
    } else {
      nextFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    frameRequestRef.current = frameRequest;
    if (frameRequestRef.current && !nextFrameRef.current) {
      nextFrameRef.current = nextFrame;
      requestAnimationFrame(nextFrame);
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

export {
  flatArray,
  useFloat32Array,
  useFrameRequest,
  useImage,
  useUint8Array,
  useUint16Array,
};
