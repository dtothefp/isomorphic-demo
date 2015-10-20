#!/usr/bin/env node
require('../server.babel'); // babel registration (runtime transpilation for node)
var path = require('path');
var rootDir = path.resolve(__dirname, '..', 'src');
/**
 * Define isomorphic constants.
 */
global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
var webpackIsomorphicTools = new WebpackIsomorphicTools(require('../gulp/tasks/webpack/webpack-isomorphic-tools'));

webpackIsomorphicTools.development(__DEVELOPMENT__).server(rootDir).then(() => {
  require('../app')({webpackIsomorphicTools});
});
