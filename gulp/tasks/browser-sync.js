export default function(gulp, plugins, config) {
  const {browserSync} = plugins;
  const {ENV, sources} = config;
  const {devHost, expressPort, devPort} = sources;

  return (cb) => {
    const config = {
      development: {
        proxy: {
          target: `${devHost}:${expressPort}`,
          ws: true,
          middleware: [
            (req, res, next) => {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'authorization, accept');
              res.setHeader('Access-Control-Max-Age', '1728000');
              if (req.method === 'OPTIONS') {
                res.end();
              } else {
                next();
              }
            }
          ]
        },
        port: devPort
      },
      production: {
        proxy: {
          target: `${devHost}:${expressPort}`,
          ws: true,
          middleware: [
            (req, res, next) => {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'authorization, accept');
              res.setHeader('Access-Control-Max-Age', '1728000');
              if (req.method === 'OPTIONS') {
                res.end();
              } else {
                next();
              }
            }
          ]
        },
        port: devPort
      }
    };

    browserSync(config[ENV], cb);
  };
}
