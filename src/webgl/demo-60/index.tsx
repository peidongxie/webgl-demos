import { type FC, useCallback, useRef } from 'react';

import { useGui } from '../../lib/gui-utils';
import { flatArray } from '../../lib/react-utils';
import { type ComponentProps, type Tuple } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4, Vector3 } from '../lib/cuon-matrix';
import {
  parseStateStore,
  type StateChangeAction,
  type StateWithRoot,
} from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

type DemoState = StateWithRoot<{
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
  mvpMatrices: Tuple<Matrix4, 2>;
  normalMatrices: Tuple<Matrix4, 2>;
  modelMatrices: Tuple<Matrix4, 2>;
  viewProjMatrix: Matrix4;
  lightColorVector: Vector3;
  lightDirectionVector: Vector3;
  ambientLightVector: Vector3;
  points: Tuple<Tuple<Tuple<number, 9>, 4>, 6>;
  surfaces: Tuple<Tuple<Tuple<number, 3>, 2>, 6>;
  translations: Tuple<Tuple<number, 3>, 2>;
  rotations: Tuple<Tuple<number, 4>, 2>;
  scales: Tuple<Tuple<number, 3>, 2>;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  lights: Tuple<Tuple<number, 6>, 2>;
}>;

/**
 * 绘制单关节
 */
