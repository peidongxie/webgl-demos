import { type FC, useCallback, useRef } from 'react';

import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4, Vector3 } from '../lib/cuon-matrix';
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
  a_Normal: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_LightColor: WebGLUniformLocation | null;
  u_LightDirection: WebGLUniformLocation | null;
  u_AmbientLight: WebGLUniformLocation | null;
  positionColorNormalBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  positionColorNormalArray: Float32Array;
  indexArray: Uint8Array;
  mvpMatrix: Matrix4;
  lightColorVector: Vector3;
  lightDirectionVector: Vector3;
  ambientLightVector: Vector3;
  points: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ][][];
  surfaces: [number, number, number][][];
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
  lights: [number, number, number, number, number, number][];
}

/**
 * 绘制环境光
 */
const Demo51: FC<ComponentProps> = () => {
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
            'a_Normal',
            'u_MvpMatrix',
            'u_LightColor',
            'u_LightDirection',
            'u_AmbientLight',
          ],
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          },
          onChange: ({ surfaces }) => {
            gl.drawElements(
              gl.TRIANGLES,
              surfaces.flat(2).length,
              gl.UNSIGNED_BYTE,
              0,
            );
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['positionColorNormalBuffer', 'indexBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Position'),
          onChange: ({ a_Position, positionColorNormalArray }) => {
            gl.vertexAttribPointer(
              a_Position,
              3,
              gl.FLOAT,
              false,
              positionColorNormalArray.BYTES_PER_ELEMENT * 9,
              0,
            );
            gl.enableVertexAttribArray(a_Position);
          },
        },
        // 着色器变量：a_Color
        a_Color: {
          deps: ['positionColorNormalBuffer', 'indexBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Color'),
          onChange: ({ a_Color, positionColorNormalArray }) => {
            gl.vertexAttribPointer(
              a_Color,
              3,
              gl.FLOAT,
              false,
              positionColorNormalArray.BYTES_PER_ELEMENT * 9,
              positionColorNormalArray.BYTES_PER_ELEMENT * 3,
            );
            gl.enableVertexAttribArray(a_Color);
          },
        },
        // 着色器变量：a_Normal
        a_Normal: {
          deps: ['positionColorNormalBuffer', 'indexBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Normal'),
          onChange: ({ a_Normal, positionColorNormalArray }) => {
            gl.vertexAttribPointer(
              a_Normal,
              3,
              gl.FLOAT,
              false,
              positionColorNormalArray.BYTES_PER_ELEMENT * 9,
              positionColorNormalArray.BYTES_PER_ELEMENT * 6,
            );
            gl.enableVertexAttribArray(a_Normal);
          },
        },
        // 着色器变量：u_MvpMatrix
        u_MvpMatrix: {
          deps: ['mvpMatrix'],
          data: gl.getUniformLocation(gl.program, 'u_MvpMatrix'),
          onChange: ({ u_MvpMatrix, mvpMatrix }) => {
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
          },
        },
        // 着色器变量：u_LightColor
        u_LightColor: {
          deps: ['lightColorVector'],
          data: gl.getUniformLocation(gl.program, 'u_LightColor'),
          onChange: ({ u_LightColor, lightColorVector }) => {
            gl.uniform3fv(u_LightColor, lightColorVector.elements);
          },
        },
        // 着色器变量：u_LightDirection
        u_LightDirection: {
          deps: ['lightDirectionVector'],
          data: gl.getUniformLocation(gl.program, 'u_LightDirection'),
          onChange: ({ u_LightDirection, lightDirectionVector }) => {
            gl.uniform3fv(u_LightDirection, lightDirectionVector.elements);
          },
        },
        // 着色器变量：u_AmbientLight
        u_AmbientLight: {
          deps: ['ambientLightVector'],
          data: gl.getUniformLocation(gl.program, 'u_AmbientLight'),
          onChange: ({ u_AmbientLight, ambientLightVector }) => {
            gl.uniform3fv(u_AmbientLight, ambientLightVector.elements);
          },
        },
        // 派生数据：顶点位置颜色法向缓冲区
        positionColorNormalBuffer: {
          deps: ['positionColorNormalArray'],
          data: gl.createBuffer(),
          onChange: ({
            positionColorNormalBuffer,
            positionColorNormalArray,
          }) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionColorNormalBuffer);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              positionColorNormalArray,
              gl.STATIC_DRAW,
            );
          },
        },
        // 派生数据：顶点索引缓冲区
        indexBuffer: {
          deps: ['indexArray'],
          data: gl.createBuffer(),
          onChange: ({ indexBuffer, indexArray }) => {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
          },
        },
        // 派生数据：顶点位置颜色法向数组
        positionColorNormalArray: {
          deps: ['points'],
          data: new Float32Array(216),
          onChange: ({ positionColorNormalArray, points }) => {
            positionColorNormalArray.set(flatArray(points));
          },
        },
        // 派生数据：顶点索引数组
        indexArray: {
          deps: ['surfaces'],
          data: new Uint8Array(36),
          onChange: ({ indexArray, surfaces }) => {
            indexArray.set(flatArray(surfaces));
          },
        },
        // 派生数据：模型视图投影矩阵
        mvpMatrix: {
          deps: ['camera', 'perspective'],
          data: new Matrix4(),
          onChange: ({ mvpMatrix, camera, perspective }) => {
            const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] =
              camera;
            const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
            mvpMatrix
              .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
              .lookAt(
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
        // 派生数据：光线颜色向量
        lightColorVector: {
          deps: ['lights'],
          data: new Vector3(),
          onChange: ({ lightColorVector, lights }) => {
            lightColorVector.setColor(lights[0][0], lights[0][1], lights[0][2]);
          },
        },
        // 派生数据：光线方向向量
        lightDirectionVector: {
          deps: ['lights'],
          data: new Vector3(),
          onChange: ({ lightDirectionVector, lights }) => {
            lightDirectionVector
              .setDirection(lights[0][3], lights[0][4], lights[0][5])
              .normalize();
          },
        },
        // 派生数据：环境光颜色向量
        ambientLightVector: {
          deps: ['lights'],
          data: new Vector3(),
          onChange: ({ ambientLightVector, lights }) => {
            ambientLightVector.setColor(
              lights[1][0],
              lights[1][1],
              lights[1][2],
            );
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
          data: [],
        },
        // 原子数据：表面
        surfaces: {
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
        // 原子数据：光线
        lights: {
          deps: [],
          data: [],
        },
      });
      draw({
        points: [
          [
            [1, 1, 1, 1, 0, 0, 0, 0, 1],
            [-1, 1, 1, 1, 0, 0, 0, 0, 1],
            [-1, -1, 1, 1, 0, 0, 0, 0, 1],
            [1, -1, 1, 1, 0, 0, 0, 0, 1],
          ],
          [
            [1, 1, 1, 1, 0, 0, 1, 0, 0],
            [1, -1, 1, 1, 0, 0, 1, 0, 0],
            [1, -1, -1, 1, 0, 0, 1, 0, 0],
            [1, 1, -1, 1, 0, 0, 1, 0, 0],
          ],
          [
            [1, 1, 1, 1, 0, 0, 0, 1, 0],
            [1, 1, -1, 1, 0, 0, 0, 1, 0],
            [-1, 1, -1, 1, 0, 0, 0, 1, 0],
            [-1, 1, 1, 1, 0, 0, 0, 1, 0],
          ],
          [
            [-1, 1, 1, 1, 0, 0, -1, 0, 0],
            [-1, 1, -1, 1, 0, 0, -1, 0, 0],
            [-1, -1, -1, 1, 0, 0, -1, 0, 0],
            [-1, -1, 1, 1, 0, 0, -1, 0, 0],
          ],
          [
            [-1, -1, -1, 1, 0, 0, 0, -1, 0],
            [1, -1, -1, 1, 0, 0, 0, -1, 0],
            [1, -1, 1, 1, 0, 0, 0, -1, 0],
            [-1, -1, 1, 1, 0, 0, 0, -1, 0],
          ],
          [
            [1, -1, -1, 1, 0, 0, 0, 0, -1],
            [-1, -1, -1, 1, 0, 0, 0, 0, -1],
            [-1, 1, -1, 1, 0, 0, 0, 0, -1],
            [1, 1, -1, 1, 0, 0, 0, 0, -1],
          ],
        ],
        surfaces: [
          [
            [0, 1, 2],
            [0, 2, 3],
          ],
          [
            [4, 5, 6],
            [4, 6, 7],
          ],
          [
            [8, 9, 10],
            [8, 10, 11],
          ],
          [
            [12, 13, 14],
            [12, 14, 15],
          ],
          [
            [16, 17, 18],
            [16, 18, 19],
          ],
          [
            [20, 21, 22],
            [20, 22, 23],
          ],
        ],
        camera: [3, 3, 7, 0, 0, 0, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
        lights: [
          [1, 1, 1, 0.5, 3, 4],
          [0.2, 0.2, 0.2, 0, 0, 0],
        ],
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

export default Demo51;
