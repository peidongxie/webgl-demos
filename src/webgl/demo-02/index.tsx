import { useEffect, useRef, type FC } from 'react';
import { type ComponentProps } from '../../type';
import { getWebGLContext } from '../lib/cuon-utils';

/**
 * 清空画布
 */
const Demo02: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && !glRef.current) {
      const gl = getWebGLContext(canvasRef.current);
      if (gl) {
        /**
         * 清空
         */
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      glRef.current = gl;
    }
    return () => {
      glRef.current = null;
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo02;
