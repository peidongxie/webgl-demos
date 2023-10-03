import { useEffect, useRef, type FC } from 'react';
import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制点
 */
const Demo03: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);

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
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 绘制
     */
    gl.drawArrays(gl.POINTS, 0, 1);
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo03;
