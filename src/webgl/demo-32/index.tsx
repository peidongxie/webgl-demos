import { type FC, useEffect, useRef } from 'react';

import { flatArray, useImage } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import CIRCLE_IMAGE from '../assets/circle.gif';
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
  u_Sampler0: WebGLUniformLocation | null;
  u_Sampler1: WebGLUniformLocation | null;
  positionTexCoordBuffer: WebGLBuffer | null;
  samplerTexture0: WebGLTexture | null;
  samplerTexture1: WebGLTexture | null;
  positionTexCoordArray: Float32Array;
  points: [number, number, number, number][];
  picture0: [TexImageSource, 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
  picture1: [TexImageSource, 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
}

const main = (gl: WebGLRenderingContext): StateChangeAction<DemoState> => {
  const draw = parseStateStore<DemoState>({
    // 着色器程序
    root: {
      deps: ['a_Position', 'a_TexCoord', 'u_Sampler0', 'u_Sampler1'],
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
    // 着色器变量：u_Sampler0
    u_Sampler0: {
      deps: ['samplerTexture0'],
      data: gl.getUniformLocation(gl.program, 'u_Sampler0'),
      onChange: ({ u_Sampler0, picture0 }) => {
        gl.uniform1i(u_Sampler0, picture0[1]);
      },
    },
    // 着色器变量：u_Sampler0
    u_Sampler1: {
      deps: ['samplerTexture1'],
      data: gl.getUniformLocation(gl.program, 'u_Sampler1'),
      onChange: ({ u_Sampler1, picture1 }) => {
        gl.uniform1i(u_Sampler1, picture1[1]);
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
    // 派生数据：采样器纹理0
    samplerTexture0: {
      deps: ['picture0'],
      data: gl.createTexture(),
      onChange: ({ samplerTexture0, picture0 }) => {
        const [source, unit] = picture0;
        gl.activeTexture(gl[`TEXTURE${unit}`]);
        gl.bindTexture(gl.TEXTURE_2D, samplerTexture0);
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
    // 派生数据：采样器纹理1
    samplerTexture1: {
      deps: ['picture1'],
      data: gl.createTexture(),
      onChange: ({ samplerTexture1, picture1 }) => {
        const [source, unit] = picture1;
        gl.activeTexture(gl[`TEXTURE${unit}`]);
        gl.bindTexture(gl.TEXTURE_2D, samplerTexture1);
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
    // 原子数据：图片0
    picture0: {
      deps: [],
      data: [new Image(), 0],
    },
    // 原子数据：图片1
    picture1: {
      deps: [],
      data: [new Image(), 0],
    },
  });
  return draw;
};

/**
 * 绘制多纹理
 */
const Demo32: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);
  const image0 = useImage(SKY_IMAGE);
  const image1 = useImage(CIRCLE_IMAGE);

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
    if (!image0) return;
    if (!image1) return;
    draw({
      points: [
        [-0.5, 0.5, 0, 1],
        [-0.5, -0.5, 0, 0],
        [0.5, 0.5, 1, 1],
        [0.5, -0.5, 1, 0],
      ],
      picture0: [image0, 0],
      picture1: [image1, 1],
    });
  }, [image0, image1]);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo32;
