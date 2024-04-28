import { type FC, useCallback, useEffect, useRef } from 'react';

import Canvas from '../../component/canvas';
import {
  flatArray,
  makeWebGLDraw,
  Matrix4,
  type StateChangeAction,
  type StateWithRoot,
  useFrameRequest,
  useImage,
} from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import SKY_IMAGE from '../assets/sky.jpg';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_TexCoord: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_Sampler: WebGLUniformLocation | null;
  frameBuffer: WebGLFramebuffer | null;
  positionTexCoordBuffers: Tuple<WebGLBuffer | null, 2>;
  indexBuffers: Tuple<WebGLBuffer | null, 2>;
  renderBuffer: WebGLRenderbuffer | null;
  samplerTexture: WebGLTexture | null;
  frameTexture: WebGLTexture | null;
  positionTexCoordArrays: Tuple<Float32Array, 2>;
  indexArrays: Tuple<Uint8Array, 2>;
  mvpMatrices: Tuple<Matrix4, 2>;
  points: [
    Tuple<Tuple<Tuple<number, 5>, 4>, 6>,
    Tuple<Tuple<Tuple<number, 5>, 4>, 1>,
  ];
  surfaces: [
    Tuple<Tuple<Tuple<number, 3>, 2>, 6>,
    Tuple<Tuple<Tuple<number, 3>, 2>, 1>,
  ];
  translations: Tuple<Tuple<number, 3>, 2>;
  rotations: Tuple<Tuple<Tuple<number, 4>, 2>, 2>;
  cameras: Tuple<Tuple<number, 9>, 2>;
  perspectives: Tuple<Tuple<number, 4>, 2>;
  picture: [TexImageSource, 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
  unit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  velocity: number;
  time: number;
}>;

const OFFSCREEN_WIDTH = 256;
const OFFSCREEN_HEIGHT = 256;

/**
 * 绘制到纹理
 */
