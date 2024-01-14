import { type FC, useEffect, useRef } from 'react';

import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

const main = (gl: WebGLRenderingContext): StateChangeAction<BaseState> => {
  const draw = parseStateStore<BaseState>({
    // 着色器程序
    root: {
      deps: [],
      data: () => {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
      onChange: () => {
        gl.drawArrays(gl.POINTS, 0, 1);
      },
    },
  });
  return draw;
};

/**
 * 绘制点
 */
const Demo03: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const drawRef = useRef<StateChangeAction<BaseState> | null>(null);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
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

export default Demo03;
