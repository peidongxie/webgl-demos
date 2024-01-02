import { type FC, useEffect, useRef, useState } from 'react';

import { useFloat32Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 向量平移
 */
const Demo14: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const translationUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.5],
    [-0.5, -0.5],
    [0.5, -0.5],
  ]);
  const positions = useFloat32Array(points);
  const [translation] = useState<[number, number, number]>([0.5, 0.5, 0]);
  const [deps, setDeps] = useState<
    [Float32Array | null, [number, number, number] | null]
  >([null, null]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    /**
     * 变量位置
     */
    const positionAttribute = gl.getAttribLocation(gl.program, 'a_Position');
    const translationUniform = gl.getUniformLocation(
      gl.program,
      'u_Translation',
    );
    positionAttributeRef.current = positionAttribute;
    translationUniformRef.current = translationUniform;
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
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    setDeps((deps) => [positions, deps[1]]);
  }, [positions]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const translationUniform = translationUniformRef.current;
    if (!translationUniform) return;
    /**
     * 数据直接分配到变量
     */
    const [translationX, translationY, translationZ] = translation;
    gl.uniform4f(
      translationUniform,
      translationX,
      translationY,
      translationZ,
      0,
    );
    setDeps((deps) => [deps[0], translation]);
  }, [translation]);

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

export default Demo14;
