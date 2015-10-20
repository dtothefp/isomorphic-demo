export default function(gulp, plugins, config) {
  const {browserSync} = plugins;
  const {sources} = config;
  const {devHost, expressPort, devPort} = sources;
  const bs = browserSync.create(`${devHost}:${devPort}`);

  return (cb) => {
    bs.init({
      proxy: {
        target: `${devHost}:${expressPort}`
      },
      port: devPort,
      open: false
    }, () => {
      global.BS_ACTIVE = true;
      cb();
    });
  };
}
