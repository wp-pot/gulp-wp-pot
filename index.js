/* eslint-env node */
/** global: Buffer */
'use strict';

const Vinyl = require('vinyl');
const wpPot = require('wp-pot');
const PluginError = require('plugin-error');
const { Transform } = require('stream');

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

  const transformer = new Transform({
    objectMode: true,
    transform (file, encoding, done) {
      if (file.isStream()) {
        done('error', new PluginError('gulp-wp-pot', 'Streams are not supported.'));
        return;
      }

      files.push(file.path);
      done();
    },
    flush (done) {
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
        done();
      } catch (error) {
        done(error, new PluginError('gulp-wp-pot', error));
      }
    }
  });

  return transformer;
}

module.exports = gulpWPpot;
