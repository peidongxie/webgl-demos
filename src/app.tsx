import { type FC } from 'react';
import { Outlet } from 'react-router-dom';
import './app.css';
import { type ComponentProps } from './type';

const App: FC<ComponentProps> = () => {
  return <Outlet />;
};

export default App;
