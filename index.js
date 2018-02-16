/* eslint-env node */
/** global: Buffer */
'use strict';

const Vinyl = require('vinyl');
const through = require('through2');
const wpPot = require('wp-pot');
const PluginError = require('plugin-error');

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
      this.emit('error', new PluginError('gulp-wp-pot', 'Streams are not supported.'));
    }

    files.push(file.path);
    cb();
  }, function (cb) {
    if (!options) {
      options = {};
    }

    options.src = files;
    options.writeFile = false;

    try {
      const potContents = wpPot(options);
      const potFile = new Vinyl({
        contents: Buffer.from(potContents),
        path: '.'
      });

      this.push(potFile);
      this.emit('end');

      cb();
    } catch (error) {
      this.emit('error', new PluginError('gulp-wp-pot', error));
    }
  });

  return stream;
}

module.exports = gulpWPpot;
