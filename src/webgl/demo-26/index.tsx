import { type FC, useCallback } from 'react';

import Canvas from '../../component/canvas';
import { flatArray, makeWebGLDraw, type StateWithRoot } from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  points: Tuple<Tuple<number, 5>, 3>;
}>;

/**
 * 动态绘制彩点
 */
const Demo26: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER,
        FSHADER,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'a_Color'],
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
            deps: ['positionColorBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionColorArray }) => {
              gl.vertexAttribPointer(
                a_Position,
                2,
                gl.FLOAT,
                false,
                positionColorArray.BYTES_PER_ELEMENT * 5,
                0,
              );
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_Color
          a_Color: {
            deps: ['positionColorBuffer'],
            data: gl.getAttribLocation(program!, 'a_Color'),
            onChange: ({ a_Color, positionColorArray }) => {
              gl.vertexAttribPointer(
                a_Color,
                3,
                gl.FLOAT,
                false,
                positionColorArray.BYTES_PER_ELEMENT * 5,
                positionColorArray.BYTES_PER_ELEMENT * 2,
              );
              gl.enableVertexAttribArray(a_Color);
            },
          },
          // 派生数据：顶点位置颜色缓冲区
          positionColorBuffer: {
            deps: ['positionColorArray'],
            data: gl.createBuffer(),
            onChange: ({ positionColorBuffer, positionColorArray }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionColorBuffer);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionColorArray,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：顶点位置颜色数组
          positionColorArray: {
            deps: ['points'],
            data: new Float32Array(5 * 3),
            onChange: ({ positionColorArray, points }) => {
              positionColorArray.set(flatArray(points));
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
          [0, 0.5, 1, 0, 0],
          [-0.5, -0.5, 0, 1, 0],
          [0.5, -0.5, 0, 0, 1],
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

export default Demo26;
