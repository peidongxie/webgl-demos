import { type FC, type MouseEventHandler, useCallback, useRef } from 'react';

import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  u_FragColor: WebGLUniformLocation | null;
  points: [number, number, number, number, number, number][];
}

/**
 * 绘制彩点
 */
const Demo06: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position', 'u_FragColor'],
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
          },
          onChange: ({ points }, index) => {
            if (points.length <= index) return false;
            gl.drawArrays(gl.POINTS, 0, 1);
            return true;
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['points'],
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Position',
          ),
          onChange: ({ a_Position, points }, index) => {
            if (points.length <= index) return false;
            const [x, y] = points[index]!;
            gl.vertexAttrib3f(a_Position, x, y, 0);
            return true;
          },
        },
        // 着色器变量：u_FragColor
        u_FragColor: {
          deps: ['points'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_FragColor',
          ),
          onChange: ({ u_FragColor, points }, index) => {
            if (points.length <= index) return false;
            gl.uniform4f(
              u_FragColor,
              points[index]![2],
              points[index]![3],
              points[index]![4],
              points[index]![5],
            );
            return true;
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
      });
      draw({ points: [] });
      drawRef.current = draw;
      glRef.current = gl;
    },
    [],
  );

  const handleCanvasMouseDown = useCallback<
    MouseEventHandler<HTMLCanvasElement>
  >((event) => {
    const canvas = event.target as HTMLCanvasElement;
    if (!canvas) return;
    const gl = glRef.current;
    if (!gl) return;
    const draw = drawRef.current;
    if (!draw) return;
    const clientX = event.clientX;
    const clientY = event.clientY;
    const clientRect = canvas.getBoundingClientRect();
    const x =
      (clientX - clientRect.left - canvas.width / 2) / (canvas.width / 2);
    const y =
      (canvas.height / 2 - (clientY - clientRect.top)) / (canvas.height / 2);
    const red = Number(x >= 0 || y >= 0);
    const green = Number(x < 0 || y < 0);
    const blue = red && green;
    const alpha = 1;
    const point: [number, number, number, number, number, number] = [
      x,
      y,
      red,
      green,
      blue,
      alpha,
    ];
    draw(({ points }) => ({ points: [...points, point] }));
  }, []);

  return (
    <Canvas
      glVertexShader={VSHADER_SOURCE}
      glFragmentShader={FSHADER_SOURCE}
      onMouseDown={handleCanvasMouseDown}
      onProgramInit={handleProgramInit}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo06;
