import { type FC, useCallback } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { type BaseState, parseStateStore } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  u_Width: WebGLUniformLocation | null;
  u_Height: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  points: [number, number][];
  drawingSize: [number, number];
}

/**
 * 逐片元渐变
 */
const Demo28: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position', 'u_Width', 'u_Height'],
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
        // 着色器变量：u_Width
        u_Width: {
          deps: ['drawingSize'],
          data: gl.getUniformLocation(gl.program, 'u_Width'),
          onChange: ({ u_Width, drawingSize }) => {
            gl.uniform1f(u_Width, drawingSize[0]);
          },
        },
        // 着色器变量：u_Height
        u_Height: {
          deps: ['drawingSize'],
          data: gl.getUniformLocation(gl.program, 'u_Height'),
          onChange: ({ u_Height, drawingSize }) => {
            gl.uniform1f(u_Height, drawingSize[1]);
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
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
        // 原子数据：绘制尺寸
        drawingSize: {
          deps: [],
          data: [0, 0],
        },
      });
      draw({
        points: [
          [0, 0.5],
          [-0.5, -0.5],
          [0.5, -0.5],
        ],
        drawingSize: [gl.drawingBufferWidth, gl.drawingBufferHeight],
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

export default Demo28;
