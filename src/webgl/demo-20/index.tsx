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
  u_ModelMatrix: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  modelMatrix: Matrix4;
  points: [number, number][];
  translation: [number, number, number];
  rotation: [number, number, number, number];
}

/**
 * 先旋转再平移
 */
const Demo20: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position', 'u_ModelMatrix'],
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
          },
          onChange: ({ points }) => {
            gl.drawArrays(gl.TRIANGLES, 0, points.length);
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['positionBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Position'),
          onChange: ({ a_Position }) => {
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
          },
        },
        // 着色器变量：u_ModelMatrix
        u_ModelMatrix: {
          deps: ['modelMatrix'],
          data: gl.getUniformLocation(gl.program, 'u_ModelMatrix'),
          onChange: ({ u_ModelMatrix, modelMatrix }) => {
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
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
          data: new Float32Array(6),
          onChange: ({ positionArray, points }) => {
            positionArray.set(flatArray(points));
          },
        },
        // 派生数据：模型矩阵
        modelMatrix: {
          deps: ['rotation', 'translation'],
          data: new Matrix4(),
          onChange: ({ modelMatrix, translation, rotation }) => {
            const [translationX, translationY, translationZ] = translation;
            const [angle, rotationX, rotationY, rotationZ] = rotation;
            modelMatrix
              .setTranslate(translationX, translationY, translationZ)
              .rotate(angle, rotationX, rotationY, rotationZ);
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
        // 原子数据：平移
        translation: {
          deps: [],
          data: [0, 0, 0],
        },
        // 原子数据：旋转
        rotation: {
          deps: [],
          data: [0, 0, 0, 0],
        },
      });
      draw({
        points: [
          [0, 0.3],
          [-0.3, -0.3],
          [0.3, -0.3],
        ],
        translation: [0.5, 0, 0],
        rotation: [60, 0, 0, 1],
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

export default Demo20;
