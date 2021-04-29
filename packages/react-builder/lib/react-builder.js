#!/usr/bin/env node
const rollup = require('rollup');
const path = require('path');
const resolve = require('@rollup/plugin-node-resolve').default;
const babel = require('@rollup/plugin-babel').default;

const currentWorkingPath = process.cwd();
// eslint-disable-next-line import/no-dynamic-require
const { src, name } = require(path.join(currentWorkingPath, `package.json`));

const inputPath = path.join(currentWorkingPath, src);

// Little workaround to get package name without scope
const fileName = name.replace('@heetch/', '');

// see below for details on the options
const inputOptions = {
  input: inputPath,
  external: [
    'react',
    'styled-components',
    'react-final-form',
    'react-syntax-highlighter',
    'react-syntax-highlighter/dist/esm/languages/prism/javascript',
    'react-syntax-highlighter/dist/esm/languages/prism/jsx',
    'react-syntax-highlighter/dist/esm/languages/prism/typescript',
    'react-syntax-highlighter/dist/esm/languages/prism/tsx',
    'react-syntax-highlighter/dist/esm/languages/prism/yaml',
    'react-syntax-highlighter/dist/esm/languages/prism/json',
    'react-syntax-highlighter/dist/esm/styles/prism/prism',
    'final-form',
    'prop-types',
    'final-form-set-field-data',
    `lodash.isequal`,
  ],
  plugins: [
    resolve(),
    babel({
      presets: ['@babel/preset-env', '@babel/preset-react'],
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
  ],
};

const outputOptions = [
  {
    file: `dist/${fileName}.cjs.js`,
    format: 'cjs',
  },
  {
    file: `dist/${fileName}.esm.js`,
    format: 'esm',
  },
];

async function build() {
  // create bundle
  const bundle = await rollup.rollup(inputOptions);
  // loop through the options and write individual bundles
  outputOptions.forEach(async (options) => {
    await bundle.write(options);
  });
}

build().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
