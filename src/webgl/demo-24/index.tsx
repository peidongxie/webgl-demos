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
  a_PointSize: GLint;
  positionBuffer: WebGLBuffer | null;
  sizeBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  sizeArray: Float32Array;
  points: [number, number, number][];
}

const main = (gl: WebGLRenderingContext): StateChangeAction<DemoState> => {
  const draw = parseStateStore<DemoState>({
    // 着色器程序
    root: {
      deps: ['a_Position', 'a_PointSize'],
      data: () => {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
      onChange: ({ points }) => {
        gl.drawArrays(gl.POINTS, 0, points.length);
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
    // 着色器变量：a_PointSize
    a_PointSize: {
      deps: ['sizeBuffer'],
      data: gl.getAttribLocation(gl.program, 'a_PointSize'),
      onChange: ({ a_PointSize }) => {
        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_PointSize);
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
    // 派生数据：顶点大小缓冲区
    sizeBuffer: {
      deps: ['sizeArray'],
      data: gl.createBuffer(),
      onChange: ({ sizeBuffer, sizeArray }) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizeArray, gl.STATIC_DRAW);
      },
    },
    // 派生数据：顶点位置数组
    positionArray: {
      deps: ['points'],
      data: new Float32Array(6),
      onChange: ({ positionArray, points }) => {
        positionArray.set(flatArray(points, [1, 1, 0]));
      },
    },
    // 派生数据：顶点大小数组
    sizeArray: {
      deps: ['points'],
      data: new Float32Array(3),
      onChange: ({ sizeArray, points }) => {
        sizeArray.set(flatArray(points, [0, 0, 1]));
      },
    },
    // 原子数据：顶点
    points: {
      deps: [],
      data: [],
    },
  });
  return draw;
};

/**
 * 多缓冲绘制点
 */
const Demo24: FC<ComponentProps> = () => {
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
        [0, 0.5, 10],
        [-0.5, -0.5, 20],
        [0.5, -0.5, 30],
      ],
    });
  }, []);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo24;
