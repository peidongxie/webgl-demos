import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { useFloat32Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 向量旋转
 */
const Demo15: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const cosBUniformRef = useRef<WebGLUniformLocation | null>(null);
  const sinBUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const positions = useFloat32Array(points);
  const [angle] = useState(90);
  const [cos, sin] = useMemo<[number, number]>(() => {
    const radian = (Math.PI * angle) / 180;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return [cos, sin];
  }, [angle]);
  const [deps, setDeps] = useState<
    [Float32Array | null, number | null, number | null]
  >([null, null, null]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    /**
     * 变量位置
     */
    const positionAttribute = gl.getAttribLocation(gl.program, 'a_Position');
    const cosBUniform = gl.getUniformLocation(gl.program, 'u_CosB');
    const sinBUniform = gl.getUniformLocation(gl.program, 'u_SinB');
    positionAttributeRef.current = positionAttribute;
    cosBUniformRef.current = cosBUniform;
    sinBUniformRef.current = sinBUniform;
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
    setDeps((deps) => [positions, deps[1], deps[2]]);
  }, [positions]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const cosBUniform = cosBUniformRef.current;
    if (!cosBUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniform1f(cosBUniform, cos);
    setDeps((deps) => [deps[0], cos, deps[2]]);
  }, [cos]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const sinBUniform = sinBUniformRef.current;
    if (!sinBUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniform1f(sinBUniform, sin);
    setDeps((deps) => [deps[0], deps[1], sin]);
  }, [sin]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(deps[0]!.length / 2));
  }, [deps]);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo15;
