import { type FC, useEffect, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import { useFloat32Array } from '../lib/react-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 多缓冲绘制点
 */
const Demo24: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const pointSizeAttributeRef = useRef(-1);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const sizeBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number, number][]>([
    [0, 0.5, 10],
    [-0.5, -0.5, 20],
    [0.5, -0.5, 30],
  ]);
  const [positionsMask] = useState([1, 1, 0]);
  const [sizesMask] = useState([0, 0, 1]);
  const positions = useFloat32Array(points, positionsMask);
  const sizes = useFloat32Array(points, sizesMask);

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

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    /**
     * 变量位置
     */
    const positionAttribute = gl.getAttribLocation(gl.program, 'a_Position');
    const pointSizeAttribute = gl.getAttribLocation(gl.program, 'a_PointSize');
    positionAttributeRef.current = positionAttribute;
    pointSizeAttributeRef.current = pointSizeAttribute;
    /**
     * 缓冲区
     */
    const positionBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    positionBufferRef.current = positionBuffer;
    sizeBufferRef.current = sizeBuffer;
    /**
     * 清空设置
     */
    gl.clearColor(0, 0, 0, 1);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute < 0) return;
    const positionBuffer = positionBufferRef.current;
    if (!positionBuffer) return;
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribute);
  }, [positions]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const pointSizeAttribute = pointSizeAttributeRef.current;
    if (pointSizeAttribute < 0) return;
    const sizeBuffer = sizeBufferRef.current;
    if (!sizeBuffer) return;
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    gl.vertexAttribPointer(pointSizeAttribute, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pointSizeAttribute);
  }, [sizes]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, Math.floor(positions.length / 2));
  }, [positions, sizes]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo24;
