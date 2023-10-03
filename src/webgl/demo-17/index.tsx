import { useEffect, useRef, useState, type FC } from 'react';
import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 缩放三角-矩阵
 */
const Demo17: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const transformMatrixUniformLocationRef = useRef<WebGLUniformLocation | null>(
    null,
  );
  const vertexBufferRef = useRef<WebGLBuffer | null>(null);
  const [vertices] = useState(
    () => new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]),
  );
  const [transformMatrix] = useState(() => {
    const scale = [1.0, 1.5, 1.0];
    return new Float32Array([
      scale[0],
      0,
      0,
      0,
      0,
      scale[1],
      0,
      0,
      0,
      0,
      scale[2],
      0,
      0,
      0,
      0,
      1,
    ]);
  });

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
    const transformMatrixUniformLocation = gl.getUniformLocation(
      gl.program,
      'u_xformMatrix',
    );
    positionAttributeLocationRef.current = positionAttributeLocation;
    transformMatrixUniformLocationRef.current = transformMatrixUniformLocation;
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
    const transformMatrixUniformLocation =
      transformMatrixUniformLocationRef.current;
    if (!transformMatrixUniformLocation) return;
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
    gl.uniformMatrix4fv(transformMatrixUniformLocation, false, transformMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(vertices.length / 2));
  }, [vertices, transformMatrix]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo17;
