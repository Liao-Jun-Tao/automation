import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import {terser} from 'rollup-plugin-terser';
import image from '@rollup/plugin-image';
import babel from '@rollup/plugin-babel';

export default {
    input: 'pufa.ts',
    output: {
        file: 'dist/bundle.cjs',
        format: 'cjs', // CommonJS 格式，兼容 Node.js 原生模块
        sourcemap: true,
        strict: false,
    },
    plugins: [
        resolve({
            preferBuiltins: true,
        }),
        commonjs({
            ignoreTryCatch: false,
            transformMixedEsModules: true,
        }),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        babel({
            babelHelpers: 'bundled',
            extensions: ['.ts', '.js'],
            include: ['node_modules/jimp/**', 'src/**'],
        }),
        json(),
        image(),
        terser(),
    ],
    external: [
        'fs',
        'path',
        'os',
        'child_process',
        'bindings', // C++ 原生插件模块
        'node-gyp',
        'jimp',
        '@nut-tree/libnut' // libnut 原生依赖标记为外部
    ],
};
