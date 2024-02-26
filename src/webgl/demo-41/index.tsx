import { type FC, useCallback, useRef } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps, type Tuple } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { makeWebGLDraw } from '../lib/cuon-utils';
import { type StateChangeAction, type StateWithRoot } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  u_ViewMatrix: WebGLUniformLocation | null;
  u_ProjMatrix: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  viewMatrix: Matrix4;
  projMatrix: Matrix4;
  points: Tuple<Tuple<Tuple<number, 6>, 3>, 6>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
}>;

/**
 * 透视三角
 */
const Demo41: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

  const handleWindowResize = useCallback(
    (canvas?: HTMLCanvasElement, gl?: WebGLRenderingContext) => {
      if (!canvas) return;
      if (!gl) return;
      const draw = drawRef.current;
      if (!draw) return;
      draw(({ perspective }) => ({
        perspective: [
          perspective[0],
          canvas.width / canvas.height,
          perspective[2],
          perspective[3],
        ],
      }));
    },
    [],
  );

  const handleProgramInit = useCallback(
    (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER_SOURCE,
        FSHADER_SOURCE,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'a_Color', 'u_ViewMatrix', 'u_ProjMatrix'],
            data: () => {
              gl.clearColor(0, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              return 1;
            },
            onChange: ({ points }) => {
              gl.drawArrays(gl.TRIANGLES, 0, points.flat().length);
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionColorBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionColorArray }) => {
              gl.vertexAttribPointer(
                a_Position,
                3,
                gl.FLOAT,
                false,
                positionColorArray.BYTES_PER_ELEMENT * 6,
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
                positionColorArray.BYTES_PER_ELEMENT * 6,
                positionColorArray.BYTES_PER_ELEMENT * 3,
              );
              gl.enableVertexAttribArray(a_Color);
            },
          },
          // 着色器变量：u_ViewMatrix
          u_ViewMatrix: {
            deps: ['viewMatrix'],
            data: gl.getUniformLocation(program!, 'u_ViewMatrix'),
            onChange: ({ u_ViewMatrix, viewMatrix }) => {
              gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
            },
          },
          // 着色器变量：u_ProjMatrix
          u_ProjMatrix: {
            deps: ['projMatrix'],
            data: gl.getUniformLocation(program!, 'u_ProjMatrix'),
            onChange: ({ u_ProjMatrix, projMatrix }) => {
              gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
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
            data: new Float32Array(6 * 3 * 6),
            onChange: ({ positionColorArray, points }) => {
              positionColorArray.set(flatArray(points));
            },
          },
          // 派生数据：视图矩阵
          viewMatrix: {
            deps: ['camera'],
            data: new Matrix4(),
            onChange: ({ viewMatrix, camera }) => {
              const [
                eyeX,
                eyeY,
                eyeZ,
                centerX,
                centerY,
                centerZ,
                upX,
                upY,
                upZ,
              ] = camera;
              viewMatrix.setLookAt(
                eyeX,
                eyeY,
                eyeZ,
                centerX,
                centerY,
                centerZ,
                upX,
                upY,
                upZ,
              );
            },
          },
          // 派生数据：投影矩阵
          projMatrix: {
            deps: ['perspective'],
            data: new Matrix4(),
            onChange: ({ projMatrix, perspective }) => {
              const [fovy, aspect, perspectiveNear, perspectiveFar] =
                perspective;
              projMatrix.setPerspective(
                fovy,
                aspect,
                perspectiveNear,
                perspectiveFar,
              );
            },
          },
          // 原子数据：顶点
          points: {
            deps: [],
          },
          // 原子数据：相机
          camera: {
            deps: [],
          },
          // 原子数据：透视
          perspective: {
            deps: [],
          },
        }),
      );
      draw({
        points: [
          [
            [0.75, 1, -4, 0.4, 1, 0.4],
            [0.25, -1, -4, 0.4, 1, 0.4],
            [1.25, -1, -4, 1, 0.4, 0.4],
          ],
          [
            [0.75, 1, -2, 1, 1, 0.4],
            [0.25, -1, -2, 1, 1, 0.4],
            [1.25, -1, -2, 1, 0.4, 0.4],
          ],
          [
            [0.75, 1, 0, 0.4, 0.4, 1],
            [0.25, -1, 0, 0.4, 0.4, 1],
            [1.25, -1, 0, 1, 0.4, 0.4],
          ],
          [
            [-0.75, 1, -4, 0.4, 1, 0.4],
            [-1.25, -1, -4, 0.4, 1, 0.4],
            [-0.25, -1, -4, 1, 0.4, 0.4],
          ],
          [
            [-0.75, 1, -2, 1, 1, 0.4],
            [-1.25, -1, -2, 1, 1, 0.4],
            [-0.25, -1, -2, 1, 0.4, 0.4],
          ],
          [
            [-0.75, 1, 0, 0.4, 0.4, 1],
            [-1.25, -1, 0, 0.4, 0.4, 1],
            [-0.25, -1, 0, 1, 0.4, 0.4],
          ],
        ],
        camera: [0, 0, 5, 0, 0, -100, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
      });
      drawRef.current = draw;
    },
    [],
  );

  return (
    <Canvas
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo41;
