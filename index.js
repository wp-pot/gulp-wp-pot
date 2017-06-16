/* eslint-env node */
/** global: Buffer */
'use strict';

const gutil = require('gulp-util');
const through = require('through2');
const wpPot = require('wp-pot');

const PluginError = gutil.PluginError;

/**
 * Determine if `obj` is a object or not.
 *
 * @param  {object}  obj
 *
 * @return {boolean}
 */
function isObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Run the wp pot generator.
 *
 * @param  {object} options
 *
 * @return {object}
 */
function gulpWPpot (options) {
  if (options !== undefined && !isObject(options)) {
    throw new PluginError('gulp-wp-pot', 'Require a argument of type object.');
  }

  const files = [];

  const stream = through.obj(function (file, enc, cb) {
    if (file.isStream()) {
      throw new PluginError('gulp-wp-pot', 'Streams are not supported.');
    }

    files.push(file.path);
    cb();
  }, function (cb) {
    if (!options) {
      options = {};
    }

    options.src = files;
    options.writeFile = false;

    const potContents = wpPot(options);

    const potFile = new gutil.File({
      contents: Buffer.from(potContents),
      path: '.'
    });

    this.push(potFile);
    cb();
  });

  return stream;
}

module.exports = gulpWPpot;
