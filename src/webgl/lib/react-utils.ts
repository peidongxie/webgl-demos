import { useEffect, useMemo, useRef, useState } from 'react';

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

const useFloat32Array = (data: NumberArray, mask?: number[]) => {
  return useMemo(() => new Float32Array(flatArray(data, mask)), [data, mask]);
};

const useImage = (src: string): HTMLImageElement | null => {
  const loaderRef = useRef<HTMLImageElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const loader = new Image();
    loaderRef.current = loader;
    loader.addEventListener('load', () => {
      if (loaderRef.current !== loader) return;
      setImage(loader);
    });
    loader.src = src;
  }, [src]);

  return image;
};

export { useFloat32Array, useImage };
