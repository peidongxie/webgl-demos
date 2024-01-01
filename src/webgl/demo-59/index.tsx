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
 * 逐片元点光源
 */
const Demo59: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const colorAttributeRef = useRef(-1);
  const normalAttributeRef = useRef(-1);
  const mvpMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const modelMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const normalMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const lightColorUniformRef = useRef<WebGLUniformLocation | null>(null);
  const lightPositionUniformRef = useRef<WebGLUniformLocation | null>(null);
  const ambientLightUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionColorNormalBufferRef = useRef<WebGLBuffer | null>(null);
  const indexBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<
    [number, number, number, number, number, number, number, number, number][][]
  >([
    [
      [1, 1, 1, 1, 0, 0, 0, 0, 1],
      [-1, 1, 1, 1, 0, 0, 0, 0, 1],
      [-1, -1, 1, 1, 0, 0, 0, 0, 1],
      [1, -1, 1, 1, 0, 0, 0, 0, 1],
    ],
    [
      [1, 1, 1, 1, 0, 0, 1, 0, 0],
      [1, -1, 1, 1, 0, 0, 1, 0, 0],
      [1, -1, -1, 1, 0, 0, 1, 0, 0],
      [1, 1, -1, 1, 0, 0, 1, 0, 0],
    ],
    [
      [1, 1, 1, 1, 0, 0, 0, 1, 0],
      [1, 1, -1, 1, 0, 0, 0, 1, 0],
      [-1, 1, -1, 1, 0, 0, 0, 1, 0],
      [-1, 1, 1, 1, 0, 0, 0, 1, 0],
    ],
    [
      [-1, 1, 1, 1, 0, 0, -1, 0, 0],
      [-1, 1, -1, 1, 0, 0, -1, 0, 0],
      [-1, -1, -1, 1, 0, 0, -1, 0, 0],
      [-1, -1, 1, 1, 0, 0, -1, 0, 0],
    ],
    [
      [-1, -1, -1, 1, 0, 0, 0, -1, 0],
      [1, -1, -1, 1, 0, 0, 0, -1, 0],
      [1, -1, 1, 1, 0, 0, 0, -1, 0],
      [-1, -1, 1, 1, 0, 0, 0, -1, 0],
    ],
    [
      [1, -1, -1, 1, 0, 0, 0, 0, -1],
      [-1, -1, -1, 1, 0, 0, 0, 0, -1],
      [-1, 1, -1, 1, 0, 0, 0, 0, -1],
      [1, 1, -1, 1, 0, 0, 0, 0, -1],
    ],
  ]);
  const positionsColorNormals = useFloat32Array(points);
  const [surfaces] = useState<[number, number, number][][]>([
    [
      [0, 1, 2],
      [0, 2, 3],
    ],
    [
      [4, 5, 6],
      [4, 6, 7],
    ],
    [
      [8, 9, 10],
      [8, 10, 11],
    ],
    [
      [12, 13, 14],
      [12, 14, 15],
    ],
    [
      [16, 17, 18],
      [16, 18, 19],
    ],
    [
      [20, 21, 22],
      [20, 22, 23],
    ],
  ]);
  const indices = useUint8Array(surfaces);
  const [perspective, setPerspective] = useState<
    [number, number, number, number]
  >([30, 1, 1, 100]);
  const [camera] = useState<
    [number, number, number, number, number, number, number, number, number]
  >([3, 3, 7, 0, 0, 0, 0, 1, 0]);
  const [rotation] = useState<[number, number, number, number]>([90, 0, 1, 0]);
  const mvpMatrix = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    const [angle, rotationX, rotationY, rotationZ] = rotation;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
      .rotate(angle, rotationX, rotationY, rotationZ);
  }, [perspective, camera, rotation]);
  const modelMatrix = useMemo(() => {
    const [angle, rotationX, rotationY, rotationZ] = rotation;
    return new Matrix4().setRotate(angle, rotationX, rotationY, rotationZ);
  }, [rotation]);
  const normalMatrix = useMemo(() => {
    const [angle, rotationX, rotationY, rotationZ] = rotation;
    return new Matrix4()
      .setRotate(angle, rotationX, rotationY, rotationZ)
      .invert()
      .transpose();
  }, [rotation]);
  const [lights] = useState<[number, number, number, number, number, number][]>(
    [
      [1, 1, 1, 1.15, 2, 1.75],
      [0.2, 0.2, 0.2, 0, 0, 0],
    ],
  );
  const lightColor = useMemo<[number, number, number]>(() => {
    return [lights[0][0], lights[0][1], lights[0][2]];
  }, [lights]);
  const lightPosition = useMemo<[number, number, number]>(() => {
    return [lights[0][3], lights[0][4], lights[0][5]];
  }, [lights]);
  const ambientLight = useMemo<[number, number, number]>(() => {
    return [lights[1][0], lights[1][1], lights[1][2]];
  }, [lights]);
  const [deps, setDeps] = useState<
    [
      Float32Array | null,
      Uint8Array | null,
      Matrix4 | null,
      Matrix4 | null,
      Matrix4 | null,
      [number, number, number] | null,
      [number, number, number] | null,
      [number, number, number] | null,
    ]
  >([null, null, null, null, null, null, null, null]);

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
    const normalAttribute = gl.getAttribLocation(gl.program, 'a_Normal');
    const mvpMatrixUniform = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    const modelMatrixUniform = gl.getUniformLocation(
      gl.program,
      'u_ModelMatrix',
    );
    const normalMatrixUniform = gl.getUniformLocation(
      gl.program,
      'u_NormalMatrix',
    );
    const lightColorUniform = gl.getUniformLocation(gl.program, 'u_LightColor');
    const lightPositionUniform = gl.getUniformLocation(
      gl.program,
      'u_LightPosition',
    );
    const ambientLightUniform = gl.getUniformLocation(
      gl.program,
      'u_AmbientLight',
    );
    positionAttributeRef.current = positionAttribute;
    colorAttributeRef.current = colorAttribute;
    normalAttributeRef.current = normalAttribute;
    mvpMatrixUniformRef.current = mvpMatrixUniform;
    modelMatrixUniformRef.current = modelMatrixUniform;
    normalMatrixUniformRef.current = normalMatrixUniform;
    lightColorUniformRef.current = lightColorUniform;
    lightPositionUniformRef.current = lightPositionUniform;
    ambientLightUniformRef.current = ambientLightUniform;
    /**
     * 缓冲区
     */
    const positionColorBuffer = gl.createBuffer();
    positionColorNormalBufferRef.current = positionColorBuffer;
    const indexBuffer = gl.createBuffer();
    indexBufferRef.current = indexBuffer;
    /**
     * 清空、深度和变量设置
     */
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    positionAttribute >= 0 && gl.enableVertexAttribArray(positionAttribute);
    colorAttribute >= 0 && gl.enableVertexAttribArray(colorAttribute);
    normalAttribute >= 0 && gl.enableVertexAttribArray(normalAttribute);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute < 0) return;
    const colorAttribute = colorAttributeRef.current;
    if (colorAttribute < 0) return;
    const normalAttribute = normalAttributeRef.current;
    if (normalAttribute < 0) return;
    const positionColorNormalBuffer = positionColorNormalBufferRef.current;
    if (!positionColorNormalBuffer) return;
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionColorNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsColorNormals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      positionAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColorNormals.BYTES_PER_ELEMENT * 9,
      0,
    );
    gl.vertexAttribPointer(
      colorAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColorNormals.BYTES_PER_ELEMENT * 9,
      positionsColorNormals.BYTES_PER_ELEMENT * 3,
    );
    gl.vertexAttribPointer(
      normalAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColorNormals.BYTES_PER_ELEMENT * 9,
      positionsColorNormals.BYTES_PER_ELEMENT * 6,
    );
    setDeps((deps) => [
      positionsColorNormals,
      deps[1],
      deps[2],
      deps[3],
      deps[4],
      deps[5],
      deps[6],
      deps[7],
    ]);
  }, [positionsColorNormals]);

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
    setDeps((deps) => [
      deps[0],
      indices,
      deps[2],
      deps[3],
      deps[4],
      deps[5],
      deps[6],
      deps[7],
    ]);
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
    setDeps((deps) => [
      deps[0],
      deps[1],
      mvpMatrix,
      deps[3],
      deps[4],
      deps[5],
      deps[6],
      deps[7],
    ]);
  }, [mvpMatrix]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const modelMatrixUniform = modelMatrixUniformRef.current;
    if (!modelMatrixUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix.elements);
    setDeps((deps) => [
      deps[0],
      deps[1],
      deps[2],
      modelMatrix,
      deps[4],
      deps[5],
      deps[6],
      deps[7],
    ]);
  }, [modelMatrix]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const normalMatrixUniform = normalMatrixUniformRef.current;
    if (!normalMatrixUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix.elements);
    setDeps((deps) => [
      deps[0],
      deps[1],
      deps[2],
      deps[3],
      normalMatrix,
      deps[5],
      deps[6],
      deps[7],
    ]);
  }, [normalMatrix]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const lightColorUniform = lightColorUniformRef.current;
    if (!lightColorUniform) return;
    /**
     * 数据直接分配到变量
     */
    const [red, green, blue] = lightColor;
    gl.uniform3f(lightColorUniform, red, green, blue);
    setDeps((deps) => [
      deps[0],
      deps[1],
      deps[2],
      deps[3],
      deps[4],
      lightColor,
      deps[6],
      deps[7],
    ]);
  }, [lightColor]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const lightPositionUniform = lightPositionUniformRef.current;
    if (!lightPositionUniform) return;
    /**
     * 数据直接分配到变量
     */
    const [x, y, z] = lightPosition;
    gl.uniform3f(lightPositionUniform, x, y, z);
    setDeps((deps) => [
      deps[0],
      deps[1],
      deps[2],
      deps[3],
      deps[4],
      deps[5],
      lightPosition,
      deps[7],
    ]);
  }, [lightPosition]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const ambientLightUniform = ambientLightUniformRef.current;
    if (!ambientLightUniform) return;
    /**
     * 数据直接分配到变量
     */
    const [red, green, blue] = ambientLight;
    gl.uniform3f(ambientLightUniform, red, green, blue);
    setDeps((deps) => [
      deps[0],
      deps[1],
      deps[2],
      deps[3],
      deps[4],
      deps[5],
      deps[6],
      ambientLight,
    ]);
  }, [ambientLight]);

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
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

export default Demo59;
