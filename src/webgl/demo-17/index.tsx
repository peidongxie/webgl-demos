import { type FC, useEffect, useRef } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  u_xformMatrix: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  xformArray: Float32Array;
  points: [number, number][];
  scale: [number, number, number];
}

const main = (gl: WebGLRenderingContext): StateChangeAction<DemoState> => {
  const draw = parseStateStore<DemoState>({
    // 着色器程序
    root: {
      deps: ['a_Position', 'u_xformMatrix'],
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
    // 着色器变量：u_xformMatrix
    u_xformMatrix: {
      deps: ['xformArray'],
      data: gl.getUniformLocation(gl.program, 'u_xformMatrix'),
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
      data: new Float32Array(6),
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
      data: [],
    },
    // 原子数据：缩放
    scale: {
      deps: [],
      data: [1, 1, 1],
    },
  });
  return draw;
};

/**
 * 矩阵缩放
 */
const Demo17: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    drawRef.current = main(gl);
  }, []);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw({
      points: [
        [0, 0.5],
        [-0.5, -0.5],
        [0.5, -0.5],
      ],
      scale: [1, 1.5, 1],
    });
  }, []);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo17;
