import { type FC, useCallback, useRef } from 'react';

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
import FSHADER1 from './fragment1.glsl?raw';
import FSHADER2 from './fragment2.glsl?raw';
import VSHADER1 from './vertex1.glsl?raw';
import VSHADER2 from './vertex2.glsl?raw';

type DemoState1 = StateWithRoot<{
  a_Position: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  frameBuffer: WebGLFramebuffer | null;
  positionBuffers: Tuple<WebGLBuffer | null, 2>;
  indexBuffers: Tuple<WebGLBuffer | null, 2>;
  renderBuffer: WebGLRenderbuffer | null;
  frameTexture: WebGLTexture | null;
  positionArrays: Tuple<Float32Array, 2>;
  indexArrays: Tuple<Uint8Array, 2>;
  mvpMatrices: Tuple<Matrix4, 2>;
  points: [Tuple<Tuple<number, 3>, 3>, Tuple<Tuple<number, 3>, 4>];
  surfaces: [Tuple<Tuple<number, 3>, 1>, Tuple<Tuple<number, 3>, 2>];
  rotations: Tuple<Tuple<number, 4>, 2>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  velocity: number;
  time: number;
}>;

type DemoState2 = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_MvpMatrixFromLight: WebGLUniformLocation | null;
  u_ShadowMap: WebGLUniformLocation | null;
  frameBuffer: WebGLFramebuffer | null;
  positionColorBuffers: Tuple<WebGLBuffer | null>;
  indexBuffers: Tuple<WebGLBuffer | null, 2>;
  renderBuffer: WebGLRenderbuffer | null;
  frameTexture: WebGLTexture | null;
  positionColorArrays: Tuple<Float32Array, 2>;
  indexArrays: Tuple<Uint8Array, 2>;
  mvpMatrices: Tuple<Matrix4, 2>;
  mvpMatricesFromLight: Tuple<Matrix4, 2>;
  points: [Tuple<Tuple<number, 6>, 3>, Tuple<Tuple<number, 6>, 4>];
  surfaces: [Tuple<Tuple<number, 3>, 1>, Tuple<Tuple<number, 3>, 2>];
  rotations: Tuple<Tuple<number, 4>, 2>;
  camera: Tuple<number, 9>;
  cameraFromLight: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  perspectiveFromLight: Tuple<number, 4>;
  unit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  velocity: number;
  time: number;
}>;

const OFFSCREEN_WIDTH = 2048;
const OFFSCREEN_HEIGHT = 2048;

/**
 * 绘制高精阴影
 */