const Demo74: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);
  const image = useImage(SKY_IMAGE);

  const handleWindowResize = useCallback(
    (canvas?: HTMLCanvasElement, gl?: WebGLRenderingContext) => {
      if (!canvas) return;
      if (!gl) return;
      const draw = drawRef.current;
      if (!draw) return;
      draw(({ perspectives }) => ({
        perspectives: [
          perspectives[0],
          [
            perspectives[1][0],
            canvas.width / canvas.height,
            perspectives[1][2],
            perspectives[1][3],
          ],
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
              'a_TexCoord',
              'u_MvpMatrix',
              'u_Sampler',
              'frameBuffer',
            ],
            type: 'dynamic',
            data: () => {
              gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
              gl.enable(gl.DEPTH_TEST);
              return 2;
            },
            onChange: ({ surfaces }, index) => {
              if (index === 0) {
                gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
                gl.clearColor(0.2, 0.2, 0.4, 1);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.drawElements(
                  gl.TRIANGLES,
                  surfaces[0].flat(2).length,
                  gl.UNSIGNED_BYTE,
                  0,
                );
              }
              if (index === 1) {
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.drawElements(
                  gl.TRIANGLES,
                  surfaces[1].flat(2).length,
                  gl.UNSIGNED_BYTE,
                  0,
                );
              }
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionTexCoordBuffers', 'indexBuffers'],
            type: 'dynamic',
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionTexCoordArrays }, index) => {
              gl.vertexAttribPointer(
                a_Position,
                3,
                gl.FLOAT,
                false,
                positionTexCoordArrays[index]!.BYTES_PER_ELEMENT * 5,
                0,
              );
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_TexCoord
          a_TexCoord: {
            deps: ['positionTexCoordBuffers', 'indexBuffers'],
            type: 'dynamic',
            data: gl.getAttribLocation(program!, 'a_TexCoord'),
            onChange: ({ a_TexCoord, positionTexCoordArrays }, index) => {
              gl.vertexAttribPointer(
                a_TexCoord,
                2,
                gl.FLOAT,
                false,
                positionTexCoordArrays[index]!.BYTES_PER_ELEMENT * 5,
                positionTexCoordArrays[index]!.BYTES_PER_ELEMENT * 3,
              );
              gl.enableVertexAttribArray(a_TexCoord);
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
          // 着色器变量：u_Sampler
          u_Sampler: {
            deps: ['samplerTexture', 'frameTexture'],
            type: 'dynamic',
            data: gl.getUniformLocation(program!, 'u_Sampler'),
            onChange: ({ u_Sampler, picture, unit }, index) => {
              if (index === 0) {
                gl.uniform1i(u_Sampler, picture?.[1]);
              }
              if (index === 1) {
                gl.uniform1i(u_Sampler, unit);
              }
            },
          },
          // 派生数据：帧缓冲区
          frameBuffer: {
            deps: ['renderBuffer', 'frameTexture'],
            type: 'dynamic',
            data: gl.createFramebuffer(),
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
              if (index === 1) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
              }
            },
          },
          // 派生数据：顶点位置坐标缓冲区
          positionTexCoordBuffers: {
            deps: ['positionTexCoordArrays'],
            type: 'dynamic',
            data: [gl.createBuffer(), gl.createBuffer()],
            onChange: (
              { positionTexCoordBuffers, positionTexCoordArrays },
              index,
            ) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionTexCoordBuffers[index]!);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionTexCoordArrays[index]!,
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
            data: gl.createRenderbuffer(),
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
          // 派生数据：采样器纹理
          samplerTexture: {
            deps: ['picture'],
            data: gl.createTexture(),
            onChange: ({ samplerTexture, picture }) => {
              const [source, unit] = picture;
              gl.activeTexture(gl[`TEXTURE${unit}`]);
              gl.bindTexture(gl.TEXTURE_2D, samplerTexture);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGB,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                source,
              );
            },
          },
          // 派生数据：帧缓冲纹理
          frameTexture: {
            deps: ['unit'],
            type: 'dynamic',
            data: gl.createTexture(),
            onChange: ({ frameTexture, unit }, index) => {
              if (index === 0) {
                const texture = gl.getParameter(gl.TEXTURE_BINDING_2D);
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
                gl.bindTexture(gl.TEXTURE_2D, texture);
              }
              if (index === 1) {
                gl.activeTexture(gl[`TEXTURE${unit}`]);
                gl.bindTexture(gl.TEXTURE_2D, frameTexture);
              }
            },
          },
          // 派生数据：顶点位置坐标数组
          positionTexCoordArrays: {
            deps: ['points'],
            type: 'multi',
            data: [new Float32Array(5 * 4 * 6), new Float32Array(5 * 4 * 1)],
            onChange: ({ positionTexCoordArrays, points }, index) => {
              positionTexCoordArrays[index]!.set(flatArray(points[index]!));
            },
          },
          // 派生数据：顶点索引数组
          indexArrays: {
            deps: ['surfaces'],
            type: 'multi',
            data: [new Uint8Array(3 * 2 * 6), new Uint8Array(3 * 2 * 1)],
            onChange: ({ indexArrays, surfaces }, index) => {
              indexArrays[index]!.set(flatArray(surfaces[index]!));
            },
          },
          // 派生数据：模型视图投影矩阵
          mvpMatrices: {
            deps: ['translations', 'rotations', 'cameras', 'perspectives'],
            type: 'multi',
            data: [new Matrix4(), new Matrix4()],
            onChange: (
              { mvpMatrices, translations, rotations, cameras, perspectives },
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
              ] = cameras[index]!;
              const [fovy, aspect, perspectiveNear, perspectiveFar] =
                perspectives[index]!;
              mvpMatrices[index]!.setPerspective(
                fovy,
                aspect,
                perspectiveNear,
                perspectiveFar,
              ).lookAt(
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
              const [translationX, translationY, translationZ] =
                translations[index]!;
              mvpMatrices[index]!.translate(
                translationX,
                translationY,
                translationZ,
              );
              for (const rotation of rotations[index]!) {
                const [angle, rotationX, rotationY, rotationZ] = rotation;
                mvpMatrices[index]!.rotate(
                  angle,
                  rotationX,
                  rotationY,
                  rotationZ,
                );
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
          // 原子数据：平移
          translations: {
            deps: [],
          },
          // 原子数据：旋转
          rotations: {
            deps: [],
          },
          // 原子数据：相机
          cameras: {
            deps: [],
          },
          // 原子数据：透视
          perspectives: {
            deps: [],
          },
          // 原子数据：图片
          picture: {
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
      draw({
        points: [
          [
            [
              [1, 1, 1, 1, 1],
              [-1, 1, 1, 0, 1],
              [-1, -1, 1, 0, 0],
              [1, -1, 1, 1, 0],
            ],
            [
              [1, 1, 1, 0, 1],
              [1, -1, 1, 0, 0],
              [1, -1, -1, 1, 0],
              [1, 1, -1, 1, 1],
            ],
            [
              [1, 1, 1, 1, 0],
              [1, 1, -1, 1, 1],
              [-1, 1, -1, 0, 1],
              [-1, 1, 1, 0, 0],
            ],
            [
              [-1, 1, 1, 1, 1],
              [-1, 1, -1, 0, 1],
              [-1, -1, -1, 0, 0],
              [-1, -1, 1, 1, 0],
            ],
            [
              [-1, -1, -1, 0, 0],
              [1, -1, -1, 1, 0],
              [1, -1, 1, 1, 1],
              [-1, -1, 1, 0, 1],
            ],
            [
              [1, -1, -1, 0, 0],
              [-1, -1, -1, 1, 0],
              [-1, 1, -1, 1, 1],
              [1, 1, -1, 0, 1],
            ],
          ],
          [
            [
              [1, 1, 0, 1, 1],
              [-1, 1, 0, 0, 1],
              [-1, -1, 0, 0, 0],
              [1, -1, 0, 1, 0],
            ],
          ],
        ],
        surfaces: [
          [
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
          [
            [
              [0, 1, 2],
              [0, 2, 3],
            ],
          ],
        ],
        translations: [
          [0, 0, 0],
          [0, 0, 1],
        ],
        rotations: [
          [
            [20, 1, 0, 0],
            [0, 0, 1, 0],
          ],
          [
            [20, 1, 0, 0],
            [0, 0, 1, 0],
          ],
        ],
        cameras: [
          [0, 2, 7, 0, 0, 0, 0, 1, 0],
          [0, 0, 7, 0, 0, 0, 0, 1, 0],
        ],
        perspectives: [
          [30, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1, 100],
          [30, canvas.width / canvas.height, 1, 100],
        ],
        unit: 1,
        velocity: 20,
        time: Date.now(),
      });
      drawRef.current = draw;
    },
    [],
  );

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    if (!image) return;
    draw({
      picture: [image, 0],
    });
  }, [image]);

  useFrameRequest(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw(({ rotations, velocity, time }) => {
      const timeEnd = Date.now();
      const timeStart = time;
      const timeSpan = timeEnd - timeStart;
      const newRotations = rotations.map((rotations) => {
        const [angle, rotationX, rotationY, rotationZ] = rotations[1];
        const angleStart = angle;
        const angleSpan = (velocity * timeSpan) / 1000;
        const angleEnd = (angleStart + angleSpan) % 360;
        return [rotations[0], [angleEnd, rotationX, rotationY, rotationZ]];
      }) as typeof rotations;
      return {
        rotations: newRotations,
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

export default Demo74;
