import { MarsPlayer } from '@galacean/mars-player';
import { useEffect, useRef, type FC, useState } from 'react';
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
  const [background, setBackground] = useState('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const player = playerRef.current;
    if (player) return;
    playerRef.current = new MarsPlayer({ container });
  }, []);

  useEffect(
    () => () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    (async () => {
      try {
        const composition = await player.loadScene(SCENE_URL);
        if (playerRef.current !== player) return;
        await player.play(composition);
      } catch {
        if (playerRef.current !== player) return;
        setBackground(IMAGE_URL);
      }
    })();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: background ? `url(${background})` : '',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    />
  );
};

export default Demo01;
