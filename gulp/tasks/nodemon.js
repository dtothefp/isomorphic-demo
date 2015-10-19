export default function(gulp, plugins, config) {
  const {nodemon} = plugins;
  const {sources, utils, ENV} = config;
  const {buildDir, scriptDir} = sources;
  const {addbase} = utils;

  return (cb) => {
    nodemon({
      script: addbase('bin', 'server.js'),
      env: {NODE_ENV: ENV}
    }).on('start', () => {
      if (typeof cb === 'function') {
        const gulpCb = cb;
        cb = null;
        gulpCb();
      }
    });
  };
}


