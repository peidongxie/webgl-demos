import { type FC, useCallback, useRef } from 'react';

import { useGui } from '../../lib/gui-utils';
import { flatArray } from '../../lib/react-utils';
import { type ComponentProps } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4, Vector3 } from '../lib/cuon-matrix';
import {
  type BaseState,
  parseStateStore,
  type StateChangeAction,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

interface DemoState extends BaseState {
  a_Position: GLint;
  a_Color: GLint;
  a_Normal: GLint;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_NormalMatrix: WebGLUniformLocation | null;
  u_LightColor: WebGLUniformLocation | null;
  u_LightDirection: WebGLUniformLocation | null;
  u_AmbientLight: WebGLUniformLocation | null;
  positionColorNormalBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer | null;
  positionColorNormalArray: Float32Array;
  indexArray: Uint8Array;
  mvpMatrices: [Matrix4, Matrix4, Matrix4, Matrix4, Matrix4, Matrix4];
  normalMatrices: [Matrix4, Matrix4, Matrix4, Matrix4, Matrix4, Matrix4];
  modelMatrices: [Matrix4, Matrix4, Matrix4, Matrix4, Matrix4, Matrix4];
  viewProjMatrix: Matrix4;
  lightColorVector: Vector3;
  lightDirectionVector: Vector3;
  ambientLightVector: Vector3;
  points: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ][][][];
  surfaces: [number, number, number][][];
  translations: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  rotations: [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
  camera: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  perspective: [number, number, number, number];
  lights: [number, number, number, number, number, number][];
}

/**
 * 解耦模型顶点
 */
const Demo62: FC<ComponentProps> = () => {
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
      const draw = parseStateStore<DemoState>({
        // 着色器程序
        root: {
          deps: [
            'a_Position',
            'a_Color',
            'a_Normal',
            'u_MvpMatrix',
            'u_NormalMatrix',
            'u_LightColor',
            'u_LightDirection',
            'u_AmbientLight',
          ],
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          },
          onChange: ({ surfaces }, index) => {
            if (index >= 6) return false;
            gl.drawElements(
              gl.TRIANGLES,
              surfaces.flat(2).length,
              gl.UNSIGNED_BYTE,
              0,
            );
            return true;
          },
        },
        // 着色器变量：a_Position
        a_Position: {
          deps: ['positionColorNormalBuffer', 'indexBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Position'),
          onChange: ({ a_Position, positionColorNormalArray }, index) => {
            if (index >= 6) return false;
            gl.vertexAttribPointer(
              a_Position,
              3,
              gl.FLOAT,
              false,
              positionColorNormalArray.BYTES_PER_ELEMENT * 9,
              0,
            );
            gl.enableVertexAttribArray(a_Position);
            return true;
          },
        },
        // 着色器变量：a_Color
        a_Color: {
          deps: ['positionColorNormalBuffer', 'indexBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Color'),
          onChange: ({ a_Color, positionColorNormalArray }, index) => {
            if (index >= 6) return false;
            gl.vertexAttribPointer(
              a_Color,
              3,
              gl.FLOAT,
              false,
              positionColorNormalArray.BYTES_PER_ELEMENT * 9,
              positionColorNormalArray.BYTES_PER_ELEMENT * 3,
            );
            gl.enableVertexAttribArray(a_Color);
            return true;
          },
        },
        // 着色器变量：a_Normal
        a_Normal: {
          deps: ['positionColorNormalBuffer', 'indexBuffer'],
          data: gl.getAttribLocation(gl.program, 'a_Normal'),
          onChange: ({ a_Normal, positionColorNormalArray }, index) => {
            if (index >= 6) return false;
            gl.vertexAttribPointer(
              a_Normal,
              3,
              gl.FLOAT,
              false,
              positionColorNormalArray.BYTES_PER_ELEMENT * 9,
              positionColorNormalArray.BYTES_PER_ELEMENT * 6,
            );
            gl.enableVertexAttribArray(a_Normal);
            return true;
          },
        },
        // 着色器变量：u_MvpMatrix
        u_MvpMatrix: {
          deps: ['mvpMatrices'],
          data: gl.getUniformLocation(gl.program, 'u_MvpMatrix'),
          onChange: ({ u_MvpMatrix, mvpMatrices }, index) => {
            if (index >= 6) return false;
            gl.uniformMatrix4fv(
              u_MvpMatrix,
              false,
              mvpMatrices[index].elements,
            );
            return true;
          },
        },
        // 着色器变量：u_NormalMatrix
        u_NormalMatrix: {
          deps: ['normalMatrices'],
          data: gl.getUniformLocation(gl.program, 'u_NormalMatrix'),
          onChange: ({ u_NormalMatrix, normalMatrices }, index) => {
            if (index >= 6) return false;
            gl.uniformMatrix4fv(
              u_NormalMatrix,
              false,
              normalMatrices[index].elements,
            );
            return true;
          },
        },
        // 着色器变量：u_LightColor
        u_LightColor: {
          deps: ['lightColorVector'],
          data: gl.getUniformLocation(gl.program, 'u_LightColor'),
          onChange: ({ u_LightColor, lightColorVector }) => {
            gl.uniform3fv(u_LightColor, lightColorVector.elements);
          },
        },
        // 着色器变量：u_LightDirection
        u_LightDirection: {
          deps: ['lightDirectionVector'],
          data: gl.getUniformLocation(gl.program, 'u_LightDirection'),
          onChange: ({ u_LightDirection, lightDirectionVector }) => {
            gl.uniform3fv(u_LightDirection, lightDirectionVector.elements);
          },
        },
        // 着色器变量：u_AmbientLight
        u_AmbientLight: {
          deps: ['ambientLightVector'],
          data: gl.getUniformLocation(gl.program, 'u_AmbientLight'),
          onChange: ({ u_AmbientLight, ambientLightVector }) => {
            gl.uniform3fv(u_AmbientLight, ambientLightVector.elements);
          },
        },
        // 派生数据：顶点位置颜色法向缓冲区
        positionColorNormalBuffer: {
          deps: ['positionColorNormalArray'],
          data: gl.createBuffer(),
          onChange: (
            { positionColorNormalBuffer, positionColorNormalArray },
            index,
          ) => {
            if (index >= 6) return false;
            gl.bindBuffer(gl.ARRAY_BUFFER, positionColorNormalBuffer);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              positionColorNormalArray,
              gl.STATIC_DRAW,
            );
            return true;
          },
        },
        // 派生数据：顶点索引缓冲区
        indexBuffer: {
          deps: ['indexArray'],
          data: gl.createBuffer(),
          onChange: ({ indexBuffer, indexArray }) => {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
          },
        },
        // 派生数据：顶点位置颜色法向数组
        positionColorNormalArray: {
          deps: ['points'],
          data: new Float32Array(216),
          onChange: ({ positionColorNormalArray, points }, index) => {
            if (index >= 6) return false;
            positionColorNormalArray.set(flatArray(points[index]));
            return true;
          },
        },
        // 派生数据：顶点索引数组
        indexArray: {
          deps: ['surfaces'],
          data: new Uint8Array(36),
          onChange: ({ indexArray, surfaces }) => {
            indexArray.set(flatArray(surfaces));
          },
        },
        // 派生数据：模型视图投影矩阵
        mvpMatrices: {
          deps: ['modelMatrices', 'viewProjMatrix'],
          data: [
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
          ],
          onChange: ({ mvpMatrices, modelMatrices, viewProjMatrix }, index) => {
            if (index >= 6) return false;
            mvpMatrices[index]
              .set(viewProjMatrix)
              .multiply(modelMatrices[index]);
            return true;
          },
        },
        // 派生数据：法向量矩阵
        normalMatrices: {
          deps: ['modelMatrices'],
          data: [
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
          ],
          onChange: ({ normalMatrices, modelMatrices }, index) => {
            if (index >= 6) return false;
            normalMatrices[index]
              .setInverseOf(modelMatrices[index])
              .transpose();
            return true;
          },
        },
        // 派生数据：模型矩阵
        modelMatrices: {
          deps: ['translations', 'rotations'],
          data: [
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
          ],
          onChange: ({ modelMatrices, translations, rotations }, index) => {
            if (index >= 6) return false;
            const modelMatrix = modelMatrices[index];
            modelMatrix.setIdentity();
            for (let i = 0; i <= index; i++) {
              if (index === 5 && i === 4) continue;
              const [translationX, translationY, translationZ] =
                translations[i];
              const [angle, rotationX, rotationY, rotationZ] = rotations[i];
              modelMatrix
                .translate(translationX, translationY, translationZ)
                .rotate(angle, rotationX, rotationY, rotationZ);
            }
            return true;
          },
        },
        // 派生数据：视图投影矩阵
        viewProjMatrix: {
          deps: ['camera', 'perspective'],
          data: new Matrix4(),
          onChange: ({ viewProjMatrix, camera, perspective }) => {
            const [eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ] =
              camera;
            const [fovy, aspect, perspectiveNear, perspectiveFar] = perspective;
            viewProjMatrix
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
              );
          },
        },
        // 派生数据：光线颜色向量
        lightColorVector: {
          deps: ['lights'],
          data: new Vector3(),
          onChange: ({ lightColorVector, lights }) => {
            lightColorVector.setColor(lights[0][0], lights[0][1], lights[0][2]);
          },
        },
        // 派生数据：光线方向向量
        lightDirectionVector: {
          deps: ['lights'],
          data: new Vector3(),
          onChange: ({ lightDirectionVector, lights }) => {
            lightDirectionVector
              .setDirection(lights[0][3], lights[0][4], lights[0][5])
              .normalize();
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
          data: [],
        },
        // 原子数据：表面
        surfaces: {
          deps: [],
          data: [],
        },
        // 原子数据：平移
        translations: {
          deps: [],
          data: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ],
        },
        // 原子数据：旋转
        rotations: {
          deps: [],
          data: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
        },
        // 原子数据：相机
        camera: {
          deps: [],
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        // 原子数据：透视
        perspective: {
          deps: [],
          data: [0, 0, 0, 0],
        },
        // 原子数据：光线
        lights: {
          deps: [],
          data: [],
        },
      });
      draw({
        points: [
          [
            [
              [5.0, 2.0, 5.0, 1, 0.4, 0, 0, 0, 1],
              [-5.0, 2.0, 5.0, 1, 0.4, 0, 0, 0, 1],
              [-5.0, 0.0, 5.0, 1, 0.4, 0, 0, 0, 1],
              [5.0, 0.0, 5.0, 1, 0.4, 0, 0, 0, 1],
            ],
            [
              [5.0, 2.0, 5.0, 1, 0.4, 0, 1, 0, 0],
              [5.0, 0.0, 5.0, 1, 0.4, 0, 1, 0, 0],
              [5.0, 0.0, -5.0, 1, 0.4, 0, 1, 0, 0],
              [5.0, 2.0, -5.0, 1, 0.4, 0, 1, 0, 0],
            ],
            [
              [5.0, 2.0, 5.0, 1, 0.4, 0, 0, 1, 0],
              [5.0, 2.0, -5.0, 1, 0.4, 0, 0, 1, 0],
              [-5.0, 2.0, -5.0, 1, 0.4, 0, 0, 1, 0],
              [-5.0, 2.0, 5.0, 1, 0.4, 0, 0, 1, 0],
            ],
            [
              [-5.0, 2.0, 5.0, 1, 0.4, 0, -1, 0, 0],
              [-5.0, 2.0, -5.0, 1, 0.4, 0, -1, 0, 0],
              [-5.0, 0.0, -5.0, 1, 0.4, 0, -1, 0, 0],
              [-5.0, 0.0, 5.0, 1, 0.4, 0, -1, 0, 0],
            ],
            [
              [-5.0, 0.0, -5.0, 1, 0.4, 0, 0, -1, 0],
              [5.0, 0.0, -5.0, 1, 0.4, 0, 0, -1, 0],
              [5.0, 0.0, 5.0, 1, 0.4, 0, 0, -1, 0],
              [-5.0, 0.0, 5.0, 1, 0.4, 0, 0, -1, 0],
            ],
            [
              [5.0, 0.0, -5.0, 1, 0.4, 0, 0, 0, -1],
              [-5.0, 0.0, -5.0, 1, 0.4, 0, 0, 0, -1],
              [-5.0, 2.0, -5.0, 1, 0.4, 0, 0, 0, -1],
              [5.0, 2.0, -5.0, 1, 0.4, 0, 0, 0, -1],
            ],
          ],
          [
            [
              [1.5, 10.0, 1.5, 1, 0.4, 0, 0, 0, 1],
              [-1.5, 10.0, 1.5, 1, 0.4, 0, 0, 0, 1],
              [-1.5, 0.0, 1.5, 1, 0.4, 0, 0, 0, 1],
              [1.5, 0.0, 1.5, 1, 0.4, 0, 0, 0, 1],
            ],
            [
              [1.5, 10.0, 1.5, 1, 0.4, 0, 1, 0, 0],
              [1.5, 0.0, 1.5, 1, 0.4, 0, 1, 0, 0],
              [1.5, 0.0, -1.5, 1, 0.4, 0, 1, 0, 0],
              [1.5, 10.0, -1.5, 1, 0.4, 0, 1, 0, 0],
            ],
            [
              [1.5, 10.0, 1.5, 1, 0.4, 0, 0, 1, 0],
              [1.5, 10.0, -1.5, 1, 0.4, 0, 0, 1, 0],
              [-1.5, 10.0, -1.5, 1, 0.4, 0, 0, 1, 0],
              [-1.5, 10.0, 1.5, 1, 0.4, 0, 0, 1, 0],
            ],
            [
              [-1.5, 10.0, 1.5, 1, 0.4, 0, -1, 0, 0],
              [-1.5, 10.0, -1.5, 1, 0.4, 0, -1, 0, 0],
              [-1.5, 0.0, -1.5, 1, 0.4, 0, -1, 0, 0],
              [-1.5, 0.0, 1.5, 1, 0.4, 0, -1, 0, 0],
            ],
            [
              [-1.5, 0.0, -1.5, 1, 0.4, 0, 0, -1, 0],
              [1.5, 0.0, -1.5, 1, 0.4, 0, 0, -1, 0],
              [1.5, 0.0, 1.5, 1, 0.4, 0, 0, -1, 0],
              [-1.5, 0.0, 1.5, 1, 0.4, 0, 0, -1, 0],
            ],
            [
              [1.5, 0.0, -1.5, 1, 0.4, 0, 0, 0, -1],
              [-1.5, 0.0, -1.5, 1, 0.4, 0, 0, 0, -1],
              [-1.5, 10.0, -1.5, 1, 0.4, 0, 0, 0, -1],
              [1.5, 10.0, -1.5, 1, 0.4, 0, 0, 0, -1],
            ],
          ],
          [
            [
              [2.0, 10.0, 2.0, 1, 0.4, 0, 0, 0, 1],
              [-2.0, 10.0, 2.0, 1, 0.4, 0, 0, 0, 1],
              [-2.0, 0.0, 2.0, 1, 0.4, 0, 0, 0, 1],
              [2.0, 0.0, 2.0, 1, 0.4, 0, 0, 0, 1],
            ],
            [
              [2.0, 10.0, 2.0, 1, 0.4, 0, 1, 0, 0],
              [2.0, 0.0, 2.0, 1, 0.4, 0, 1, 0, 0],
              [2.0, 0.0, -2.0, 1, 0.4, 0, 1, 0, 0],
              [2.0, 10.0, -2.0, 1, 0.4, 0, 1, 0, 0],
            ],
            [
              [2.0, 10.0, 2.0, 1, 0.4, 0, 0, 1, 0],
              [2.0, 10.0, -2.0, 1, 0.4, 0, 0, 1, 0],
              [-2.0, 10.0, -2.0, 1, 0.4, 0, 0, 1, 0],
              [-2.0, 10.0, 2.0, 1, 0.4, 0, 0, 1, 0],
            ],
            [
              [-2.0, 10.0, 2.0, 1, 0.4, 0, -1, 0, 0],
              [-2.0, 10.0, -2.0, 1, 0.4, 0, -1, 0, 0],
              [-2.0, 0.0, -2.0, 1, 0.4, 0, -1, 0, 0],
              [-2.0, 0.0, 2.0, 1, 0.4, 0, -1, 0, 0],
            ],
            [
              [-2.0, 0.0, -2.0, 1, 0.4, 0, 0, -1, 0],
              [2.0, 0.0, -2.0, 1, 0.4, 0, 0, -1, 0],
              [2.0, 0.0, 2.0, 1, 0.4, 0, 0, -1, 0],
              [-2.0, 0.0, 2.0, 1, 0.4, 0, 0, -1, 0],
            ],
            [
              [2.0, 0.0, -2.0, 1, 0.4, 0, 0, 0, -1],
              [-2.0, 0.0, -2.0, 1, 0.4, 0, 0, 0, -1],
              [-2.0, 10.0, -2.0, 1, 0.4, 0, 0, 0, -1],
              [2.0, 10.0, -2.0, 1, 0.4, 0, 0, 0, -1],
            ],
          ],
          [
            [
              [1.0, 2.0, 3.0, 1, 0.4, 0, 0, 0, 1],
              [-1.0, 2.0, 3.0, 1, 0.4, 0, 0, 0, 1],
              [-1.0, 0.0, 3.0, 1, 0.4, 0, 0, 0, 1],
              [1.0, 0.0, 3.0, 1, 0.4, 0, 0, 0, 1],
            ],
            [
              [1.0, 2.0, 3.0, 1, 0.4, 0, 1, 0, 0],
              [1.0, 0.0, 3.0, 1, 0.4, 0, 1, 0, 0],
              [1.0, 0.0, -3.0, 1, 0.4, 0, 1, 0, 0],
              [1.0, 2.0, -3.0, 1, 0.4, 0, 1, 0, 0],
            ],
            [
              [1.0, 2.0, 3.0, 1, 0.4, 0, 0, 1, 0],
              [1.0, 2.0, -3.0, 1, 0.4, 0, 0, 1, 0],
              [-1.0, 2.0, -3.0, 1, 0.4, 0, 0, 1, 0],
              [-1.0, 2.0, 3.0, 1, 0.4, 0, 0, 1, 0],
            ],
            [
              [-1.0, 2.0, 3.0, 1, 0.4, 0, -1, 0, 0],
              [-1.0, 2.0, -3.0, 1, 0.4, 0, -1, 0, 0],
              [-1.0, 0.0, -3.0, 1, 0.4, 0, -1, 0, 0],
              [-1.0, 0.0, 3.0, 1, 0.4, 0, -1, 0, 0],
            ],
            [
              [-1.0, 0.0, -3.0, 1, 0.4, 0, 0, -1, 0],
              [1.0, 0.0, -3.0, 1, 0.4, 0, 0, -1, 0],
              [1.0, 0.0, 3.0, 1, 0.4, 0, 0, -1, 0],
              [-1.0, 0.0, 3.0, 1, 0.4, 0, 0, -1, 0],
            ],
            [
              [1.0, 0.0, -3.0, 1, 0.4, 0, 0, 0, -1],
              [-1.0, 0.0, -3.0, 1, 0.4, 0, 0, 0, -1],
              [-1.0, 2.0, -3.0, 1, 0.4, 0, 0, 0, -1],
              [1.0, 2.0, -3.0, 1, 0.4, 0, 0, 0, -1],
            ],
          ],
          [
            [
              [0.5, 2.0, 0.5, 1, 0.4, 0, 0, 0, 1],
              [-0.5, 2.0, 0.5, 1, 0.4, 0, 0, 0, 1],
              [-0.5, 0.0, 0.5, 1, 0.4, 0, 0, 0, 1],
              [0.5, 0.0, 0.5, 1, 0.4, 0, 0, 0, 1],
            ],
            [
              [0.5, 2.0, 0.5, 1, 0.4, 0, 1, 0, 0],
              [0.5, 0.0, 0.5, 1, 0.4, 0, 1, 0, 0],
              [0.5, 0.0, -0.5, 1, 0.4, 0, 1, 0, 0],
              [0.5, 2.0, -0.5, 1, 0.4, 0, 1, 0, 0],
            ],
            [
              [0.5, 2.0, 0.5, 1, 0.4, 0, 0, 1, 0],
              [0.5, 2.0, -0.5, 1, 0.4, 0, 0, 1, 0],
              [-0.5, 2.0, -0.5, 1, 0.4, 0, 0, 1, 0],
              [-0.5, 2.0, 0.5, 1, 0.4, 0, 0, 1, 0],
            ],
            [
              [-0.5, 2.0, 0.5, 1, 0.4, 0, -1, 0, 0],
              [-0.5, 2.0, -0.5, 1, 0.4, 0, -1, 0, 0],
              [-0.5, 0.0, -0.5, 1, 0.4, 0, -1, 0, 0],
              [-0.5, 0.0, 0.5, 1, 0.4, 0, -1, 0, 0],
            ],
            [
              [-0.5, 0.0, -0.5, 1, 0.4, 0, 0, -1, 0],
              [0.5, 0.0, -0.5, 1, 0.4, 0, 0, -1, 0],
              [0.5, 0.0, 0.5, 1, 0.4, 0, 0, -1, 0],
              [-0.5, 0.0, 0.5, 1, 0.4, 0, 0, -1, 0],
            ],
            [
              [0.5, 0.0, -0.5, 1, 0.4, 0, 0, 0, -1],
              [-0.5, 0.0, -0.5, 1, 0.4, 0, 0, 0, -1],
              [-0.5, 2.0, -0.5, 1, 0.4, 0, 0, 0, -1],
              [0.5, 2.0, -0.5, 1, 0.4, 0, 0, 0, -1],
            ],
          ],
          [
            [
              [0.5, 2.0, 0.5, 1, 0.4, 0, 0, 0, 1],
              [-0.5, 2.0, 0.5, 1, 0.4, 0, 0, 0, 1],
              [-0.5, 0.0, 0.5, 1, 0.4, 0, 0, 0, 1],
              [0.5, 0.0, 0.5, 1, 0.4, 0, 0, 0, 1],
            ],
            [
              [0.5, 2.0, 0.5, 1, 0.4, 0, 1, 0, 0],
              [0.5, 0.0, 0.5, 1, 0.4, 0, 1, 0, 0],
              [0.5, 0.0, -0.5, 1, 0.4, 0, 1, 0, 0],
              [0.5, 2.0, -0.5, 1, 0.4, 0, 1, 0, 0],
            ],
            [
              [0.5, 2.0, 0.5, 1, 0.4, 0, 0, 1, 0],
              [0.5, 2.0, -0.5, 1, 0.4, 0, 0, 1, 0],
              [-0.5, 2.0, -0.5, 1, 0.4, 0, 0, 1, 0],
              [-0.5, 2.0, 0.5, 1, 0.4, 0, 0, 1, 0],
            ],
            [
              [-0.5, 2.0, 0.5, 1, 0.4, 0, -1, 0, 0],
              [-0.5, 2.0, -0.5, 1, 0.4, 0, -1, 0, 0],
              [-0.5, 0.0, -0.5, 1, 0.4, 0, -1, 0, 0],
              [-0.5, 0.0, 0.5, 1, 0.4, 0, -1, 0, 0],
            ],
            [
              [-0.5, 0.0, -0.5, 1, 0.4, 0, 0, -1, 0],
              [0.5, 0.0, -0.5, 1, 0.4, 0, 0, -1, 0],
              [0.5, 0.0, 0.5, 1, 0.4, 0, 0, -1, 0],
              [-0.5, 0.0, 0.5, 1, 0.4, 0, 0, -1, 0],
            ],
            [
              [0.5, 0.0, -0.5, 1, 0.4, 0, 0, 0, -1],
              [-0.5, 0.0, -0.5, 1, 0.4, 0, 0, 0, -1],
              [-0.5, 2.0, -0.5, 1, 0.4, 0, 0, 0, -1],
              [0.5, 2.0, -0.5, 1, 0.4, 0, 0, 0, -1],
            ],
          ],
        ],
        surfaces: [
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
        ],
        translations: [
          [0, -12, 0],
          [0, 2, 0],
          [0, 10, 0],
          [0, 10, 0],
          [0, 2, 2],
          [0, 2, -2],
        ],
        rotations: [
          [0, 0, 0, 0],
          [90, 0, 1, 0],
          [45, 0, 0, 1],
          [0, 0, 1, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
        ],
        camera: [20, 10, 30, 0, 0, 0, 0, 1, 0],
        perspective: [50, canvas.width / canvas.height, 1, 100],
        lights: [
          [1, 1, 1, 0, 0.5, 0.7],
          [0.1, 0.1, 0.1, 0, 0, 0],
        ],
      });
      drawRef.current = draw;
    },
    [],
  );

  useGui(
    [
      {
        type: 'function',
        name: '手臂逆时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[1];
            return {
              points,
              rotations: [
                rotations[0],
                [angle + 3, rotationX, rotationY, rotationZ],
                rotations[2],
                rotations[3],
                rotations[4],
                rotations[5],
              ],
            };
          });
        },
      },
      {
        type: 'function',
        name: '手臂顺时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[1];
            return {
              points,
              rotations: [
                rotations[0],
                [angle - 3, rotationX, rotationY, rotationZ],
                rotations[2],
                rotations[3],
                rotations[4],
                rotations[5],
              ],
            };
          });
        },
      },
      {
        type: 'function',
        name: '前臂逆时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[2];
            if (angle >= 135) return { rotations };
            return {
              points,
              rotations: [
                rotations[0],
                rotations[1],
                [angle + 3, rotationX, rotationY, rotationZ],
                rotations[3],
                rotations[4],
                rotations[5],
              ],
            };
          });
        },
      },
      {
        type: 'function',
        name: '前臂顺时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[2];
            if (angle <= -135) return { rotations };
            return {
              points,
              rotations: [
                rotations[0],
                rotations[1],
                [angle - 3, rotationX, rotationY, rotationZ],
                rotations[3],
                rotations[4],
                rotations[5],
              ],
            };
          });
        },
      },
      {
        type: 'function',
        name: '手掌逆时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[3];
            return {
              points,
              rotations: [
                rotations[0],
                rotations[1],
                rotations[2],
                [angle + 3, rotationX, rotationY, rotationZ],
                rotations[4],
                rotations[5],
              ],
            };
          });
        },
      },
      {
        type: 'function',
        name: '手掌顺时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[3];
            return {
              points,
              rotations: [
                rotations[0],
                rotations[1],
                rotations[2],
                [angle - 3, rotationX, rotationY, rotationZ],
                rotations[4],
                rotations[5],
              ],
            };
          });
        },
      },
      {
        type: 'function',
        name: '手指逆时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[4];
            if (angle >= 60) return { rotations };
            return {
              points,
              rotations: [
                rotations[0],
                rotations[1],
                rotations[2],
                rotations[3],
                [angle + 3, rotationX, rotationY, rotationZ],
                [-angle - 3, rotationX, rotationY, rotationZ],
              ],
            };
          });
        },
      },
      {
        type: 'function',
        name: '手指顺时针旋转',
        initialValue: () => {
          const draw = drawRef.current;
          if (!draw) return;
          draw(({ points, rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[4];
            if (angle <= -60) return { rotations };
            return {
              points,
              rotations: [
                rotations[0],
                rotations[1],
                rotations[2],
                rotations[3],
                [angle - 3, rotationX, rotationY, rotationZ],
                [-angle + 3, rotationX, rotationY, rotationZ],
              ],
            };
          });
        },
      },
    ],
    {
      container: '#gui-demo',
      title: '模型控件',
    },
  );

  return (
    <Canvas
      glVertexShader={VSHADER_SOURCE}
      glFragmentShader={FSHADER_SOURCE}
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo62;
