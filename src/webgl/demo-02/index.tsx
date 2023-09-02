import { useEffect, useRef, type FC } from 'react';
import { getWebGLContext } from '../lib/cuon-utils';

interface Demo02Props {
  [key: string]: never;
}

/**
 * 清空画布
 */
const Demo02: FC<Demo02Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /**
     * 画布
     */
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    /**
     * 上下文
     */
    const gl = getWebGLContext(canvas);
    if (!gl) return;
    /**
     * 清空
     */
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo02;
