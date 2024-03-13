import {
  type FC,
  type PointerEventHandler,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import Canvas from '../../component/canvas';
import {
  flatArray,
  makeWebGLDraw,
  Matrix4,
  type StateChangeAction,
  type StateWithRoot,
  useImage,
} from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import SKY_IMAGE from '../assets/sky.jpg';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_TexCoord: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_Sampler: WebGLUniformLocation | null;
  positionTexCoordBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  samplerTexture: WebGLTexture | null;
  positionTexCoordArray: Float32Array;
  indexArray: Uint8Array;
  mvpMatrix: Matrix4;
  points: Tuple<Tuple<Tuple<number, 5>, 4>, 6>;
  surfaces: Tuple<Tuple<Tuple<number, 3>, 2>, 6>;
  rotations: Tuple<Tuple<number, 4>, 2>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  picture: [TexImageSource, 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
  dragging: boolean;
  base: [number, number];
}>;

/**
 * 拖拽旋转
 */
const Demo63: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);
  const image = useImage(SKY_IMAGE);

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
        VSHADER_SOURCE,
        FSHADER_SOURCE,
        (program) => ({
          // 着色器程序
          root: {
            deps: ['a_Position', 'a_TexCoord', 'u_MvpMatrix', 'u_Sampler'],
            type: 'dynamic',
            data: () => {
              gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
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
            deps: ['positionTexCoordBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionTexCoordArray }) => {
              gl.vertexAttribPointer(
                a_Position,
                3,
                gl.FLOAT,
                false,
                positionTexCoordArray.BYTES_PER_ELEMENT * 5,
                0,
              );
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_TexCoord
          a_TexCoord: {
            deps: ['positionTexCoordBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_TexCoord'),
            onChange: ({ a_TexCoord, positionTexCoordArray }) => {
              gl.vertexAttribPointer(
                a_TexCoord,
                2,
                gl.FLOAT,
                false,
                positionTexCoordArray.BYTES_PER_ELEMENT * 5,
                positionTexCoordArray.BYTES_PER_ELEMENT * 3,
              );
              gl.enableVertexAttribArray(a_TexCoord);
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
          // 着色器变量：u_Sampler
          u_Sampler: {
            deps: ['samplerTexture'],
            data: gl.getUniformLocation(program!, 'u_Sampler'),
            onChange: ({ u_Sampler, picture }) => {
              gl.uniform1i(u_Sampler, picture[1]);
            },
          },
          // 派生数据：顶点位置坐标缓冲区
          positionTexCoordBuffer: {
            deps: ['positionTexCoordArray'],
            data: gl.createBuffer(),
            onChange: ({ positionTexCoordBuffer, positionTexCoordArray }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionTexCoordBuffer);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionTexCoordArray,
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
          // 派生数据：顶点位置坐标数组
          positionTexCoordArray: {
            deps: ['points'],
            data: new Float32Array(5 * 4 * 6),
            onChange: ({ positionTexCoordArray, points }) => {
              positionTexCoordArray.set(flatArray(points));
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
          // 原子数据：图片
          picture: {
            deps: [],
          },
          // 原子数据：拖动
          dragging: {
            deps: [],
          },
          // 原子数据：基准位置
          base: {
            deps: [],
          },
        }),
      );
      draw({
        points: [
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
        ],
        camera: [3, 3, 7, 0, 0, 0, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
        dragging: false,
        base: [0, 0],
      });
      drawRef.current = draw;
    },
    [],
  );

  const handlePointerDown = useCallback<PointerEventHandler<HTMLCanvasElement>>(
    (event) => {
      const canvas = event.target as HTMLCanvasElement;
      if (!canvas) return;
      const draw = drawRef.current;
      if (!draw) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      const clientRect = canvas.getBoundingClientRect();
      const baseX = (100 * clientX) / canvas.height;
      const baseY = (100 * clientY) / canvas.height;
      if (
        clientRect.left <= clientX &&
        clientX < clientRect.right &&
        clientRect.top <= clientY &&
        clientY < clientRect.bottom
      ) {
        draw({
          dragging: true,
          base: [baseX, baseY],
        });
      }
    },
    [],
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLCanvasElement>>(
    (event) => {
      const canvas = event.target as HTMLCanvasElement;
      if (!canvas) return;
      const draw = drawRef.current;
      if (!draw) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      const clientRect = canvas.getBoundingClientRect();
      const baseX = (100 * clientX) / canvas.height;
      const baseY = (100 * clientY) / canvas.height;
      draw(({ rotations, dragging, base }) => {
        if (
          dragging &&
          clientRect.left <= clientX &&
          clientX < clientRect.right &&
          clientRect.top <= clientY &&
          clientY < clientRect.bottom
        ) {
          const offsetX = baseX - base[0];
          const offsetY = baseY - base[1];
          return {
            rotations: [
              [Math.max(Math.min(rotations[0][0] + offsetY, 90), -90), 1, 0, 0],
              [rotations[1][0] + offsetX, 0, 1, 0],
            ],
            base: [baseX, baseY],
          };
        }
        return;
      });
    },
    [],
  );

  const handlePointerUp = useCallback<
    PointerEventHandler<HTMLCanvasElement>
  >(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw({
      dragging: false,
    });
  }, []);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    if (!image) return;
    draw({
      picture: [image, 0],
    });
  }, [image]);

  return (
    <Canvas
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo63;
