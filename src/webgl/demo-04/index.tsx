import { type FC, useCallback } from 'react';

import Canvas from '../../component/canvas';
import { makeWebGLDraw, type StateWithRoot } from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  point: Tuple<number, 2>;
}>;

/**
 * 动态绘制点
 */
const Demo04: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER,
        FSHADER,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position'],
            data: () => {
              gl.clearColor(0, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              return 1;
            },
            onChange: () => {
              gl.drawArrays(gl.POINTS, 0, 1);
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['point'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, point }) => {
              const [x, y] = point;
              gl.vertexAttrib3f(a_Position, x, y, 0);
            },
          },
          // 原子数据：顶点
          point: {
            deps: [],
          },
        }),
      );
      draw({ point: [0, 0] });
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

export default Demo04;
