import { type FC, useEffect, useRef } from 'react';

import { flatArray, useImage } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import SKY_IMAGE from '../assets/sky.jpg';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  a_TexCoord: GLint;
  u_Sampler: WebGLUniformLocation | null;
  positionTexCoordBuffer: WebGLBuffer | null;
  samplerTexture: WebGLTexture | null;
  positionTexCoordArray: Float32Array;
  points: [number, number, number, number][];
  picture: [TexImageSource, 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
}

const main = (gl: WebGLRenderingContext): StateChangeAction<DemoState> => {
  const draw = parseStateStore<DemoState>({
    // 着色器程序
    root: {
      deps: ['a_Position', 'a_TexCoord', 'u_Sampler'],
      data: () => {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
      onChange: ({ points }) => {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
      },
    },
    // 着色器变量：a_Position
    a_Position: {
      deps: ['positionTexCoordBuffer'],
      data: gl.getAttribLocation(gl.program, 'a_Position'),
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
      data: gl.getAttribLocation(gl.program, 'a_TexCoord'),
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
      data: gl.getUniformLocation(gl.program, 'u_Sampler'),
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
        gl.bufferData(gl.ARRAY_BUFFER, positionTexCoordArray, gl.STATIC_DRAW);
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
      data: [],
    },
    // 原子数据：图片
    picture: {
      deps: [],
      data: [new Image(), 0],
    },
  });
  return draw;
};

/**
 * 绘制重复纹理
 */
const Demo30: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);
  const image = useImage(SKY_IMAGE);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    drawRef.current = main(gl);
  }, []);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    if (!image) return;
    draw({
      points: [
        [-0.5, 0.5, -0.3, 1.7],
        [-0.5, -0.5, -0.3, -0.2],
        [0.5, 0.5, 1.7, 1.7],
        [0.5, -0.5, 1.7, -0.2],
      ],
      picture: [image, 0],
    });
  }, [image]);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo30;
