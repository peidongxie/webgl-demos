import { type FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import Demo01 from './demo-01';

interface WebglProps {
  [key: string]: never;
}

const Webgl: FC<WebglProps> = () => {
  return (
    <Routes>
      <Route path={'/'} element={'Hello, WebGL!'} />
      <Route path={'/demo-01'} element={<Demo01 />} />
    </Routes>
  );
};

export default Webgl;
