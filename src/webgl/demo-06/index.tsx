import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type MouseEventHandler,
} from 'react';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface Demo06Props {
  [key: string]: never;
}

/**
 * 绘制多色点
 */
const Demo06: FC<Demo06Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const fragColorUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
  const [points, setPoints] = useState<
    [number, number, number, number, number, number][]
  >([]);

  const handleCanvasMouseDown = useCallback<
    MouseEventHandler<HTMLCanvasElement>
  >((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = glRef.current;
    if (!gl) return;
    /**
     * 确定点的坐标和颜色
     */
    const clientX = event.clientX;
    const clientY = event.clientY;
    const clientRect = canvas.getBoundingClientRect();
    const x =
      (clientX - clientRect.left - canvas.width / 2) / (canvas.width / 2);
    const y =
      (canvas.height / 2 - (clientY - clientRect.top)) / (canvas.height / 2);
    const red = Number(x >= 0 || y >= 0);
    const green = Number(x < 0 || y < 0);
    const blue = red && green;
    const alpha = 1;
    const point: [number, number, number, number, number, number] = [
      x,
      y,
      red,
      green,
      blue,
      alpha,
    ];
    setPoints((points) => [...points, point]);
  }, []);

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
    const fragColorUniformLocation = gl.getUniformLocation(
      gl.program,
      'u_FragColor',
    );
    positionAttributeLocationRef.current = positionAttributeLocation;
    fragColorUniformLocationRef.current = fragColorUniformLocation;
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
    const fragColorUniformLocation = fragColorUniformLocationRef.current;
    if (!fragColorUniformLocation) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据分配到变量，绘制
     */
    for (const [x, y, red, green, blue, alpha] of points) {
      gl.vertexAttrib3f(positionAttributeLocation, x, y, 0);
      gl.uniform4f(fragColorUniformLocation, red, green, blue, alpha);
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

export default Demo06;
