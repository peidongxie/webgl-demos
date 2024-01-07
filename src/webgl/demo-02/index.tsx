import { type FC, useEffect, useRef } from 'react';

import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { parseStateStore } from '../lib/webgl-store';

interface GlobalState {
  root: null;
}

const main = (
  gl: WebGLRenderingContext,
): ((newState?: Partial<GlobalState>) => void) => {
  const draw = parseStateStore<GlobalState>({
    // WebGL 系统
    root: {
      deps: [],
      value: null,
      setValue: () => {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
    },
  });
  return draw;
};

/**
 * 清空画布
 */
const Demo02: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const drawRef = useRef<((newState?: Partial<GlobalState>) => void) | null>(
    null,
  );

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    drawRef.current = main(gl);
  }, []);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw();
  }, []);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo02;
