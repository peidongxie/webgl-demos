import { makeDebugContext } from './webgl-debug';
import {
  makeDraw,
  type StateChangeAction,
  type StateStore,
  type StateWithRoot,
} from './webgl-store';
import { setupWebGL } from './webgl-utils';

const loadShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    globalThis.console.log('unable to create shader');
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    globalThis.console.log(
      'Failed to compile shader: ' + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (
  gl: WebGLRenderingContext,
  vshader: string,
  fshader: string,
): WebGLProgram | null => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program!, vertexShader);
  gl.attachShader(program!, fragmentShader);
  gl.linkProgram(program);
  const linked = gl.getProgramParameter(program!, gl.LINK_STATUS);
  if (!linked) {
    globalThis.console.log(
      'Failed to link program: ' + gl.getProgramInfoLog(program),
    );
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
};

const initShaders = (
  gl: WebGLRenderingContext,
  vshader: string,
  fshader: string,
): boolean => {
  const program = createProgram(gl, vshader, fshader);
  if (!program) {
    globalThis.console.log('Failed to create program');
    return false;
  }
  gl.useProgram(program);
  return true;
};

const getWebGLContext = (
  canvas: HTMLCanvasElement,
  debug = true,
): WebGLRenderingContext | null => {
  const gl = setupWebGL(canvas);
  if (!gl) return null;
  return debug ? makeDebugContext(gl) : gl;
};

const makeWebGLDraw = <S extends StateWithRoot<S> = StateWithRoot>(
  gl: WebGLRenderingContext,
  vshader: string,
  fshader: string,
  store: (program: WebGLProgram | null) => StateStore<S>,
): StateChangeAction<S> => {
  const program = createProgram(gl, vshader, fshader);
  const draw = makeDraw(store(program));
  return (action) => {
    program && gl.useProgram(program);
    draw(action);
  };
};

export { getWebGLContext, initShaders, makeWebGLDraw };
