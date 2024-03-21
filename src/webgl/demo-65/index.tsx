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
  a_Face: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_PickedFace: WebGLUniformLocation | null;
  positionColorFaceBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  positionColorFaceArray: Float32Array;
  indexArray: Uint8Array;
  mvpMatrix: Matrix4;
  points: Tuple<Tuple<Tuple<number, 7>, 4>, 6>;
  surfaces: Tuple<Tuple<Tuple<number, 3>, 2>, 6>;
  rotations: Tuple<Tuple<number, 4>, 3>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  pickedFace: number;
  velocity: number;
  time: number;
}>;

/**
 * 选中表面
 */
const Demo65: FC<ComponentProps> = () => {
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
            deps: [
              'a_Position',
              'a_Color',
              'a_Face',
              'u_MvpMatrix',
              'u_PickedFace',
            ],
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
            deps: ['positionColorFaceBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionColorFaceArray }) => {
              gl.vertexAttribPointer(
                a_Position,
                3,
                gl.FLOAT,
                false,
                positionColorFaceArray.BYTES_PER_ELEMENT * 7,
                0,
              );
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_Color
          a_Color: {
            deps: ['positionColorFaceBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Color'),
            onChange: ({ a_Color, positionColorFaceArray }) => {
              gl.vertexAttribPointer(
                a_Color,
                3,
                gl.FLOAT,
                false,
                positionColorFaceArray.BYTES_PER_ELEMENT * 7,
                positionColorFaceArray.BYTES_PER_ELEMENT * 3,
              );
              gl.enableVertexAttribArray(a_Color);
            },
          },
          // 着色器变量：a_Face
          a_Face: {
            deps: ['positionColorFaceBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Face'),
            onChange: ({ a_Face, positionColorFaceArray }) => {
              gl.vertexAttribPointer(
                a_Face,
                1,
                gl.FLOAT,
                false,
                positionColorFaceArray.BYTES_PER_ELEMENT * 7,
                positionColorFaceArray.BYTES_PER_ELEMENT * 6,
              );
              gl.enableVertexAttribArray(a_Face);
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
          // 着色器变量：u_PickedFace
          u_PickedFace: {
            deps: ['pickedFace'],
            data: gl.getUniformLocation(program!, 'u_PickedFace'),
            onChange: ({ u_PickedFace, pickedFace }) => {
              gl.uniform1i(u_PickedFace, pickedFace);
            },
          },
          // 派生数据：顶点位置颜色缓冲区
          positionColorFaceBuffer: {
            deps: ['positionColorFaceArray'],
            data: gl.createBuffer(),
            onChange: ({ positionColorFaceBuffer, positionColorFaceArray }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionColorFaceBuffer);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionColorFaceArray,
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
          positionColorFaceArray: {
            deps: ['points'],
            data: new Float32Array(7 * 4 * 6),
            onChange: ({ positionColorFaceArray, points }) => {
              positionColorFaceArray.set(flatArray(points));
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
          // 原子数据：选中面
          pickedFace: {
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
            [1, 1, 1, 0.32, 0.18, 0.56, 1],
            [-1, 1, 1, 0.32, 0.18, 0.56, 1],
            [-1, -1, 1, 0.32, 0.18, 0.56, 1],
            [1, -1, 1, 0.32, 0.18, 0.56, 1],
          ],
          [
            [1, 1, 1, 0.5, 0.41, 0.69, 2],
            [1, -1, 1, 0.5, 0.41, 0.69, 2],
            [1, -1, -1, 0.5, 0.41, 0.69, 2],
            [1, 1, -1, 0.5, 0.41, 0.69, 2],
          ],
          [
            [1, 1, 1, 0.78, 0.69, 0.84, 3],
            [1, 1, -1, 0.78, 0.69, 0.84, 3],
            [-1, 1, -1, 0.78, 0.69, 0.84, 3],
            [-1, 1, 1, 0.78, 0.69, 0.84, 3],
          ],
          [
            [-1, 1, 1, 0, 0.32, 0.61, 4],
            [-1, 1, -1, 0, 0.32, 0.61, 4],
            [-1, -1, -1, 0, 0.32, 0.61, 4],
            [-1, -1, 1, 0, 0.32, 0.61, 4],
          ],
          [
            [-1, -1, -1, 0.27, 0.58, 0.82, 5],
            [1, -1, -1, 0.27, 0.58, 0.82, 5],
            [1, -1, 1, 0.27, 0.58, 0.82, 5],
            [-1, -1, 1, 0.27, 0.58, 0.82, 5],
          ],
          [
            [1, -1, -1, 0.73, 0.82, 0.93, 6],
            [-1, -1, -1, 0.73, 0.82, 0.93, 6],
            [-1, 1, -1, 0.73, 0.82, 0.93, 6],
            [1, 1, -1, 0.73, 0.82, 0.93, 6],
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
        velocity: 20,
        time: Date.now(),
        camera: [0, 0, 7, 0, 0, 0, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
        pickedFace: 255,
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
          pickedFace: 0,
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
          pickedFace: pixels[3]!,
        });
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

export default Demo65;
