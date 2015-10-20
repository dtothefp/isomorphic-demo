import Express from 'express';
import makeConfig from '../gulp/config';
import renameKey from './lib/rename-key';
import http from 'http';
import Assemble from 'assemble';
import loader from 'assemble-loader';
import nunjucks from 'nunjucks';
import consolidate from 'consolidate';
import jsxLoader from './lib/jsx-loader';
import addTags from './tags';

export default function({webpackIsomorphicTools}) {
  const {NODE_ENV} = process.env;
  const config = makeConfig({ENV: NODE_ENV});
  const {sources, environment, utils} = config;
  const {srcDir, buildDir, expressPort} = sources;
  const {isDev} = environment;
  const {addbase} = utils;
  const app = new Express();
  const server = new http.Server(app);
  const assemble = new Assemble();

  const instance = nunjucks.configure({
    watch: false,
    noCache: true
  });

  addTags({nunjucks: instance, app: assemble});

  assemble.data({
    environment,
    utils,
    layouts(fp) {
      return `${addbase(srcDir, 'templates/layouts', fp)}.html`;
    }
  });

  assemble.engine('.html', consolidate.nunjucks);
  assemble.create('pages', {renameKey})
  .use(loader());

  assemble.pages('./src/templates/pages/*.html');

  assemble.create('snippets', {viewType: 'partial', renameKey})
  .use(jsxLoader(config));

  app.use(require('serve-static')(addbase(buildDir)));

  app.use((req, res, next) => {
    if (isDev) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }

    const snippetId = req.query.snippetId || 'sample';
    const userName = process.cwd().split('/')[2];

    const componentProps = {
      userName
    };

    assemble.snippets.load([`./src/js/components/${snippetId}.jsx`], {}, componentProps, function(err) {
      if (err) return next(err);

      const page = assemble.pages.getView('pages/index');
      page.render({
        userName,
        snippetId,
        assets: webpackIsomorphicTools.assets()
      }, function(err, view) {
        if (err) return next(err);

        res.send(view.content);
      });
    });
  });

  if (expressPort) {
    server.listen(expressPort, (err) => {
      if (err) {
        console.error(err);
      }
      console.info('==> 💻  Open http://localhost:%s in a browser to view the app.', expressPort);
    });
  } else {
    console.error('==>     ERROR: No PORT environment variable has been specified');
  }
}
