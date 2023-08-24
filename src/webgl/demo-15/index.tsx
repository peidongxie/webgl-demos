import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 向量旋转
 */
const Demo15: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const cosUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const sinUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const vertexBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const vertices = useMemo(() => new Float32Array(points.flat()), [points]);
  const [angle] = useState(90);
  const [cos, sin] = useMemo(() => {
    const radian = (Math.PI * angle) / 180;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return [cos, sin] as const;
  }, [angle]);

  useEffect(() => {
    /**
     * 画布
     */
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    /**
     * 上下文
     */
    const gl = getWebGLContext(canvas);
    if (!gl || !initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;
    glRef.current = gl;
    /**
     * 变量位置
     */
    const positionAttributeLocation = gl.getAttribLocation(
      gl.program,
      'a_Position',
    );
    const cosUniformLocation = gl.getUniformLocation(gl.program, 'u_CosB');
    const sinUniformLocation = gl.getUniformLocation(gl.program, 'u_SinB');
    positionAttributeLocationRef.current = positionAttributeLocation;
    cosUniformLocationRef.current = cosUniformLocation;
    sinUniformLocationRef.current = sinUniformLocation;
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
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = glRef.current;
    if (!gl) return;
    const positionAttributeLocation = positionAttributeLocationRef.current;
    if (positionAttributeLocation < 0) return;
    const cosUniformLocation = cosUniformLocationRef.current;
    if (!cosUniformLocation) return;
    const sinUniformLocation = sinUniformLocationRef.current;
    if (!sinUniformLocation) return;
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
    gl.uniform1f(cosUniformLocation, cos);
    gl.uniform1f(sinUniformLocation, sin);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(vertices.length / 2));
  }, [vertices, cos, sin]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo15;
