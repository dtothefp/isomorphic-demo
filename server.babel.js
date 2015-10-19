//  enable runtime transpilation to use ES6/7 in node

//var fs = require('fs');

//var babelrc = fs.readFileSync('./.babelrc');
//var config;

//try {
  //config = JSON.parse(babelrc);
//} catch (err) {
  //console.error('==>     ERROR: Error parsing your .babelrc.');
  //console.error(err);
//}

var config = {
  'stage': 0,
  optional: 'runtime',
  loose: 'all',
  plugins: [
    'typecheck'
  ]
};

require('babel/register')(config);
