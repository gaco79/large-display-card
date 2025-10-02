import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import { watch } from 'fs';

export default {
  input: ['src/large-display-card.ts'],
  output: {
    dir: './dist',
    format: 'es',
  },
  plugins: [
    resolve(),
    json(),
    typescript(),
    babel({
      exclude: 'node_modules/**',
    }),
    terser(),
    livereload('dist'),
  ],
  watch: {
    chokidar: true,
    exclude: ['node_modules/**', 'dist/**', '.vscode/**', '.git/**', 'config/**'],
  }
};
