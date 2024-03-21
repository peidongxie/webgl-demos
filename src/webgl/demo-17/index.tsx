import { type FC, useCallback } from 'react';

import Canvas from '../../component/canvas';
import { flatArray, makeWebGLDraw, type StateWithRoot } from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  u_xformMatrix: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  xformArray: Float32Array;
  points: Tuple<Tuple<number, 2>, 3>;
  scale: Tuple<number, 3>;
}>;

/**
 * 矩阵缩放
 */
const Demo17: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER,
        FSHADER,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'u_xformMatrix'],
            data: () => {
              gl.clearColor(0, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              return 1;
            },
            onChange: ({ points }) => {
              gl.drawArrays(gl.TRIANGLES, 0, points.length);
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
          // 着色器变量：u_xformMatrix
          u_xformMatrix: {
            deps: ['xformArray'],
            data: gl.getUniformLocation(program!, 'u_xformMatrix'),
            onChange: ({ u_xformMatrix, xformArray }) => {
              gl.uniformMatrix4fv(u_xformMatrix, false, xformArray);
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
          // 派生数据：变换数组
          xformArray: {
            deps: ['scale'],
            data: new Float32Array(16),
            onChange: ({ xformArray, scale }) => {
              const [scaleX, scaleY, scaleZ] = scale;
              xformArray.set([
                scaleX,
                0,
                0,
                0,
                0,
                scaleY,
                0,
                0,
                0,
                0,
                scaleZ,
                0,
                0,
                0,
                0,
                1,
              ]);
            },
          },
          // 原子数据：顶点
          points: {
            deps: [],
          },
          // 原子数据：缩放
          scale: {
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
        scale: [1, 1.5, 1],
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

export default Demo17;
