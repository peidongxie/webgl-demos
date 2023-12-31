import {
  forwardRef,
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { getWebGLContext } from './cuon-utils';

interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  onResize?: () => void;
}

const Canvas = forwardRef<WebGLRenderingContext | null, CanvasProps>(
  (props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = glRef.current;
      if (gl) return;
      glRef.current = getWebGLContext(canvasRef.current);
    }, []);

    useEffect(() => {
      const listener = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          glRef.current?.viewport(0, 0, canvas.width, canvas.height);
          console.log('redraw');
        }
      };
      window.addEventListener('resize', listener);
      listener();
      return () => window.removeEventListener('resize', listener);
    }, []);

    useImperativeHandle<
      WebGLRenderingContext | null,
      WebGLRenderingContext | null
    >(ref, () => glRef.current, []);

    return (
      <canvas
        children={'Please use a browser that supports "canvas"'}
        ref={canvasRef}
        {...props}
      />
    );
  },
);

export default Canvas;
