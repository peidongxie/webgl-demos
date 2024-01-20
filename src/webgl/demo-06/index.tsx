import {
  type FC,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react';

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
  u_FragColor: WebGLUniformLocation | null;
  points: [number, number, number, number, number, number][];
}

const main = (gl: WebGLRenderingContext): StateChangeAction<DemoState> => {
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
      data: gl.getAttribLocation(gl.program, 'a_Position'),
      onChange: ({ a_Position, points }, index) => {
        if (points.length <= index) return false;
        const [x, y] = points[index];
        gl.vertexAttrib3f(a_Position, x, y, 0);
        return true;
      },
    },
    // 着色器变量：u_FragColor
    u_FragColor: {
      deps: ['points'],
      data: gl.getUniformLocation(gl.program, 'u_FragColor'),
      onChange: ({ u_FragColor, points }, index) => {
        if (points.length <= index) return false;
        const [red, green, blue, alpha] = points[index].slice(2);
        gl.uniform4f(u_FragColor, red, green, blue, alpha);
        return true;
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
 * 绘制彩点
 */
const Demo06: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

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
    draw({ points: [] });
  }, []);

  return (
    <Canvas
      onMouseDown={handleCanvasMouseDown}
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo06;
