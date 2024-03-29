import { type FC, useCallback } from 'react';

import Canvas from '../../component/canvas';
import { flatArray, makeWebGLDraw, type StateWithRoot } from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_PointSize: GLint;
  positionBuffer: WebGLBuffer | null;
  sizeBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  sizeArray: Float32Array;
  points: Tuple<Tuple<number, 3>, 3>;
}>;

/**
 * 多缓冲绘制点
 */
const Demo24: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER,
        FSHADER,
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
            deps: ['positionBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionBuffer }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
              gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_PointSize
          a_PointSize: {
            deps: ['sizeBuffer'],
            data: gl.getAttribLocation(program!, 'a_PointSize'),
            onChange: ({ a_PointSize, sizeBuffer }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
              gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
              gl.enableVertexAttribArray(a_PointSize);
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
          // 派生数据：顶点大小缓冲区
          sizeBuffer: {
            deps: ['sizeArray'],
            data: gl.createBuffer(),
            onChange: ({ sizeBuffer, sizeArray }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
              gl.bufferData(gl.ARRAY_BUFFER, sizeArray, gl.STATIC_DRAW);
            },
          },
          // 派生数据：顶点位置数组
          positionArray: {
            deps: ['points'],
            data: new Float32Array(2 * 3),
            onChange: ({ positionArray, points }) => {
              positionArray.set(flatArray(points, [1, 1, 0]));
            },
          },
          // 派生数据：顶点大小数组
          sizeArray: {
            deps: ['points'],
            data: new Float32Array(1 * 3),
            onChange: ({ sizeArray, points }) => {
              sizeArray.set(flatArray(points, [0, 0, 1]));
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

export default Demo24;
