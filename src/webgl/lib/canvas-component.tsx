import {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';

import { getWebGLContext } from './cuon-utils';

interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  onContextCreate?: (
    canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
  ) => void;
  onProgramInit?: (
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
    const { onContextCreate, onProgramInit, onWindowResize, ...canvasProps } =
      props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
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
    const createRef = useRef(() => {});
    createRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = glRef.current;
      if (gl) return;
      glRef.current = getWebGLContext(canvas);
      if (!glRef.current) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      glRef.current.viewport(0, 0, canvas.width, canvas.height);
      return onContextCreate?.(canvas, glRef.current);
    };
    const initRef = useRef(() => {});
    initRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = glRef.current;
      if (!gl) return;
      return onProgramInit?.(canvas, gl);
    };

    useLayoutEffect(() => {
      let requestId = 0;
      const listener = () => {
        if (requestId) return;
        requestId = window.requestAnimationFrame(() => {
          resizerRef.current();
          requestId = 0;
        });
      };
      globalThis.addEventListener('resize', listener);
      return () => globalThis.removeEventListener('resize', listener);
    }, []);

    useLayoutEffect(() => {
      createRef.current();
    });

    useEffect(() => {
      initRef.current();
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
