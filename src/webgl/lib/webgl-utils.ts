const GET_A_WEBGL_BROWSER =
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

const OTHER_PROBLEM =
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org">Click here for more information.</a>';

const showErrorMsg = (msg: string): void => {
  const container = document.querySelector('#root');
  if (container) {
    container.innerHTML = `
      <div style="margin:auto;width:500px;z-index:10000;margin-top:20em;text-align:center;">
      ${globalThis.WebGLRenderingContext ? OTHER_PROBLEM : GET_A_WEBGL_BROWSER}
      ${msg ? '<br/><br/>Status: ' + msg : ''}
      </div>
    `;
  }
};

const create3DContext = (
  canvas: HTMLCanvasElement,
  options?: WebGLContextAttributes,
): WebGLRenderingContext | null => {
  const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
  for (const name of names) {
    try {
      const context = canvas.getContext(name as 'webgl', options);
      if (context) return context;
    } catch (e) {
      continue;
    }
  }
  return null;
};

const setupWebGL = (
  canvas: HTMLCanvasElement,
  options?: WebGLContextAttributes,
  onError?: (msg: string) => void,
): WebGLRenderingContext | null => {
  const handleCreationError = onError || showErrorMsg;
  canvas.addEventListener?.(
    'webglcontextcreationerror',
    (event) => handleCreationError(event.statusMessage),
    false,
  );
  const context = create3DContext(canvas, options);
  if (!context) handleCreationError('');
  return context;
};

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    ((callback) => window.setTimeout(callback, 1000 / 60));
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame =
    window.cancelRequestAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.clearTimeout;
}

export { setupWebGL };
