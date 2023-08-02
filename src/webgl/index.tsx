import { type FC } from 'react';
import { Outlet } from 'react-router-dom';
interface WebglProps {
  [key: string]: never;
}

const Webgl: FC<WebglProps> = () => {
  return <Outlet />;
};

export default Webgl;
