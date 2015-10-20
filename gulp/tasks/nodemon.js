import {intersection} from 'lodash';
import open from 'open';

export default function(gulp, plugins, config) {
  const {nodemon} = plugins;
  const {utils, ENV, sources} = config;
  const {devHost, devPort, expressPort} = sources;
  const {addbase} = utils;
  const protocol = 'http://';
  const devPath = `${protocol}${devHost}:${devPort}`;
  const expressPath = `${protocol}${devHost}:${expressPort}`;

  const browserSyncIsActive = intersection(['browser-sync', 'watch'], process.argv).length > 0;
  const openPath = browserSyncIsActive ? devPath : expressPath;
  const taskConfig = {
    script: addbase('bin', 'server.js'),
    env: {
      NODE_ENV: ENV
    }
  };

  return (cb) => {
    nodemon(taskConfig).on('config:update', () => {
      if (typeof cb === 'function') {
        const gulpCb = cb;
        cb = null;
        setTimeout(() => {
          open(openPath);
          gulpCb();
        }, 2000);
      }
    });
  };
}


