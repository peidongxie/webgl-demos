import { Camera, type GLTFResource, WebGLEngine } from '@galacean/engine';
import { OrbitControl } from '@galacean/engine-toolkit-controls';
import { type FC, useEffect, useRef } from 'react';

import { type ComponentProps } from '../../type';

const GLTF_URL =
  'https://gw.alipayobjects.com/os/OasisHub/267000040/9994/%25E5%25BD%2592%25E6%25A1%25A3.gltf';

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
   * 设置相机的位置和轨道控制器
   */
  const cameraEntity = rootEntity.createChild('camera');
  cameraEntity.transform.setPosition(3, 3, 3);
  cameraEntity.addComponent(Camera);
  cameraEntity.addComponent(OrbitControl);

  /**
   * 设置纯色模式的环境光
   */
  scene.ambientLight.diffuseSolidColor.set(1, 1, 1, 1);

  /**
   * 加载模型
   */
  const gltf = await engine.resourceManager.load<GLTFResource>(GLTF_URL);
  rootEntity.addChild(gltf.defaultSceneRoot);
};

/**
 * 绘制模型
 */
const Demo03: FC<ComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const promiseRef = useRef<Promise<WebGLEngine> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const promise = promiseRef.current;
    if (promise) return;
    promiseRef.current = WebGLEngine.create({ canvas });
  }, []);

  useEffect(
    () => () => {
      promiseRef.current?.then((engine) => engine.destroy());
      promiseRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const promise = promiseRef.current;
    if (!promise) return;
    (async () => {
      const engine = await promise;
      if (promiseRef.current !== promise) return;
      await main(engine);
      if (promiseRef.current !== promise) return;
      engine.run();
    })();
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }}>
      {'Please use a browser that supports "canvas"'}
    </canvas>
  );
};

export default Demo03;
