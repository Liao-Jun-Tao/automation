// rollup.config.js

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import {terser} from 'rollup-plugin-terser';
import image from '@rollup/plugin-image';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy'


// 定义要打包的脚本及其对应的输出文件名
const scripts = [
    {input: 'pufa/openScript.ts', output: 'dist/openScript.cjs'},
    {input: 'pufa/loginScript.ts', output: 'dist/loginScript.cjs'},
    {input: 'pufa/businessScript.ts', output: 'dist/businessScript.cjs'},
    {input: 'pufa/closeScript.ts', output: 'dist/closeScript.cjs'},
    {input: 'pufa/main.ts', output: 'dist/main.cjs'},
];

// 创建每个脚本的 Rollup 配置
const configs = scripts.map(script => ({
    input: script.input,
    output: {
        file: script.output,
        format: 'cjs', // CommonJS 格式，兼容 Node.js 原生模块
        sourcemap: true,
        strict: true
        ,
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
            include: ['node_modules/jimp/**', 'pufa/**', 'utils/**'],
        }),
        json(),
        image(),
        terser(),
        copy({ // 配置 copy 插件
            targets: [
                {src: 'images/pufa/*', dest: 'dist/images/pufa'} // 复制所有图片到 dist/images/pufa
            ],
            verbose: true // 显示复制过程中的日志
        }),
    ],
    external: [

        "@nut-tree/bolt",
        "@nut-tree/nl-matcher",
        "@nut-tree/nut-js",
        "@nut-tree/plugin-ocr"
    ],
}));

export default configs;
