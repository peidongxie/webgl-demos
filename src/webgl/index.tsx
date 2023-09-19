import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { type ComponentProps } from '../type';

const Webgl: FC<ComponentProps> = () => {
  return <Outlet />;
};

export default Webgl;
