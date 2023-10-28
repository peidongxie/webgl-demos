import { WebGLEngine } from '@galacean/engine';
import { type FC, useEffect, useRef } from 'react';

import { type ComponentProps } from '../../type';

const main = async (engine: WebGLEngine): Promise<void> => {
  /**
   * 根据 DOM 元素显示尺寸调整画布尺寸
   */
  engine.canvas.resizeByClientSize();
};

/**
 * 初始化画布
 */
const Demo01: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<Promise<WebGLEngine> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const loader = loaderRef.current;
    if (loader) return;
    loaderRef.current = WebGLEngine.create({ canvas });
  }, []);

  useEffect(
    () => () => {
      loaderRef.current?.then((engine) => engine.destroy());
      loaderRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    (async () => {
      const engine = await loader;
      if (loaderRef.current !== loader) return;
      await main(engine);
      if (loaderRef.current !== loader) return;
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
