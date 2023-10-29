import { type FC, useEffect, useRef } from 'react';

import { type ComponentProps } from '../../type';
import { getWebGLContext } from '../lib/cuon-utils';

/**
 * 清空画布
 */
const Demo02: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = glRef.current;
    if (gl) return;
    glRef.current = getWebGLContext(canvasRef.current);
  }, []);

  useEffect(
    () => () => {
      glRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    /**
     * 清空设置
     */
    gl.clearColor(0, 0, 0, 1);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo02;
