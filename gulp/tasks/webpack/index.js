import Express from 'express';
import {assign, isFunction} from 'lodash';
import webpack from 'webpack';
import makeConfig from './make-webpack-config';

export default function(gulp, plugins, config) {
  const {sources, utils, environment} = config;
  const {isDev} = environment;
  const {addbase, getTaskName} = utils;
  const {mainBundleName, buildDir, hotPort, devPort, devHost} = sources;
  const {gutil} = plugins;

  return (cb) => {
    const app = new Express();
    const task = getTaskName(gulp.currentTask);
    const isMainTask = task === mainBundleName;
    let publicPath;
    const devPath = `http://${devHost}:${hotPort}`;

    if (isMainTask) {
      publicPath = isDev ?  `${devPath}/` : `/`;
    } else {
      publicPath = isDev ? `http://${devHost}:${devPort}` : `/`;
    }

    const webpackConfig = makeConfig(assign({}, config, {isMainTask, publicPath, app}));
    const compiler = webpack(webpackConfig);

    function logger(err, stats) {
      if (err) {
        throw new new gutil.PluginError({
          plugin: `[webpack]`,
          message: err.message
        });
      }

      if (!isDev) {
        gutil.log(stats.toString());
      }
    }

    compiler.plugin('compile', () => {
      gutil.log(`Webpack Bundling ${task} bundle`);
    });

    compiler.plugin('done', (stats) => {
      gutil.log(`Webpack Bundled ${task} bundle in ${stats.endTime - stats.startTime}ms`);

      if (stats.hasErrors() || stats.hasWarnings()) {
        const {errors, warnings} = stats.toJson({errorDetails: true});

        [errors, warnings].forEach((stat, i) => {
          let type = i ? 'warning' : 'error';
          if (stat.length) {
            const [statStr] = stat;
            /*eslint-disable*/
            const [first, ...rest] = statStr.split('\n\n');
            /*eslint-enable*/
            if (rest.length) {
              gutil.log(`[webpack: ${task} bundle ${type}]\n`, rest.join('\n\n'));
            } else {
              gutil.log(`[webpack: ${task} bundle ${type}]`, stats.toString());
            }
          }
        });

        if (!isDev) {
          process.exit(1);
        }
      }

      //avoid multiple calls of gulp callback
      if (isFunction(cb)) {
        let gulpCb = cb;
        cb = null;
        if (isDev && isMainTask) {
          app.listen(hotPort, function onAppListening(err) {
            if (err) {
              console.error(err);
            } else {
              console.info('==> 🚧  Webpack development server listening on port %s', hotPort);
            }
          });
        }

        gulpCb();
      }
    });

    if (isDev) {
      if (isMainTask) {
        const serverOptions = {
          contentBase: addbase(buildDir),
          quiet: true,
          noInfo: true,
          hot: true,
          inline: true,
          lazy: false,
          publicPath,
          headers: {'Access-Control-Allow-Origin': '*'},
          stats: {colors: true}
        };

        app.use(require('webpack-dev-middleware')(compiler, serverOptions));
        app.use(require('webpack-hot-middleware')(compiler));

      } else {
        compiler.watch({
          aggregateTimeout: 300,
          poll: true
        }, logger);
      }
    } else {
      compiler.run(logger);
    }
  };
}
