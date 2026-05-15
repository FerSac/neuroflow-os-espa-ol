import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    build: {
      minify: true,
      cssMinify: true,
      sourcemap: false,
      assetsInlineLimit: 100000000,
    },
    plugins: [
      react(), 
      tailwindcss(),
      viteSingleFile({
        useRecommendedBuildConfig: true,
        removeViteModuleLoader: false,
      }),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
