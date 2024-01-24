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
  positionSizeBuffer: WebGLBuffer | null;
  positionSizeArray: Float32Array;
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
      deps: ['positionSizeBuffer'],
      data: gl.getAttribLocation(gl.program, 'a_Position'),
      onChange: ({ a_Position, positionSizeArray }) => {
        gl.vertexAttribPointer(
          a_Position,
          2,
          gl.FLOAT,
          false,
          positionSizeArray.BYTES_PER_ELEMENT * 3,
          0,
        );
        gl.enableVertexAttribArray(a_Position);
      },
    },
    // 着色器变量：a_PointSize
    a_PointSize: {
      deps: ['positionSizeBuffer'],
      data: gl.getAttribLocation(gl.program, 'a_PointSize'),
      onChange: ({ a_PointSize, positionSizeArray }) => {
        gl.vertexAttribPointer(
          a_PointSize,
          1,
          gl.FLOAT,
          false,
          positionSizeArray.BYTES_PER_ELEMENT * 3,
          positionSizeArray.BYTES_PER_ELEMENT * 2,
        );
        gl.enableVertexAttribArray(a_PointSize);
      },
    },
    // 派生数据：顶点位置大小缓冲区
    positionSizeBuffer: {
      deps: ['positionSizeArray'],
      data: gl.createBuffer(),
      onChange: ({ positionSizeBuffer, positionSizeArray }) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, positionSizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positionSizeArray, gl.STATIC_DRAW);
      },
    },
    // 派生数据：顶点位置大小数组
    positionSizeArray: {
      deps: ['points'],
      data: new Float32Array(9),
      onChange: ({ positionSizeArray, points }) => {
        positionSizeArray.set(flatArray(points));
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
 * 单缓冲绘制点
 */
const Demo25: FC<ComponentProps> = () => {
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

export default Demo25;
