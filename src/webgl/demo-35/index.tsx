import { type FC, useCallback } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { type BaseState, parseStateStore } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  a_Color: GLint;
  u_ModelViewMatrix: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  modelViewMatrix: Matrix4;
  points: [number, number, number, number, number, number][][];
  camera: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  rotation: [number, number, number, number];
}

/**
 * 组合观察旋转
 */
const Demo35: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position', 'a_Color', 'u_ModelViewMatrix'],
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
          },
          onChange: ({ points }) => {
            gl.drawArrays(gl.TRIANGLES, 0, points.flat().length);
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['positionColorBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Position'),
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
          data: gl.getAttribLocation(gl.program, 'a_Color'),
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
        // 着色器变量：u_ModelViewMatrix
        u_ModelViewMatrix: {
          deps: ['modelViewMatrix'],
          data: gl.getUniformLocation(gl.program, 'u_ModelViewMatrix'),
          onChange: ({ u_ModelViewMatrix, modelViewMatrix }) => {
            gl.uniformMatrix4fv(
              u_ModelViewMatrix,
              false,
              modelViewMatrix.elements,
            );
          },
        },
        // 派生数据：顶点位置颜色缓冲区
        positionColorBuffer: {
          deps: ['positionColorArray'],
          data: gl.createBuffer(),
          onChange: ({ positionColorBuffer, positionColorArray }) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positionColorArray, gl.STATIC_DRAW);
          },
        },
        // 派生数据：顶点位置颜色数组
        positionColorArray: {
          deps: ['points'],
          data: new Float32Array(54),
          onChange: ({ positionColorArray, points }) => {
            positionColorArray.set(flatArray(points));
          },
        },
        // 派生数据：模型视图矩阵
        modelViewMatrix: {
          deps: ['camera', 'rotation'],
          data: new Matrix4(),
          onChange: ({ modelViewMatrix, camera, rotation }) => {
            const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] =
              camera;
            const [angle, rotationX, rotationY, rotationZ] = rotation;
            modelViewMatrix
              .setLookAt(
                eyeX,
                eyeY,
                eyeZ,
                centerX,
                centerY,
                centerZ,
                upX,
                upY,
                upZ,
              )
              .rotate(angle, rotationX, rotationY, rotationZ);
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
        // 原子数据：相机
        camera: {
          deps: [],
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        // 原子数据：旋转
        rotation: {
          deps: [],
          data: [0, 0, 0, 0],
        },
      });
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
      glVertexShader={VSHADER_SOURCE}
      glFragmentShader={FSHADER_SOURCE}
      onProgramInit={handleProgramInit}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo35;
