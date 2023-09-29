import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 渐变
 */
const Demo27: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const colorAttributeLocationRef = useRef(-1);
  const vertexColorBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number, number, number, number][]>([
    [0, 0.5, 1, 0, 0],
    [-0.5, -0.5, 0, 1, 0],
    [0.5, -0.5, 0, 0, 1],
  ]);
  const verticesColors = useMemo(
    () => new Float32Array(points.flat()),
    [points],
  );

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
      const positionAttributeLocation = gl.getAttribLocation(
        gl.program,
        'a_Position',
      );
      const colorAttributeLocation = gl.getAttribLocation(
        gl.program,
        'a_Color',
      );
      positionAttributeLocationRef.current = positionAttributeLocation;
      colorAttributeLocationRef.current = colorAttributeLocation;
      /**
       * 缓冲区
       */
      const vertexBuffer = gl.createBuffer();
      vertexColorBufferRef.current = vertexBuffer;
      /**
       * 清空设置
       */
      gl.clearColor(0, 0, 0, 1);
    }
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttributeLocation = positionAttributeLocationRef.current;
    if (positionAttributeLocation < 0) return;
    const colorAttributeLocation = colorAttributeLocationRef.current;
    if (colorAttributeLocation < 0) return;
    const vertexColorBuffer = vertexColorBufferRef.current;
    if (!vertexColorBuffer) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量，绘制
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      positionAttributeLocation,
      2,
      gl.FLOAT,
      false,
      verticesColors.BYTES_PER_ELEMENT * 5,
      0,
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(
      colorAttributeLocation,
      3,
      gl.FLOAT,
      false,
      verticesColors.BYTES_PER_ELEMENT * 5,
      verticesColors.BYTES_PER_ELEMENT * 2,
    );
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(verticesColors.length / 5));
  }, [verticesColors]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo27;
