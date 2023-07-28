import { type FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import Demo01 from './demo-01';
import Demo02 from './demo-02';
import Demo03 from './demo-03';
import Demo04 from './demo-04';
import Demo05 from './demo-05';
import Demo06 from './demo-06';

interface WebglProps {
  [key: string]: never;
}

const Webgl: FC<WebglProps> = () => {
  return (
    <Routes>
      <Route path={'/'} element={'Hello, WebGL!'} />
      <Route path={'/demo-01'} element={<Demo01 />} />
      <Route path={'/demo-02'} element={<Demo02 />} />
      <Route path={'/demo-03'} element={<Demo03 />} />
      <Route path={'/demo-04'} element={<Demo04 />} />
      <Route path={'/demo-05'} element={<Demo05 />} />
      <Route path={'/demo-06'} element={<Demo06 />} />
    </Routes>
  );
};

export default Webgl;
