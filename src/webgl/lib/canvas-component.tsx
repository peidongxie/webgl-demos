import {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { getWebGLContext } from './cuon-utils';

interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  onWindowResize?: (canvas: HTMLCanvasElement | null) => void;
}

const Canvas = forwardRef<WebGLRenderingContext | null, CanvasProps>(
  (props, ref) => {
    const { onWindowResize, ...canvasProps } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const timeoutIdRef = useRef(0);
    const resizeRef = useRef<
      ((canvas: HTMLCanvasElement | null) => void) | null
    >(null);
    resizeRef.current = onWindowResize || null;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = glRef.current;
      if (gl) return;
      glRef.current = getWebGLContext(canvasRef.current);
    }, []);

    useEffect(() => {
      const callback = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          glRef.current?.viewport(0, 0, canvas.width, canvas.height);
        }
        resizeRef.current?.(canvas);
      };
      const listener = () => {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = window.setTimeout(callback, 100);
      };
      globalThis.addEventListener('resize', listener);
      callback();
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
