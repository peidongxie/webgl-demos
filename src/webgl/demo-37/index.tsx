import { type FC, useCallback, useRef } from 'react';

import { useGui } from '../../lib/gui-utils';
import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import {
  parseStateStore,
  type StateChangeAction,
  type StateWithRoot,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  u_ProjMatrix: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  projMatrix: Matrix4;
  points: [number, number, number, number, number, number][][];
  orthographic: [number, number, number, number, number, number];
}>;

/**
 * 控制纵深
 */
const Demo37: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position', 'a_Color', 'u_ProjMatrix'],
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
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Position',
          ),
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
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Color',
          ),
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
        // 着色器变量：u_ProjMatrix
        u_ProjMatrix: {
          deps: ['projMatrix'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_ProjMatrix',
          ),
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
        // 派生数据：投影矩阵
        projMatrix: {
          deps: ['orthographic'],
          data: new Matrix4(),
          onChange: ({ projMatrix, orthographic }) => {
            const [
              left,
              right,
              bottom,
              top,
              orthographicNear,
              orthographicFar,
            ] = orthographic;
            projMatrix.setOrtho(
              left,
              right,
              bottom,
              top,
              orthographicNear,
              orthographicFar,
            );
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
        // 原子数据：正视
        orthographic: {
          deps: [],
          data: [0, 0, 0, 0, 0, 0],
        },
      });
      draw({
        points: [
          [
            [0, 0.6, -0.4, 0.4, 1, 0.4],
            [-0.5, -0.4, -0.4, 0.4, 1, 0.4],
            [0.5, -0.4, -0.4, 1, 0.4, 0.4],
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
        orthographic: [-1, 1, -1, 1, 0, 0.5],
      });
      drawRef.current = draw;
    },
    [],
  );

  useGui(
    [
      {
        type: 'number',
        name: '可视范围近处',
        initialValue: 0,
        min: -1,
        max: 1,
        step: 0.01,
        onChange: (value) => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ orthographic }) => {
            return {
              orthographic: [
                orthographic[0],
                orthographic[1],
                orthographic[2],
                orthographic[3],
                value - 1 / Number.MAX_SAFE_INTEGER,
                orthographic[5],
              ],
            };
          });
        },
      },
      {
        type: 'number',
        name: '可视范围远处',
        initialValue: 0.5,
        min: -1,
        max: 1,
        step: 0.01,
        onChange: (value) => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ orthographic }) => {
            return {
              orthographic: [
                orthographic[0],
                orthographic[1],
                orthographic[2],
                orthographic[3],
                orthographic[4],
                value + 1 / Number.MAX_SAFE_INTEGER,
              ],
            };
          });
        },
      },
    ],
    {
      container: '#gui-demo',
      title: '可视空间控件',
    },
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

export default Demo37;
