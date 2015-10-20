import {intersection} from 'lodash';

export default function(gulp, plugins, config) {
  const {nodemon} = plugins;
  const {utils, ENV} = config;
  const {addbase} = utils;
  const browserSyncIsActive = intersection(['browser-sync', 'watch'], process.argv).length > 0;

  return (cb) => {
    nodemon({
      script: addbase('bin', 'server.js'),
      env: {
        NODE_ENV: ENV,
        BS_ACTIVE: browserSyncIsActive
      }
    }).on('start', () => {
      if (typeof cb === 'function') {
        const gulpCb = cb;
        cb = null;
        gulpCb();
      }
    });
  };
}


