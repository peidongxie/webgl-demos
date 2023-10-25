import { useEffect, useMemo, useState } from 'react';

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

export { useFloat32Array, useImage };
