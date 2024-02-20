import { type FC, useCallback } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps, type Tuple } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { parseStateStore, type StateWithRoot } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  u_xformMatrix: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  xformMatrix: Matrix4;
  points: Tuple<Tuple<number, 2>, 3>;
  rotation: Tuple<number, 4>;
}>;

/**
 * 旋转
 */
const Demo18: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
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
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Position',
          ),
          onChange: ({ a_Position }) => {
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
          },
        },
        // 着色器变量：u_xformMatrix
        u_xformMatrix: {
          deps: ['xformMatrix'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_xformMatrix',
          ),
          onChange: ({ u_xformMatrix, xformMatrix }) => {
            gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
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
        // 派生数据：变换矩阵
        xformMatrix: {
          deps: ['rotation'],
          data: new Matrix4(),
          onChange: ({ xformMatrix, rotation }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotation;
            xformMatrix.setRotate(angle, rotationX, rotationY, rotationZ);
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
        },
        // 原子数据：旋转
        rotation: {
          deps: [],
        },
      });
      draw({
        points: [
          [0, 0.5],
          [-0.5, -0.5],
          [0.5, -0.5],
        ],
        rotation: [90, 0, 0, 1],
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

export default Demo18;
