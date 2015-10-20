import {merge} from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import shouldExclude from './exclude-list';

export default function(opts) {
  const {
    expose,
    extract,
    isMainTask,
    libraryName,
    paths,
    sources,
    quick,
    DEBUG,
    TEST
  } = opts;
  const {fileLoader} = paths;
  const {includePaths} = sources;
  const babelQuery = {
    optional: ['runtime'],
    stage: 0
  };

  let jsxLoader = 'babel-loader';
  //let jsxLoader = [];
  let sassLoader, cssLoader;

  let jsonLoader = ['json-loader'];

  let sassParams = [
    `outputStyle=${DEBUG || quick ? 'expanded' : 'compressed'}`
  ];

  if (includePaths && Array.isArray(includePaths)) {
    includePaths.reduce((list, fp) => {
      list.push(`includePaths[]=${fp}`);
      return list;
    }, sassParams);
  }

  sassParams.push('sourceMap', 'sourceMapContents=true');

  if (DEBUG || TEST) {
    const babelDevConfig = {
      plugins: [
        //'rewire',
        'react-transform'
      ],
      extra: {
        'react-transform': {
          transforms:
            [{
              transform: 'react-transform-hmr',
              imports: ['react'],
              locals: ['module']
            }]
        }
      }
    };

    //if (!TEST && !extract) {
      //jsxLoader.push('react-hot');
    //} else {
      //jsLoader += '&plugins=rewire';
    //}

    if (isMainTask) {
      merge(babelQuery, babelDevConfig);
    }

    // TODO: clean this up
    if (extract) {
      sassLoader = ExtractTextPlugin.extract('style-loader', [
        'css-loader?sourceMap&importLoaders=2',
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!'));
    } else {
      sassLoader = [
        'style-loader',
        'css-loader?sourceMap&importLoaders=2',
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!');
    }

    //cssLoader = ExtractTextPlugin.extract('style-loader', [
      //'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[name]__[local]___[hash:base64:5]',
      //'postcss-loader'
    //].join('!'));
    cssLoader = [
      'style-loader',
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[name]__[local]___[hash:base64:5]',
      'postcss-loader'
    ].join('!');
  } else {
    const babelProdOptional = [
      'optimisation.react.inlineElements',
      'optimisation.react.constantElements'
    ];

    babelQuery.optional.push(...babelProdOptional);

    cssLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[hash:base64:5]',
      'postcss-loader'
    ].join('!'));

    sassLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=2',
      'postcss-loader',
      `sass-loader?${sassParams.join('&')}`
    ].join('!'));
  }

  const preLoaders = [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }
  ];

  let loaders = [
    {
      test: /\.jsx?$/,
      exclude: shouldExclude,
      loader: jsxLoader,
      query: babelQuery
    },
    {
      test: /\.(jpe?g|gif|png|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: fileLoader
    },
    {
      test: /\.json$/,
      loader: jsonLoader
    },
    {
      test: /\.css$/,
      loader: cssLoader
    },
    {
      test: /\.scss$/,
      loader: sassLoader
    }
  ];

  if (TEST) {
    loaders.push({
      test: require.resolve('sinon'),
      loader: 'imports?define=>false'
    });
  }

  if (DEBUG || TEST) {
    loaders.unshift({
      expose,
      loader: `expose?${libraryName}`
    });
  }

  return {preLoaders, loaders};
}
