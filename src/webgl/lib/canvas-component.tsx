import {
  forwardRef,
  type HTMLAttributes,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';

import { getWebGLContext } from './cuon-utils';

interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  onWindowResize?: (canvas?: HTMLCanvasElement) => void;
}

const Canvas = forwardRef<WebGLRenderingContext | null, CanvasProps>(
  (props, ref) => {
    const { onWindowResize, ...canvasProps } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const resizerRef = useRef(() => {});
    resizerRef.current = () => {
      const canvas = canvasRef.current;
      const gl = glRef.current;
      const callback = onWindowResize;
      if (!canvas) return callback?.();
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl?.viewport(0, 0, canvas.width, canvas.height);
      return callback?.(canvas);
    };

    useLayoutEffect(() => {
      let timeoutId = 0;
      const listener = () => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(resizerRef.current, 1000 / 60);
      };
      globalThis.addEventListener('resize', listener);
      return () => globalThis.removeEventListener('resize', listener);
    }, []);

    useLayoutEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = glRef.current;
      if (gl) return;
      glRef.current = getWebGLContext(canvasRef.current);
      resizerRef.current();
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
