import { type FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Webgl from './webgl';

interface AppProps {
  [key: string]: never;
}

const App: FC<AppProps> = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={'Hello, WebGL!'} />
        <Route path={'/webgl/*'} element={<Webgl />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
