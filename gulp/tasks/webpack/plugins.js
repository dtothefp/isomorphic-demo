import {join} from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import WebpackIsomorphicToolsPlugin from 'webpack-isomorphic-tools/plugin';
import ismorphicToolsConfig from './webpack-isomorphic-tools';
const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(ismorphicToolsConfig);

export default function(opts) {
  const {
    app,
    environment,
    file,
    isMainTask,
    paths,
    sources,
    release,
    DEBUG,
    SERVER,
    TEST
  } = opts;
  const {scriptDir} = sources;
  const {shouldRev} = environment;
  const {cssBundleName, jsBundleName} = paths;
  const {CommonsChunkPlugin} = webpack.optimize;

  const commons = [
    new CommonsChunkPlugin({
      name: 'vendors',
      filename: join(scriptDir, jsBundleName),
      minChunks: Infinity
    })
  ];

  const plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jquery': 'jquery'
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(DEBUG || TEST ? 'development' : 'production'),
        TEST_FILE: file ? JSON.stringify(file) : null
      }
    })
  ];

  const prodPlugins = [
    new webpack.optimize.DedupePlugin()
  ];

  const releasePlugins = [
    new webpack.BannerPlugin(
      'try{require("source-map-support").install();}\ncatch(err) {}',
      { raw: true, entryOnly: false }
    )
  ];

  if (!SERVER) {
    plugins.push(
      new ExtractTextPlugin(cssBundleName, {
        allChunks: true
      })
    );

    if (isMainTask) {
      plugins.push(...commons, webpackIsomorphicToolsPlugin.development(DEBUG));
    }

    if (!DEBUG || !TEST) {
      plugins.push(...prodPlugins);
    }

    if (release) {
      plugins.push(...releasePlugins);
    }
  }

  return {plugins};
}
