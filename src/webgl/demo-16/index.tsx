import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import { useFloat32Array } from '../lib/react-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 矩阵旋转
 */
const Demo16: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const xformMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const positions = useFloat32Array(points);
  const [angle] = useState(90);
  const xformMatrix = useMemo(() => {
    const radian = (Math.PI * angle) / 180;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return new Float32Array([
      cos,
      sin,
      0,
      0,
      -sin,
      cos,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ]);
  }, [angle]);

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
      const xformMatrixUniform = gl.getUniformLocation(
        gl.program,
        'u_xformMatrix',
      );
      positionAttributeRef.current = positionAttribute;
      xformMatrixUniformRef.current = xformMatrixUniform;
      /**
       * 缓冲区
       */
      const positionBuffer = gl.createBuffer();
      positionBufferRef.current = positionBuffer;
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
    const xformMatrixUniform = xformMatrixUniformRef.current;
    if (!xformMatrixUniform) return;
    const positionBuffer = positionBufferRef.current;
    if (!positionBuffer) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribute);
    gl.uniformMatrix4fv(xformMatrixUniform, false, xformMatrix);
    /**
     * 绘制
     */
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(positions.length / 2));
  }, [positions, xformMatrix]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo16;
