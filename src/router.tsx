import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  type RouteObject,
  RouterProvider,
} from 'react-router-dom';

import App from './app';
import GalaceanEffects from './galacean-effects';
import GalaceanEngine from './galacean-engine';
import { type MatchData } from './type';
import Webgl from './webgl';

const WebglDemo01 = lazy(() => import('./webgl/demo-01'));
const WebglDemo02 = lazy(() => import('./webgl/demo-02'));
const WebglDemo03 = lazy(() => import('./webgl/demo-03'));
const WebglDemo04 = lazy(() => import('./webgl/demo-04'));
const WebglDemo05 = lazy(() => import('./webgl/demo-05'));
const WebglDemo06 = lazy(() => import('./webgl/demo-06'));
const WebglDemo07 = lazy(() => import('./webgl/demo-07'));
const WebglDemo08 = lazy(() => import('./webgl/demo-08'));
const WebglDemo09 = lazy(() => import('./webgl/demo-09'));
const WebglDemo10 = lazy(() => import('./webgl/demo-10'));
const WebglDemo11 = lazy(() => import('./webgl/demo-11'));
const WebglDemo12 = lazy(() => import('./webgl/demo-12'));
const WebglDemo13 = lazy(() => import('./webgl/demo-13'));
const WebglDemo14 = lazy(() => import('./webgl/demo-14'));
const WebglDemo15 = lazy(() => import('./webgl/demo-15'));
const WebglDemo16 = lazy(() => import('./webgl/demo-16'));
const WebglDemo17 = lazy(() => import('./webgl/demo-17'));
const WebglDemo18 = lazy(() => import('./webgl/demo-18'));
const WebglDemo19 = lazy(() => import('./webgl/demo-19'));
const WebglDemo20 = lazy(() => import('./webgl/demo-20'));
const WebglDemo21 = lazy(() => import('./webgl/demo-21'));
const WebglDemo22 = lazy(() => import('./webgl/demo-22'));
const WebglDemo23 = lazy(() => import('./webgl/demo-23'));
const WebglDemo24 = lazy(() => import('./webgl/demo-24'));
const WebglDemo25 = lazy(() => import('./webgl/demo-25'));
const WebglDemo26 = lazy(() => import('./webgl/demo-26'));
const WebglDemo27 = lazy(() => import('./webgl/demo-27'));
const WebglDemo28 = lazy(() => import('./webgl/demo-28'));
const WebglDemo29 = lazy(() => import('./webgl/demo-29'));
const WebglDemo30 = lazy(() => import('./webgl/demo-30'));
const WebglDemo31 = lazy(() => import('./webgl/demo-31'));
const WebglDemo32 = lazy(() => import('./webgl/demo-32'));
const WebglDemo33 = lazy(() => import('./webgl/demo-33'));
const WebglDemo34 = lazy(() => import('./webgl/demo-34'));
const WebglDemo35 = lazy(() => import('./webgl/demo-35'));
const WebglDemo36 = lazy(() => import('./webgl/demo-36'));
const WebglDemo37 = lazy(() => import('./webgl/demo-37'));
const WebglDemo38 = lazy(() => import('./webgl/demo-38'));
const WebglDemo39 = lazy(() => import('./webgl/demo-39'));
const WebglDemo40 = lazy(() => import('./webgl/demo-40'));
const WebglDemo41 = lazy(() => import('./webgl/demo-41'));
const WebglDemo42 = lazy(() => import('./webgl/demo-42'));
const WebglDemo43 = lazy(() => import('./webgl/demo-43'));
const WebglDemo44 = lazy(() => import('./webgl/demo-44'));
const WebglDemo45 = lazy(() => import('./webgl/demo-45'));
const WebglDemo46 = lazy(() => import('./webgl/demo-46'));
const WebglDemo47 = lazy(() => import('./webgl/demo-47'));
const WebglDemo48 = lazy(() => import('./webgl/demo-48'));
const WebglDemo49 = lazy(() => import('./webgl/demo-49'));
const WebglDemo50 = lazy(() => import('./webgl/demo-50'));
const WebglDemo51 = lazy(() => import('./webgl/demo-51'));
const WebglDemo52 = lazy(() => import('./webgl/demo-52'));
const WebglDemo53 = lazy(() => import('./webgl/demo-53'));
const WebglDemo54 = lazy(() => import('./webgl/demo-54'));
const WebglDemo55 = lazy(() => import('./webgl/demo-55'));
const WebglDemo56 = lazy(() => import('./webgl/demo-56'));
const WebglDemo57 = lazy(() => import('./webgl/demo-57'));
const WebglDemo58 = lazy(() => import('./webgl/demo-58'));
const WebglDemo59 = lazy(() => import('./webgl/demo-59'));
const WebglDemo60 = lazy(() => import('./webgl/demo-60'));
const WebglDemo61 = lazy(() => import('./webgl/demo-61'));
const WebglDemo62 = lazy(() => import('./webgl/demo-62'));
const WebglDemo63 = lazy(() => import('./webgl/demo-63'));
const WebglDemo64 = lazy(() => import('./webgl/demo-64'));
const WebglDemo65 = lazy(() => import('./webgl/demo-65'));
const WebglDemo66 = lazy(() => import('./webgl/demo-66'));
const WebglDemo67 = lazy(() => import('./webgl/demo-67'));
const WebglDemo68 = lazy(() => import('./webgl/demo-68'));
const WebglDemo69 = lazy(() => import('./webgl/demo-69'));
const WebglDemo70 = lazy(() => import('./webgl/demo-70'));
const WebglDemo71 = lazy(() => import('./webgl/demo-71'));
const WebglDemo72 = lazy(() => import('./webgl/demo-72'));
const WebglDemo73 = lazy(() => import('./webgl/demo-73'));
const WebglDemo74 = lazy(() => import('./webgl/demo-74'));
const WebglDemo75 = lazy(() => import('./webgl/demo-75'));
const GalaceanEffectsDemo01 = lazy(() => import('./galacean-effects/demo-01'));
const GalaceanEngineDemo01 = lazy(() => import('./galacean-engine/demo-01'));
const GalaceanEngineDemo02 = lazy(() => import('./galacean-engine/demo-02'));
const GalaceanEngineDemo03 = lazy(() => import('./galacean-engine/demo-03'));

