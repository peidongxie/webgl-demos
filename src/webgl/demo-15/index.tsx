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
  u_CosB: WebGLUniformLocation | null;
  u_SinB: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  points: [number, number][];
  angle: number;
}

const main = (gl: WebGLRenderingContext): StateChangeAction<DemoState> => {
  const draw = parseStateStore<DemoState>({
    // 着色器程序
    root: {
      deps: ['a_Position', 'u_CosB', 'u_SinB'],
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
    // 着色器变量：u_CosB
    u_CosB: {
      deps: ['angle'],
      data: gl.getUniformLocation(gl.program, 'u_CosB'),
      onChange: ({ u_CosB, angle }) => {
        const radian = (Math.PI * angle) / 180;
        const cos = Math.cos(radian);
        gl.uniform1f(u_CosB, cos);
        gl;
      },
    },
    // 着色器变量：u_SinB
    u_SinB: {
      deps: ['angle'],
      data: gl.getUniformLocation(gl.program, 'u_SinB'),
      onChange: ({ u_SinB, angle }) => {
        const radian = (Math.PI * angle) / 180;
        const sin = Math.sin(radian);
        gl.uniform1f(u_SinB, sin);
        gl;
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
    // 原子数据：角度
    angle: {
      deps: [],
      data: 0,
    },
  });
  return draw;
};

/**
 * 向量旋转
 */
const Demo15: FC<ComponentProps> = () => {
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
      angle: 90,
    });
  }, []);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo15;
