import { type FC, useCallback } from 'react';

import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { type BaseState, parseStateStore } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  point: [number, number];
}

/**
 * 动态绘制点
 */
const Demo04: FC<ComponentProps> = () => {
  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position'],
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
          },
          onChange: () => {
            gl.drawArrays(gl.POINTS, 0, 1);
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['point'],
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Position',
          ),
          onChange: ({ a_Position, point }) => {
            const [x, y] = point;
            gl.vertexAttrib3f(a_Position, x, y, 0);
          },
        },
        // 原子数据：顶点
        point: {
          deps: [],
          data: [0, 0],
        },
      });
      draw({ point: [0, 0] });
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

export default Demo04;
