/// <reference types='vite/client' />

declare interface HTMLCanvasElement {
  addEventListener(
    type: 'webglcontextcreationerror',
    listener: (this: HTMLCanvasElement, event: WebGLContextEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

declare interface WebGLRenderingContext {
  program: WebGLProgram;
  getParameter(
    pname: WebGLRenderingContext['CURRENT_PROGRAM'],
  ): WebGLProgram | null;
}

declare interface Window {
  cancelRequestAnimationFrame?: Window['cancelAnimationFrame'];
  mozCancelAnimationFrame?: Window['cancelAnimationFrame'];
  mozCancelRequestAnimationFrame?: Window['cancelAnimationFrame'];
  mozRequestAnimationFrame?: Window['requestAnimationFrame'];
  msCancelAnimationFrame?: Window['cancelAnimationFrame'];
  msCancelRequestAnimationFrame?: Window['cancelAnimationFrame'];
  msRequestAnimationFrame?: Window['requestAnimationFrame'];
  oCancelAnimationFrame?: Window['cancelAnimationFrame'];
  oCancelRequestAnimationFrame?: Window['cancelAnimationFrame'];
  oRequestAnimationFrame?: Window['requestAnimationFrame'];
  webkitCancelAnimationFrame?: Window['cancelAnimationFrame'];
  webkitCancelRequestAnimationFrame?: Window['cancelAnimationFrame'];
  webkitRequestAnimationFrame?: Window['requestAnimationFrame'];
}
