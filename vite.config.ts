import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.PUBLIC_URL || '/',
    build: {
      chunkSizeWarningLimit: 800,
    },
    plugins: [react()],
  };
});
