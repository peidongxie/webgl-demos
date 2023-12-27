import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { type GuiOptions, type GuiSchema, useGui } from '../../lib/gui-utils';
import { useFloat32Array, useUint8Array } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import { Matrix4, Vector3 } from '../lib/cuon-matrix';
import { getWebGLContext, initShaders } from '../lib/cuon-utils';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

/**
 * 绘制多关节
 */
const Demo61: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const positionAttributeRef = useRef(-1);
  const colorAttributeRef = useRef(-1);
  const normalAttributeRef = useRef(-1);
  const mvpMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const normalMatrixUniformRef = useRef<WebGLUniformLocation | null>(null);
  const lightColorUniformRef = useRef<WebGLUniformLocation | null>(null);
  const lightDirectionUniformRef = useRef<WebGLUniformLocation | null>(null);
  const ambientLightUniformRef = useRef<WebGLUniformLocation | null>(null);
  const positionColorNormalBufferRef = useRef<WebGLBuffer | null>(null);
  const indexBufferRef = useRef<WebGLBuffer | null>(null);
  const [points] = useState<
    [number, number, number, number, number, number, number, number, number][][]
  >([
    [
      [0.5, 1, 0.5, 1, 0.4, 0, 0, 0, 1],
      [-0.5, 1, 0.5, 1, 0.4, 0, 0, 0, 1],
      [-0.5, 0, 0.5, 1, 0.4, 0, 0, 0, 1],
      [0.5, 0, 0.5, 1, 0.4, 0, 0, 0, 1],
    ],
    [
      [0.5, 1, 0.5, 1, 0.4, 0, 1, 0, 0],
      [0.5, 0, 0.5, 1, 0.4, 0, 1, 0, 0],
      [0.5, 0, -0.5, 1, 0.4, 0, 1, 0, 0],
      [0.5, 1, -0.5, 1, 0.4, 0, 1, 0, 0],
    ],
    [
      [0.5, 1, 0.5, 1, 0.4, 0, 0, 1, 0],
      [0.5, 1, -0.5, 1, 0.4, 0, 0, 1, 0],
      [-0.5, 1, -0.5, 1, 0.4, 0, 0, 1, 0],
      [-0.5, 1, 0.5, 1, 0.4, 0, 0, 1, 0],
    ],
    [
      [-0.5, 1, 0.5, 1, 0.4, 0, -1, 0, 0],
      [-0.5, 1, -0.5, 1, 0.4, 0, -1, 0, 0],
      [-0.5, 0, -0.5, 1, 0.4, 0, -1, 0, 0],
      [-0.5, 0, 0.5, 1, 0.4, 0, -1, 0, 0],
    ],
    [
      [-0.5, 0, -0.5, 1, 0.4, 0, 0, -1, 0],
      [0.5, 0, -0.5, 1, 0.4, 0, 0, -1, 0],
      [0.5, 0, 0.5, 1, 0.4, 0, 0, -1, 0],
      [-0.5, 0, 0.5, 1, 0.4, 0, 0, -1, 0],
    ],
    [
      [0.5, 0, -0.5, 1, 0.4, 0, 0, 0, -1],
      [-0.5, 0, -0.5, 1, 0.4, 0, 0, 0, -1],
      [-0.5, 1, -0.5, 1, 0.4, 0, 0, 0, -1],
      [0.5, 1, -0.5, 1, 0.4, 0, 0, 0, -1],
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
  >([50, 1, 1, 100]);
  const [camera] = useState<
    [number, number, number, number, number, number, number, number, number]
  >([20, 10, 30, 0, 0, 0, 0, 1, 0]);
  const [translation1] = useState<[number, number, number]>([0, -12, 0]);
  const [scale1] = useState<[number, number, number]>([10, 2, 10]);
  const mvpMatrix1 = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [scale1X, scale1Y, scale1Z] = scale1;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
      .translate(translation1X, translation1Y, translation1Z)
      .scale(scale1X, scale1Y, scale1Z);
  }, [perspective, camera, translation1, scale1]);
  const normalMatrix1 = useMemo(() => {
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [scale1X, scale1Y, scale1Z] = scale1;
    return new Matrix4()
      .setTranslate(translation1X, translation1Y, translation1Z)
      .scale(scale1X, scale1Y, scale1Z)
      .invert()
      .transpose();
  }, [translation1, scale1]);
  const [translation2] = useState<[number, number, number]>([0, 2, 0]);
  const [rotation2, setRotation2] = useState<[number, number, number, number]>([
    90, 0, 1, 0,
  ]);
  const [scale2] = useState<[number, number, number]>([3, 10, 3]);
  const mvpMatrix2 = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [scale2X, scale2Y, scale2Z] = scale2;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .scale(scale2X, scale2Y, scale2Z);
  }, [perspective, camera, translation1, translation2, rotation2, scale2]);
  const normalMatrix2 = useMemo(() => {
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [scale2X, scale2Y, scale2Z] = scale2;
    return new Matrix4()
      .setTranslate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .scale(scale2X, scale2Y, scale2Z)
      .invert()
      .transpose();
  }, [translation1, translation2, rotation2, scale2]);
  const [translation3] = useState<[number, number, number]>([0, 10, 0]);
  const [rotation3, setRotation3] = useState<[number, number, number, number]>([
    45, 0, 0, 1,
  ]);
  const [scale3] = useState<[number, number, number]>([4, 10, 4]);
  const mvpMatrix3 = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [scale3X, scale3Y, scale3Z] = scale3;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .scale(scale3X, scale3Y, scale3Z);
  }, [
    perspective,
    camera,
    translation1,
    translation2,
    rotation2,
    translation3,
    rotation3,
    scale3,
  ]);
  const normalMatrix3 = useMemo(() => {
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [scale3X, scale3Y, scale3Z] = scale3;
    return new Matrix4()
      .setTranslate(translation1X, translation1Y, translation1Z)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .scale(scale3X, scale3Y, scale3Z)
      .invert()
      .transpose();
  }, [translation1, translation2, rotation2, translation3, rotation3, scale3]);
  const [translation4] = useState<[number, number, number]>([0, 10, 0]);
  const [rotation4, setRotation4] = useState<[number, number, number, number]>([
    0, 0, 1, 0,
  ]);
  const [scale4] = useState<[number, number, number]>([2, 2, 6]);
  const mvpMatrix4 = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [translation4X, translation4Y, translation4Z] = translation4;
    const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
    const [scale4X, scale4Y, scale4Z] = scale4;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .translate(translation4X, translation4Y, translation4Z)
      .rotate(angle4, rotation4X, rotation4Y, rotation4Z)
      .scale(scale4X, scale4Y, scale4Z);
  }, [
    perspective,
    camera,
    translation1,
    translation2,
    rotation2,
    translation3,
    rotation3,
    translation4,
    rotation4,
    scale4,
  ]);
  const normalMatrix4 = useMemo(() => {
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [translation4X, translation4Y, translation4Z] = translation4;
    const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
    const [scale4X, scale4Y, scale4Z] = scale4;
    return new Matrix4()
      .setTranslate(translation1X, translation1Y, translation1Z)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .translate(translation4X, translation4Y, translation4Z)
      .rotate(angle4, rotation4X, rotation4Y, rotation4Z)
      .scale(scale4X, scale4Y, scale4Z)
      .invert()
      .transpose();
  }, [
    translation1,
    translation2,
    rotation2,
    translation3,
    rotation3,
    translation4,
    rotation4,
    scale4,
  ]);
  const [translation5] = useState<[number, number, number]>([0, 2, 2]);
  const [rotation5, setRotation5] = useState<[number, number, number, number]>([
    0, 1, 0, 0,
  ]);
  const [scale5] = useState<[number, number, number]>([1, 2, 1]);
  const mvpMatrix5 = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [translation4X, translation4Y, translation4Z] = translation4;
    const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
    const [translation5X, translation5Y, translation5Z] = translation5;
    const [angle5, rotation5X, rotation5Y, rotation5Z] = rotation5;
    const [scale5X, scale5Y, scale5Z] = scale5;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .translate(translation4X, translation4Y, translation4Z)
      .rotate(angle4, rotation4X, rotation4Y, rotation4Z)
      .translate(translation5X, translation5Y, translation5Z)
      .rotate(angle5, rotation5X, rotation5Y, rotation5Z)
      .scale(scale5X, scale5Y, scale5Z);
  }, [
    perspective,
    camera,
    translation1,
    translation2,
    rotation2,
    translation3,
    rotation3,
    translation4,
    rotation4,
    translation5,
    rotation5,
    scale5,
  ]);
  const normalMatrix5 = useMemo(() => {
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [translation4X, translation4Y, translation4Z] = translation4;
    const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
    const [translation5X, translation5Y, translation5Z] = translation5;
    const [angle5, rotation5X, rotation5Y, rotation5Z] = rotation5;
    const [scale5X, scale5Y, scale5Z] = scale5;
    return new Matrix4()
      .setTranslate(translation1X, translation1Y, translation1Z)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .translate(translation4X, translation4Y, translation4Z)
      .rotate(angle4, rotation4X, rotation4Y, rotation4Z)
      .translate(translation5X, translation5Y, translation5Z)
      .rotate(angle5, rotation5X, rotation5Y, rotation5Z)
      .scale(scale5X, scale5Y, scale5Z)
      .invert()
      .transpose();
  }, [
    translation1,
    translation2,
    rotation2,
    translation3,
    rotation3,
    translation4,
    rotation4,
    translation5,
    rotation5,
    scale5,
  ]);
  const [translation6] = useState<[number, number, number]>([0, 2, -2]);
  const [rotation6, setRotation6] = useState<[number, number, number, number]>([
    0, 1, 0, 0,
  ]);
  const [scale6] = useState<[number, number, number]>([1, 2, 1]);
  const mvpMatrix6 = useMemo(() => {
    const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
    const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] = camera;
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [translation4X, translation4Y, translation4Z] = translation4;
    const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
    const [translation6X, translation6Y, translation6Z] = translation6;
    const [angle6, rotation6X, rotation6Y, rotation6Z] = rotation6;
    const [scale6X, scale6Y, scale6Z] = scale6;
    return new Matrix4()
      .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
      .lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .translate(translation4X, translation4Y, translation4Z)
      .rotate(angle4, rotation4X, rotation4Y, rotation4Z)
      .translate(translation6X, translation6Y, translation6Z)
      .rotate(angle6, rotation6X, rotation6Y, rotation6Z)
      .scale(scale6X, scale6Y, scale6Z);
  }, [
    perspective,
    camera,
    translation1,
    translation2,
    rotation2,
    translation3,
    rotation3,
    translation4,
    rotation4,
    translation6,
    rotation6,
    scale6,
  ]);
  const normalMatrix6 = useMemo(() => {
    const [translation1X, translation1Y, translation1Z] = translation1;
    const [translation2X, translation2Y, translation2Z] = translation2;
    const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
    const [translation3X, translation3Y, translation3Z] = translation3;
    const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
    const [translation4X, translation4Y, translation4Z] = translation4;
    const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
    const [translation6X, translation6Y, translation6Z] = translation6;
    const [angle6, rotation6X, rotation6Y, rotation6Z] = rotation6;
    const [scale6X, scale6Y, scale6Z] = scale6;
    return new Matrix4()
      .setTranslate(translation1X, translation1Y, translation1Z)
      .translate(translation1X, translation1Y, translation1Z)
      .translate(translation2X, translation2Y, translation2Z)
      .rotate(angle2, rotation2X, rotation2Y, rotation2Z)
      .translate(translation3X, translation3Y, translation3Z)
      .rotate(angle3, rotation3X, rotation3Y, rotation3Z)
      .translate(translation4X, translation4Y, translation4Z)
      .rotate(angle4, rotation4X, rotation4Y, rotation4Z)
      .translate(translation6X, translation6Y, translation6Z)
      .rotate(angle6, rotation6X, rotation6Y, rotation6Z)
      .scale(scale6X, scale6Y, scale6Z)
      .invert()
      .transpose();
  }, [
    translation1,
    translation2,
    rotation2,
    translation3,
    rotation3,
    translation4,
    rotation4,
    translation6,
    rotation6,
    scale6,
  ]);
  const [lights] = useState<[number, number, number, number, number, number][]>(
    [
      [1, 1, 1, 0, 0.5, 0.7],
      [0.1, 0.1, 0.1, 0, 0, 0],
    ],
  );
  const lightColor = useMemo<[number, number, number]>(() => {
    return [lights[0][0], lights[0][1], lights[0][2]];
  }, [lights]);
  const lightDirection = useMemo(() => {
    return new Vector3([lights[0][3], lights[0][4], lights[0][5]]).normalize();
  }, [lights]);
  const ambientLight = useMemo<[number, number, number]>(() => {
    return [lights[1][0], lights[1][1], lights[1][2]];
  }, [lights]);
  const [deps, setDeps] = useState<
    [
      Float32Array | null,
      Uint8Array | null,
      [number, number, number] | null,
      Vector3 | null,
      [number, number, number] | null,
    ]
  >([null, null, null, null, null]);
  const schemas = useMemo<GuiSchema[]>(() => {
    return [
      {
        type: 'function',
        name: '手臂逆时针旋转',
        initialValue: () => {
          setRotation2((rotation2) => {
            const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
            return [angle2 + 3, rotation2X, rotation2Y, rotation2Z];
          });
        },
      },
      {
        type: 'function',
        name: '手臂顺时针旋转',
        initialValue: () => {
          setRotation2((rotation2) => {
            const [angle2, rotation2X, rotation2Y, rotation2Z] = rotation2;
            return [angle2 - 3, rotation2X, rotation2Y, rotation2Z];
          });
        },
      },
      {
        type: 'function',
        name: '前臂逆时针旋转',
        initialValue: () => {
          setRotation3((rotation3) => {
            const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
            if (angle3 >= 135) return rotation3;
            return [angle3 + 3, rotation3X, rotation3Y, rotation3Z];
          });
        },
      },
      {
        type: 'function',
        name: '前臂顺时针旋转',
        initialValue: () => {
          setRotation3((rotation3) => {
            const [angle3, rotation3X, rotation3Y, rotation3Z] = rotation3;
            if (angle3 <= -135) return rotation3;
            return [angle3 - 3, rotation3X, rotation3Y, rotation3Z];
          });
        },
      },
      {
        type: 'function',
        name: '手掌逆时针旋转',
        initialValue: () => {
          setRotation4((rotation4) => {
            const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
            return [angle4 + 3, rotation4X, rotation4Y, rotation4Z];
          });
        },
      },
      {
        type: 'function',
        name: '手掌顺时针旋转',
        initialValue: () => {
          setRotation4((rotation4) => {
            const [angle4, rotation4X, rotation4Y, rotation4Z] = rotation4;
            return [angle4 - 3, rotation4X, rotation4Y, rotation4Z];
          });
        },
      },
      {
        type: 'function',
        name: '手指逆时针旋转',
        initialValue: () => {
          setRotation5((rotation5) => {
            const [angle5, rotation5X, rotation5Y, rotation5Z] = rotation5;
            if (angle5 >= 60) return rotation5;
            return [angle5 + 3, rotation5X, rotation5Y, rotation5Z];
          });
          setRotation6((rotation6) => {
            const [angle6, rotation6X, rotation6Y, rotation6Z] = rotation6;
            if (angle6 <= -60) return rotation6;
            return [angle6 - 3, rotation6X, rotation6Y, rotation6Z];
          });
        },
      },
      {
        type: 'function',
        name: '手指顺时针旋转',
        initialValue: () => {
          setRotation5((rotation5) => {
            const [angle5, rotation5X, rotation5Y, rotation5Z] = rotation5;
            if (angle5 <= -60) return rotation5;
            return [angle5 - 3, rotation5X, rotation5Y, rotation5Z];
          });
          setRotation6((rotation6) => {
            const [angle6, rotation6X, rotation6Y, rotation6Z] = rotation6;
            if (angle6 >= 60) return rotation6;
            return [angle6 + 3, rotation6X, rotation6Y, rotation6Z];
          });
        },
      },
    ];
  }, []);
  const options = useMemo<GuiOptions>(
    () => ({
      container: '#gui-demo',
      title: '模型控件',
    }),
    [],
  );

  useGui(schemas, options);

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
    const normalAttribute = gl.getAttribLocation(gl.program, 'a_Normal');
    const mvpMatrixUniform = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    const normalMatrixUniform = gl.getUniformLocation(
      gl.program,
      'u_NormalMatrix',
    );
    const lightColorUniform = gl.getUniformLocation(gl.program, 'u_LightColor');
    const lightDirectionUniform = gl.getUniformLocation(
      gl.program,
      'u_LightDirection',
    );
    const ambientLightUniform = gl.getUniformLocation(
      gl.program,
      'u_AmbientLight',
    );
    positionAttributeRef.current = positionAttribute;
    colorAttributeRef.current = colorAttribute;
    normalAttributeRef.current = normalAttribute;
    mvpMatrixUniformRef.current = mvpMatrixUniform;
    normalMatrixUniformRef.current = normalMatrixUniform;
    lightColorUniformRef.current = lightColorUniform;
    lightDirectionUniformRef.current = lightDirectionUniform;
    ambientLightUniformRef.current = ambientLightUniform;
    /**
     * 缓冲区
     */
    const positionColorBuffer = gl.createBuffer();
    positionColorNormalBufferRef.current = positionColorBuffer;
    const indexBuffer = gl.createBuffer();
    indexBufferRef.current = indexBuffer;
    /**
     * 清空和深度设置
     */
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
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
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(
      colorAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColorNormals.BYTES_PER_ELEMENT * 9,
      positionsColorNormals.BYTES_PER_ELEMENT * 3,
    );
    gl.enableVertexAttribArray(colorAttribute);
    gl.vertexAttribPointer(
      normalAttribute,
      3,
      gl.FLOAT,
      false,
      positionsColorNormals.BYTES_PER_ELEMENT * 9,
      positionsColorNormals.BYTES_PER_ELEMENT * 6,
    );
    gl.enableVertexAttribArray(normalAttribute);
    setDeps((deps) => [
      positionsColorNormals,
      deps[1],
      deps[2],
      deps[3],
      deps[4],
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
    setDeps((deps) => [deps[0], indices, deps[2], deps[3], deps[4]]);
  }, [indices]);

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
    setDeps((deps) => [deps[0], deps[1], lightColor, deps[3], deps[4]]);
  }, [lightColor]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const lightDirectionUniform = lightDirectionUniformRef.current;
    if (!lightDirectionUniform) return;
    /**
     * 数据直接分配到变量
     */
    gl.uniform3fv(lightDirectionUniform, lightDirection.elements);
    setDeps((deps) => [deps[0], deps[1], deps[2], lightDirection, deps[4]]);
  }, [lightDirection]);

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
    setDeps((deps) => [deps[0], deps[1], deps[2], deps[3], ambientLight]);
  }, [ambientLight]);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const mvpMatrixUniform = mvpMatrixUniformRef.current;
    if (!mvpMatrixUniform) return;
    const normalMatrixUniform = normalMatrixUniformRef.current;
    if (!normalMatrixUniform) return;
    if (deps.some((dep) => dep === null)) return;
    /**
     * 清空
     */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix1.elements);
    gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix1.elements);
    /**
     * 绘制
     */
    gl.drawElements(gl.TRIANGLES, deps[1]!.length, gl.UNSIGNED_BYTE, 0);
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix2.elements);
    gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix2.elements);
    /**
     * 绘制
     */
    gl.drawElements(gl.TRIANGLES, deps[1]!.length, gl.UNSIGNED_BYTE, 0);
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix3.elements);
    gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix3.elements);
    /**
     * 绘制
     */
    gl.drawElements(gl.TRIANGLES, deps[1]!.length, gl.UNSIGNED_BYTE, 0);
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix4.elements);
    gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix4.elements);
    /**
     * 绘制
     */
    gl.drawElements(gl.TRIANGLES, deps[1]!.length, gl.UNSIGNED_BYTE, 0);
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix5.elements);
    gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix5.elements);
    /**
     * 绘制
     */
    gl.drawElements(gl.TRIANGLES, deps[1]!.length, gl.UNSIGNED_BYTE, 0);
    /**
     * 数据直接分配到变量
     */
    gl.uniformMatrix4fv(mvpMatrixUniform, false, mvpMatrix6.elements);
    gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix6.elements);
    /**
     * 绘制
     */
    gl.drawElements(gl.TRIANGLES, deps[1]!.length, gl.UNSIGNED_BYTE, 0);
  }, [
    deps,
    mvpMatrix1,
    normalMatrix1,
    mvpMatrix2,
    normalMatrix2,
    mvpMatrix3,
    normalMatrix3,
    mvpMatrix4,
    normalMatrix4,
    mvpMatrix5,
    normalMatrix5,
    mvpMatrix6,
    normalMatrix6,
  ]);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo61;