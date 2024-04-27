import { type FC, type PointerEventHandler, useCallback, useRef } from 'react';

import Canvas from '../../component/canvas';
import {
  flatArray,
  makeWebGLDraw,
  Matrix4,
  type StateChangeAction,
  type StateWithRoot,
  useFrameRequest,
} from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_Clicked: WebGLUniformLocation | null;
  positionColorBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  positionColorArray: Float32Array;
  indexArray: Uint8Array;
  mvpMatrix: Matrix4;
  points: Tuple<Tuple<Tuple<number, 6>, 4>, 6>;
  surfaces: Tuple<Tuple<Tuple<number, 3>, 2>, 6>;
  rotations: Tuple<Tuple<number, 4>, 3>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  clicked: boolean;
  velocity: number;
  time: number;
}>;

/**
 * 选中物体
 */
const Demo64: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext | null>(null);
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
            deps: ['a_Position', 'a_Color', 'u_MvpMatrix', 'u_Clicked'],
            data: () => {
              gl.clearColor(0, 0, 0, 1);
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
          // 着色器变量：u_Clicked
          u_Clicked: {
            deps: ['clicked'],
            data: gl.getUniformLocation(program!, 'u_Clicked'),
            onChange: ({ u_Clicked, clicked }) => {
              gl.uniform1i(u_Clicked, Number(clicked));
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
            deps: ['rotations', 'camera', 'perspective'],
            data: new Matrix4(),
            onChange: ({ mvpMatrix, rotations, camera, perspective }) => {
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
                );
              for (const rotation of rotations) {
                const [angle, rotationX, rotationY, rotationZ] = rotation;
                mvpMatrix.rotate(angle, rotationX, rotationY, rotationZ);
              }
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
          // 原子数据：旋转
          rotations: {
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
          // 原子数据：是否点击
          clicked: {
            deps: [],
          },
          // 原子数据：速度
          velocity: {
            deps: [],
          },
          // 原子数据：时间
          time: {
            deps: [],
          },
        }),
      );
      draw({
        points: [
          [
            [1, 1, 1, 0.2, 0.58, 0.82],
            [-1, 1, 1, 0.2, 0.58, 0.82],
            [-1, -1, 1, 0.2, 0.58, 0.82],
            [1, -1, 1, 0.2, 0.58, 0.82],
          ],
          [
            [1, 1, 1, 0.5, 0.41, 0.69],
            [1, -1, 1, 0.5, 0.41, 0.69],
            [1, -1, -1, 0.5, 0.41, 0.69],
            [1, 1, -1, 0.5, 0.41, 0.69],
          ],
          [
            [1, 1, 1, 0, 0.32, 0.61],
            [1, 1, -1, 0, 0.32, 0.61],
            [-1, 1, -1, 0, 0.32, 0.61],
            [-1, 1, 1, 0, 0.32, 0.61],
          ],
          [
            [-1, 1, 1, 0.78, 0.69, 0.84],
            [-1, 1, -1, 0.78, 0.69, 0.84],
            [-1, -1, -1, 0.78, 0.69, 0.84],
            [-1, -1, 1, 0.78, 0.69, 0.84],
          ],
          [
            [-1, -1, -1, 0.32, 0.18, 0.56],
            [1, -1, -1, 0.32, 0.18, 0.56],
            [1, -1, 1, 0.32, 0.18, 0.56],
            [-1, -1, 1, 0.32, 0.18, 0.56],
          ],
          [
            [1, -1, -1, 0.73, 0.82, 0.93],
            [-1, -1, -1, 0.73, 0.82, 0.93],
            [-1, 1, -1, 0.73, 0.82, 0.93],
            [1, 1, -1, 0.73, 0.82, 0.93],
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
        rotations: [
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1],
        ],
        camera: [0, 0, 7, 0, 0, 0, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
        clicked: false,
        velocity: 20,
        time: Date.now(),
      });
      glRef.current = gl;
      drawRef.current = draw;
    },
    [],
  );

  const handlePointerDown = useCallback<PointerEventHandler<HTMLCanvasElement>>(
    (event) => {
      const canvas = event.target as HTMLCanvasElement;
      if (!canvas) return;
      const gl = glRef.current;
      if (!gl) return;
      const draw = drawRef.current;
      if (!draw) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      const clientRect = canvas.getBoundingClientRect();
      if (
        clientRect.left <= clientX &&
        clientX < clientRect.right &&
        clientRect.top <= clientY &&
        clientY < clientRect.bottom
      ) {
        draw({
          clicked: true,
        });
        const pixels = new Uint8Array(4);
        gl.readPixels(
          clientX - clientRect.left,
          clientRect.bottom - clientY,
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels,
        );
        draw({
          clicked: false,
        });
        if (pixels[0] === 255) {
          globalThis.alert('The cube was selected! ');
        }
      }
    },
    [],
  );

  useFrameRequest(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw(({ rotations, velocity, time }) => {
      const timeEnd = Date.now();
      const timeStart = time;
      const timeSpan = timeEnd - timeStart;
      const newRotations = rotations.map((rotation) => {
        const [angle, rotationX, rotationY, rotationZ] = rotation;
        const angleStart = angle;
        const angleSpan = (velocity * timeSpan) / 1000;
        const angleEnd = (angleStart + angleSpan) % 360;
        return [angleEnd, rotationX, rotationY, rotationZ];
      }) as typeof rotations;
      return {
        rotations: newRotations,
        time: timeEnd,
      };
    });
  });

  return (
    <Canvas
      onPointerDown={handlePointerDown}
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo64;
