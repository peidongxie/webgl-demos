import { useEffect, useRef, useState, type FC } from 'react';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface Demo04Props {
  [key: string]: never;
}

/**
 * 动态绘制点
 */
const Demo04: FC<Demo04Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const [point] = useState<[number, number]>([0, 0]);

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
    positionAttributeLocationRef.current = positionAttributeLocation;
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
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据分配到变量，绘制
     */
    const [x, y] = point;
    gl.vertexAttrib3f(positionAttributeLocation, x, y, 0);
    gl.drawArrays(gl.POINTS, 0, 1);
  }, [point]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo04;