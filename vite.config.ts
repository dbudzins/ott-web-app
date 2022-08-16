import path from 'path';

import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import StylelintPlugin from 'vite-plugin-stylelint';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createHtmlPlugin } from 'vite-plugin-html';
import { visualizer } from 'rollup-plugin-visualizer';

// noinspection JSUnusedGlobalSymbols
export default ({ mode }: { mode: 'production' | 'development' | 'test' }) => {
  const plugins = [
    react(),
    eslintPlugin({ emitError: mode === 'production' }), // Move linting to pre-build to match dashboard
    StylelintPlugin(),
    VitePWA(),
    createHtmlPlugin({
      minify: true,
    }),
    visualizer() as PluginOption,
  ];

  // These files are only needed in dev / test, don't include in prod builds
  if (process.env.APP_INCLUDE_TEST_CONFIGS) {
    plugins.push(
      viteStaticCopy({
        targets: [
          {
            src: 'test-e2e/data/*',
            dest: 'test-data',
          },
        ],
      }),
    );
  }

  return defineConfig({
    plugins: plugins,
    publicDir: './public',
    envPrefix: 'APP_',
    server: {
      port: 8080,
    },
    build: {
      outDir: './build',
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('/src/services/')) {
              return 'services/' + id.split('/').reverse()[0].slice(0, -3);
            }

            if (id.includes('/node_modules/react-virtualized/dist/')) {
              return 'react-virtualized';
            }

            if (id.includes('/node_modules/react-dom/')) {
              return 'react-dom';
            }

            if (id.includes('/node_modules/')) {
              return 'vendor';
            }

            return 'index';
          },
        },
      },
    },
    css:
      mode === 'test'
        ? {
            modules: {
              generateScopedName: (name) => name,
            },
          }
        : {
            devSourcemap: true,
          },
    resolve: {
      alias: {
        '#src': path.join(__dirname, 'src'),
        '#test': path.join(__dirname, 'test'),
        '#types': path.join(__dirname, 'types'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['test/vitest.setup.ts'],
    },
  });
};
