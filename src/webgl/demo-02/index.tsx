import { type FC, useEffect, useRef } from 'react';

import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';

/**
 * 清空画布
 */
const Demo02: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);

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
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo02;
