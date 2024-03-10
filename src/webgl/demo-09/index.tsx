import { type FC, useCallback } from 'react';

import Canvas from '../../lib/canvas-component';
import { makeWebGLDraw } from '../../lib/cuon-utils';
import { flatArray } from '../../lib/react-utils';
import { type StateWithRoot } from '../../lib/webgl-store';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  points: Tuple<Tuple<number, 2>, 3>;
}>;

/**
 * 绘制单独线
 */
const Demo09: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER_SOURCE,
        FSHADER_SOURCE,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position'],
            data: () => {
              gl.clearColor(0, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              return 1;
            },
            onChange: ({ points }) => {
              gl.drawArrays(gl.LINES, 0, points.length);
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position }) => {
              gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 派生数据：顶点位置缓冲区
          positionBuffer: {
            deps: ['positionArray'],
            data: gl.createBuffer(),
            onChange: ({ positionBuffer, positionArray }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
              gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);
            },
          },
          // 派生数据：顶点位置数组
          positionArray: {
            deps: ['points'],
            data: new Float32Array(2 * 3),
            onChange: ({ positionArray, points }) => {
              positionArray.set(flatArray(points));
            },
          },
          // 原子数据：顶点
          points: {
            deps: [],
          },
        }),
      );
      draw({
        points: [
          [0, 0.5],
          [-0.5, -0.5],
          [0.5, -0.5],
        ],
      });
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

export default Demo09;
