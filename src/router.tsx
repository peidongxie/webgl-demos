import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  type RouteObject,
  RouterProvider,
} from 'react-router-dom';

import App from './app';
import Galacean from './galacean';
import Mars from './mars';
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
const MarsDemo01 = lazy(() => import('./mars/demo-01'));
const GalaceanDemo01 = lazy(() => import('./galacean/demo-01'));
const GalaceanDemo02 = lazy(() => import('./galacean/demo-02'));
const GalaceanDemo03 = lazy(() => import('./galacean/demo-03'));

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
      value: ['34 观察旋转三角', '/demo-34'],
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
      value: ['38 缩小视野', '/demo-38'],
      children: [],
    }),
  },
  {
    path: 'demo-39',
    element: <WebglDemo39 />,
    loader: (): MatchData => ({
      value: ['39 收窄视野', '/demo-39'],
      children: [],
    }),
  },
];

const marsChildren: RouteObject[] = [
  {
    path: '*',
    element: null,
  },
  {
    path: 'demo-01',
    element: <MarsDemo01 />,
    loader: (): MatchData => ({
      value: ['01 播放动画', '/demo-01'],
      children: [],
    }),
  },
];

const galaceanChildren: RouteObject[] = [
  {
    path: '*',
    element: null,
  },
  {
    path: 'demo-01',
    element: <GalaceanDemo01 />,
    loader: (): MatchData => ({
      value: ['01 初始化画布', '/demo-01'],
      children: [],
    }),
  },
  {
    path: 'demo-02',
    element: <GalaceanDemo02 />,
    loader: (): MatchData => ({
      value: ['02 绘制立方体', '/demo-02'],
      children: [],
    }),
  },
  {
    path: 'demo-03',
    element: <GalaceanDemo03 />,
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
        .map((child) => child.loader?.(args))
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
    path: 'mars',
    element: <Mars />,
    loader: (args): MatchData => ({
      value: ['Mars', '/mars'],
      children: marsChildren
        .map((child) => child.loader?.(args))
        .filter<MatchData>((childData): childData is MatchData => {
          if (!childData) return false;
          if (!Reflect.has(childData, 'value')) return false;
          if (!Reflect.has(childData, 'children')) return false;
          return true;
        })
        .map((childData) => [childData.value[0], `/mars${childData.value[1]}`]),
    }),
    children: marsChildren,
  },
  {
    path: 'galacean',
    element: <Galacean />,
    loader: (args): MatchData => ({
      value: ['Galacean', '/galacean'],
      children: galaceanChildren
        .map((child) => child.loader?.(args))
        .filter<MatchData>((childData): childData is MatchData => {
          if (!childData) return false;
          if (!Reflect.has(childData, 'value')) return false;
          if (!Reflect.has(childData, 'children')) return false;
          return true;
        })
        .map((childData) => [
          childData.value[0],
          `/galacean${childData.value[1]}`,
        ]),
    }),
    children: galaceanChildren,
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
          .map((child) => child.loader?.(args))
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
