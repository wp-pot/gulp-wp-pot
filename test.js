'use strict';

/* global describe, it */

var assert = require('assert');
var File   = require('vinyl');
var wpPot  = require('./');

describe('Arguments tests', function () {
  it('should thrown a error without argument', function () {
    try {
      wpPot();
    } catch (e) {
      assert.equal('Require a argument of type object.', e.message);
    }
  });

  it('should thrown a error when argument is not a object', function () {
    try {
      wpPot(null);
    } catch (e) {
      assert.equal('Require a argument of type object.', e.message);
    }
  });

  it('should throw a error without domain', function () {
      try {
      wpPot({});
    } catch (e) {
      assert.equal('Domain option is required.', e.message);
    }
  });
});

describe('generate tests', function () {
  it ('should generate a pot file from php file', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _e( "Name", "test" ); ?>')
    });
    var stream = wpPot({
      domain: 'test'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid \"Name\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with context', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgctxt \"the name\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with plural', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php sprintf( _n( "%s star", "%s stars", 3, "test" ), 3 ); ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgid_plural \"%s stars\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with plural and context', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php sprintf( _nx( "%s star", "%s stars", 3, "stars translation", "test" ), 3 ); ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf("msgctxt \"stars translation\"\n") !== -1);
      assert(fileContents.indexOf("msgid_plural \"%s stars\"\n") !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file with custom headers from php file with headers set', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>',
      headers: {
        'Hello-World': 'This is a test'
      }
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('Hello-World: This is a test\\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file without default headers from php file with headers false', function (done) {
    var testFile = new File({
      contents: new Buffer('<?php _x( "Name", "the name", "test" );  ?>')
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>',
      headers: false
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('X-Poedit-KeywordsList') === -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with escaped single quotes', function (done) {
    var testFile = new File({
      contents: new Buffer("<?php _ex( 'It\\\'s escaped', 'test' ); ?>")
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('msgid \"It\'s escaped\"\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });

  it ('should generate a pot file from php file with escaped double quotes', function (done) {
    var testFile = new File({
      contents: new Buffer("<?php _ex( \"Hello \\\"World\\\"\", 'test' ); ?>")
    });
    var stream = wpPot({
      domain: 'test',
      bugReport: 'http://example.com',
      lastTranslator: 'John Doe <mail@example.com>',
      team: 'Team Team <mail@example.com>'
    });
    stream.once('data', function (file) {
      assert(file.isBuffer());
      var fileContents = file.contents.toString();
      assert(fileContents.indexOf('msgid \"Hello \\\"World\\\"\"\n') !== -1);
      done();
    });
    stream.write(testFile);
    stream.end();
  });
});
