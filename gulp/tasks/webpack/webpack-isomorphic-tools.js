/*eslint-disable*/
const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');

// see this link for more info on what all of this means
// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
module.exports = {
  webpack_assets_file_path: 'webpack-stats.json',

  assets: {
    images: {
      extensions: [
        'jpeg',
        'jpg',
        'png',
        'gif',
        'svg'
      ],
      parser: WebpackIsomorphicToolsPlugin.url_loader_parser
    },
    style_modules: {
      extensions: ['css', 'less','scss'],
      filter: function(m, regex, options, log) {
        let check;

        if (options.development) {
          check = m.name.indexOf('./~/css-loader') === 0 && (regex.test(m.name) && m.name.slice(-2) === 'ss' && m.reasons[0].moduleName.slice(-2) === 'ss');
        } else {
          check = regex.test(m.name);
        }
        //filter by modules with '.scss' inside name string, that also have name and moduleName that end with 'ss'(allows for css, less, sass, and scss extensions)
        //this ensures that the proper scss module is returned, so that namePrefix variable is no longer needed
        return check;
      },
      naming: function(m, options, log) {
        //find index of '/src' inside the module name, slice it and resolve path
        const split = m.name.split('/src');
        var name = '.' + split.splice(-1)[0];
        if (split.length > 1) {
          // Resolve the e.g.: "C:\"  issue on windows
          const i = name.indexOf(':');
          if (i >= 0) {
            name = name.slice(i + 1);
          }
        }
        return name;
      },
      parser: function(m, options, log) {
        if (m.source) {
          //var regex = /module\.exports = ((.|\n)+);/;
          var regex = options.development ? /exports\.locals = ((.|\n)+);/ : /module\.exports = ((.|\n)+);/;
          var match = m.source.match(regex);
          return match ? JSON.parse(match[1]) : {};
        }
      }
    }
  }
}
/*eslint-enable*/
