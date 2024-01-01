import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useFloat32Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 透视平移
 */
const Demo42: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const colorAttributeRef = useRef(-1);
  const modelMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const viewMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const projMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionColorBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<
    [number, number, number, number, number, number][][]
  >([
    [
      [0, 1, -4, 0.4, 1, 0.4],
      [-0.5, -1, -4, 0.4, 1, 0.4],
      [0.5, -1, -4, 1, 0.4, 0.4],
    ],
    [
      [0, 1, -2, 1, 1, 0.4],
      [-0.5, -1, -2, 1, 1, 0.4],
      [0.5, -1, -2, 1, 0.4, 0.4],
    ],
    [
      [0, 1, 0, 0.4, 0.4, 1],
      [-0.5, -1, 0, 0.4, 0.4, 1],
      [0.5, -1, 0, 1, 0.4, 0.4],
    ],
  ]);
  const positionsColors = useFloat32Array(points);
  const [translations] = useState<[number, number, number][]>([
    [0.75, 0, 0],
    [-0.75, 0, 0],
  ]);
  const modelMatrices = useMemo(() => {
    return translations.map((translation) => {
      const [translationX, translationY, translationZ] = translation;
      return new Matrix4().setTranslate(
        translationX,
        translationY,
        translationZ,
      );
    });
  }, [translations]);
  const [camera] = useState<
    [number, number, number, number, number, number, number, number, number]
  >([0, 0, 5, 0, 0, -100, 0, 1, 0]);
  const viewMatrix = useMemo(() => {
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    return new Matrix4().setLookAt(
      eyeX,
      eyeY,
      eyeZ,
      centerX,
      centerY,
      centerZ,
      upX,
      upY,
      upZ,
    );
  }, [camera]);
  const [perspective, setPerspective] = useState<
    [number, number, number, number]
  >([30, 1, 1, 100]);
  const projMatrix = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    return new Matrix4().setPerspective(
      fovy,
      aspect,
      perspectiveNear,
      perspectiveFar,
    );
  }, [perspective]);
  const [deps, setDeps] = useState<
    [Float32Array | null, Matrix4 | null, Matrix4 | null]
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
    const modelMatrixUniform = gl.getUniformLocation(
      gl.program,
      'u_ModelMatrix',
    );
    const viewMatrixUniform = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    const projMatrixUniform = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    positionAttributeRef.current = positionAttribute;
    colorAttributeRef.current = colorAttribute;
    modelMatrixUniformRef.current = modelMatrixUniform;
    viewMatrixUniformRef.current = viewMatrixUniform;
    projMatrixUniformRef.current = projMatrixUniform;
    /**
     * 缓冲区
     */
    const positionColorBuffer = gl.createBuffer();
    positionColorBufferRef.current = positionColorBuffer;
    /**
     * 清空和变量设置
     */
    gl.clearColor(0, 0, 0, 1);
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
    const viewMatrixUniform = viewMatrixUniformRef.current;
    if (!viewMatrixUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(viewMatrixUniform, false, viewMatrix.elements);
    setDeps((deps) => [deps[0], viewMatrix, deps[2]]);
  }, [viewMatrix]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const projMatrixUniform = projMatrixUniformRef.current;
    if (!projMatrixUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(projMatrixUniform, false, projMatrix.elements);
    setDeps((deps) => [deps[0], deps[1], projMatrix]);
  }, [projMatrix]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const modelMatrixUniform = modelMatrixUniformRef.current;
    if (!modelMatrixUniform) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const modelMatrix of modelMatrices) {
      /**
       * 数据直接分配到变量
       */
      gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix.elements);
      /**
       * 绘制
       */
      gl.drawArrays(gl.TRIANGLES, 0, Math.floor(deps[0]!.length / 6));
    }
  }, [modelMatrices, deps]);

  return (
    <Canvas
      onWindowResize={handleWindowResize}
      ref={glRef}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

export default Demo42;
