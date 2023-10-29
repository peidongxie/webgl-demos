import { type FC, useEffect, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import { useFloat32Array } from '../lib/react-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 渐变
 */
const Demo27: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const colorAttributeRef = useRef(-1);
  const positionColorBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number, number, number, number][]>([
    [0, 0.5, 1, 0, 0],
    [-0.5, -0.5, 0, 1, 0],
    [0.5, -0.5, 0, 0, 1],
  ]);
  const positionsColors = useFloat32Array(points);

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
      const colorAttribute = gl.getAttribLocation(gl.program, 'a_Color');
      positionAttributeRef.current = positionAttribute;
      colorAttributeRef.current = colorAttribute;
      /**
       * 缓冲区
       */
      const positionColorBuffer = gl.createBuffer();
      positionColorBufferRef.current = positionColorBuffer;
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
    const colorAttribute = colorAttributeRef.current;
    if (colorAttribute < 0) return;
    const positionColorBuffer = positionColorBufferRef.current;
    if (!positionColorBuffer) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      positionAttribute,
      2,
      gl.FLOAT,
      false,
      positionsColors.BYTES_PER_ELEMENT * 5,
      0,
    );
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(
      colorAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColors.BYTES_PER_ELEMENT * 5,
      positionsColors.BYTES_PER_ELEMENT * 2,
    );
    gl.enableVertexAttribArray(colorAttribute);
    /**
     * 绘制
     */
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(positionsColors.length / 5));
  }, [positionsColors]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo27;
