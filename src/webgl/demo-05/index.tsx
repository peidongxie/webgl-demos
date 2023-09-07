import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type MouseEventHandler,
} from 'react';
import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 点击绘制点
 */
const Demo05: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const [points, setPoints] = useState<[number, number][]>([]);

  const handleCanvasMouseDown = useCallback<
    MouseEventHandler<HTMLCanvasElement>
  >((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = glRef.current;
    if (!gl) return;
    /**
     * 确定点的坐标
     */
    const clientX = event.clientX;
    const clientY = event.clientY;
    const clientRect = canvas.getBoundingClientRect();
    const x =
      (clientX - clientRect.left - canvas.width / 2) / (canvas.width / 2);
    const y =
      (canvas.height / 2 - (clientY - clientRect.top)) / (canvas.height / 2);
    const point: [number, number] = [x, y];
    setPoints((points) => [...points, point]);
  }, []);

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
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据分配到变量，绘制
     */
    for (const [x, y] of points) {
      gl.vertexAttrib3f(positionAttributeLocation, x, y, 0);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }, [points]);

  return (
    <canvas
      onMouseDown={handleCanvasMouseDown}
      ref={canvasRef}
      style={{ width: '100vw', height: '100vh' }}
    >
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo05;
