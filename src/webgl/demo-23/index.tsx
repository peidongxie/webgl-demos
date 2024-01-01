import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type GuiOptions, type GuiSchema, useGui } from '../../lib/gui-utils';
import { useFloat32Array, useFrameRequest } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 控制复合动画
 */
const Demo23: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const modelMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const positions = useFloat32Array(points);
  const rotationRef = useRef<[number, number, number, number]>([0, 0, 0, 1]);
  const translationRef = useRef<[number, number, number]>([0.35, 0, 0]);
  const velocityRef = useRef(45);
  const timeRef = useRef(Date.now());
  const modelMatrixRef = useRef<Matrix4 | null>(null);
  if (!modelMatrixRef.current) modelMatrixRef.current = new Matrix4();
  const [deps, setDeps] = useState<[Float32Array | null]>([null]);
  const schemas = useMemo<GuiSchema[]>(() => {
    return [
      {
        type: 'function',
        name: '逆时针转速增大',
        initialValue: () => {
          velocityRef.current += 10;
        },
      },
      {
        type: 'function',
        name: '顺时针转速增加',
        initialValue: () => {
          velocityRef.current -= 10;
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

  useGui(schemas, options);

  const tick = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;
    const modelMatrixUniform = modelMatrixUniformRef.current;
    if (!modelMatrixUniform) return;
    const modelMatrix = modelMatrixRef.current;
    if (!modelMatrix) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 数据直接分配到变量
     */
    const [angle, rotationX, rotationY, rotationZ] = rotationRef.current;
    const [translationX, translationY, translationZ] = translationRef.current;
    const timeEnd = Date.now();
    const timeStart = timeRef.current;
    const timeSpan = timeEnd - timeStart;
    const angleStart = angle;
    const angleSpan = (velocityRef.current * timeSpan) / 1000;
    const angleEnd = angleStart + angleSpan;
    modelMatrix
      .setRotate(angleEnd, rotationX, rotationY, rotationZ)
      .translate(translationX, translationY, translationZ);
    timeRef.current = timeEnd;
    rotationRef.current[0] = angleEnd;
    gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix.elements);
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(deps[0]!.length / 2));
  }, [deps]);

  useFrameRequest(tick);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
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
     * 清空和变量设置
     */
    gl.clearColor(0, 0, 0, 1);
    positionAttribute >= 0 && gl.enableVertexAttribArray(positionAttribute);
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
    setDeps([positions]);
  }, [positions]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    /**
     * 动画帧
     */
    tick();
  }, [tick]);

  return <Canvas ref={glRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Demo23;
