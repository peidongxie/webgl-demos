import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { type GuiOptions, type GuiSchema, useGui } from '../../lib/gui-utils';
import { useFloat32Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4 } from '../lib/cuon-matrix';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 拉近控制观察
 */
const Demo38: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const colorAttributeRef = useRef(-1);
  const viewMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const projMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionColorBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<
    [number, number, number, number, number, number][][]
  >([
    [
      [0, 0.5, -0.4, 0.4, 1, 0.4],
      [-0.5, -0.5, -0.4, 0.4, 1, 0.4],
      [0.5, -0.5, -0.4, 1, 0.4, 0.4],
    ],
    [
      [0.5, 0.4, -0.2, 1, 0.4, 0.4],
      [-0.5, 0.4, -0.2, 1, 1, 0.4],
      [0, -0.6, -0.2, 1, 1, 0.4],
    ],
    [
      [0, 0.5, 0, 0.4, 0.4, 1],
      [-0.5, -0.5, 0, 0.4, 0.4, 1],
      [0.5, -0.5, 0, 1, 0.4, 0.4],
    ],
  ]);
  const positionsColors = useFloat32Array(points);
  const [camera, setCamera] = useState<
    [number, number, number, number, number, number, number, number, number]
  >([0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0]);
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
  const [orthographic] = useState<
    [number, number, number, number, number, number]
  >([-1, 1, -1, 1, 0, 2]);
  const projMatrix = useMemo(() => {
    const [left, right, bottom, top, orthographicNear, orthographicFar] =
      orthographic;
    return new Matrix4().setOrtho(
      left,
      right,
      bottom,
      top,
      orthographicNear,
      orthographicFar,
    );
  }, [orthographic]);
  const [deps, setDeps] = useState<
    [Float32Array | null, Matrix4 | null, Matrix4 | null]
  >([null, null, null]);
  const schemas = useMemo<GuiSchema[]>(() => {
    return [
      {
        type: 'function',
        name: '相机左移',
        initialValue: () => {
          setCamera((camera) => {
            const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] =
              camera;
            return [
              eyeX - 0.01,
              eyeY,
              eyeZ,
              centerX,
              centerY,
              centerZ,
              upX,
              upY,
              upZ,
            ];
          });
        },
      },
      {
        type: 'function',
        name: '相机右移',
        initialValue: () => {
          setCamera((camera) => {
            const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] =
              camera;
            return [
              eyeX + 0.01,
              eyeY,
              eyeZ,
              centerX,
              centerY,
              centerZ,
              upX,
              upY,
              upZ,
            ];
          });
        },
      },
    ];
  }, []);
  const options = useMemo<GuiOptions>(
    () => ({
      container: '#gui-demo',
      title: '视点控件',
    }),
    [],
  );

  useGui(schemas, options);

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
    const viewMatrixUniform = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    const projMatrixUniform = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    positionAttributeRef.current = positionAttribute;
    colorAttributeRef.current = colorAttribute;
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
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, Math.floor(deps[0]!.length / 6));
  }, [deps]);

  return <Canvas ref={glRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Demo38;
