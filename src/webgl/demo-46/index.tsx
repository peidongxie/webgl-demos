import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useFloat32Array, useUint8Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制立方
 */
const Demo46: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const colorAttributeRef = useRef(-1);
  const mvpMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionColorBufferRef = useRef<WebGLBuffer | null>(null);
  const indexBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number, number, number, number, number][]>(
    [
      [1, 1, 1, 1, 1, 1],
      [-1, 1, 1, 1, 1, 1],
      [-1, -1, 1, 1, 1, 1],
      [1, -1, 1, 1, 1, 1],
      [1, -1, -1, 1, 1, 1],
      [1, 1, -1, 1, 1, 1],
      [-1, 1, -1, 1, 1, 1],
      [-1, -1, -1, 1, 1, 1],
    ],
  );
  const positionsColors = useFloat32Array(points);
  const [surfaces] = useState<[number, number, number][][]>([
    [
      [0, 1, 2],
      [0, 2, 3],
    ],
    [
      [0, 3, 4],
      [0, 4, 5],
    ],
    [
      [0, 5, 6],
      [0, 6, 1],
    ],
    [
      [1, 6, 7],
      [1, 7, 2],
    ],
    [
      [7, 4, 3],
      [7, 3, 2],
    ],
    [
      [4, 7, 6],
      [4, 6, 5],
    ],
  ]);
  const indices = useUint8Array(surfaces);
  const [perspective, setPerspective] = useState<
    [number, number, number, number]
  >([30, 1, 1, 100]);
  const [camera] = useState<
    [number, number, number, number, number, number, number, number, number]
  >([3, 3, 7, 0, 0, 0, 0, 1, 0]);
  const mvpMatrix = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ);
  }, [perspective, camera]);
  const [deps, setDeps] = useState<
    [Float32Array | null, Uint8Array | null, Matrix4 | null]
  >([null, null, null]);

  const handleWindowResize = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    setPerspective((perspective) => [
      perspective[0],
      canvas.width / canvas.height,
      perspective[2],
      perspective[3],
    ]);
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
    const colorAttribute = gl.getAttribLocation(gl.program, 'a_Color');
    const mvpMatrixUniform = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    positionAttributeRef.current = positionAttribute;
    colorAttributeRef.current = colorAttribute;
    mvpMatrixUniformRef.current = mvpMatrixUniform;
    /**
     * 缓冲区
     */
    const positionColorBuffer = gl.createBuffer();
    positionColorBufferRef.current = positionColorBuffer;
    const indexBuffer = gl.createBuffer();
    indexBufferRef.current = indexBuffer;
    /**
     * 清空、深度和变量设置
     */
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    positionAttribute >= 0 && gl.enableVertexAttribArray(positionAttribute);
    colorAttribute >= 0 && gl.enableVertexAttribArray(colorAttribute);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute < 0) return;
    const colorAttribute = colorAttributeRef.current;
    if (colorAttribute < 0) return;
    const positionColorBuffer = positionColorBufferRef.current;
    if (!positionColorBuffer) return;
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      positionAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColors.BYTES_PER_ELEMENT * 6,
      0,
    );
    gl.vertexAttribPointer(
      colorAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColors.BYTES_PER_ELEMENT * 6,
      positionsColors.BYTES_PER_ELEMENT * 3,
    );
    setDeps((deps) => [positionsColors, deps[1], deps[2]]);
  }, [positionsColors]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const indexBuffer = indexBufferRef.current;
    if (!indexBuffer) return;
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    setDeps((deps) => [deps[0], indices, deps[2]]);
  }, [indices]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const mvpMatrixUniform = mvpMatrixUniformRef.current;
    if (!mvpMatrixUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix.elements);
    setDeps((deps) => [deps[0], deps[1], mvpMatrix]);
  }, [mvpMatrix]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, deps[1]!.length, gl.UNSIGNED_BYTE, 0);
  }, [deps]);

  return (
    <Canvas
      onWindowResize={handleWindowResize}
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo46;
