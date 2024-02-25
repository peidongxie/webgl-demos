import { type FC, useCallback, useRef } from 'react';

import { flatArray, useFrameRequest } from '../../lib/react-utils';
import { type ComponentProps, type Tuple } from '../../type';
import Canvas from '../lib/canvas-component';
import { Matrix4, Vector3 } from '../lib/cuon-matrix';
import { makeWebGLDraw } from '../lib/cuon-utils';
import { type StateChangeAction, type StateWithRoot } from '../lib/webgl-store';
import FSHADER_SOURCE from './fragment.glsl?raw';
import VSHADER_SOURCE from './vertex.glsl?raw';

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
  points: Tuple<Tuple<Tuple<number, 9>, 4>, 6>;
  surfaces: Tuple<Tuple<Tuple<number, 3>, 2>, 6>;
  rotation: Tuple<number, 4>;
  velocity: number;
  time: number;
  camera: Tuple<number, 9>;
  perspective: Tuple<number, 4>;
  lights: Tuple<Tuple<number, 6>, 2>;
}>;

/**
 * 绘制多光动画
 */
const Demo55: FC<ComponentProps> = () => {
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
        VSHADER_SOURCE,
        FSHADER_SOURCE,
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
            data: gl.getAttribLocation(program, 'a_Position'),
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
            data: gl.getAttribLocation(program, 'a_Color'),
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
            data: gl.getAttribLocation(program, 'a_Normal'),
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
            data: gl.getUniformLocation(program, 'u_MvpMatrix'),
            onChange: ({ u_MvpMatrix, mvpMatrix }) => {
              gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
            },
          },
          // 着色器变量：u_ModelMatrix
          u_ModelMatrix: {
            deps: ['modelMatrix'],
            data: gl.getUniformLocation(program, 'u_ModelMatrix'),
            onChange: ({ u_ModelMatrix, modelMatrix }) => {
              gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            },
          },
          // 着色器变量：u_NormalMatrix
          u_NormalMatrix: {
            deps: ['normalMatrix'],
            data: gl.getUniformLocation(program, 'u_NormalMatrix'),
            onChange: ({ u_NormalMatrix, normalMatrix }) => {
              gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
            },
          },
          // 着色器变量：u_LightColor
          u_LightColor: {
            deps: ['lightColorVector'],
            data: gl.getUniformLocation(program, 'u_LightColor'),
            onChange: ({ u_LightColor, lightColorVector }) => {
              gl.uniform3fv(u_LightColor, lightColorVector.elements);
            },
          },
          // 着色器变量：u_LightPosition
          u_LightPosition: {
            deps: ['lightPositionVector'],
            data: gl.getUniformLocation(program, 'u_LightPosition'),
            onChange: ({ u_LightPosition, lightPositionVector }) => {
              gl.uniform3fv(u_LightPosition, lightPositionVector.elements);
            },
          },
          // 着色器变量：u_AmbientLight
          u_AmbientLight: {
            deps: ['ambientLightVector'],
            data: gl.getUniformLocation(program, 'u_AmbientLight'),
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
            data: new Float32Array(9 * 4 * 6),
            onChange: ({ positionColorNormalArray, points }) => {
              positionColorNormalArray.set(flatArray(points));
            },
          },
          // 派生数据：顶点索引数组
          indexArray: {
            deps: ['surfaces'],
            data: new Uint8Array(3 * 2 * 6),
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
            deps: ['rotation', 'velocity', 'time'],
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
          // 原子数据：速度
          velocity: {
            deps: [],
          },
          // 原子数据：时间
          time: {
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
      draw({
        points: [
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
        rotation: [90, 0, 1, 0],
        velocity: 30,
        time: Date.now(),
        camera: [3, 3, 7, 0, 0, 0, 0, 1, 0],
        perspective: [30, canvas.width / canvas.height, 1, 100],
        lights: [
          [1, 1, 1, 1.15, 2, 1.75],
          [0.2, 0.2, 0.2, 0, 0, 0],
        ],
      });
      drawRef.current = draw;
    },
    [],
  );

  useFrameRequest(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw(({ rotation, velocity, time }) => {
      const [angle, rotationX, rotationY, rotationZ] = rotation;
      const timeEnd = Date.now();
      const timeStart = time;
      const timeSpan = timeEnd - timeStart;
      const angleStart = angle;
      const angleSpan = (velocity * timeSpan) / 1000;
      const angleEnd = angleStart + angleSpan;
      return {
        rotation: [angleEnd, rotationX, rotationY, rotationZ],
        time: timeEnd,
      };
    });
  });

  return (
    <Canvas
      onProgramInit={handleProgramInit}
      onWindowResize={handleWindowResize}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}
    />
  );
};

export default Demo55;
