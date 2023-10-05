/// <reference types='vite/client' />

interface ImportMetaEnv {
  readonly VITE_BASENAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare interface HTMLCanvasElement {
  addEventListener(
    type: 'webglcontextcreationerror',
    listener: (this: HTMLCanvasElement, event: WebGLContextEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

declare interface WebGLRenderingContext {
  program: WebGLProgram;
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
