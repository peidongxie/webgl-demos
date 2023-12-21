import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { useFloat32Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import { Matrix4 } from '../lib/cuon-matrix';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 先平移再旋转
 */
const Demo19: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const modelMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number][]>([
    [0, 0.3],
    [-0.3, -0.3],
    [0.3, -0.3],
  ]);
  const positions = useFloat32Array(points);
  const [rotation] = useState<[number, number, number, number]>([60, 0, 0, 1]);
  const [translation] = useState<[number, number, number]>([0.5, 0, 0]);
  const modelMatrix = useMemo(() => {
    const [angle, rotationX, rotationY, rotationZ] = rotation;
    const [translationX, translationY, translationZ] = translation;
    return new Matrix4()
      .setRotate(angle, rotationX, rotationY, rotationZ)
      .translate(translationX, translationY, translationZ);
  }, [rotation, translation]);
  const [deps, setDeps] = useState<[Float32Array | null, Matrix4 | null]>([
    null,
    null,
  ]);

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
     * 清空设置
     */
    gl.clearColor(0, 0, 0, 1);
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
    setDeps((deps) => [positions, deps[1]]);
  }, [positions]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const modelMatrixUniform = modelMatrixUniformRef.current;
    if (!modelMatrixUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix.elements);
    setDeps((deps) => [deps[0], modelMatrix]);
  }, [modelMatrix]);

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
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo19;
