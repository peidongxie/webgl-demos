import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import { Matrix4 } from '../lib/cuon-matrix';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import { useFloat32Array } from '../lib/react-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制动画
 */
const Demo21: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const modelMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const positions = useFloat32Array(points);
  const [timeStart] = useState(() => Date.now());
  const [[angleStart, angleStep]] = useState([0, 45]);
  const modelMatrixRef = useRef(new Matrix4());

  const animate = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;
    const modelMatrixUniform = modelMatrixUniformRef.current;
    if (!modelMatrixUniform) return;
    /**
     * 数据直接分配到变量
     */
    const time = Date.now();
    const timeSpan = time - timeStart;
    const angleSpan = (angleStep * timeSpan) / 1000;
    const angle = angleStart + angleSpan;
    const modelMatrix = modelMatrixRef.current;
    modelMatrix.setRotate(angle, 0, 0, 1);
    gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix.elements);
  }, [timeStart, angleStart, angleStep]);

  const draw = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(positions.length / 2));
  }, [positions]);

  const tick = useCallback(() => {
    animate();
    draw();
    requestAnimationFrame(tick);
  }, [animate, draw]);

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
      const modelMatrixUniform = gl.getUniformLocation(
        gl.program,
        'u_ModelMatrix',
      );
      positionAttributeRef.current = positionAttribute;
      modelMatrixUniformRef.current = modelMatrixUniform;
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
    /**
     * 动画帧
     */
    tick();
  }, [tick]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo21;
