import { type FC, useEffect, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import CIRCLE_IMAGE from '../assets/circle.gif';
import SKY_IMAGE from '../assets/sky.jpg';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import { useFloat32Array } from '../lib/react-utils';
import { useImage } from '../lib/react-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制多纹理
 */
const Demo32: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const texCoordAttributeRef = useRef(-1);
  const sampler0UniformRef = useRef<WebGLUniformLocation | null>(null);
  const sampler1UniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionTexCoordBufferRef = useRef<WebGLBuffer | null>(null);
  const imageTexture0Ref = useRef<WebGLTexture | null>(null);
  const imageTexture1Ref = useRef<WebGLTexture | null>(null);
  const [points] = useState<[number, number, number, number][]>([
    [-0.5, 0.5, 0, 1],
    [-0.5, -0.5, 0, 0],
    [0.5, 0.5, 1, 1],
    [0.5, -0.5, 1, 0],
  ]);
  const positionsTexCoords = useFloat32Array(points);
  const [src0] = useState<string>(SKY_IMAGE);
  const [src1] = useState<string>(CIRCLE_IMAGE);
  const image0 = useImage(src0);
  const image1 = useImage(src1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = glRef.current;
    if (gl) return;
    glRef.current = getWebGLContext(canvasRef.current);
  }, []);

  useEffect(
    () => () => {
      glRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (success) {
      /**
       * 变量位置
       */
      const positionAttribute = gl.getAttribLocation(gl.program, 'a_Position');
      const texCoordAttribute = gl.getAttribLocation(gl.program, 'a_TexCoord');
      const sampler0Uniform = gl.getUniformLocation(gl.program, 'u_Sampler0');
      const sampler1Uniform = gl.getUniformLocation(gl.program, 'u_Sampler1');
      positionAttributeRef.current = positionAttribute;
      texCoordAttributeRef.current = texCoordAttribute;
      sampler0UniformRef.current = sampler0Uniform;
      sampler1UniformRef.current = sampler1Uniform;
      /**
       * 缓冲区
       */
      const positionTexCoordBuffer = gl.createBuffer();
      positionTexCoordBufferRef.current = positionTexCoordBuffer;
      /**
       * 纹理对象
       */
      const imageTexture0 = gl.createTexture();
      const imageTexture1 = gl.createTexture();
      imageTexture0Ref.current = imageTexture0;
      imageTexture1Ref.current = imageTexture1;
      /**
       * 清空设置
       */
      gl.clearColor(0, 0, 0, 1);
    }
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute < 0) return;
    const texCoordAttribute = texCoordAttributeRef.current;
    if (texCoordAttribute < 0) return;
    const sampler0Uniform = sampler0UniformRef.current;
    if (!sampler0Uniform) return;
    const sampler1Uniform = sampler1UniformRef.current;
    if (!sampler1Uniform) return;
    const positionTexCoordBuffer = positionTexCoordBufferRef.current;
    if (!positionTexCoordBuffer) return;
    const imageTexture0 = imageTexture0Ref.current;
    if (!imageTexture0) return;
    const imageTexture1 = imageTexture1Ref.current;
    if (!imageTexture1) return;
    if (!image0) return;
    if (!image1) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsTexCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      positionAttribute,
      2,
      gl.FLOAT,
      false,
      positionsTexCoords.BYTES_PER_ELEMENT * 4,
      0,
    );
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(
      texCoordAttribute,
      2,
      gl.FLOAT,
      false,
      positionsTexCoords.BYTES_PER_ELEMENT * 4,
      positionsTexCoords.BYTES_PER_ELEMENT * 2,
    );
    gl.enableVertexAttribArray(texCoordAttribute);
    /**
     * 图像分配给纹理对象并分配到变量
     */
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image0);
    gl.uniform1i(sampler0Uniform, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.uniform1i(sampler1Uniform, 1);
    /**
     * 绘制
     */
    gl.drawArrays(
      gl.TRIANGLE_STRIP,
      0,
      Math.floor(positionsTexCoords.length / 4),
    );
  }, [positionsTexCoords, image0, image1]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo32;