const webglChildren: RouteObject[] = [
  {
    path: '*',
    element: null,
  },
  {
    path: 'demo-01',
    element: <WebglDemo01 />,
    loader: (): MatchData => ({
      value: ['01 使用画布', '/demo-01'],
      children: [],
    }),
  },
  {
    path: 'demo-02',
    element: <WebglDemo02 />,
    loader: (): MatchData => ({
      value: ['02 清空画布', '/demo-02'],
      children: [],
    }),
  },
  {
    path: 'demo-03',
    element: <WebglDemo03 />,
    loader: (): MatchData => ({
      value: ['03 绘制点', '/demo-03'],
      children: [],
    }),
  },
  {
    path: 'demo-04',
    element: <WebglDemo04 />,
    loader: (): MatchData => ({
      value: ['04 动态绘制点', '/demo-04'],
      children: [],
    }),
  },
  {
    path: 'demo-05',
    element: <WebglDemo05 />,
    loader: (): MatchData => ({
      value: ['05 点击绘制点', '/demo-05'],
      children: [],
    }),
  },
  {
    path: 'demo-06',
    element: <WebglDemo06 />,
    loader: (): MatchData => ({
      value: ['06 绘制彩点', '/demo-06'],
      children: [],
    }),
  },
  {
    path: 'demo-07',
    element: <WebglDemo07 />,
    loader: (): MatchData => ({
      value: ['07 绘制多个点', '/demo-07'],
      children: [],
    }),
  },
  {
    path: 'demo-08',
    element: <WebglDemo08 />,
    loader: (): MatchData => ({
      value: ['08 绘制三角', '/demo-08'],
      children: [],
    }),
  },
  {
    path: 'demo-09',
    element: <WebglDemo09 />,
    loader: (): MatchData => ({
      value: ['09 绘制单独线', '/demo-09'],
      children: [],
    }),
  },
  {
    path: 'demo-10',
    element: <WebglDemo10 />,
    loader: (): MatchData => ({
      value: ['10 绘制连接线', '/demo-10'],
      children: [],
    }),
  },
  {
    path: 'demo-11',
    element: <WebglDemo11 />,
    loader: (): MatchData => ({
      value: ['11 绘制循环线', '/demo-11'],
      children: [],
    }),
  },
  {
    path: 'demo-12',
    element: <WebglDemo12 />,
    loader: (): MatchData => ({
      value: ['12 绘制矩形', '/demo-12'],
      children: [],
    }),
  },
  {
    path: 'demo-13',
    element: <WebglDemo13 />,
    loader: (): MatchData => ({
      value: ['13 绘制飘带', '/demo-13'],
      children: [],
    }),
  },
  {
    path: 'demo-14',
    element: <WebglDemo14 />,
    loader: (): MatchData => ({
      value: ['14 向量平移', '/demo-14'],
      children: [],
    }),
  },
  {
    path: 'demo-15',
    element: <WebglDemo15 />,
    loader: (): MatchData => ({
      value: ['15 向量旋转', '/demo-15'],
      children: [],
    }),
  },
  {
    path: 'demo-16',
    element: <WebglDemo16 />,
    loader: (): MatchData => ({
      value: ['16 矩阵旋转', '/demo-16'],
      children: [],
    }),
  },
  {
    path: 'demo-17',
    element: <WebglDemo17 />,
    loader: (): MatchData => ({
      value: ['17 矩阵缩放', '/demo-17'],
      children: [],
    }),
  },
  {
    path: 'demo-18',
    element: <WebglDemo18 />,
    loader: (): MatchData => ({
      value: ['18 旋转', '/demo-18'],
      children: [],
    }),
  },
  {
    path: 'demo-19',
    element: <WebglDemo19 />,
    loader: (): MatchData => ({
      value: ['19 先平移再旋转', '/demo-19'],
      children: [],
    }),
  },
  {
    path: 'demo-20',
    element: <WebglDemo20 />,
    loader: (): MatchData => ({
      value: ['20 先旋转再平移', '/demo-20'],
      children: [],
    }),
  },
  {
    path: 'demo-21',
    element: <WebglDemo21 />,
    loader: (): MatchData => ({
      value: ['21 绘制动画', '/demo-21'],
      children: [],
    }),
  },
  {
    path: 'demo-22',
    element: <WebglDemo22 />,
    loader: (): MatchData => ({
      value: ['22 绘制复合动画', '/demo-22'],
      children: [],
    }),
  },
  {
    path: 'demo-23',
    element: <WebglDemo23 />,
    loader: (): MatchData => ({
      value: ['23 控制动画', '/demo-23'],
      children: [],
    }),
  },
  {
    path: 'demo-24',
    element: <WebglDemo24 />,
    loader: (): MatchData => ({
      value: ['24 多缓冲绘制点', '/demo-24'],
      children: [],
    }),
  },
  {
    path: 'demo-25',
    element: <WebglDemo25 />,
    loader: (): MatchData => ({
      value: ['25 单缓冲绘制点', '/demo-25'],
      children: [],
    }),
  },
  {
    path: 'demo-26',
    element: <WebglDemo26 />,
    loader: (): MatchData => ({
      value: ['26 动态绘制彩点', '/demo-26'],
      children: [],
    }),
  },
  {
    path: 'demo-27',
    element: <WebglDemo27 />,
    loader: (): MatchData => ({
      value: ['27 渐变', '/demo-27'],
      children: [],
    }),
  },
  {
    path: 'demo-28',
    element: <WebglDemo28 />,
    loader: (): MatchData => ({
      value: ['28 逐片元渐变', '/demo-28'],
      children: [],
    }),
  },
  {
    path: 'demo-29',
    element: <WebglDemo29 />,
    loader: (): MatchData => ({
      value: ['29 绘制纹理', '/demo-29'],
      children: [],
    }),
  },
  {
    path: 'demo-30',
    element: <WebglDemo30 />,
    loader: (): MatchData => ({
      value: ['30 绘制重复纹理', '/demo-30'],
      children: [],
    }),
  },
  {
    path: 'demo-31',
    element: <WebglDemo31 />,
    loader: (): MatchData => ({
      value: ['31 绘制镜像纹理', '/demo-31'],
      children: [],
    }),
  },
  {
    path: 'demo-32',
    element: <WebglDemo32 />,
    loader: (): MatchData => ({
      value: ['32 绘制多纹理', '/demo-32'],
      children: [],
    }),
  },
  {
    path: 'demo-33',
    element: <WebglDemo33 />,
    loader: (): MatchData => ({
      value: ['33 观察三角', '/demo-33'],
      children: [],
    }),
  },
  {
    path: 'demo-34',
    element: <WebglDemo34 />,
    loader: (): MatchData => ({
      value: ['34 观察旋转', '/demo-34'],
      children: [],
    }),
  },
  {
    path: 'demo-35',
    element: <WebglDemo35 />,
    loader: (): MatchData => ({
      value: ['35 组合观察旋转', '/demo-35'],
      children: [],
    }),
  },
  {
    path: 'demo-36',
    element: <WebglDemo36 />,
    loader: (): MatchData => ({
      value: ['36 控制观察', '/demo-36'],
      children: [],
    }),
  },
  {
    path: 'demo-37',
    element: <WebglDemo37 />,
    loader: (): MatchData => ({
      value: ['37 控制纵深', '/demo-37'],
      children: [],
    }),
  },
  {
    path: 'demo-38',
    element: <WebglDemo38 />,
    loader: (): MatchData => ({
      value: ['38 拉近控制观察', '/demo-38'],
      children: [],
    }),
  },
  {
    path: 'demo-39',
    element: <WebglDemo39 />,
    loader: (): MatchData => ({
      value: ['39 缩小视野', '/demo-39'],
      children: [],
    }),
  },
  {
    path: 'demo-40',
    element: <WebglDemo40 />,
    loader: (): MatchData => ({
      value: ['40 收窄视野', '/demo-40'],
      children: [],
    }),
  },
  {
    path: 'demo-41',
    element: <WebglDemo41 />,
    loader: (): MatchData => ({
      value: ['41 透视三角', '/demo-41'],
      children: [],
    }),
  },
  {
    path: 'demo-42',
    element: <WebglDemo42 />,
    loader: (): MatchData => ({
      value: ['42 透视平移', '/demo-42'],
      children: [],
    }),
  },
  {
    path: 'demo-43',
    element: <WebglDemo43 />,
    loader: (): MatchData => ({
      value: ['43 组合透视平移', '/demo-43'],
      children: [],
    }),
  },
  {
    path: 'demo-44',
    element: <WebglDemo44 />,
    loader: (): MatchData => ({
      value: ['44 消除隐藏面', '/demo-44'],
      children: [],
    }),
  },
  {
    path: 'demo-45',
    element: <WebglDemo45 />,
    loader: (): MatchData => ({
      value: ['45 解决深度冲突', '/demo-45'],
      children: [],
    }),
  },
  {
    path: 'demo-46',
    element: <WebglDemo46 />,
    loader: (): MatchData => ({
      value: ['46 绘制立方', '/demo-46'],
      children: [],
    }),
  },
  {
    path: 'demo-47',
    element: <WebglDemo47 />,
    loader: (): MatchData => ({
      value: ['47 绘制彩点立方', '/demo-47'],
      children: [],
    }),
  },
  {
    path: 'demo-48',
    element: <WebglDemo48 />,
    loader: (): MatchData => ({
      value: ['48 绘制彩面立方', '/demo-48'],
      children: [],
    }),
  },
  {
    path: 'demo-49',
    element: <WebglDemo49 />,
    loader: (): MatchData => ({
      value: ['49 绘制纯色立方', '/demo-49'],
      children: [],
    }),
  },
  {
    path: 'demo-50',
    element: <WebglDemo50 />,
    loader: (): MatchData => ({
      value: ['50 绘制平行光', '/demo-50'],
      children: [],
    }),
  },
  {
    path: 'demo-51',
    element: <WebglDemo51 />,
    loader: (): MatchData => ({
      value: ['51 绘制环境光', '/demo-51'],
      children: [],
    }),
  },
  {
    path: 'demo-52',
    element: <WebglDemo52 />,
    loader: (): MatchData => ({
      value: ['52 绘制光下变换', '/demo-52'],
      children: [],
    }),
  },
  {
    path: 'demo-53',
    element: <WebglDemo53 />,
    loader: (): MatchData => ({
      value: ['53 绘制点光源', '/demo-53'],
      children: [],
    }),
  },
  {
    path: 'demo-54',
    element: <WebglDemo54 />,
    loader: (): MatchData => ({
      value: ['54 绘制光照动画', '/demo-54'],
      children: [],
    }),
  },
  {
    path: 'demo-55',
    element: <WebglDemo55 />,
    loader: (): MatchData => ({
      value: ['55 绘制多光动画', '/demo-55'],
      children: [],
    }),
  },
  {
    path: 'demo-56',
    element: <WebglDemo56 />,
    loader: (): MatchData => ({
      value: ['56 逐顶点绘制', '/demo-56'],
      children: [],
    }),
  },
  {
    path: 'demo-57',
    element: <WebglDemo57 />,
    loader: (): MatchData => ({
      value: ['57 逐片元绘制', '/demo-57'],
      children: [],
    }),
  },
  {
    path: 'demo-58',
    element: <WebglDemo58 />,
    loader: (): MatchData => ({
      value: ['58 逐片元平行光', '/demo-58'],
      children: [],
    }),
  },
  {
    path: 'demo-59',
    element: <WebglDemo59 />,
    loader: (): MatchData => ({
      value: ['59 逐片元点光源', '/demo-59'],
      children: [],
    }),
  },
  {
    path: 'demo-60',
    element: <WebglDemo60 />,
    loader: (): MatchData => ({
      value: ['60 绘制单关节', '/demo-60'],
      children: [],
    }),
  },
  {
    path: 'demo-61',
    element: <WebglDemo61 />,
    loader: (): MatchData => ({
      value: ['61 绘制多关节', '/demo-61'],
      children: [],
    }),
  },
  {
    path: 'demo-62',
    element: <WebglDemo62 />,
    loader: (): MatchData => ({
      value: ['62 解耦模型顶点', '/demo-62'],
      children: [],
    }),
  },
  {
    path: 'demo-63',
    element: <WebglDemo63 />,
    loader: (): MatchData => ({
      value: ['63 拖拽旋转', '/demo-63'],
      children: [],
    }),
  },
  {
    path: 'demo-64',
    element: <WebglDemo64 />,
    loader: (): MatchData => ({
      value: ['64 选中物体', '/demo-64'],
      children: [],
    }),
  },
  {
    path: 'demo-65',
    element: <WebglDemo65 />,
    loader: (): MatchData => ({
      value: ['65 选中表面', '/demo-65'],
      children: [],
    }),
  },
  {
    path: 'demo-66',
    element: <WebglDemo66 />,
    loader: (): MatchData => ({
      value: ['66 叠置内容下方', '/demo-66'],
      children: [],
    }),
  },
  {
    path: 'demo-67',
    element: <WebglDemo67 />,
    loader: (): MatchData => ({
      value: ['67 叠置内容上方', '/demo-67'],
      children: [],
    }),
  },
  {
    path: 'demo-68',
    element: <WebglDemo68 />,
    loader: (): MatchData => ({
      value: ['68 线性雾化', '/demo-68'],
      children: [],
    }),
  },
  {
    path: 'demo-69',
    element: <WebglDemo69 />,
    loader: (): MatchData => ({
      value: ['69 简化雾化', '/demo-69'],
      children: [],
    }),
  },
  {
    path: 'demo-70',
    element: <WebglDemo70 />,
    loader: (): MatchData => ({
      value: ['70 绘制圆点', '/demo-70'],
      children: [],
    }),
  },
  {
    path: 'demo-71',
    element: <WebglDemo71 />,
    loader: (): MatchData => ({
      value: ['71 绘制半透三角', '/demo-71'],
      children: [],
    }),
  },
  {
    path: 'demo-72',
    element: <WebglDemo72 />,
    loader: (): MatchData => ({
      value: ['72 绘制半透立方', '/demo-72'],
      children: [],
    }),
  },
  {
    path: 'demo-73',
    element: <WebglDemo73 />,
    loader: (): MatchData => ({
      value: ['73 切换着色器', '/demo-73'],
      children: [],
    }),
  },
  {
    path: 'demo-74',
    element: <WebglDemo74 />,
    loader: (): MatchData => ({
      value: ['74 绘制到纹理', '/demo-74'],
      children: [],
    }),
  },
  {
    path: 'demo-75',
    element: <WebglDemo75 />,
    loader: (): MatchData => ({
      value: ['75 绘制阴影', '/demo-75'],
      children: [],
    }),
  },
];
const galaceanEffectsChildren: RouteObject[] = [
  {
    path: '*',
    element: null,
  },
  {
    path: 'demo-01',
    element: <GalaceanEffectsDemo01 />,
    loader: (): MatchData => ({
      value: ['01 播放动画', '/demo-01'],
      children: [],
    }),
  },
];
const galaceanEngineChildren: RouteObject[] = [
  {
    path: '*',
    element: null,
  },
  {
    path: 'demo-01',
    element: <GalaceanEngineDemo01 />,
    loader: (): MatchData => ({
      value: ['01 初始化画布', '/demo-01'],
      children: [],
    }),
  },
  {
    path: 'demo-02',
    element: <GalaceanEngineDemo02 />,
    loader: (): MatchData => ({
      value: ['02 绘制立方体', '/demo-02'],
      children: [],
    }),
  },
  {
    path: 'demo-03',
    element: <GalaceanEngineDemo03 />,
    loader: (): MatchData => ({
      value: ['03 加载模型', '/demo-03'],
      children: [],
    }),
  },
];

