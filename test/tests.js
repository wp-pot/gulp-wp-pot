/* eslint-env node, mocha */
'use strict';

const assert = require('assert');
const fs = require('fs');
const gulpWpPot = require('../');
const testHelper = require('./test-helper');
const Vinyl = require('vinyl');
const PluginError = require('plugin-error');
const es = require('event-stream');

describe('File write tests', function () {
  it('should generate a file', function (done) {
    const fixturePath = 'test/fixtures/empty.php';

    const testFile = new Vinyl({
      path: fixturePath,
      contents: fs.readFileSync(fixturePath)
    });

    es.readArray([testFile])
      .pipe(gulpWpPot())
      .on('error', function (error) {
        done(error);
      })
      .on('data', function (file) {
        assert(file.isBuffer());
        done();
      });
  });

  it('should read a file correctly', function (done) {
    const fixturePath = 'test/fixtures/valid-functions.php';

    const testFile = new Vinyl({
      path: fixturePath,
      contents: fs.readFileSync(fixturePath)
    });

    es.readArray([testFile])
      .pipe(gulpWpPot({
        src: fixturePath
      }))
      .on('error', function (error) {
        done(error);
      })
      .on('data', function (file) {
        const potContents = file.contents.toString();
        testHelper.testValidFunctions(potContents, fixturePath);
        done();
      });
  });
});

describe('Error handling', function () {
  it('should throw an error if options is not an object or undefined', function () {
    assert.throws(function () {
      gulpWpPot('invalid');
    }, PluginError);
  });

  it('should emit an error if file is a stream', function (done) {
    const fixturePath = 'test/fixtures/empty.php';

    const testFile = new Vinyl({
      path: fixturePath,
      contents: fs.createReadStream(fixturePath)
    });

    es.readArray([testFile])
      .pipe(gulpWpPot())
      .on('error', function () {
        done();
      })
      .on('end', function () {
        done(new Error('Error was not fired'));
      });
  });

  it('should emit an error if there is an error in a file', function (done) {
    const fixturePath = 'test/fixtures/invalid.php';

    const testFile = new Vinyl({
      path: fixturePath,
      contents: fs.readFileSync(fixturePath)
    });

    es.readArray([testFile])
      .pipe(gulpWpPot())
      .on('error', function () {
        done();
      })
      .on('end', function () {
        done('Error was not fired');
      });
  });
});
