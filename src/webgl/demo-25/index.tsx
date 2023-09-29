import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { type ComponentProps } from '../../type';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 单缓冲绘制点
 */
const Demo25: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeLocationRef = useRef(-1);
  const pointSizeAttributeLocationRef = useRef(-1);
  const vertexSizeBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<[number, number, number][]>([
    [0, 0.5, 10],
    [-0.5, -0.5, 20],
    [0.5, -0.5, 30],
  ]);
  const verticesSizes = useMemo(
    () => new Float32Array(points.flat()),
    [points],
  );

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

  useEffect(
    () => () => {
      glRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const success = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (success) {
      /**
       * 变量位置
       */
      const positionAttributeLocation = gl.getAttribLocation(
        gl.program,
        'a_Position',
      );
      const pointSizeAttributeLocation = gl.getAttribLocation(
        gl.program,
        'a_PointSize',
      );
      positionAttributeLocationRef.current = positionAttributeLocation;
      pointSizeAttributeLocationRef.current = pointSizeAttributeLocation;
      /**
       * 缓冲区
       */
      const vertexBuffer = gl.createBuffer();
      vertexSizeBufferRef.current = vertexBuffer;
      /**
       * 清空设置
       */
      gl.clearColor(0, 0, 0, 1);
    }
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const positionAttributeLocation = positionAttributeLocationRef.current;
    if (positionAttributeLocation < 0) return;
    const pointSizeAttributeLocation = pointSizeAttributeLocationRef.current;
    if (pointSizeAttributeLocation < 0) return;
    const vertexSizeBuffer = vertexSizeBufferRef.current;
    if (!vertexSizeBuffer) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * 数据写入缓冲区并分配到变量，绘制
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      positionAttributeLocation,
      2,
      gl.FLOAT,
      false,
      verticesSizes.BYTES_PER_ELEMENT * 3,
      0,
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(
      pointSizeAttributeLocation,
      1,
      gl.FLOAT,
      false,
      verticesSizes.BYTES_PER_ELEMENT * 3,
      verticesSizes.BYTES_PER_ELEMENT * 2,
    );
    gl.enableVertexAttribArray(pointSizeAttributeLocation);
    gl.drawArrays(gl.POINTS, 0, Math.floor(verticesSizes.length / 3));
  }, [verticesSizes]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo25;
