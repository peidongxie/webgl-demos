import { WebGLEngine } from '@galacean/engine';
import { useEffect, useRef, type FC } from 'react';
import { type ComponentProps } from '../../type';

const main = async (engine: WebGLEngine): Promise<void> => {
  engine.canvas.resizeByClientSize();
};

/**
 * 初始化画布
 */
const Demo01: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const promiseRef = useRef<Promise<WebGLEngine> | null>(null);

  useEffect(() => {
    if (canvasRef.current && !promiseRef.current) {
      const canvas = canvasRef.current;
      const promise = WebGLEngine.create({ canvas });
      promiseRef.current = promise;
    }
    return () => {
      promiseRef.current?.then((engine) => engine.destroy());
      promiseRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const promise = promiseRef.current;
    if (!promise) return;
    (async () => {
      const engine = await promise;
      if (promiseRef.current !== promise) return;
      await main(engine);
      if (promiseRef.current !== promise) return;
      engine.run();
    })();
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo01;
