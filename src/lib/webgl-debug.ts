type WebGLRenderingContextFuncName = {
  [K in keyof WebGLRenderingContext]: WebGLRenderingContext[K] extends (
    ...args: never[]
  ) => void
    ? K
    : never;
}[keyof WebGLRenderingContext];

type WebGLRenderingContextArgValues<
  FuncName extends WebGLRenderingContextFuncName,
> = Parameters<WebGLRenderingContext[FuncName]>;

let glEnums: Record<number, string> | null = null;

const init = (ctx: WebGLRenderingContext): void => {
  if (glEnums === null) {
    glEnums = {};
    for (const key in ctx) {
      if (key !== key.toUpperCase()) continue;
      const value = ctx[key as keyof WebGLRenderingContext];
      if (typeof value !== 'number') continue;
      glEnums[value] = key;
    }
  }
};

const checkInit = (): void => {
  if (glEnums === null) throw 'WebGLDebugUtils.init(ctx) not called';
};

const mightBeEnum = (value: number): boolean => {
  checkInit();
  return !!glEnums?.[value];
};

const glEnumToString = (value: number): string => {
  checkInit();
  return (
    glEnums?.[value] || '*UNKNOWN WebGL ENUM (0x' + value.toString(16) + ')'
  );
};

const GL_VALID_ENUM_CONTEXTS: Partial<
  Record<WebGLRenderingContextFuncName, Record<number, true>>
> = {
  /**
   * Generic setters and getters
   */
  enable: { 0: true },
  disable: { 0: true },
  getParameter: { 0: true },
  /**
   * Rendering
   */
  drawArrays: { 0: true },
  drawElements: { 0: true, 2: true },
  /**
   * Shaders
   */
  createShader: { 0: true },
  getShaderParameter: { 1: true },
  getProgramParameter: { 1: true },
  /**
   * Vertex attributes
   */
  getVertexAttrib: { 1: true },
  vertexAttribPointer: { 2: true },
  /**
   * Textures
   */
  bindTexture: { 0: true },
  activeTexture: { 0: true },
  getTexParameter: { 0: true, 1: true },
  texParameterf: { 0: true, 1: true },
  texParameteri: { 0: true, 1: true, 2: true },
  texImage2D: { 0: true, 2: true, 6: true, 7: true },
  texSubImage2D: { 0: true, 6: true, 7: true },
  copyTexImage2D: { 0: true, 2: true },
  copyTexSubImage2D: { 0: true },
  generateMipmap: { 0: true },
  /**
   * Buffer objects
   */
  bindBuffer: { 0: true },
  bufferData: { 0: true, 2: true },
  bufferSubData: { 0: true },
  getBufferParameter: { 0: true, 1: true },
  /**
   * Renderbuffers and framebuffers
   */
  pixelStorei: { 0: true, 1: true },
  readPixels: { 4: true, 5: true },
  bindRenderbuffer: { 0: true },
  bindFramebuffer: { 0: true },
  checkFramebufferStatus: { 0: true },
  framebufferRenderbuffer: { 0: true, 1: true, 2: true },
  framebufferTexture2D: { 0: true, 1: true, 2: true },
  getFramebufferAttachmentParameter: { 0: true, 1: true, 2: true },
  getRenderbufferParameter: { 0: true, 1: true },
  renderbufferStorage: { 0: true, 1: true },
  /**
   * Frame buffer operations (clear, blend, depth test, stencil)
   */
  clear: { 0: true },
  depthFunc: { 0: true },
  blendFunc: { 0: true, 1: true },
  blendFuncSeparate: { 0: true, 1: true, 2: true, 3: true },
  blendEquation: { 0: true },
  blendEquationSeparate: { 0: true, 1: true },
  stencilFunc: { 0: true },
  stencilFuncSeparate: { 0: true, 1: true },
  stencilMaskSeparate: { 0: true },
  stencilOp: { 0: true, 1: true, 2: true },
  stencilOpSeparate: { 0: true, 1: true, 2: true, 3: true },
  /**
   * Culling
   */
  cullFace: { 0: true },
  frontFace: { 0: true },
};

const glFunctionArgToString = <
  FuncName extends WebGLRenderingContextFuncName,
  ArgIndex extends number,
>(
  funcName: FuncName,
  argIndex: ArgIndex,
  argValue: WebGLRenderingContextArgValues<FuncName>[ArgIndex],
): string => {
  const funcInfo: Record<number, true> | undefined =
    GL_VALID_ENUM_CONTEXTS[funcName];
  return funcInfo?.[argIndex] && typeof argValue === 'number'
    ? glEnumToString(argValue)
    : String(argValue);
};

export { init, mightBeEnum, glEnumToString, glFunctionArgToString };
