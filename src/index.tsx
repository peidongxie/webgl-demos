import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Router from './router';

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
);
