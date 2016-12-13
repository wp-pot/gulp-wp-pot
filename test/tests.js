/* eslint-env node, mocha */
/* global describe, it */
'use strict';

const assert = require('assert');
const fs = require('fs');
const gutil = require('gulp-util');
const gulpWpPot = require('../');
const testHelper = require('./test-helper');

describe('File write tests', function () {
  it('should generate a file', function (done) {
    var fixturePath = 'test/fixtures/empty.php';

    var testFile = new gutil.File({
      path: fixturePath,
      contents: fs.readFileSync(fixturePath)
    });

    let stream = gulpWpPot();
    stream.once('data', function (file) {
      assert(file.isBuffer());
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it('should read a file correctly', function (done) {
    const fixturePath = 'test/fixtures/valid-functions.php';

    var testFile = new gutil.File({
      path: fixturePath,
      contents: fs.readFileSync(fixturePath)
    });

    let stream = gulpWpPot({
      src: fixturePath
    });

    stream.once('data', function (file) {
      const potContents = file.contents.toString();
      testHelper.testValidFunctions(potContents, fixturePath);
      done();
    });
    stream.write(testFile);
    stream.end();
  });
});
