import { type FC, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { type ComponentProps } from '../type';

const Webgl: FC<ComponentProps> = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000',
          }}
        />
      }
    >
      <Outlet />
    </Suspense>
  );
};

export default Webgl;
