import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { useFloat32Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import { Matrix4 } from '../lib/cuon-matrix';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 组合透视平移
 */
const Demo43: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const colorAttributeRef = useRef(-1);
  const mvpMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
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
  const [perspective, setPerspective] = useState<
    [number, number, number, number]
  >([30, 1, 1, 100]);
  const [camera] = useState<
    [number, number, number, number, number, number, number, number, number]
  >([0, 0, 5, 0, 0, -100, 0, 1, 0]);
  const [translations] = useState<[number, number, number][]>([
    [0.75, 0, 0],
    [-0.75, 0, 0],
  ]);
  const mvpMatrices = useMemo(() => {
    return translations.map((translation) => {
      const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
      const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] =
        camera;
      const [translationX, translationY, translationZ] = translation;
      return new Matrix4()
        .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
        .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
        .translate(translationX, translationY, translationZ);
    });
  }, [perspective, camera, translations]);
  const [deps, setDeps] = useState<[Float32Array | null]>([null]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    setPerspective((perspective) => [
      perspective[0],
      canvas.width / canvas.height,
      perspective[2],
      perspective[3],
    ]);
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
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(
      colorAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColors.BYTES_PER_ELEMENT * 6,
      positionsColors.BYTES_PER_ELEMENT * 3,
    );
    gl.enableVertexAttribArray(colorAttribute);
    setDeps([positionsColors]);
  }, [positionsColors]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const mvpMatrixUniform = mvpMatrixUniformRef.current;
    if (!mvpMatrixUniform) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const mvpMatrix of mvpMatrices) {
      /**
       * 数据直接分配到变量
       */
      gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix.elements);
      /**
       * 绘制
       */
      gl.drawArrays(gl.TRIANGLES, 0, Math.floor(deps[0]!.length / 6));
    }
  }, [mvpMatrices, deps]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo43;
