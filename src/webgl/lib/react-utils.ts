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

const useImage = (src: string): TexImageSource | null => {
  const srcRef = useRef('');
  const [image, setImage] = useState<TexImageSource | null>(null);

  useEffect(() => {
    srcRef.current = src;
  }, [src]);

  useEffect(
    () => () => {
      srcRef.current = '';
    },
    [],
  );

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      if (srcRef.current !== src) return;
      setImage(image);
    };
  }, [src]);

  return image;
};

export { useFloat32Array, useImage };
