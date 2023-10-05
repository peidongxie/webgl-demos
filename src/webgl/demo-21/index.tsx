import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import { type ComponentProps } from '../../type';
import { Matrix4 } from '../lib/cuon-matrix';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制动画
 */
const Demo21: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const modelMatrixUniformLocationRef = useRef<WebGLUniformLocation | null>(
    null,
  );
  const vertexBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const vertices = useMemo(() => new Float32Array(points.flat()), [points]);
  const [timeStart] = useState(() => Date.now());
  const [[angleStart, angleStep]] = useState([0, 45]);
  const modelMatrixRef = useRef(new Matrix4());

  const animate = useCallback(() => {
    const time = Date.now();
    const timeSpan = time - timeStart;
    const angleSpan = (angleStep * timeSpan) / 1000;
    const angle = angleStart + angleSpan;
    return angle;
  }, [timeStart, angleStart, angleStep]);

  const draw = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = glRef.current;
      if (!gl) return;
      const modelMatrixUniformLocation = modelMatrixUniformLocationRef.current;
      if (!modelMatrixUniformLocation) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      /**
       * 调整模型矩阵，绘制
       */
      const modelMatrix = modelMatrixRef.current;
      modelMatrix.setRotate(angle, 0, 0, 1);
      gl.uniformMatrix4fv(
        modelMatrixUniformLocation,
        false,
        modelMatrix.elements,
      );
      gl.drawArrays(gl.TRIANGLES, 0, Math.floor(vertices.length / 2));
    },
    [vertices],
  );

  const tick = useCallback(() => {
    const angle = animate();
    draw(angle);
    requestAnimationFrame(tick);
  }, [animate, draw]);

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
    const modelMatrixUniformLocation = gl.getUniformLocation(
      gl.program,
      'u_ModelMatrix',
    );
    positionAttributeLocationRef.current = positionAttributeLocation;
    modelMatrixUniformLocationRef.current = modelMatrixUniformLocation;
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
    const vertexBuffer = vertexBufferRef.current;
    if (!vertexBuffer) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    tick();
  }, [vertices, tick]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo21;
