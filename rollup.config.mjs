import typescript from '@rollup/plugin-typescript';
import { obfuscator } from 'rollup-obfuscator';

export default {
  input: 'src/index.ts', // your entry point
  output: {
    file: 'dist/bundle.js',
    format: 'esm', // or 'esm'
  },
  plugins: [
    typescript(),
    obfuscator()
  ]
};
