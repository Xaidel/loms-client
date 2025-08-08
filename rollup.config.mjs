import typescript from '@rollup/plugin-typescript';
import { obfuscator } from 'rollup-obfuscator';

export default {
  input: 'src/main.ts', // your entry point
  output: {
    file: 'dist/bundle.js',
    format: 'es', // or 'esm'
  },
  plugins: [
    typescript(),
    obfuscator(),
  ],
  external: ['papaparse', 'xlsx']
};
