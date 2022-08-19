import path from 'path';

import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  envPrefix: 'APP_',
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    port: 3000,
  },
  build: {
    outDir: './build',
  },
  plugins: [
    ...VitePluginNode({
      // Nodejs native Request adapter
      adapter: 'express',
      appPath: './src/app.ts',

      // The TypeScript compiler you want to use
      // by default this plugin is using vite default ts compiler which is esbuild
      // 'swc' compiler is supported to use as well for frameworks
      // like Nestjs (esbuild doesn't support 'emitDecoratorMetadata' yet)
      // you need to INSTALL `@swc/core` as dev dependency if you want to use swc
      tsCompiler: 'esbuild',

      // Optional, default: {
      // jsc: {
      //   target: 'es2019',
      //   parser: {
      //     syntax: 'typescript',
      //     decorators: true
      //   },
      //  transform: {
      //     legacyDecorator: true,
      //     decoratorMetadata: true
      //   }
      // }
      // }
      // swc configs, see [swc doc](https://swc.rs/docs/configuration/swcrc)
      swcOptions: {},
    }),
  ],
  optimizeDeps: {
    // Vite does not work well with optional dependencies,
    // you can mark them as ignored for now
    // eg: for nestjs, exclude these optional dependencies:
    // exclude: [
    //   '@nestjs/microservices',
    //   '@nestjs/websockets',
    //   'cache-manager',
    //   'class-transformer',
    //   'class-validator',
    //   'fastify-swagger',
    // ],
  },
  resolve: {
    alias: {
      '#src': path.join(__dirname, 'src'),
    },
  },
});
