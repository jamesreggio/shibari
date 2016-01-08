module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'browserify', 'source-map-support'],
    files: [
      'test/**/*.js',
    ],
    preprocessors: {
      'test/**/*.js': ['browserify'],
    },
    browserify: {
      debug: true,
    },

    browsers: ['Chrome'],
    reporters: ['progress'],
    singleRun: true,
  })
};
