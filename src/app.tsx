import { GUI } from 'lil-gui';
import { useEffect, useRef, type FC } from 'react';
import { Outlet, useMatches, useNavigate } from 'react-router-dom';
import './app.css';
import { type ComponentProps, type MatchData } from './type';

const App: FC<ComponentProps> = () => {
  const guiRef = useRef<GUI | null>(null);
  const matches = useMatches();
  const navigate = useNavigate();

  useEffect(() => {
    const gui = new GUI({
      title: '控制面板',
      container: document.querySelector<HTMLElement>('#gui-app')!,
    });
    const categoryEntries = (matches[0]?.data as MatchData)?.children || [];
    const categoryValue =
      (matches[1]?.data as MatchData)?.value?.[1] || '请选择';
    const demoEntries = (matches[1]?.data as MatchData)?.children || [];
    const demoValue = (matches[2]?.data as MatchData)?.value?.[1]
      ? categoryValue + (matches[2]?.data as MatchData)?.value?.[1]
      : '请选择';
    const object = {
      category: categoryValue,
      demo: demoValue,
      previous: () => {
        const index = demoEntries.findIndex((entry) => entry[1] === demoValue);
        const nextIndex = index > 0 ? index - 1 : demoEntries.length - 1;
        navigate(demoEntries[nextIndex][1]);
      },
      next: () => {
        const index = demoEntries.findIndex((entry) => entry[1] === demoValue);
        const nextIndex = (index + 1) % demoEntries.length;
        navigate(demoEntries[nextIndex][1]);
      },
    };
    gui
      .add(object, 'category', Object.fromEntries(categoryEntries))
      .onChange((value: string) => navigate(value))
      .name('类别');
    gui
      .add(object, 'demo', Object.fromEntries(demoEntries))
      .onChange((value: string) => navigate(value))
      .name('示例');
    demoEntries.length && gui.add(object, 'previous').name('上一个示例');
    demoEntries.length && gui.add(object, 'next').name('下一个示例');
    guiRef.current = gui;
    return () => {
      guiRef.current?.destroy();
      guiRef.current = null;
    };
  }, [matches, navigate]);

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
