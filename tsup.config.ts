import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'testing/index': 'src/testing/index.ts',
  },
  format: ['cjs', 'esm'],
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: [
    '@nestjs/common',
    '@nestjs/config',
    'reflect-metadata',
    'zod'
  ]
});