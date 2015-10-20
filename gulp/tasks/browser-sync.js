export default function(gulp, plugins, config) {
  const {browserSync} = plugins;
  const {sources} = config;
  const {devHost, expressPort, devPort} = sources;

  return (cb) => {
    browserSync({
      proxy: {
        target: `${devHost}:${expressPort}`
      },
      port: devPort
    }, cb);
  };
}
