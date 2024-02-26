import { type FC, useCallback } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps, type Tuple } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { makeWebGLDraw } from '../lib/cuon-utils';
import { type StateWithRoot } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  u_ViewMatrix: WebGLUniformLocation | null;
  u_ModelMatrix: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  viewMatrix: Matrix4;
  modelMatrix: Matrix4;
  points: Tuple<Tuple<Tuple<number, 6>, 3>, 3>;
  camera: Tuple<number, 9>;
  rotation: Tuple<number, 4>;
}>;

/**
 * 观察旋转
 */
const Demo34: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER_SOURCE,
        FSHADER_SOURCE,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'a_Color', 'u_ViewMatrix', 'u_ModelMatrix'],
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
          // 着色器变量：u_ModelMatrix
          u_ModelMatrix: {
            deps: ['modelMatrix'],
            data: gl.getUniformLocation(program!, 'u_ModelMatrix'),
            onChange: ({ u_ModelMatrix, modelMatrix }) => {
              gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
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
            data: new Float32Array(6 * 3 * 3),
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
          // 派生数据：模型矩阵
          modelMatrix: {
            deps: ['rotation'],
            data: new Matrix4(),
            onChange: ({ modelMatrix, rotation }) => {
              const [angle, rotationX, rotationY, rotationZ] = rotation;
              modelMatrix.setRotate(angle, rotationX, rotationY, rotationZ);
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
          // 原子数据：旋转
          rotation: {
            deps: [],
          },
        }),
      );
      draw({
        points: [
          [
            [0, 0.5, -0.4, 0.4, 1, 0.4],
            [-0.5, -0.5, -0.4, 0.4, 1, 0.4],
            [0.5, -0.5, -0.4, 1, 0.4, 0.4],
          ],
          [
            [0.5, 0.4, -0.2, 1, 0.4, 0.4],
            [-0.5, 0.4, -0.2, 1, 1, 0.4],
            [0, -0.6, -0.2, 1, 1, 0.4],
          ],
          [
            [0, 0.5, 0, 0.4, 0.4, 1],
            [-0.5, -0.5, 0, 0.4, 0.4, 1],
            [0.5, -0.5, 0, 1, 0.4, 0.4],
          ],
        ],
        camera: [0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0],
        rotation: [-10, 0, 0, 1],
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

export default Demo34;
