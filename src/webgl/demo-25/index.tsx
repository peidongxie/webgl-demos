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
  a_PointSize: GLint;
  positionSizeBuffer: WebGLBuffer | null;
  positionSizeArray: Float32Array;
  points: Tuple<Tuple<number, 3>, 3>;
}>;

/**
 * 单缓冲绘制点
 */
const Demo25: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER_SOURCE,
        FSHADER_SOURCE,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'a_PointSize'],
            data: () => {
              gl.clearColor(0, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              return 1;
            },
            onChange: ({ points }) => {
              gl.drawArrays(gl.POINTS, 0, points.length);
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionSizeBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionSizeArray }) => {
              gl.vertexAttribPointer(
                a_Position,
                2,
                gl.FLOAT,
                false,
                positionSizeArray.BYTES_PER_ELEMENT * 3,
                0,
              );
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_PointSize
          a_PointSize: {
            deps: ['positionSizeBuffer'],
            data: gl.getAttribLocation(program!, 'a_PointSize'),
            onChange: ({ a_PointSize, positionSizeArray }) => {
              gl.vertexAttribPointer(
                a_PointSize,
                1,
                gl.FLOAT,
                false,
                positionSizeArray.BYTES_PER_ELEMENT * 3,
                positionSizeArray.BYTES_PER_ELEMENT * 2,
              );
              gl.enableVertexAttribArray(a_PointSize);
            },
          },
          // 派生数据：顶点位置大小缓冲区
          positionSizeBuffer: {
            deps: ['positionSizeArray'],
            data: gl.createBuffer(),
            onChange: ({ positionSizeBuffer, positionSizeArray }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionSizeBuffer);
              gl.bufferData(gl.ARRAY_BUFFER, positionSizeArray, gl.STATIC_DRAW);
            },
          },
          // 派生数据：顶点位置大小数组
          positionSizeArray: {
            deps: ['points'],
            data: new Float32Array(3 * 3),
            onChange: ({ positionSizeArray, points }) => {
              positionSizeArray.set(flatArray(points));
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
          [0, 0.5, 10],
          [-0.5, -0.5, 20],
          [0.5, -0.5, 30],
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

export default Demo25;
