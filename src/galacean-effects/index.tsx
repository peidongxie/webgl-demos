import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { type ComponentProps } from '../type';

const GalaceanEffects: FC<ComponentProps> = () => {
  return <Outlet />;
};

export default GalaceanEffects;
