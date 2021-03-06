// Karma configuration
// Generated on Mon Aug 04 2014 10:45:24 GMT+0400 (MSK)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'static/js/lib/jquery.min.js',
      'static/js/lib/bloodhound.js',
      'static/js/lib/moment.min.js',
      'static/js/lib/angular.min.js',
      'static/js/lib/angular-*.js',
      'static/js/lib/toaster.js',
      'static/js/lib/pace.min.js',
      'test/lib/angular-mocks.js',
      'static/js/app/**/*.js',
      'test/**/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
      'static/js/app/**/*.min.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    plugins: [
      'karma-jasmine', 
      'karma-phantomjs-launcher'
    ],


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
