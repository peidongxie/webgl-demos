import { MarsPlayer, spec } from '@galacean/mars-player';
import { type FC, useEffect, useRef, useState } from 'react';

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
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundSize, setBackgroundSize] = useState('cover');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const player = playerRef.current;
    if (player) return;
    playerRef.current = new MarsPlayer({ container });
  }, []);

  useEffect(
    () => () => {
      if (playerRef.current) playerRef.current.dispose();
      playerRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    (async () => {
      let clipMode: spec.CameraClipMode | undefined;
      try {
        const composition = await player.loadScene(SCENE_URL);
        if (playerRef.current !== player) return;
        clipMode = composition.camera.clipMode;
        await player.play(composition);
      } catch {
        if (playerRef.current !== player) return;
        setBackgroundImage(`url(${IMAGE_URL})`);
        if (clipMode === spec.CameraClipMode.portrait) {
          setBackgroundSize('100% auto');
        } else if (clipMode === spec.CameraClipMode.landscape) {
          setBackgroundSize('auto 100%');
        } else {
          setBackgroundSize('cover');
        }
      }
    })();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundImage,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize,
      }}
    />
  );
};

export default Demo01;
