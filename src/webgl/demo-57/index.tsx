import { type FC, useCallback, useRef } from 'react';

import Canvas from '../../component/canvas';
import {
  flatArray,
  makeWebGLDraw,
  Matrix4,
  type StateChangeAction,
  type StateWithRoot,
  Vector3,
} from '../../lib';
import { type ComponentProps, type Tuple } from '../../type';
import FSHADER from './fragment.glsl?raw';
import VSHADER from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
  a_Position: GLint;
  a_Color: GLint;
  a_Normal: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_ModelMatrix: WebGLUniformLocation | null;
  u_NormalMatrix: WebGLUniformLocation | null;
  u_LightColor: WebGLUniformLocation | null;
  u_LightPosition: WebGLUniformLocation | null;
  u_AmbientLight: WebGLUniformLocation | null;
  positionColorNormalBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  positionColorNormalArray: Float32Array;
  indexArray: Uint8Array;
  mvpMatrix: Matrix4;
  normalMatrix: Matrix4;
  modelMatrix: Matrix4;
  lightColorVector: Vector3;
  lightPositionVector: Vector3;
  ambientLightVector: Vector3;
  points: Tuple<number, 9>[];
  surfaces: Tuple<Tuple<number, 3>, 2>[];
  rotation: Tuple<number, 4>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  lights: Tuple<Tuple<number, 6>, 2>;
}>;

const DIVISION = 13;

/**
 * 逐片元绘制
 */
