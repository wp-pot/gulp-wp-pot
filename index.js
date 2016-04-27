'use strict';

var gutil          = require('gulp-util');
var through        = require('through2');
var path           = require('path');
var getLineFromPos = require('get-line-from-pos');

var PluginError = gutil.PluginError;

/**
 * Determine if `key` is plural or not.
 *
 * @param  {string}  key
 *
 * @return {boolean}
 */
function isPlural(key) {
  return /(_n|_n_noop|_nx|_nx_noop)/.test(key);
}

/**
 * Determine if `key` has context or not.
 *
 * @param  {string}  key
 *
 * @return {boolean}
 */
function hasContext(key) {
  return /(_x|_ex|esc_attr_x|esc_html_x|_nx|_nx_noop)/.test(key);
}

function isNoop(key) {
  return /(_nx_noop|_n_noop)/.test(key);
}

/**
 * Get key chain.
 *
 * @param  {string} key
 * @param  {array}  functionArgs

 * @return {string|undefined}
 */
function keyChain(key, functionArgs) {
  if (!isPlural(key) && !hasContext(key)) {
    return 'simple_' + functionArgs[0];
  }

  if (!isPlural(key) && hasContext(key)) {
    return 'context_' + functionArgs[1] +  functionArgs[0];
  }

  if (isPlural(key) && !hasContext(key)) {
    return 'multiple_' + functionArgs[1] + functionArgs[0];
  }

  if (isPlural(key) && hasContext(key)) {
    return 'multiple_' + functionArgs[2] + functionArgs[1] + functionArgs[0];
  }
}

/**
 * Find translations in files.
 *
 * @param  {string} file
 * @param  {string} domain
 *
 * @return {array}
 */
