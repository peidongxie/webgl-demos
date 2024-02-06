import { type FC, useCallback } from 'react';

import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { type BaseState, parseStateStore } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制点
 */
const Demo03: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
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
      draw();
    },
    [],
  );

  return (
    <Canvas
      glVertexShader={VSHADER_SOURCE}
      glFragmentShader={FSHADER_SOURCE}
      onProgramInit={handleProgramInit}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo03;
