
const path = require('path');

cml.config.merge({
  templateLang: "cml",
  templateType: "smarty",
  enableGlobalCheck: false,
  wx: {
    dev: {
    },
    build: {
    },
    export: {
      entry: ['index.js'],
      publicPath: '/',
      hash: false,
      externals: {
        'mobx': 'mobx',
        'vuex': 'vuex'
      }
    }
  },
  alipay: {
    dev: {
    },
    build: {
    },
    export: {
      entry: ['index.js'],
      publicPath: '/',
      hash: false,
      externals: {
        'mobx': 'mobx',
        'vuex': 'vuex'
      }
    }
  },
  baidu: {
    dev: {
    },
    build: {
    },
    export: {
      entry: ['index.js'],
      publicPath: '/',
      hash: false,
      externals: {
        'mobx': 'mobx',
        'vuex': 'vuex'
      }
    }
  },
  web: {
    dev: {
      analysis: false,
      console: false,
      babelPolyfill: true
    },
    build: {
      analysis: false,
      babelPolyfill: true
    },
    export: {
      entry: ['index.js'],
      publicPath: '/',
      hash: false,
      externals: {
        'mobx': 'mobx',
        'vuex': 'vuex'
      }
    }
  },
  weex: {
    dev: {
    },
    build: {
    },
    export: {
      entry: ['index.js'],
      publicPath: '/',
      outputPath: path.resolve(__dirname, 'dist/weex'),
      hash: false,
      externals: {
        'mobx': 'mobx',
        'vuex': 'vuex'
      }
    }
  }
})

cml.utils.plugin('webpackConfig', function({ type, media, webpackConfig }, cb) {
  // cb函数用于设置修改后的配置
  
  if (['wx', 'alipay', 'baidu'].indexOf(type) !== -1) {
    delete webpackConfig.target;
    delete webpackConfig.output.jsonpFunction;
    webpackConfig.output.libraryTarget = 'umd';
    webpackConfig.output.filename = '[name].js';
    let index  = webpackConfig.plugins.findIndex(item => item.constructor.name === 'CommonsChunkPlugin')
    webpackConfig.plugins.splice(index, 1);
    // 在小程序导出组件时，将externals包裹成了 mobx: require('mobx')；不符合预期；所以这里重新设置。
    webpackConfig.externals = {
      'mobx': 'mobx',
      'vuex': 'vuex'
    }
  }
  webpackConfig.entry = {
    'index': path.resolve(__dirname, 'index.js')
  }
  webpackConfig.output.path = path.resolve(__dirname, `dist/${type}`)
  webpackConfig.module.rules.push({
    test: /\.js$/,
    // 不能babel babel-runtime
    include: [path.join(cml.projectRoot, 'src'), path.join(cml.projectRoot, 'index.js')],
    use: [{
      loader: 'babel-loader',
      options: {
        'filename': path.join(cml.root, 'chameleon.js')
      }
    }]
  });
  cb({
    type,
    media,
    webpackConfig
  });
});