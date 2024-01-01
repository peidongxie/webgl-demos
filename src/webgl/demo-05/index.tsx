import {
  type FC,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 点击绘制点
 */
const Demo05: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const [points, setPoints] = useState<[number, number][]>([]);

  const handleCanvasMouseDown = useCallback<
    MouseEventHandler<HTMLCanvasElement>
  >((event) => {
    const canvas = event.target as HTMLCanvasElement;
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
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    /**
     * 变量位置
     */
    const positionAttribute = gl.getAttribLocation(gl.program, 'a_Position');
    positionAttributeRef.current = positionAttribute;
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
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const point of points) {
      /**
       * 数据直接分配到变量
       */
      const [x, y] = point;
      gl.vertexAttrib3f(positionAttribute, x, y, 0);
      /**
       * 绘制
       */
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }, [points]);

  return (
    <Canvas
      onMouseDown={handleCanvasMouseDown}
      ref={glRef}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

export default Demo05;
