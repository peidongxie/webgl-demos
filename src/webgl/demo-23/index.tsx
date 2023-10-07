import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type GuiOptions, type GuiSchema, useGui } from '../../lib/gui-utils';
import { type ComponentProps } from '../../type';
import { Matrix4 } from '../lib/cuon-matrix';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import { useFloat32Array } from '../lib/react-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 控制复合动画
 */
const Demo23: FC<ComponentProps> = () => {
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
  const timeRef = useRef(Date.now());
  const angleRef = useRef(0);
  const stepRef = useRef(45);
  const modelMatrixRef = useRef(new Matrix4());
  const schemas = useMemo<GuiSchema[]>(() => {
    return [
      {
        type: 'function',
        name: 'UP',
        initialValue: () => {
          stepRef.current += 10;
        },
      },
      {
        type: 'function',
        name: 'DOWN',
        initialValue: () => {
          stepRef.current -= 10;
        },
      },
    ];
  }, []);
  const options = useMemo<GuiOptions>(
    () => ({
      container: '#gui-demo',
      title: '速度控件',
    }),
    [],
  );

  const animate = useCallback(() => {
    const timeEnd = Date.now();
    const timeStart = timeRef.current;
    const timeSpan = timeEnd - timeStart;
    const angleStart = angleRef.current;
    const angleSpan = (stepRef.current * timeSpan) / 1000;
    const angleEnd = angleStart + angleSpan;
    timeRef.current = timeEnd;
    angleRef.current = angleEnd;
  }, []);

  const draw = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;
    const modelMatrixUniform = modelMatrixUniformRef.current;
    if (!modelMatrixUniform) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 调整模型矩阵
     */
    const modelMatrix = modelMatrixRef.current;
    const angle = angleRef.current;
    modelMatrix.setRotate(angle, 0, 0, 1);
    modelMatrix.translate(0.35, 0, 0);
    gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix.elements);
    /**
     * 绘制
     */
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(positions.length / 2));
  }, [positions]);

  const tick = useCallback(() => {
    animate();
    draw();
    requestAnimationFrame(tick);
  }, [animate, draw]);

  useGui(schemas, options);

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
    tick();
  }, [positions, tick]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo23;
