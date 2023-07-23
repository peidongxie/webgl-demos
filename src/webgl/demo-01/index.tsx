import { useEffect, useRef, type FC } from 'react';

interface Demo01Props {
  [key: string]: never;
}

/**
 * 使用画布
 */
const Demo01: FC<Demo01Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /**
     * 画布
     */
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    /**
     * 上下文
     */
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    /**
     * 绘制
     */
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillRect(120, 10, 150, 150);
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo01;