const appChildren: RouteObject[] = [
  {
    path: '*',
    element: null,
  },
  {
    path: 'webgl',
    element: <Webgl />,
    loader: (args): MatchData => ({
      value: ['WebGL', '/webgl'],
      children: webglChildren
        .map((child) =>
          typeof child.loader === 'function'
            ? child.loader(args)
            : child.loader,
        )
        .filter<MatchData>((childData): childData is MatchData => {
          if (!childData) return false;
          if (!Reflect.has(childData, 'value')) return false;
          if (!Reflect.has(childData, 'children')) return false;
          return true;
        })
        .map((childData) => [
          childData.value[0],
          `/webgl${childData.value[1]}`,
        ]),
    }),
    children: webglChildren,
  },
  {
    path: 'galacean-effects',
    element: <GalaceanEffects />,
    loader: (args): MatchData => ({
      value: ['Galacean Effects', '/galacean-effects'],
      children: galaceanEffectsChildren
        .map((child) =>
          typeof child.loader === 'function'
            ? child.loader(args)
            : child.loader,
        )
        .filter<MatchData>((childData): childData is MatchData => {
          if (!childData) return false;
          if (!Reflect.has(childData, 'value')) return false;
          if (!Reflect.has(childData, 'children')) return false;
          return true;
        })
        .map((childData) => [
          childData.value[0],
          `/galacean-effects${childData.value[1]}`,
        ]),
    }),
    children: galaceanEffectsChildren,
  },
  {
    path: 'galacean-engine',
    element: <GalaceanEngine />,
    loader: (args): MatchData => ({
      value: ['Galacean Engine', '/galacean-engine'],
      children: galaceanEngineChildren
        .map((child) =>
          typeof child.loader === 'function'
            ? child.loader(args)
            : child.loader,
        )
        .filter<MatchData>((childData): childData is MatchData => {
          if (!childData) return false;
          if (!Reflect.has(childData, 'value')) return false;
          if (!Reflect.has(childData, 'children')) return false;
          return true;
        })
        .map((childData) => [
          childData.value[0],
          `/galacean-engine${childData.value[1]}`,
        ]),
    }),
    children: galaceanEngineChildren,
  },
];

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <Suspense>
          <App />
        </Suspense>
      ),
      loader: (args): MatchData => ({
        value: ['All', ''],
        children: appChildren
          .map((child) =>
            typeof child.loader === 'function'
              ? child.loader(args)
              : child.loader,
          )
          .filter<MatchData>((childData): childData is MatchData => {
            if (!childData) return false;
            if (!Reflect.has(childData, 'value')) return false;
            if (!Reflect.has(childData, 'children')) return false;
            return true;
          })
          .map((childData) => childData.value),
      }),
      children: appChildren,
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
