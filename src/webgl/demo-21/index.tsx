import { type FC, useEffect, useRef } from 'react';

import { flatArray, useFrameRequest } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
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
  u_ModelMatrix: WebGLUniformLocation | null;
  positionBuffer: WebGLBuffer | null;
  positionArray: Float32Array;
  modelMatrix: Matrix4;
  points: [number, number][];
  rotation: [number, number, number, number];
  velocity: number;
  time: number;
}

const main = (gl: WebGLRenderingContext): StateChangeAction<DemoState> => {
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
      deps: ['rotation', 'velocity', 'time'],
      data: new Matrix4(),
      onChange: ({ modelMatrix, rotation }) => {
        const [angle, rotationX, rotationY, rotationZ] = rotation;
        modelMatrix.setRotate(angle, rotationX, rotationY, rotationZ);
      },
    },
    // 原子数据：顶点
    points: {
      deps: [],
      data: [],
    },
    // 原子数据：旋转
    rotation: {
      deps: [],
      data: [0, 0, 0, 0],
    },
    // 原子数据：速度
    velocity: {
      deps: [],
      data: 0,
    },
    // 原子数据：时间
    time: {
      deps: [],
      data: 0,
    },
  });
  return draw;
};

/**
 * 绘制动画
 */
const Demo21: FC<ComponentProps> = () => {
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
      rotation: [0, 0, 0, 1],
      velocity: 45,
      time: Date.now(),
    });
  }, []);

  useFrameRequest(() =>
    drawRef.current?.(({ rotation, velocity, time }) => {
      const [angle, rotationX, rotationY, rotationZ] = rotation;
      const timeEnd = Date.now();
      const timeStart = time;
      const timeSpan = timeEnd - timeStart;
      const angleStart = angle;
      const angleSpan = (velocity * timeSpan) / 1000;
      const angleEnd = angleStart + angleSpan;
      return {
        rotation: [angleEnd, rotationX, rotationY, rotationZ],
        time: timeEnd,
      };
    }),
  );

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo21;
