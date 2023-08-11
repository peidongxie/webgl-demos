import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom';
import App from './app';
import { type MatchData } from './type';
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

const webglChildren: RouteObject[] = [
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
];

const appChildren: RouteObject[] = [
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
];

const router = createBrowserRouter([
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
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