function findTranslations(file, domain) {
  var fileContent         = file.contents.toString();
  var patternFunctionCalls = /(__|_e|esc_attr__|esc_attr_e|esc_html__|esc_html_e|_x|_ex|esc_attr_x|esc_html_x|_n|_n_noop|_nx|_nx_noop)\s*\(/g;
  var translations         = [];
  var functionCall;

  while ((functionCall = patternFunctionCalls.exec(fileContent))) {
    var functionArgs = [];
    var openParentheses = 1;
    var escaped = false;
    var quote = '';
    var currentArgument = '';

    for (var i = functionCall.index + functionCall[0].length, len = fileContent.length; i < len; i++) {
      var currentChar = fileContent[i];

      var saveChar = true; // Save character in argument

      if (!quote && /\s/.test(currentChar)) { // Ignore whitespace outside quotes.
        saveChar = false;
      }

      if (!escaped && currentChar === quote) { // If in quote and current char is unescaped quote char then close quote.
        quote = '';
        saveChar = false;
      } else if (!escaped && !quote && (currentChar === '\"' || currentChar === '\'')) { // If outside of quote and current char is unescaped quote char then open quote.
        quote = currentChar;
        saveChar = false;
      }

      if (!quote && currentChar === '(') { // If current char is opening parantheses and outside an quote increment parantheses count to know when to finish the translation function.
        openParentheses++;
        saveChar = false;
      } else if (!quote && currentChar === ')') { // If current char is closing parantheses and outside an quote decrese parantheses count to know when to finish the translation function.
        openParentheses--;
        saveChar = false;
      }

      if (!quote && currentChar === ',') { // If not in quote and current char is comma the current argument is done.
        functionArgs.push(currentArgument);
        currentArgument = '';
        continue;
      }

      if (escaped) { // Reset escaped if escape was enabled.
        escaped = false;
      } else if (currentChar === '\\') { // Enable escape if current char is non escaped escape character.
        escaped = true;
      }

      if (openParentheses > 0 && saveChar === true) { // If function is not closed, add current char to current arguement.
        currentArgument = currentArgument + currentChar;
      } else if (openParentheses === 0) { // If function is closed by this character, add current arguement to function arguments and continue to next function.
        functionArgs.push(currentArgument);
        break;
      }
    }

    if (functionArgs.length <= 1) { // If no arguments was found in this function ignore it.
      continue;
    }

    var filePath = file.path === undefined ? domain + '.pot' : file.path;

    if (!domain || domain === functionArgs[functionArgs.length - 1]) { // Only save function if no domain is set or if domain is correct.
      for (var j = 0; j < functionArgs.length; j++) {
        functionArgs[j] = functionArgs[j].replace(/\\([^\"\\])/g, '$1'); // Unescape everything except for " and \ (they are escaped in the pot-file).
        functionArgs[j] = functionArgs[j].replace(/\\([\s\S])|(\")/g, '\\$1$2'); // Escape unescaped "
      }

      // Add function call to translations array.
      translations.push({
        key: functionCall[1],
        functionArgs: functionArgs,
        info: path.relative('./', filePath) + ':' + getLineFromPos(fileContent, functionCall.index),
        keyChain: keyChain(functionCall[1], functionArgs),
      });
    }
  }

  return translations;
}

/**
 * Find unique translations.
 *
 * @param  {array} orig
 *
 * @return {object}
 */
function uniqueTranslations(orig) {
  // Merge duplicate translations, add source path to info.
  var buffer = {};

  orig.forEach(function (file) {
    file.forEach(function (translation) {
      if (buffer[translation.keyChain]) {
        buffer[translation.keyChain].info += ', ' + translation.info;
      } else {
        buffer[translation.keyChain] = translation;
      }
    });
  });

  return buffer;
}

/**
 * Write translation to array with pot format.
 *
 * @param  {object} buffer
 *
 * @return {array}
 */
function translationToPot(buffer) {
  // Write translation rows.
  var output = [];

  if (buffer) {
    for (var el in buffer) {
      if (buffer.hasOwnProperty(el)) {
        var key = buffer[el].key;

        // Unify paths for Unix and Windows
        output.push('#: ' + buffer[el].info.replace(/\\/g, '/'));

        if (hasContext(key)) {
          var argKey = 1;
          if (isPlural(key)) {
            argKey = argKey + 2;
          }

          // Noop-functions has one less argument
          if (isNoop(key)) {
            argKey = argKey - 1;
          }

          output.push('msgctxt "' + buffer[el].functionArgs[argKey] + '"');
        }

        if (/\n/.test(buffer[el].functionArgs[0])) {
          output.push('msgid ""');
          var rows = buffer[el].functionArgs[0].split(/\n/);
          for (var rowId = 0; rowId < rows.length; rowId++) {
            var lineBreak = rowId === (rows.length - 1) ? '' : '\\n';
            output.push('"' + rows[rowId] + lineBreak + '"');
          }
        } else {
          output.push('msgid "' + buffer[el].functionArgs[0] + '"');
        }

        if (isPlural(key)) {
          output.push('msgid_plural "' + buffer[el].functionArgs[1] + '"');
          output.push('msgstr[0] ""');
          output.push('msgstr[1] ""\n');
        } else {
          output.push('msgstr ""\n');
        }
      }
    }
  }

  return output;
}

/**
 * Determine if `obj` is a object or not.
 *
 * @param  {object}  obj
 *
 * @return {boolean}
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Run the wp pot generator.
 *
 * @param  {object} options
 *
 * @return {object}
 */
function gulpWPpot(options) {
  if (options !== undefined && !isObject(options)) {
    throw new PluginError('gulp-wp-pot', 'Require a argument of type object.');
  }

  if (!options) {
    options = {};
  }

  if (!options.destFile) {
    options.destFile = (options.domain || 'translations') + '.pot';
  }

  if (!options.package) {
    options.package = options.domain || 'unnamed project';
  }

  var defaultHeaders = {
    'X-Poedit-Basepath': '..',
    'X-Poedit-SourceCharset': 'UTF-8',
    'X-Poedit-KeywordsList': '__;_e;_n:1,2;_x:1,2c;_ex:1,2c;_nx:4c,1,2;esc_attr__;esc_attr_e;esc_attr_x:1,2c;esc_html__;esc_html_e;esc_html_x:1,2c;_n_noop:1,2;_nx_noop:3c,1,2;__ngettext_noop:1,2',
    'X-Poedit-SearchPath-0': '.',
    'X-Poedit-SearchPathExcluded-0': '*.js',
  };

  var buffer   = [];
  var destFile = options.destFile;
  var destDir  = path.dirname(destFile);

  if (!options.headers && options.headers !== false) {
    options.headers = defaultHeaders;
  }

  // Creating a stream through which each file will pass.
  var stream = through.obj(function (file, enc, cb) {

    if (file.isStream()) {
      throw new PluginError('gulp-wp-pot', 'Streams are not supported.');
    }

    if (file.isBuffer()) {
      var translations = findTranslations(file, options.domain);
      if (translations.length > 0) {
        buffer.push(translations);
      }
    }

    cb();
  }, function (cb) {

    // Headers.
    var year = new Date().getFullYear();
    var contents = '# Copyright (C) ' + year + ' ' + options.package + '\n';
    contents += '# This file is distributed under the same license as the ' + options.package + ' package.\n';
    contents += 'msgid ""\n';
    contents += 'msgstr ""\n';
    contents += '"Project-Id-Version: ' + options.package + '\\n"\n';

    if (options.bugReport) {
      contents += '"Report-Msgid-Bugs-To: ' + options.bugReport + '\\n"\n';
    }

    contents += '"MIME-Version: 1.0\\n"\n';
    contents += '"Content-Type: text/plain; charset=UTF-8\\n"\n';
    contents += '"Content-Transfer-Encoding: 8bit\\n"\n';
    contents += '"PO-Revision-Date: ' + year + '-MO-DA HO:MI+ZONE\\n"\n';

    if (options.lastTranslator) {
      contents += '"Last-Translator: ' + options.lastTranslator + '\\n"\n';
    }

    if (options.team) {
      contents += '"Language-Team: ' + options.team + '\\n"\n';
    }

    if (options.headers) {
      for (var key in options.headers) {
        if (options.headers.hasOwnProperty(key)) {
          contents += '"' + key + ': ' + options.headers[key] + '\\n"\n';
        }
      }
    }

    contents += '"Plural-Forms: nplurals=2; plural=(n != 1);\\n\\n"\n\n';

    // Contents.
    buffer = uniqueTranslations(buffer);
    buffer = translationToPot(buffer);
    contents += buffer.join('\n');

    var concatenatedFile = new gutil.File({
      base: path.relative('./', destDir),
      cwd: destDir,
      path: path.join(destDir, destFile),
      contents: new Buffer(contents),
    });
    this.push(concatenatedFile);
    cb();
  });

  return stream;
}

module.exports = gulpWPpot;
