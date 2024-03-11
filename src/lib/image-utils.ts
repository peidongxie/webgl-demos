import { useEffect, useState } from 'react';

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

export { useImage };
