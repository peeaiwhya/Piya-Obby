import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // This maps the Vercel/System env var 'VITE_API_KEY' to 'process.env.API_KEY'
      // to satisfy the Google GenAI SDK requirements while running in the browser.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});