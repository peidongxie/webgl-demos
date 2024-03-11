import { type FC, useCallback } from 'react';

import Canvas from '../../component/canvas';
import { makeWebGLDraw } from '../../lib';
import { type ComponentProps } from '../../type';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制点
 */
const Demo03: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw(gl, VSHADER_SOURCE, FSHADER_SOURCE, () => ({
        // 着色器程序
        root: {
          deps: [],
          type: 'dynamic',
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            return 1;
          },
          onChange: () => {
            gl.drawArrays(gl.POINTS, 0, 1);
          },
        },
      }));
      draw({});
    },
    [],
  );

  return (
    <Canvas
      onProgramInit={handleProgramInit}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo03;
