import { type FC, useCallback, useRef } from 'react';

import Canvas from '../../component/canvas';
import {
  flatArray,
  makeWebGLDraw,
  Matrix4,
  type StateChangeAction,
  type StateWithRoot,
} from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  mvpMatrices: Tuple<Matrix4, 2>;
  points: Tuple<Tuple<Tuple<number, 6>, 3>, 3>;
  translations: Tuple<Tuple<number, 3>, 2>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
}>;

/**
 * 组合透视平移
 */
const Demo43: FC<ComponentProps> = () => {
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
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER,
        FSHADER,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'a_Color', 'u_MvpMatrix'],
            type: 'dynamic',
            data: () => {
              gl.clearColor(0, 0, 0, 1);
              gl.clear(gl.COLOR_BUFFER_BIT);
              return 2;
            },
            onChange: ({ points }) => {
              gl.drawArrays(gl.TRIANGLES, 0, points.flat().length);
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionColorBuffer'],
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
            deps: ['positionColorBuffer'],
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
            deps: ['mvpMatrices'],
            type: 'dynamic',
            data: gl.getUniformLocation(program!, 'u_MvpMatrix'),
            onChange: ({ u_MvpMatrix, mvpMatrices }, index) => {
              gl.uniformMatrix4fv(
                u_MvpMatrix,
                false,
                mvpMatrices[index]!.elements,
              );
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
          // 派生数据：顶点位置颜色数组
          positionColorArray: {
            deps: ['points'],
            data: new Float32Array(6 * 3 * 3),
            onChange: ({ positionColorArray, points }) => {
              positionColorArray.set(flatArray(points));
            },
          },
          // 派生数据：模型视图投影矩阵
          mvpMatrices: {
            deps: ['translations', 'camera', 'perspective'],
            type: 'multi',
            data: [new Matrix4(), new Matrix4()],
            onChange: (
              { mvpMatrices, translations, camera, perspective },
              index,
            ) => {
              const [translationX, translationY, translationZ] =
                translations[index]!;
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
              mvpMatrices[index]!.setPerspective(
                fovy,
                aspect,
                perspectiveNear,
                perspectiveFar,
              )
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
                .translate(translationX, translationY, translationZ);
            },
          },
          // 原子数据：顶点
          points: {
            deps: [],
          },
          // 原子数据：平移
          translations: {
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
        }),
      );
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
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo43;
