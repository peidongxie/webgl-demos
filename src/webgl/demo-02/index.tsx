import { type FC, useCallback } from 'react';

import Canvas from '../../component/canvas';
import { makeWebGLDraw } from '../../lib';
import { type ComponentProps } from '../../type';

/**
 * 清空画布
 */
const Demo02: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw(gl, '', '', () => ({
        // 着色器程序
        root: {
          deps: [],
          type: 'dynamic',
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            return 1;
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

export default Demo02;
