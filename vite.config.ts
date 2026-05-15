import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: mode === 'production' ? './' : '/',
    build: {
      minify: true,
      cssMinify: true,
      sourcemap: false,
      assetsInlineLimit: 100000000,
      modulePreload: false,
    },
    plugins: [
      react(), 
      tailwindcss(),
      viteSingleFile({
        removeViteModuleLoader: true,
      }),
      mode === 'production' && {
        name: 'remove-module-type',
        enforce: 'post',
        transformIndexHtml(html) {
          return html.replace(/type="module" crossorigin/g, '');
        },
      },
    ].filter(Boolean),
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''),
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
