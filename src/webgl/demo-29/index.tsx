import { type FC, useEffect, useRef, useState } from 'react';

import { useFloat32Array } from '../../lib/react-utils';
import { useImage } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import SKY_IMAGE from '../assets/sky.jpg';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制纹理
 */
const Demo29: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const texCoordAttributeRef = useRef(-1);
  const samplerUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionTexCoordBufferRef = useRef<WebGLBuffer | null>(null);
  const imageTextureRef = useRef<WebGLTexture | null>(null);
  const [points] = useState<[number, number, number, number][]>([
    [-0.5, 0.5, 0, 1],
    [-0.5, -0.5, 0, 0],
    [0.5, 0.5, 1, 1],
    [0.5, -0.5, 1, 0],
  ]);
  const positionsTexCoords = useFloat32Array(points);
  const [src] = useState<string>(SKY_IMAGE);
  const image = useImage(src);
  const [deps, setDeps] = useState<
    [Float32Array | null, number | null, HTMLImageElement | null]
  >([null, null, null]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    /**
     * 变量位置
     */
    const positionAttribute = gl.getAttribLocation(gl.program, 'a_Position');
    const texCoordAttribute = gl.getAttribLocation(gl.program, 'a_TexCoord');
    const samplerUniform = gl.getUniformLocation(gl.program, 'u_Sampler');
    positionAttributeRef.current = positionAttribute;
    texCoordAttributeRef.current = texCoordAttribute;
    samplerUniformRef.current = samplerUniform;
    /**
     * 缓冲区
     */
    const positionTexCoordBuffer = gl.createBuffer();
    positionTexCoordBufferRef.current = positionTexCoordBuffer;
    /**
     * 纹理
     */
    const imageTexture = gl.createTexture();
    imageTextureRef.current = imageTexture;
    /**
     * 清空和变量设置
     */
    gl.clearColor(0, 0, 0, 1);
    positionAttribute >= 0 && gl.enableVertexAttribArray(positionAttribute);
    texCoordAttribute >= 0 && gl.enableVertexAttribArray(texCoordAttribute);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute < 0) return;
    const texCoordAttribute = texCoordAttributeRef.current;
    if (texCoordAttribute < 0) return;
    const positionTexCoordBuffer = positionTexCoordBufferRef.current;
    if (!positionTexCoordBuffer) return;
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
    gl.vertexAttribPointer(
      texCoordAttribute,
      2,
      gl.FLOAT,
      false,
      positionsTexCoords.BYTES_PER_ELEMENT * 4,
      positionsTexCoords.BYTES_PER_ELEMENT * 2,
    );
    setDeps((deps) => [positionsTexCoords, deps[1], deps[2]]);
  }, [positionsTexCoords]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const samplerUniform = samplerUniformRef.current;
    if (!samplerUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniform1i(samplerUniform, 0);
    setDeps((deps) => [deps[0], 0, deps[2]]);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const imageTexture = imageTextureRef.current;
    if (!imageTexture) return;
    if (!image) return;
    /**
     * 图像分配到纹理
     */
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    setDeps((deps) => [deps[0], deps[1], image]);
  }, [image]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Math.floor(deps[0]!.length / 4));
  }, [deps]);

  return <Canvas ref={glRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Demo29;
