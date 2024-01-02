import { type FC, useEffect, useRef, useState } from 'react';

import { useFloat32Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 单缓冲绘制点
 */
const Demo25: FC<ComponentProps> = () => {
  const glRef = useRef<WebGLRenderingContext>(null);
  const positionAttributeRef = useRef(-1);
  const pointSizeAttributeRef = useRef(-1);
  const positionSizeBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number, number][]>([
    [0, 0.5, 10],
    [-0.5, -0.5, 20],
    [0.5, -0.5, 30],
  ]);
  const positionsSizes = useFloat32Array(points);
  const [deps, setDeps] = useState<[Float32Array | null]>([null]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!success) return;
    /**
     * 变量位置
     */
    const positionAttribute = gl.getAttribLocation(gl.program, 'a_Position');
    const pointSizeAttribute = gl.getAttribLocation(gl.program, 'a_PointSize');
    positionAttributeRef.current = positionAttribute;
    pointSizeAttributeRef.current = pointSizeAttribute;
    /**
     * 缓冲区
     */
    const positionSizeBuffer = gl.createBuffer();
    positionSizeBufferRef.current = positionSizeBuffer;
    /**
     * 清空和变量设置
     */
    gl.clearColor(0, 0, 0, 1);
    positionAttribute >= 0 && gl.enableVertexAttribArray(positionAttribute);
    pointSizeAttribute >= 0 && gl.enableVertexAttribArray(pointSizeAttribute);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttribute = positionAttributeRef.current;
    if (positionAttribute < 0) return;
    const pointSizeAttribute = pointSizeAttributeRef.current;
    if (pointSizeAttribute < 0) return;
    const positionSizeBuffer = positionSizeBufferRef.current;
    if (!positionSizeBuffer) return;
    /**
     * 数据写入缓冲区并分配到变量
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsSizes, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      positionAttribute,
      2,
      gl.FLOAT,
      false,
      positionsSizes.BYTES_PER_ELEMENT * 3,
      0,
    );
    gl.vertexAttribPointer(
      pointSizeAttribute,
      1,
      gl.FLOAT,
      false,
      positionsSizes.BYTES_PER_ELEMENT * 3,
      positionsSizes.BYTES_PER_ELEMENT * 2,
    );
    setDeps([positionsSizes]);
  }, [positionsSizes]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空并绘制
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, Math.floor(deps[0]!.length / 3));
  }, [deps]);

  return (
    <Canvas
      ref={glRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo25;
