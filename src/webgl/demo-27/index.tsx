import { type FC, useCallback } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { type BaseState, parseStateStore } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  a_Color: GLint;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  points: [number, number, number, number, number][];
}

/**
 * 渐变
 */
const Demo27: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position', 'a_Color'],
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
          deps: ['positionColorBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Position'),
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
          data: gl.getAttribLocation(gl.program, 'a_Color'),
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
            gl.bufferData(gl.ARRAY_BUFFER, positionColorArray, gl.STATIC_DRAW);
          },
        },
        // 派生数据：顶点位置颜色数组
        positionColorArray: {
          deps: ['points'],
          data: new Float32Array(15),
          onChange: ({ positionColorArray, points }) => {
            positionColorArray.set(flatArray(points));
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
      });
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
      glVertexShader={VSHADER_SOURCE}
      glFragmentShader={FSHADER_SOURCE}
      onProgramInit={handleProgramInit}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo27;
