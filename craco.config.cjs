const webpack = require('webpack');

console.log("✅ CRACO config file is being loaded!");

module.exports = {
  style: {
    postcssOptions: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Fix JS rule detection
      const jsRule = webpackConfig.module.rules
        .find((rule) => Array.isArray(rule.oneOf))
        ?.oneOf.find(
          (oneOfRule) =>
            (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) ||
            (oneOfRule.options &&
              oneOfRule.options.customize &&
              oneOfRule.options.customize.endsWith('babel-preset-react-app'))
        );

      if (jsRule) {
        if (!jsRule.exclude) jsRule.exclude = [];
        jsRule.exclude.push(/\.css$/);
      }

      // Add Node.js polyfills for browser
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        fs: false,
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        vm: require.resolve('vm-browserify'),
        encoding: false,
      };

      // Handle .mjs/.js fullySpecified issue
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      // Ignore harmless warnings
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      return webpackConfig;
    },

    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
};