const Demo76: FC<ComponentProps> = () => {
  const drawRef = useRef<
    [StateChangeAction<DemoState1>, StateChangeAction<DemoState2>] | null
  >(null);

  const handleWindowResize = useCallback(
    (canvas?: HTMLCanvasElement, gl?: WebGLRenderingContext) => {
      if (!canvas) return;
      if (!gl) return;
      const draw = drawRef.current;
      if (!draw) return;
      const [draw1, draw2] = draw;
      draw1({});
      draw2(({ perspective }) => ({
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
      const frameBuffer = gl.createFramebuffer();
      const renderBuffer = gl.createRenderbuffer();
      const frameTexture = gl.createTexture();
      const draw1 = makeWebGLDraw<DemoState1>(
        gl,
        VSHADER1,
        FSHADER1,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'u_MvpMatrix', 'frameBuffer'],
            type: 'dynamic',
            data: () => {
              gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
              gl.clearColor(0, 0, 0, 1);
              gl.enable(gl.DEPTH_TEST);
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              return 2;
            },
            onChange: ({ surfaces }, index) => {
              gl.drawElements(
                gl.TRIANGLES,
                surfaces[index]!.flat().length,
                gl.UNSIGNED_BYTE,
                0,
              );
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionBuffers', 'indexBuffers'],
            type: 'dynamic',
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position }) => {
              gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
              gl.enableVertexAttribArray(a_Position);
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
          // 派生数据：帧缓冲区
          frameBuffer: {
            deps: ['renderBuffer', 'frameTexture'],
            type: 'dynamic',
            data: frameBuffer,
            onChange: ({ frameBuffer, renderBuffer, frameTexture }, index) => {
              if (index === 0) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
                gl.framebufferRenderbuffer(
                  gl.FRAMEBUFFER,
                  gl.DEPTH_ATTACHMENT,
                  gl.RENDERBUFFER,
                  renderBuffer,
                );
                gl.framebufferTexture2D(
                  gl.FRAMEBUFFER,
                  gl.COLOR_ATTACHMENT0,
                  gl.TEXTURE_2D,
                  frameTexture,
                  0,
                );
              }
            },
          },
          // 派生数据：顶点位置缓冲区
          positionBuffers: {
            deps: ['positionArrays'],
            type: 'dynamic',
            data: [gl.createBuffer(), gl.createBuffer()],
            onChange: ({ positionBuffers, positionArrays }, index) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffers[index]!);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionArrays[index]!,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：顶点索引缓冲区
          indexBuffers: {
            deps: ['indexArrays'],
            type: 'dynamic',
            data: [gl.createBuffer(), gl.createBuffer()],
            onChange: ({ indexBuffers, indexArrays }, index) => {
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffers[index]!);
              gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                indexArrays[index]!,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：渲染缓冲区
          renderBuffer: {
            deps: [],
            type: 'dynamic',
            data: renderBuffer,
            onChange: ({ renderBuffer }, index) => {
              if (index === 0) {
                gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
                gl.renderbufferStorage(
                  gl.RENDERBUFFER,
                  gl.DEPTH_COMPONENT16,
                  OFFSCREEN_WIDTH,
                  OFFSCREEN_HEIGHT,
                );
              }
            },
          },
          // 派生数据：帧缓冲纹理
          frameTexture: {
            deps: [],
            type: 'dynamic',
            data: frameTexture,
            onChange: ({ frameTexture }, index) => {
              if (index === 0) {
                gl.bindTexture(gl.TEXTURE_2D, frameTexture);
                gl.texParameteri(
                  gl.TEXTURE_2D,
                  gl.TEXTURE_MIN_FILTER,
                  gl.LINEAR,
                );
                gl.texImage2D(
                  gl.TEXTURE_2D,
                  0,
                  gl.RGBA,
                  OFFSCREEN_WIDTH,
                  OFFSCREEN_HEIGHT,
                  0,
                  gl.RGBA,
                  gl.UNSIGNED_BYTE,
                  null,
                );
              }
            },
          },
          // 派生数据：顶点位置数组
          positionArrays: {
            deps: ['points'],
            type: 'multi',
            data: [new Float32Array(3 * 3), new Float32Array(3 * 4)],
            onChange: ({ positionArrays, points }, index) => {
              positionArrays[index]!.set(flatArray(points[index]!));
            },
          },
          // 派生数据：顶点索引数组
          indexArrays: {
            deps: ['surfaces'],
            type: 'multi',
            data: [new Uint8Array(3 * 1), new Uint8Array(3 * 2)],
            onChange: ({ indexArrays, surfaces }, index) => {
              indexArrays[index]!.set(flatArray(surfaces[index]!));
            },
          },
          // 派生数据：模型视图投影矩阵
          mvpMatrices: {
            deps: ['rotations', 'camera', 'perspective'],
            type: 'multi',
            data: [new Matrix4(), new Matrix4()],
            onChange: (
              { mvpMatrices, rotations, camera, perspective },
              index,
            ) => {
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
              const [angle, rotationX, rotationY, rotationZ] =
                rotations[index]!;
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
                .rotate(angle, rotationX, rotationY, rotationZ);
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
      const draw2 = makeWebGLDraw<DemoState2>(
        gl,
        VSHADER2,
        FSHADER2,
        (program) => ({
          // 着色器程序
          root: {
            deps: [
              'a_Position',
              'a_Color',
              'u_MvpMatrix',
              'u_MvpMatrixFromLight',
              'u_ShadowMap',
              'frameBuffer',
            ],
            type: 'dynamic',
            data: () => {
              gl.bindFramebuffer(gl.FRAMEBUFFER, null);
              gl.viewport(0, 0, canvas.width, canvas.height);
              gl.clearColor(0, 0, 0, 1);
              gl.enable(gl.DEPTH_TEST);
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              return 2;
            },
            onChange: ({ surfaces }, index) => {
              gl.drawElements(
                gl.TRIANGLES,
                surfaces[index]!.flat().length,
                gl.UNSIGNED_BYTE,
                0,
              );
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionColorBuffers', 'indexBuffers'],
            type: 'dynamic',
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionColorArrays }, index) => {
              gl.vertexAttribPointer(
                a_Position,
                3,
                gl.FLOAT,
                false,
                positionColorArrays[index]!.BYTES_PER_ELEMENT * 6,
                0,
              );
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_Color
          a_Color: {
            deps: ['positionColorBuffers', 'indexBuffers'],
            type: 'dynamic',
            data: gl.getAttribLocation(program!, 'a_Color'),
            onChange: ({ a_Color, positionColorArrays }, index) => {
              gl.vertexAttribPointer(
                a_Color,
                3,
                gl.FLOAT,
                false,
                positionColorArrays[index]!.BYTES_PER_ELEMENT * 6,
                positionColorArrays[index]!.BYTES_PER_ELEMENT * 3,
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
          // 着色器变量：u_MvpMatrixFromLight
          u_MvpMatrixFromLight: {
            deps: ['mvpMatricesFromLight'],
            type: 'dynamic',
            data: gl.getUniformLocation(program!, 'u_MvpMatrixFromLight'),
            onChange: (
              { u_MvpMatrixFromLight, mvpMatricesFromLight },
              index,
            ) => {
              gl.uniformMatrix4fv(
                u_MvpMatrixFromLight,
                false,
                mvpMatricesFromLight[index]!.elements,
              );
            },
          },
          // 着色器变量：u_ShadowMap
          u_ShadowMap: {
            deps: ['frameTexture'],
            type: 'dynamic',
            data: gl.getUniformLocation(program!, 'u_ShadowMap'),
            onChange: ({ u_ShadowMap, unit }) => {
              gl.uniform1i(u_ShadowMap, unit);
            },
          },
          // 派生数据：帧缓冲区
          frameBuffer: {
            deps: ['renderBuffer', 'frameTexture'],
            type: 'dynamic',
            data: frameBuffer,
            onChange: (_state, index) => {
              if (index === 0) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
              }
            },
          },
          // 派生数据：顶点位置颜色缓冲区
          positionColorBuffers: {
            deps: ['positionColorArrays'],
            type: 'dynamic',
            data: [gl.createBuffer(), gl.createBuffer()],
            onChange: (
              { positionColorBuffers, positionColorArrays },
              index,
            ) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionColorBuffers[index]!);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionColorArrays[index]!,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：顶点索引缓冲区
          indexBuffers: {
            deps: ['indexArrays'],
            type: 'dynamic',
            data: [gl.createBuffer(), gl.createBuffer()],
            onChange: ({ indexBuffers, indexArrays }, index) => {
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffers[index]!);
              gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                indexArrays[index]!,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：渲染缓冲区
          renderBuffer: {
            deps: [],
            type: 'dynamic',
            data: renderBuffer,
          },
          // 派生数据：帧缓冲纹理
          frameTexture: {
            deps: ['unit'],
            type: 'dynamic',
            data: frameTexture,
            onChange: ({ frameTexture, unit }, index) => {
              if (index === 0) {
                gl.activeTexture(gl[`TEXTURE${unit}`]);
                gl.bindTexture(gl.TEXTURE_2D, frameTexture);
              }
            },
          },
          // 派生数据：顶点位置颜色数组
          positionColorArrays: {
            deps: ['points'],
            type: 'multi',
            data: [new Float32Array(6 * 3), new Float32Array(6 * 4)],
            onChange: ({ positionColorArrays, points }, index) => {
              positionColorArrays[index]!.set(flatArray(points[index]!));
            },
          },
          // 派生数据：顶点索引数组
          indexArrays: {
            deps: ['surfaces'],
            type: 'multi',
            data: [new Uint8Array(3 * 1), new Uint8Array(3 * 2)],
            onChange: ({ indexArrays, surfaces }, index) => {
              indexArrays[index]!.set(flatArray(surfaces[index]!));
            },
          },
          // 派生数据：模型视图投影矩阵
          mvpMatrices: {
            deps: ['rotations', 'camera', 'perspective'],
            type: 'multi',
            data: [new Matrix4(), new Matrix4()],
            onChange: (
              { mvpMatrices, rotations, camera, perspective },
              index,
            ) => {
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
              const [angle, rotationX, rotationY, rotationZ] =
                rotations[index]!;
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
                .rotate(angle, rotationX, rotationY, rotationZ);
            },
          },
          // 派生数据：光下模型视图投影矩阵
          mvpMatricesFromLight: {
            deps: ['rotations', 'cameraFromLight', 'perspectiveFromLight'],
            type: 'multi',
            data: [new Matrix4(), new Matrix4()],
            onChange: (
              {
                mvpMatricesFromLight,
                rotations,
                cameraFromLight,
                perspectiveFromLight,
              },
              index,
            ) => {
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
              ] = cameraFromLight;
              const [fovy, aspect, perspectiveNear, perspectiveFar] =
                perspectiveFromLight;
              const [angle, rotationX, rotationY, rotationZ] =
                rotations[index]!;
              mvpMatricesFromLight[index]!.setPerspective(
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
                .rotate(angle, rotationX, rotationY, rotationZ);
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
          // 原子数据：光下相机
          cameraFromLight: {
            deps: [],
          },
          // 原子数据：透视
          perspective: {
            deps: [],
          },
          // 原子数据：光下透视
          perspectiveFromLight: {
            deps: [],
          },
          // 原子数据：纹理单元
          unit: {
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
      const rotations: Tuple<Tuple<number, 4>, 2> = [
        [0, 0, 1, 0],
        [-45, 0, 1, 1],
      ];
      const camera: Tuple<number, 9> = [0, 40, 2, 0, 0, 0, 0, 1, 0];
      const perspective: Tuple<number, 4> = [
        70,
        OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT,
        1,
        200,
      ];
      const velocity = 40;
      const time = Date.now();
      draw1({
        points: [
          [
            [-0.8, 3.5, 0],
            [0.8, 3.5, 0],
            [0.0, 3.5, 1.8],
          ],
          [
            [3, -1.7, 2.5],
            [-3, -1.7, 2.5],
            [-3, -1.7, -2.5],
            [3, -1.7, -2.5],
          ],
        ],
        surfaces: [
          [[0, 1, 2]],
          [
            [0, 1, 2],
            [0, 2, 3],
          ],
        ],
        rotations,
        camera,
        perspective,
        velocity,
        time,
      });
      draw2({
        points: [
          [
            [-0.8, 3.5, 0, 1, 0.5, 0],
            [0.8, 3.5, 0, 1, 0.5, 0],
            [0.0, 3.5, 1.8, 1, 0, 0],
          ],
          [
            [3, -1.7, 2.5, 1, 1, 1],
            [-3, -1.7, 2.5, 1, 1, 1],
            [-3, -1.7, -2.5, 1, 1, 1],
            [3, -1.7, -2.5, 1, 1, 1],
          ],
        ],
        surfaces: [
          [[0, 1, 2]],
          [
            [0, 1, 2],
            [0, 2, 3],
          ],
        ],
        rotations,
        camera: [0, 7, 9, 0, 0, 0, 0, 1, 0],
        cameraFromLight: camera,
        perspective: [45, canvas.width / canvas.height, 1, 100],
        perspectiveFromLight: perspective,
        unit: 0,
        velocity,
        time,
      });
      drawRef.current = [draw1, draw2];
    },
    [],
  );

  useFrameRequest(() => {
    const draw = drawRef.current;
    if (!draw) return;
    const [draw1, draw2] = draw;
    const timeEnd = Date.now();
    draw1(({ rotations, velocity, time }) => {
      const [angle, rotationX, rotationY, rotationZ] = rotations[0];
      const timeStart = time;
      const timeSpan = timeEnd - timeStart;
      const angleStart = angle;
      const angleSpan = (velocity * timeSpan) / 1000;
      const angleEnd = (angleStart + angleSpan) % 360;
      return {
        rotations: [[angleEnd, rotationX, rotationY, rotationZ], rotations[1]],
        time: timeEnd,
      };
    });
    draw2(({ rotations, velocity, time }) => {
      const [angle, rotationX, rotationY, rotationZ] = rotations[0];
      const timeStart = time;
      const timeSpan = timeEnd - timeStart;
      const angleStart = angle;
      const angleSpan = (velocity * timeSpan) / 1000;
      const angleEnd = (angleStart + angleSpan) % 360;
      return {
        rotations: [[angleEnd, rotationX, rotationY, rotationZ], rotations[1]],
        time: timeEnd,
      };
    });
  });

  return (
    <Canvas
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo76;
