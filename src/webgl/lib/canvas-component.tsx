import {
  forwardRef,
  type HTMLAttributes,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';

import { getWebGLContext } from './cuon-utils';

interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  // glVertexShader: string;
  // glFragmentShader: string;
  onContextInit?: (
    canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
  ) => void;
  onWindowResize?: (
    canvas?: HTMLCanvasElement,
    gl?: WebGLRenderingContext,
  ) => void;
}

const Canvas = forwardRef<WebGLRenderingContext | null, CanvasProps>(
  (props, ref) => {
    const { onContextInit, onWindowResize, ...canvasProps } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const initRef = useRef(() => {});
    initRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = glRef.current || getWebGLContext(canvas);
      if (!gl) return;
      const program = gl.getParameter(gl.CURRENT_PROGRAM);
      if (program) return;
      // const success = initShaders(gl, glVertexShader, glFragmentShader);
      // if (!success) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      glRef.current = gl;
      onContextInit?.(canvas, gl);
    };
    const resizerRef = useRef(() => {});
    resizerRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return onWindowResize?.();
      const gl = glRef.current;
      if (!gl) return onWindowResize?.(canvas);
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      return onWindowResize?.(canvas, gl);
    };

    useLayoutEffect(() => {
      initRef.current();
    }, []);

    useLayoutEffect(() => {
      let timeoutId = 0;
      const listener = () => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(resizerRef.current, 1000 / 60);
      };
      globalThis.addEventListener('resize', listener);
      return () => globalThis.removeEventListener('resize', listener);
    }, []);

    useImperativeHandle<
      WebGLRenderingContext | null,
      WebGLRenderingContext | null
    >(ref, () => glRef.current, []);

    return (
      <canvas
        children={'Please use a browser that supports "canvas"'}
        ref={canvasRef}
        {...canvasProps}
      />
    );
  },
);

export default Canvas;
