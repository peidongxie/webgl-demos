import { type FC, useCallback, useEffect, useRef } from 'react';

import { flatArray, useImage } from '../../lib/react-utils';
import { type ComponentProps, type Tuple } from '../../type';
import SKY_IMAGE from '../assets/sky.jpg';
import Canvas from '../lib/canvas-component';
import {
  parseStateStore,
  type StateChangeAction,
  type StateWithRoot,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_TexCoord: GLint;
  u_Sampler: WebGLUniformLocation | null;
  positionTexCoordBuffer: WebGLBuffer | null;
  samplerTexture: WebGLTexture | null;
  positionTexCoordArray: Float32Array;
  points: Tuple<Tuple<number, 4>, 4>;
  picture: [TexImageSource, 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
}>;

/**
 * 绘制纹理
 */
const Demo29: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);
  const image = useImage(SKY_IMAGE);

  const handleProgramInit = useCallback(
    (_: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: ['a_Position', 'a_TexCoord', 'u_Sampler'],
          data: () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            return 1;
          },
          onChange: ({ points }) => {
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['positionTexCoordBuffer'],
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Position',
          ),
          onChange: ({ a_Position, positionTexCoordArray }) => {
            gl.vertexAttribPointer(
              a_Position,
              2,
              gl.FLOAT,
              false,
              positionTexCoordArray.BYTES_PER_ELEMENT * 4,
              0,
            );
            gl.enableVertexAttribArray(a_Position);
          },
        },
        // 着色器变量：a_TexCoord
        a_TexCoord: {
          deps: ['positionTexCoordBuffer'],
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_TexCoord',
          ),
          onChange: ({ a_TexCoord, positionTexCoordArray }) => {
            gl.vertexAttribPointer(
              a_TexCoord,
              2,
              gl.FLOAT,
              false,
              positionTexCoordArray.BYTES_PER_ELEMENT * 4,
              positionTexCoordArray.BYTES_PER_ELEMENT * 2,
            );
            gl.enableVertexAttribArray(a_TexCoord);
          },
        },
        // 着色器变量：u_Sampler
        u_Sampler: {
          deps: ['samplerTexture'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_Sampler',
          ),
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
          data: new Float32Array(16),
          onChange: ({ positionTexCoordArray, points }) => {
            positionTexCoordArray.set(flatArray(points));
          },
        },
        // 原子数据：顶点
        points: {
          deps: [],
        },
        // 原子数据：图片
        picture: {
          deps: [],
        },
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
      points: [
        [-0.5, 0.5, 0, 1],
        [-0.5, -0.5, 0, 0],
        [0.5, 0.5, 1, 1],
        [0.5, -0.5, 1, 0],
      ],
      picture: [image, 0],
    });
  }, [image]);

  return (
    <Canvas
      glVertexShader={VSHADER_SOURCE}
      glFragmentShader={FSHADER_SOURCE}
      onProgramInit={handleProgramInit}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo29;
