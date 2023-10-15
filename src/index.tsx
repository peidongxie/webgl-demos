import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom';
import App from './app';
import { type MatchData } from './type';
import Galacean from './galacean';
import GalaceanDemo01 from './galacean/demo-01';
import Mars from './mars';
import MarsDemo01 from './mars/demo-01';
import Webgl from './webgl';
import WebglDemo01 from './webgl/demo-01';
import WebglDemo02 from './webgl/demo-02';
import WebglDemo03 from './webgl/demo-03';
import WebglDemo04 from './webgl/demo-04';
import WebglDemo05 from './webgl/demo-05';
import WebglDemo06 from './webgl/demo-06';
import WebglDemo07 from './webgl/demo-07';
import WebglDemo08 from './webgl/demo-08';
import WebglDemo09 from './webgl/demo-09';
import WebglDemo10 from './webgl/demo-10';
import WebglDemo11 from './webgl/demo-11';
import WebglDemo12 from './webgl/demo-12';
import WebglDemo13 from './webgl/demo-13';
import WebglDemo14 from './webgl/demo-14';
import WebglDemo15 from './webgl/demo-15';
import WebglDemo16 from './webgl/demo-16';
import WebglDemo17 from './webgl/demo-17';
import WebglDemo18 from './webgl/demo-18';
import WebglDemo19 from './webgl/demo-19';
import WebglDemo20 from './webgl/demo-20';
import WebglDemo21 from './webgl/demo-21';
import WebglDemo22 from './webgl/demo-22';
import WebglDemo23 from './webgl/demo-23';

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
      value: ['06 绘制多色点', '/demo-06'],
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
      element: <App />,
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

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
