import {
  BlinnPhongMaterial,
  Camera,
  DirectLight,
  MeshRenderer,
  PrimitiveMesh,
  Vector3,
  WebGLEngine,
} from '@galacean/engine';
import { type FC, useEffect, useRef } from 'react';

import { type ComponentProps } from '../../type';

const main = async (engine: WebGLEngine): Promise<void> => {
  /**
   * 根据 DOM 元素显示尺寸调整画布尺寸
   */
  engine.canvas.resizeByClientSize();

  /**
   * 在激活场景中创建一个根实体
   */
  const scene = engine.sceneManager.activeScene;
  const rootEntity = scene.createRootEntity();

  /**
   * 设置相机的朝向和位置
   */
  const cameraEntity = rootEntity.createChild('camera');
  cameraEntity.transform.setPosition(0, 5, 10);
  cameraEntity.transform.lookAt(new Vector3(0, 0, 0));
  cameraEntity.addComponent(Camera);

  /**
   * 设置场景背景色
   */
  scene.background.solidColor.set(1, 1, 1, 1);

  /**
   * 设置方向光的角度、颜色和强度
   */
  const lightEntity = rootEntity.createChild('light');
  lightEntity.transform.setRotation(45, 45, 45);
  const directLight = lightEntity.addComponent(DirectLight);
  directLight.color.set(1, 1, 1, 1);
  directLight.intensity = 0.5;

  /**
   * 设置网格渲染器的材质和网格
   */
  const cubeEntity = rootEntity.createChild('cube');
  const meshRenderer = cubeEntity.addComponent(MeshRenderer);
  meshRenderer.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2);
  meshRenderer.setMaterial(new BlinnPhongMaterial(engine));
};

/**
 * 绘制立方体
 */
const Demo02: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<Promise<WebGLEngine> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const loader = loaderRef.current;
    if (loader) return;
    loaderRef.current = WebGLEngine.create({ canvas });
  }, []);

  useEffect(
    () => () => {
      loaderRef.current?.then((engine) => engine.destroy());
      loaderRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    (async () => {
      const engine = await loader;
      if (loaderRef.current !== loader) return;
      await main(engine);
      if (loaderRef.current !== loader) return;
      engine.run();
    })();
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo02;
