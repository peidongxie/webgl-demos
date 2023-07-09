import { makeDebugContext } from './webgl-debug';
import { setupWebGL } from './webgl-utils';

const loadShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    console.log('unable to create shader');
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.log('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
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
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    console.log('Failed to link program: ' + gl.getProgramInfoLog(program));
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
    console.log('Failed to create program');
    return false;
  }
  gl.useProgram(program);
  gl.program = program;
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

export { createProgram, getWebGLContext, initShaders };
