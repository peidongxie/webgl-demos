import { type FC, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { type ComponentProps } from '../type';

const Galacean: FC<ComponentProps> = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#ffffff',
          }}
        />
      }
    >
      <Outlet />
    </Suspense>
  );
};

export default Galacean;
