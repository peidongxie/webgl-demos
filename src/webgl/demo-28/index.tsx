import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 逐片元渐变
 */
const Demo28: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const widthUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const heightUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const vertexBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const vertices = useMemo(() => new Float32Array(points.flat()), [points]);

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
      const widthUniformLocation = gl.getUniformLocation(gl.program, 'u_Width');
      const heightUniformLocation = gl.getUniformLocation(
        gl.program,
        'u_Height',
      );
      positionAttributeLocationRef.current = positionAttributeLocation;
      widthUniformLocationRef.current = widthUniformLocation;
      heightUniformLocationRef.current = heightUniformLocation;
      /**
       * 缓冲区
       */
      const vertexBuffer = gl.createBuffer();
      vertexBufferRef.current = vertexBuffer;
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
    const widthUniformLocation = widthUniformLocationRef.current;
    if (!widthUniformLocation) return;
    const heightUniformLocation = heightUniformLocationRef.current;
    if (!heightUniformLocation) return;
    const vertexBuffer = vertexBufferRef.current;
    if (!vertexBuffer) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量，绘制
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.uniform1f(widthUniformLocation, gl.drawingBufferWidth);
    gl.uniform1f(heightUniformLocation, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(vertices.length / 2));
  }, [vertices]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo28;
