import { type FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Webgl from './webgl';
import './app.css';

interface AppProps {
  [key: string]: never;
}

const App: FC<AppProps> = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={'Hello, World!'} />
        <Route path={'/webgl/*'} element={<Webgl />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