const Demo60: FC<ComponentProps> = () => {
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
          type: 'dynamic',
          data: () => {
            gl.clearColor(0, 0, 0, 1);
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            return 2;
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
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Position',
          ),
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
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Color',
          ),
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
          data: gl.getAttribLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'a_Normal',
          ),
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
          deps: ['mvpMatrices'],
          type: 'dynamic',
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_MvpMatrix',
          ),
          onChange: ({ u_MvpMatrix, mvpMatrices }, index) => {
            gl.uniformMatrix4fv(
              u_MvpMatrix,
              false,
              mvpMatrices[index].elements,
            );
          },
        },
        // 着色器变量：u_NormalMatrix
        u_NormalMatrix: {
          deps: ['normalMatrices'],
          type: 'dynamic',
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_NormalMatrix',
          ),
          onChange: ({ u_NormalMatrix, normalMatrices }, index) => {
            gl.uniformMatrix4fv(
              u_NormalMatrix,
              false,
              normalMatrices[index].elements,
            );
          },
        },
        // 着色器变量：u_LightColor
        u_LightColor: {
          deps: ['lightColorVector'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_LightColor',
          ),
          onChange: ({ u_LightColor, lightColorVector }) => {
            gl.uniform3fv(u_LightColor, lightColorVector.elements);
          },
        },
        // 着色器变量：u_LightDirection
        u_LightDirection: {
          deps: ['lightDirectionVector'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_LightDirection',
          ),
          onChange: ({ u_LightDirection, lightDirectionVector }) => {
            gl.uniform3fv(u_LightDirection, lightDirectionVector.elements);
          },
        },
        // 着色器变量：u_AmbientLight
        u_AmbientLight: {
          deps: ['ambientLightVector'],
          data: gl.getUniformLocation(
            gl.getParameter(gl.CURRENT_PROGRAM)!,
            'u_AmbientLight',
          ),
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
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
          },
        },
        // 派生数据：顶点位置颜色法向数组
        positionColorNormalArray: {
          deps: ['points'],
          data: new Float32Array(216),
          onChange: ({ positionColorNormalArray, points }) => {
            positionColorNormalArray.set(flatArray(points));
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
          type: 'multi',
          data: [new Matrix4(), new Matrix4()],
          onChange: ({ mvpMatrices, modelMatrices, viewProjMatrix }, index) => {
            mvpMatrices[index]
              .set(viewProjMatrix)
              .multiply(modelMatrices[index]);
          },
        },
        // 派生数据：法向量矩阵
        normalMatrices: {
          deps: ['modelMatrices'],
          type: 'multi',
          data: [new Matrix4(), new Matrix4()],
          onChange: ({ normalMatrices, modelMatrices }, index) => {
            normalMatrices[index]
              .setInverseOf(modelMatrices[index])
              .transpose();
          },
        },
        // 派生数据：模型矩阵
        modelMatrices: {
          deps: ['translations', 'rotations', 'scales'],
          type: 'multi',
          data: [new Matrix4(), new Matrix4()],
          onChange: (
            { modelMatrices, translations, rotations, scales },
            index,
          ) => {
            const modelMatrix = modelMatrices[index];
            modelMatrix.setIdentity();
            for (let i = 0; i <= index; i++) {
              const [translationX, translationY, translationZ] =
                translations[i];
              const [angle, rotationX, rotationY, rotationZ] = rotations[i];
              modelMatrix
                .translate(translationX, translationY, translationZ)
                .rotate(angle, rotationX, rotationY, rotationZ);
            }
            const [scaleX, scaleY, scaleZ] = scales[index];
            modelMatrix.scale(scaleX, scaleY, scaleZ);
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
        },
        // 原子数据：表面
        surfaces: {
          deps: [],
        },
        // 原子数据：平移
        translations: {
          deps: [],
        },
        // 原子数据：旋转
        rotations: {
          deps: [],
        },
        // 原子数据：缩放
        scales: {
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
      });
      draw({
        points: [
          [
            [1.5, 10, 1.5, 1, 0.4, 0, 0, 0, 1],
            [-1.5, 10, 1.5, 1, 0.4, 0, 0, 0, 1],
            [-1.5, 0, 1.5, 1, 0.4, 0, 0, 0, 1],
            [1.5, 0, 1.5, 1, 0.4, 0, 0, 0, 1],
          ],
          [
            [1.5, 10, 1.5, 1, 0.4, 0, 1, 0, 0],
            [1.5, 0, 1.5, 1, 0.4, 0, 1, 0, 0],
            [1.5, 0, -1.5, 1, 0.4, 0, 1, 0, 0],
            [1.5, 10, -1.5, 1, 0.4, 0, 1, 0, 0],
          ],
          [
            [1.5, 10, 1.5, 1, 0.4, 0, 0, 1, 0],
            [1.5, 10, -1.5, 1, 0.4, 0, 0, 1, 0],
            [-1.5, 10, -1.5, 1, 0.4, 0, 0, 1, 0],
            [-1.5, 10, 1.5, 1, 0.4, 0, 0, 1, 0],
          ],
          [
            [-1.5, 10, 1.5, 1, 0.4, 0, -1, 0, 0],
            [-1.5, 10, -1.5, 1, 0.4, 0, -1, 0, 0],
            [-1.5, 0, -1.5, 1, 0.4, 0, -1, 0, 0],
            [-1.5, 0, 1.5, 1, 0.4, 0, -1, 0, 0],
          ],
          [
            [-1.5, 0, -1.5, 1, 0.4, 0, 0, -1, 0],
            [1.5, 0, -1.5, 1, 0.4, 0, 0, -1, 0],
            [1.5, 0, 1.5, 1, 0.4, 0, 0, -1, 0],
            [-1.5, 0, 1.5, 1, 0.4, 0, 0, -1, 0],
          ],
          [
            [1.5, 0, -1.5, 1, 0.4, 0, 0, 0, -1],
            [-1.5, 0, -1.5, 1, 0.4, 0, 0, 0, -1],
            [-1.5, 10, -1.5, 1, 0.4, 0, 0, 0, -1],
            [1.5, 10, -1.5, 1, 0.4, 0, 0, 0, -1],
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
          [0, 10, 0],
        ],
        rotations: [
          [-90, 0, 1, 0],
          [0, 0, 0, 1],
        ],
        scales: [
          [1, 1, 1],
          [1.3, 1, 1.3],
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
          draw(({ rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[0];
            return {
              rotations: [
                [angle + 3, rotationX, rotationY, rotationZ],
                rotations[1],
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
          draw(({ rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[0];
            return {
              rotations: [
                [angle - 3, rotationX, rotationY, rotationZ],
                rotations[1],
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
          draw(({ rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[1];
            if (angle >= 135) return { rotations };
            return {
              rotations: [
                rotations[0],
                [angle + 3, rotationX, rotationY, rotationZ],
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
          draw(({ rotations }) => {
            const [angle, rotationX, rotationY, rotationZ] = rotations[1];
            if (angle <= -135) return { rotations };
            return {
              rotations: [
                rotations[0],
                [angle - 3, rotationX, rotationY, rotationZ],
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

export default Demo60;
