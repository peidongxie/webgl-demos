import { MarsPlayer } from '@galacean/mars-player';
import { useEffect, useRef, type FC } from 'react';
import { type ComponentProps } from '../../type';

const SCENE_URL =
  'https://mdn.alipayobjects.com/mars/afts/file/A*boSKRLcCS6YAAAAAAAAAAAAADlB4AQ';
const IMAGE_URL =
  'https://mdn.alipayobjects.com/mars/afts/img/A*u735Sajcy5IAAAAAAAAAAAAADlB4AQ';

/**
 * 播放动画
 */
const Demo01: FC<ComponentProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MarsPlayer | null>(null);

  useEffect(() => {
    if (containerRef.current && !playerRef.current) {
      const container = containerRef.current;
      const player = new MarsPlayer({ container });
      playerRef.current = player;
    }
    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const player = playerRef.current;
    if (!player) return;
    player
      .loadScene(SCENE_URL)
      .then((composition) => {
        if (playerRef.current === player) {
          player.play(composition);
        }
      })
      .catch(() => {
        if (playerRef.current === player) {
          container.style.backgroundImage = `url(${IMAGE_URL})`;
        }
      });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    />
  );
};

export default Demo01;
