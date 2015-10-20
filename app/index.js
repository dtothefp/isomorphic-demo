import Express from 'express';
import Html from '../src/js/helpers/html';
import React from 'react';
import ReactDOM from 'react-dom/server';
import makeConfig from '../gulp/config';
import path from 'path';
import PrettyError from 'pretty-error';
import http from 'http';
import Sample from '../src/js/components/sample';
import Assemble from 'assemble';
import loader from 'assemble-loader';
import nunjucks from 'nunjucks';
import consolidate from 'consolidate';
import jsxLoader from './lib/jsx-loader';
import addTags from './tags';

export default function({webpackIsomorphicTools, isDev}) {
  const config = makeConfig({ENV: 'development'});
  const {sources, environment, utils} = config;
  const {srcDir} = sources;
  const {addbase} = utils;
  const {expressPort} = sources;
  const pretty = new PrettyError();
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
  assemble.create('pages', {renameKey: function (fp) {
    const dirname = path.dirname(fp).split('/').slice(-1)[0];
    const basename = path.basename(fp).split('.').slice(0)[0];
    return `${dirname}/${basename}`;
  }})
  .use(loader());

  assemble.pages('./src/templates/pages/*.html');

  assemble.create('snippets', {viewType: 'partial', renameKey: function (fp) {
      const dirname = path.dirname(fp).split('/').slice(-1)[0];
      const basename = path.basename(fp).split('.').slice(0)[0];
      return `${dirname}/${basename}`;
    }})
    .use(jsxLoader(config));

  app.use((req, res, next) => {
    if (isDev) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }

    const snippetId = req.query.snippetId;
    const componentProps = {
      userName: 'DFP'
    };

    assemble.snippets.load([`./src/js/components/${snippetId}.jsx`], {}, componentProps, function (err) {
      if (err) return next(err);

      var page = assemble.pages.getView('pages/index');
      page.render({
        snippetId,
        assets: webpackIsomorphicTools.assets(),
      }, function (err, view) {
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
