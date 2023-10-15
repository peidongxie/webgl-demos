import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制矩形
 */
const Demo12: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const vertexBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [-0.5, 0.5],
    [-0.5, -0.5],
    [0.5, 0.5],
    [0.5, -0.5],
  ]);
  const vertices = useMemo(() => new Float32Array(points.flat()), [points]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && !glRef.current) {
      const gl = getWebGLContext(canvasRef.current);
      if (gl && initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        /**
         * 变量位置
         */
        const positionAttributeLocation = gl.getAttribLocation(
          gl.program,
          'a_Position',
        );
        positionAttributeLocationRef.current = positionAttributeLocation;
        /**
         * 缓冲区
         */
        const vertexBuffer = gl.createBuffer();
        vertexBufferRef.current = vertexBuffer;
        /**
         * 清空
         */
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      glRef.current = gl;
    }
    return () => {
      glRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = glRef.current;
    if (!gl) return;
    const positionAttributeLocation = positionAttributeLocationRef.current;
    if (positionAttributeLocation < 0) return;
    const vertexBuffer = vertexBufferRef.current;
    if (!vertexBuffer) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量，绘制
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Math.floor(vertices.length / 2));
  }, [vertices]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo12;
