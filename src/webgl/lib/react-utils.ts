import { useMemo } from 'react';

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

export { useFloat32Array };
