import { type FC, useCallback, useRef } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  a_Color: GLint;
  u_ModelMatrix: WebGLUniformLocation | null;
  u_ViewMatrix: WebGLUniformLocation | null;
  u_ProjMatrix: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  modelMatrices: Matrix4[];
  viewMatrix: Matrix4;
  projMatrix: Matrix4;
  points: [number, number, number, number, number, number][][];
  translations: [number, number, number][];
  camera: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  perspective: [number, number, number, number];
}

/**
 * 透视平移
 */
const Demo42: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

  const handleWindowResize = useCallback(
    (canvas?: HTMLCanvasElement, gl?: WebGLRenderingContext) => {
      if (!canvas) return;
      if (!gl) return;
      const draw = drawRef.current;
      if (!draw) return;
      draw(({ perspective }) => ({
        perspective: [
          perspective[0],
          canvas.width / canvas.height,
          perspective[2],
          perspective[3],
        ],
        translations: [
          [0.75, 0, 0],
          [-0.75, 0, 0],
        ],
      }));
    },
    [],
  );

  const handleProgramInit = useCallback(
    (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: [
            'a_Position',
            'a_Color',
            'u_ModelMatrix',
            'u_ViewMatrix',
            'u_ProjMatrix',
          ],
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
          },
          onChange: ({ points, translations }, index) => {
            if (translations.length <= index) return false;
            gl.drawArrays(gl.TRIANGLES, 0, points.flat().length);
            return true;
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['positionColorBuffer'],
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Position',
          ),
          onChange: ({ a_Position, positionColorArray }) => {
            gl.vertexAttribPointer(
              a_Position,
              3,
              gl.FLOAT,
              false,
              positionColorArray.BYTES_PER_ELEMENT * 6,
              0,
            );
            gl.enableVertexAttribArray(a_Position);
          },
        },
        // 着色器变量：a_Color
        a_Color: {
          deps: ['positionColorBuffer'],
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Color',
          ),
          onChange: ({ a_Color, positionColorArray }) => {
            gl.vertexAttribPointer(
              a_Color,
              3,
              gl.FLOAT,
              false,
              positionColorArray.BYTES_PER_ELEMENT * 6,
              positionColorArray.BYTES_PER_ELEMENT * 3,
            );
            gl.enableVertexAttribArray(a_Color);
          },
        },
        // 着色器变量：u_ModelMatrix
        u_ModelMatrix: {
          deps: ['modelMatrices'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_ModelMatrix',
          ),
          onChange: ({ u_ModelMatrix, modelMatrices, translations }, index) => {
            if (translations.length <= index) return false;
            gl.uniformMatrix4fv(
              u_ModelMatrix,
              false,
              modelMatrices[index].elements,
            );
            return true;
          },
        },
        // 着色器变量：u_ViewMatrix
        u_ViewMatrix: {
          deps: ['viewMatrix'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_ViewMatrix',
          ),
          onChange: ({ u_ViewMatrix, viewMatrix }) => {
            gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
          },
        },
        // 着色器变量：u_ProjMatrix
        u_ProjMatrix: {
          deps: ['projMatrix'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_ProjMatrix',
          ),
          onChange: ({ u_ProjMatrix, projMatrix }) => {
            gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
          },
        },
        // 派生数据：顶点位置颜色缓冲区
        positionColorBuffer: {
          deps: ['positionColorArray'],
          data: gl.createBuffer(),
          onChange: ({ positionColorBuffer, positionColorArray }) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positionColorArray, gl.STATIC_DRAW);
          },
        },
        // 派生数据：顶点位置颜色数组
        positionColorArray: {
          deps: ['points'],
          data: new Float32Array(54),
          onChange: ({ positionColorArray, points }) => {
            positionColorArray.set(flatArray(points));
          },
        },
        // 派生数据：模型矩阵
        modelMatrices: {
          deps: ['translations'],
          data: [new Matrix4(), new Matrix4()],
          onChange: ({ modelMatrices, translations }, index) => {
            if (translations.length <= index) return false;
            const [translationX, translationY, translationZ] =
              translations[index];
            modelMatrices[index].setTranslate(
              translationX,
              translationY,
              translationZ,
            );
            return true;
          },
        },
        // 派生数据：视图矩阵
        viewMatrix: {
          deps: ['camera'],
          data: new Matrix4(),
          onChange: ({ viewMatrix, camera }) => {
            const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] =
              camera;
            viewMatrix.setLookAt(
              eyeX,
              eyeY,
              eyeZ,
              centerX,
              centerY,
              centerZ,
              upX,
              upY,
              upZ,
            );
          },
        },
        // 派生数据：投影矩阵
        projMatrix: {
          deps: ['perspective'],
          data: new Matrix4(),
          onChange: ({ projMatrix, perspective }) => {
            const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
            projMatrix.setPerspective(
              fovy,
              aspect,
              perspectiveNear,
              perspectiveFar,
            );
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
        // 原子数据：平移
        translations: {
          deps: [],
          data: [],
        },
        // 原子数据：相机
        camera: {
          deps: [],
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        // 原子数据：透视
        perspective: {
          deps: [],
          data: [0, 0, 0, 0],
        },
      });
      draw({
        points: [
          [
            [0, 1, -4, 0.4, 1, 0.4],
            [-0.5, -1, -4, 0.4, 1, 0.4],
            [0.5, -1, -4, 1, 0.4, 0.4],
          ],
          [
            [0, 1, -2, 1, 1, 0.4],
            [-0.5, -1, -2, 1, 1, 0.4],
            [0.5, -1, -2, 1, 0.4, 0.4],
          ],
          [
            [0, 1, 0, 0.4, 0.4, 1],
            [-0.5, -1, 0, 0.4, 0.4, 1],
            [0.5, -1, 0, 1, 0.4, 0.4],
          ],
        ],
        translations: [
          [0.75, 0, 0],
          [-0.75, 0, 0],
        ],
        camera: [0, 0, 5, 0, 0, -100, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
      });
      drawRef.current = draw;
    },
    [],
  );

  return (
    <Canvas
      glVertexShader={VSHADER_SOURCE}
      glFragmentShader={FSHADER_SOURCE}
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo42;
