import { type FC, useCallback, useRef } from 'react';

import Canvas from '../../component/canvas';
import {
  flatArray,
  makeWebGLDraw,
  Matrix4,
  type StateChangeAction,
  type StateWithRoot,
  useGui,
} from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_FogColor: WebGLUniformLocation | null;
  u_FogDist: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  indexArray: Uint8Array;
  mvpMatrix: Matrix4;
  modelMatrix: Matrix4;
  points: Tuple<Tuple<Tuple<number, 6>, 4>, 6>;
  surfaces: Tuple<Tuple<Tuple<number, 3>, 2>, 6>;
  scale: Tuple<number, 3>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  fogColor: Tuple<number, 3>;
  fogDist: Tuple<number, 2>;
}>;

/**
 * 简化雾化
 */
const Demo69: FC<ComponentProps> = () => {
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
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER,
        FSHADER,
        (program) => ({
          // 着色器程序
          root: {
            deps: [
              'a_Position',
              'a_Color',
              'u_MvpMatrix',
              'u_FogColor',
              'u_FogDist',
            ],
            data: ({ fogColor }) => {
              const [red, green, blue] = fogColor;
              gl.clearColor(red, green, blue, 1);
              gl.enable(gl.DEPTH_TEST);
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              return 1;
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
            deps: ['positionColorBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
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
            deps: ['positionColorBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Color'),
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
          // 着色器变量：u_MvpMatrix
          u_MvpMatrix: {
            deps: ['mvpMatrix'],
            data: gl.getUniformLocation(program!, 'u_MvpMatrix'),
            onChange: ({ u_MvpMatrix, mvpMatrix }) => {
              gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
            },
          },
          // 着色器变量：u_FogColor
          u_FogColor: {
            deps: ['fogColor'],
            data: gl.getUniformLocation(program!, 'u_FogColor'),
            onChange: ({ u_FogColor, fogColor }) => {
              gl.uniform3fv(u_FogColor, fogColor);
            },
          },
          // 着色器变量：u_FogDist
          u_FogDist: {
            deps: ['fogDist'],
            data: gl.getUniformLocation(program!, 'u_FogDist'),
            onChange: ({ u_FogDist, fogDist }) => {
              gl.uniform2fv(u_FogDist, fogDist);
            },
          },
          // 派生数据：顶点位置颜色缓冲区
          positionColorBuffer: {
            deps: ['positionColorArray'],
            data: gl.createBuffer(),
            onChange: ({ positionColorBuffer, positionColorArray }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionColorBuffer);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionColorArray,
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
              gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                indexArray,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：顶点位置颜色数组
          positionColorArray: {
            deps: ['points'],
            data: new Float32Array(6 * 4 * 6),
            onChange: ({ positionColorArray, points }) => {
              positionColorArray.set(flatArray(points));
            },
          },
          // 派生数据：顶点索引数组
          indexArray: {
            deps: ['surfaces'],
            data: new Uint8Array(3 * 2 * 6),
            onChange: ({ indexArray, surfaces }) => {
              indexArray.set(flatArray(surfaces));
            },
          },
          // 派生数据：模型视图投影矩阵
          mvpMatrix: {
            deps: ['modelMatrix', 'camera', 'perspective'],
            data: new Matrix4(),
            onChange: ({ mvpMatrix, modelMatrix, camera, perspective }) => {
              const [
                eyeX,
                eyeY,
                eyeZ,
                centerX,
                centerY,
                centerZ,
                upX,
                upY,
                upZ,
              ] = camera;
              const [fovy, aspect, perspectiveNear, perspectiveFar] =
                perspective;
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
                )
                .multiply(modelMatrix);
            },
          },
          // 派生数据：模型矩阵
          modelMatrix: {
            deps: ['scale'],
            data: new Matrix4(),
            onChange: ({ modelMatrix, scale }) => {
              const [scaleX, scaleY, scaleZ] = scale;
              modelMatrix.setScale(scaleX, scaleY, scaleZ);
            },
          },
          // 原子数据：顶点
          points: {
            deps: [],
          },
          // 原子数据：表面
          surfaces: {
            deps: [],
          },
          // 原子数据：缩放
          scale: {
            deps: [],
          },
          // 原子数据：相机
          camera: {
            deps: [],
          },
          // 原子数据：透视
          perspective: {
            deps: [],
          },
          // 原子数据：雾化颜色
          fogColor: {
            deps: [],
          },
          // 原子数据：雾化范围
          fogDist: {
            deps: [],
          },
        }),
      );
      draw({
        points: [
          [
            [1, 1, 1, 0.4, 0.4, 1],
            [-1, 1, 1, 0.4, 0.4, 1],
            [-1, -1, 1, 0.4, 0.4, 1],
            [1, -1, 1, 0.4, 0.4, 1],
          ],
          [
            [1, 1, 1, 0.4, 1, 0.4],
            [1, -1, 1, 0.4, 1, 0.4],
            [1, -1, -1, 0.4, 1, 0.4],
            [1, 1, -1, 0.4, 1, 0.4],
          ],
          [
            [1, 1, 1, 1, 0.4, 0.4],
            [1, 1, -1, 1, 0.4, 0.4],
            [-1, 1, -1, 1, 0.4, 0.4],
            [-1, 1, 1, 1, 0.4, 0.4],
          ],
          [
            [-1, 1, 1, 1, 1, 0.4],
            [-1, 1, -1, 1, 1, 0.4],
            [-1, -1, -1, 1, 1, 0.4],
            [-1, -1, 1, 1, 1, 0.4],
          ],
          [
            [-1, -1, -1, 1, 1, 1],
            [1, -1, -1, 1, 1, 1],
            [1, -1, 1, 1, 1, 1],
            [-1, -1, 1, 1, 1, 1],
          ],
          [
            [1, -1, -1, 0.4, 1, 1],
            [-1, -1, -1, 0.4, 1, 1],
            [-1, 1, -1, 0.4, 1, 1],
            [1, 1, -1, 0.4, 1, 1],
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
        scale: [10, 10, 10],
        camera: [25, 65, 35, 0, 2, 0, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
        fogColor: [0.137, 0.231, 0.423],
        fogDist: [55, 80],
      });
      drawRef.current = draw;
    },
    [],
  );

  useGui(
    [
      {
        type: 'number',
        name: '雾化终点',
        initialValue: 80,
        min: 55,
        max: 105,
        step: 1,
        onChange: (value) => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ fogDist }) => {
            return {
              fogDist: [fogDist[0], value],
            };
          });
        },
      },
    ],
    {
      container: '#gui-demo',
      title: '雾化控件',
    },
  );

  return (
    <Canvas
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo69;
