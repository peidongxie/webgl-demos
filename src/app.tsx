import './app.css';

import { type FC, useMemo } from 'react';
import { Outlet, useMatches, useNavigate } from 'react-router-dom';

import { type GuiOptions, type GuiSchema, useGui } from './lib/gui-utils';
import { type ComponentProps, type MatchData } from './type';

const App: FC<ComponentProps> = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const schemas = useMemo<GuiSchema[]>(() => {
    const categoryEntries = (matches[0]?.data as MatchData)?.children || [];
    const categoryValue =
      (matches[1]?.data as MatchData)?.value?.[1] || '请选择';
    const demoEntries = (matches[1]?.data as MatchData)?.children || [];
    const demoValue = (matches[2]?.data as MatchData)?.value?.[1]
      ? categoryValue + (matches[2]?.data as MatchData)?.value?.[1]
      : '请选择';
    return [
      {
        type: 'dropdown',
        name: '类别',
        initialValue: categoryValue,
        options: Object.fromEntries(categoryEntries),
        onChange: (value: string) => navigate(value),
      },
      {
        type: 'dropdown',
        name: '示例',
        initialValue: demoValue,
        options: Object.fromEntries(demoEntries),
        onChange: (value: string) => navigate(value),
      },
      {
        type: 'function',
        name: '上一个示例',
        initialValue: () => {
          const index = demoEntries.findIndex(
            (entry) => entry[1] === demoValue,
          );
          const nextIndex = index > 0 ? index - 1 : demoEntries.length - 1;
          const to = demoEntries[nextIndex]?.[1];
          to && navigate(to);
        },
      },
      {
        type: 'function',
        name: '下一个示例',
        initialValue: () => {
          const index = demoEntries.findIndex(
            (entry) => entry[1] === demoValue,
          );
          const nextIndex = (index + 1) % demoEntries.length;
          const to = demoEntries[nextIndex]?.[1];
          to && navigate(to);
        },
      },
    ];
  }, [matches, navigate]);
  const options = useMemo<GuiOptions>(
    () => ({
      container: '#gui-app',
      title: '控制面板',
    }),
    [],
  );

  useGui(schemas, options);

  return (
    <>
      <Outlet />
      <div className={'lil-gui autoPlace'}>
        <div id={'gui-app'} />
        <div id={'gui-demo'} />
      </div>
    </>
  );
};

export default App;
