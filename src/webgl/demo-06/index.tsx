import { type FC, type MouseEventHandler, useCallback, useRef } from 'react';

import Canvas from '../../components/canvas';
import { makeWebGLDraw } from '../../lib/cuon-utils';
import {
  type StateChangeAction,
  type StateWithRoot,
} from '../../lib/webgl-store';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  u_FragColor: WebGLUniformLocation | null;
  points: Tuple<number, 6>[];
}>;

/**
 * 绘制彩点
 */
const Demo06: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER_SOURCE,
        FSHADER_SOURCE,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'u_FragColor'],
            type: 'dynamic',
            data: ({ points }) => {
              gl.clearColor(0, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              return points.length;
            },
            onChange: () => {
              gl.drawArrays(gl.POINTS, 0, 1);
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['points'],
            type: 'dynamic',
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, points }, index) => {
              const [x, y] = points[index]!;
              gl.vertexAttrib3f(a_Position, x, y, 0);
            },
          },
          // 着色器变量：u_FragColor
          u_FragColor: {
            deps: ['points'],
            type: 'dynamic',
            data: gl.getUniformLocation(program!, 'u_FragColor'),
            onChange: ({ u_FragColor, points }, index) => {
              gl.uniform4f(
                u_FragColor,
                points[index]![2],
                points[index]![3],
                points[index]![4],
                points[index]![5],
              );
            },
          },
          // 原子数据：顶点
          points: {
            deps: [],
          },
        }),
      );
      draw({ points: [] });
      drawRef.current = draw;
    },
    [],
  );

  const handleCanvasMouseDown = useCallback<
    MouseEventHandler<HTMLCanvasElement>
  >((event) => {
    const canvas = event.target as HTMLCanvasElement;
    if (!canvas) return;
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
    const point: Tuple<number, 6> = [x, y, red, green, blue, alpha];
    draw(({ points }) => ({ points: [...points, point] }));
  }, []);

  return (
    <Canvas
      onMouseDown={handleCanvasMouseDown}
      onProgramInit={handleProgramInit}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo06;
