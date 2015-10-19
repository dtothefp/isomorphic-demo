import Express from 'express';
import Html from '../src/js/helpers/html';
import React from 'react';
import ReactDOM from 'react-dom/server';
import makeConfig from '../gulp/config';
import path from 'path';
import PrettyError from 'pretty-error';
import http from 'http';
import Sample from '../src/js/components/sample';

export default function({webpackIsomorphicTools, isDev}) {
  const config = makeConfig({ENV: 'development'});
  const {sources} = config;
  const {expressPort} = sources;
  const pretty = new PrettyError();
  const app = new Express();
  const server = new http.Server(app);

  app.use((req, res) => {
    if (isDev) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }

    res.send('<!doctype html>\n' +
     ReactDOM.renderToString(
       <Html
         assets={webpackIsomorphicTools.assets()}
         component={<Sample userName="DFP" />}
       />
      )
    );
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
