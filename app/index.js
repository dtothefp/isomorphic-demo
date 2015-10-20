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

export default function({webpackIsomorphicTools, isDev}) {
  const config = makeConfig({ENV: 'development'});
  const {sources} = config;
  const {expressPort} = sources;
  const pretty = new PrettyError();
  const app = new Express();
  const server = new http.Server(app);
  const assemble = new Assemble();

  nunjucks.configure({
    watch: false,
    noCache: true
  });

  assemble.data(config);

  assemble.engine('.html', consolidate.nunjucks);
  assemble.create('pages', {renameKey: function (fp) {
    return path.basename(fp, path.extname(fp));
  }})
  .use(loader());

  assemble.pages('./src/templates/pages/*.html');

  assemble.create('snippets', {viewType: 'partial', renameKey: function (fp) {
      return path.basename(fp, path.extname(fp));
    }})
    .use(jsxLoader(config));

  app.use((req, res, next) => {
    console.log('here');
    if (isDev) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }

    let componentProps = {
      userName: 'DFP'
    };
    let snippetId = req.params.snippetId;
    assemble.snippets.load(['./src/js/components/${snippetId}.jsx'], {}, componentProps, function (err) {
      if (err) return next(err);

      var page = assemble.pages.getView('index');
      page.render({snippetId}, function (err, view) {
        if (err) return next(err);
        write('dest/path', view.content, done);
      });
    });
  });

  console.log('PORt', expressPort);
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