const Demo57: FC<ComponentProps> = () => {
  const drawRef = useRef<StateChangeAction<DemoState> | null>(null);

  const handleWindowResize = useCallback(
    (canvas?: HTMLCanvasElement, gl?: WebGLRenderingContext) => {
      if (!canvas) return;
      if (!gl) return;
      const draw = drawRef.current;
      if (!draw) return;
      draw(({ perspective }) => ({
        perspective: [
          perspective[0],
          canvas.width / canvas.height,
          perspective[2],
          perspective[3],
        ],
      }));
    },
    [],
  );

  const handleProgramInit = useCallback(
    (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) => {
      const draw = makeWebGLDraw<DemoState>(
        gl,
        VSHADER,
        FSHADER,
        (program) => ({
          // 着色器程序
          root: {
            deps: [
              'a_Position',
              'a_Color',
              'a_Normal',
              'u_MvpMatrix',
              'u_ModelMatrix',
              'u_NormalMatrix',
              'u_LightColor',
              'u_LightPosition',
              'u_AmbientLight',
            ],
            data: () => {
              gl.clearColor(0, 0, 0, 1);
              gl.enable(gl.DEPTH_TEST);
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
              return 1;
            },
            onChange: ({ surfaces }) => {
              gl.drawElements(
                gl.TRIANGLES,
                surfaces.flat(2).length,
                gl.UNSIGNED_BYTE,
                0,
              );
            },
          },
          // 着色器变量：a_Position
          a_Position: {
            deps: ['positionColorNormalBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Position'),
            onChange: ({ a_Position, positionColorNormalArray }) => {
              gl.vertexAttribPointer(
                a_Position,
                3,
                gl.FLOAT,
                false,
                positionColorNormalArray.BYTES_PER_ELEMENT * 9,
                0,
              );
              gl.enableVertexAttribArray(a_Position);
            },
          },
          // 着色器变量：a_Color
          a_Color: {
            deps: ['positionColorNormalBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Color'),
            onChange: ({ a_Color, positionColorNormalArray }) => {
              gl.vertexAttribPointer(
                a_Color,
                3,
                gl.FLOAT,
                false,
                positionColorNormalArray.BYTES_PER_ELEMENT * 9,
                positionColorNormalArray.BYTES_PER_ELEMENT * 3,
              );
              gl.enableVertexAttribArray(a_Color);
            },
          },
          // 着色器变量：a_Normal
          a_Normal: {
            deps: ['positionColorNormalBuffer', 'indexBuffer'],
            data: gl.getAttribLocation(program!, 'a_Normal'),
            onChange: ({ a_Normal, positionColorNormalArray }) => {
              gl.vertexAttribPointer(
                a_Normal,
                3,
                gl.FLOAT,
                false,
                positionColorNormalArray.BYTES_PER_ELEMENT * 9,
                positionColorNormalArray.BYTES_PER_ELEMENT * 6,
              );
              gl.enableVertexAttribArray(a_Normal);
            },
          },
          // 着色器变量：u_MvpMatrix
          u_MvpMatrix: {
            deps: ['mvpMatrix'],
            data: gl.getUniformLocation(program!, 'u_MvpMatrix'),
            onChange: ({ u_MvpMatrix, mvpMatrix }) => {
              gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
            },
          },
          // 着色器变量：u_ModelMatrix
          u_ModelMatrix: {
            deps: ['modelMatrix'],
            data: gl.getUniformLocation(program!, 'u_ModelMatrix'),
            onChange: ({ u_ModelMatrix, modelMatrix }) => {
              gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            },
          },
          // 着色器变量：u_NormalMatrix
          u_NormalMatrix: {
            deps: ['normalMatrix'],
            data: gl.getUniformLocation(program!, 'u_NormalMatrix'),
            onChange: ({ u_NormalMatrix, normalMatrix }) => {
              gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
            },
          },
          // 着色器变量：u_LightColor
          u_LightColor: {
            deps: ['lightColorVector'],
            data: gl.getUniformLocation(program!, 'u_LightColor'),
            onChange: ({ u_LightColor, lightColorVector }) => {
              gl.uniform3fv(u_LightColor, lightColorVector.elements);
            },
          },
          // 着色器变量：u_LightPosition
          u_LightPosition: {
            deps: ['lightPositionVector'],
            data: gl.getUniformLocation(program!, 'u_LightPosition'),
            onChange: ({ u_LightPosition, lightPositionVector }) => {
              gl.uniform3fv(u_LightPosition, lightPositionVector.elements);
            },
          },
          // 着色器变量：u_AmbientLight
          u_AmbientLight: {
            deps: ['ambientLightVector'],
            data: gl.getUniformLocation(program!, 'u_AmbientLight'),
            onChange: ({ u_AmbientLight, ambientLightVector }) => {
              gl.uniform3fv(u_AmbientLight, ambientLightVector.elements);
            },
          },
          // 派生数据：顶点位置颜色法向缓冲区
          positionColorNormalBuffer: {
            deps: ['positionColorNormalArray'],
            data: gl.createBuffer(),
            onChange: ({
              positionColorNormalBuffer,
              positionColorNormalArray,
            }) => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionColorNormalBuffer);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                positionColorNormalArray,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：顶点索引缓冲区
          indexBuffer: {
            deps: ['indexArray'],
            data: gl.createBuffer(),
            onChange: ({ indexBuffer, indexArray }) => {
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
              gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                indexArray,
                gl.STATIC_DRAW,
              );
            },
          },
          // 派生数据：顶点位置颜色法向数组
          positionColorNormalArray: {
            deps: ['points'],
            data: new Float32Array(9 * (DIVISION + 1) * (DIVISION + 1)),
            onChange: ({ positionColorNormalArray, points }) => {
              positionColorNormalArray.set(flatArray(points));
            },
          },
          // 派生数据：顶点索引数组
          indexArray: {
            deps: ['surfaces'],
            data: new Uint8Array(3 * 2 * DIVISION * DIVISION),
            onChange: ({ indexArray, surfaces }) => {
              indexArray.set(flatArray(surfaces));
            },
          },
          // 派生数据：模型视图投影矩阵
          mvpMatrix: {
            deps: ['modelMatrix', 'camera', 'perspective'],
            data: new Matrix4(),
            onChange: ({ mvpMatrix, modelMatrix, camera, perspective }) => {
              const [
                eyeX,
                eyeY,
                eyeZ,
                centerX,
                centerY,
                centerZ,
                upX,
                upY,
                upZ,
              ] = camera;
              const [fovy, aspect, perspectiveNear, perspectiveFar] =
                perspective;
              mvpMatrix
                .setPerspective(fovy, aspect, perspectiveNear, perspectiveFar)
                .lookAt(
                  eyeX,
                  eyeY,
                  eyeZ,
                  centerX,
                  centerY,
                  centerZ,
                  upX,
                  upY,
                  upZ,
                )
                .multiply(modelMatrix);
            },
          },
          // 派生数据：法向量矩阵
          normalMatrix: {
            deps: ['modelMatrix'],
            data: new Matrix4(),
            onChange: ({ normalMatrix, modelMatrix }) => {
              normalMatrix.setInverseOf(modelMatrix).transpose();
            },
          },
          // 派生数据：模型矩阵
          modelMatrix: {
            deps: ['rotation'],
            data: new Matrix4(),
            onChange: ({ modelMatrix, rotation }) => {
              const [angle, rotationX, rotationY, rotationZ] = rotation;
              modelMatrix.setRotate(angle, rotationX, rotationY, rotationZ);
            },
          },
          // 派生数据：光线颜色向量
          lightColorVector: {
            deps: ['lights'],
            data: new Vector3(),
            onChange: ({ lightColorVector, lights }) => {
              lightColorVector.setColor(
                lights[0][0],
                lights[0][1],
                lights[0][2],
              );
            },
          },
          // 派生数据：光线方向向量
          lightPositionVector: {
            deps: ['lights'],
            data: new Vector3(),
            onChange: ({ lightPositionVector, lights }) => {
              lightPositionVector.setPosition(
                lights[0][3],
                lights[0][4],
                lights[0][5],
              );
            },
          },
          // 派生数据：环境光颜色向量
          ambientLightVector: {
            deps: ['lights'],
            data: new Vector3(),
            onChange: ({ ambientLightVector, lights }) => {
              ambientLightVector.setColor(
                lights[1][0],
                lights[1][1],
                lights[1][2],
              );
            },
          },
          // 原子数据：顶点
          points: {
            deps: [],
          },
          // 原子数据：表面
          surfaces: {
            deps: [],
          },
          // 原子数据：旋转
          rotation: {
            deps: [],
          },
          // 原子数据：相机
          camera: {
            deps: [],
          },
          // 原子数据：透视
          perspective: {
            deps: [],
          },
          // 原子数据：光线
          lights: {
            deps: [],
          },
        }),
      );
      const points: Tuple<number, 9>[] = [];
      const surfaces: Tuple<Tuple<number, 3>, 2>[] = [];
      for (let i = 0; i <= DIVISION; i++) {
        const latitude = (Math.PI * i) / DIVISION;
        const sinLatitude = Math.sin(latitude);
        const cosLatitude = Math.cos(latitude);
        for (let j = 0; j <= DIVISION; j++) {
          const longitude = (Math.PI * j * 2) / DIVISION;
          const sinLongitude = Math.sin(longitude);
          const cosLongitude = Math.cos(longitude);
          const x = sinLatitude * sinLongitude;
          const y = cosLatitude;
          const z = sinLatitude * cosLongitude;
          points.push([x, y, z, 1, 1, 1, x, y, z]);
        }
      }
      for (let i = 0; i < DIVISION; i++) {
        for (let j = 0; j < DIVISION; j++) {
          const index = (DIVISION + 1) * i + j;
          surfaces.push([
            [index, index + DIVISION + 1, index + 1],
            [index + 1, index + DIVISION + 1, index + DIVISION + 2],
          ]);
        }
      }
      draw({
        points,
        surfaces,
        rotation: [90, 0, 1, 0],
        camera: [0, 0, 6, 0, 0, 0, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
        lights: [
          [0.8, 0.8, 0.8, 5, 8, 7],
          [0.2, 0.2, 0.2, 0, 0, 0],
        ],
      });
      drawRef.current = draw;
    },
    [],
  );

  return (
    <Canvas
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo57;
