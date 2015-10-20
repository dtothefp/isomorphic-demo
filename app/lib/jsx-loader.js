import async from 'async';
import glob from 'globby';
import ReactDOM from 'react-dom/server';
import React from 'react';

export default function(config) {
  const {sources, utils} = config;
  const {buildDir, srcDir} = sources;
  const {addbase} = utils;

  function _transform(data) {
    return function(fp, cb) {
      fp = addbase(fp);
      console.log(fp);
      const Comp = require(fp);
      let contents;
      try {
        contents = ReactDOM.renderToString(<Comp {...data} />);
      } catch(err) {
        console.log('REACT ERR', err);
      }
      cb(null, {path: fp, contents});
    };
  }

  return function(collection) {
    collection.load = function(patterns, options, data, cb) {
      console.log(arguments);
      options = options || {};
      const files = glob.sync(patterns, options);
      console.log(files);
      async.map(files, _transform(data), function(err, results) {
        if (err) return cb(err);
        results.forEach(function(file) {
          collection.addView(file.path, file);
        });
        cb();
      });
    };
  };
}
