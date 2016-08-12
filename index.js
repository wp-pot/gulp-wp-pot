'use strict';

var gutil          = require('gulp-util');
var through        = require('through2');
var path           = require('path');
var getLineFromPos = require('get-line-from-pos');

var PluginError = gutil.PluginError;

/**
 * Determine if `key` is plural or not.
 *
 * @param  {string} key
 *
 * @return {bool}
 */
function isPlural(key) {
  return /(_n|_n_noop|_nx|_nx_noop)/.test(key);
}

/**
 * Determine if `key` has context or not.
 *
 * @param  {string} key
 *
 * @return {bool}
 */
function hasContext(key) {
  return /(_x|_ex|esc_attr_x|esc_html_x|_nx|_nx_noop)/.test(key);
}

/**
 * Determine if `key` is a noop key or not.
 *
 * @param  {string} key
 *
 * @return {bool}
 */
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
function keyChain(translationString, context) {
  if (!context) {
    return '_simple_' + translationString;
  } else {
    return '_context_' + context + '_' + translationString;
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

      // Save character in argument.
      var saveChar = true;

      // Ignore whitespace outside quotes.
      if (!quote && /\s/.test(currentChar)) {
        saveChar = false;
      }

      // If in quote and current char is unescaped quote char then close quote.
      if (!escaped && currentChar === quote) {
        quote = '';
        saveChar = false;

        // If outside of quote and current char is unescaped quote char then open quote.
      } else if (!escaped && !quote && (currentChar === '\"' || currentChar === '\'')) {
        quote = currentChar;
        saveChar = false;
      }

      // If current char is opening parantheses and outside an quote increment
      // parantheses count to know when to finish the translation function.
      if (!quote && currentChar === '(') {
        openParentheses++;
        saveChar = false;

        // If current char is closing parantheses and outside an
        // quote decrese parantheses count to know when to finish
        // the translation function.
      } else if (!quote && currentChar === ')') {
        openParentheses--;
        saveChar = false;
      }

      // If not in quote and current char is comma the current argument is done.
      if (!quote && currentChar === ',') {
        functionArgs.push(currentArgument);
        currentArgument = '';
        continue;
      }

      // Reset escaped if escape was enabled.
      if (escaped) {
        escaped = false;
      }

      // Enable escape if current char is non escaped escape character.
      else if (currentChar === '\\') {
        escaped = true;
      }

      // If function is not closed, add current char to current arguement.
      if (openParentheses > 0 && saveChar === true) {
        currentArgument = currentArgument + currentChar;

        // If function is closed by this character, add current arguement to function arguments and continue to next function.
      } else if (openParentheses === 0) {
        functionArgs.push(currentArgument);
        break;
      }
    }

    // If no arguments was found in this function ignore it.
    if (functionArgs.length <= 1) {
      continue;
    }

    var filePath = file.path === undefined ? domain + '.pot' : file.path;

    // Only save function if no domain is set or if domain is correct.
    if (!domain || domain === functionArgs[functionArgs.length - 1]) {
      for (var j = 0; j < functionArgs.length; j++) {
        // Unescape everything except for " and \ (they are escaped in the pot-file).
        functionArgs[j] = functionArgs[j].replace(/\\([^\"\\])/g, '$1');

        // Escape unescaped "
        functionArgs[j] = functionArgs[j].replace(/\\([\s\S])|(\")/g, '\\$1$2');
      }

      var translation = {
        info: path.relative('./', filePath) + ':' + getLineFromPos(fileContent, functionCall.index),
        msgid:  functionArgs[0],
      };

      if (isPlural(functionCall[1])) {
        translation.msgid_plural = functionArgs[1];
      }

      if (hasContext(functionCall[1])) {
        // Default context position
        var contextKey = 1;

        // Plural has two more arguments before context
        if (isPlural(functionCall[1])) {
          contextKey = contextKey + 2;
        }

        // Noop-functions has one less argument before context
        if (isNoop(functionCall[1])) {
          contextKey = contextKey - 1;
        }

        translation.msgctxt = functionArgs[contextKey];
      }

      translation.key = keyChain(translation.msgid, translation.msgctxt);

      // Add function call to translations array.
      translations.push(translation);
    }
  }

  return translations;
}

/**
 * Find unique translations.
 *
 * @param  {array} original
 *
 * @return {object}
 */
function uniqueTranslations(translationsBuffer) {
  // Merge duplicate translations, add source path to info.
  var translations = {};

  translationsBuffer.forEach(function (file) {
    file.forEach(function (translation) {
      if (translations[translation.key]) {
        translations[translation.key].info += ', ' + translation.info;

        if (translation.msgid_plural && !translations[translation.key].msgid_plural) {
          translations[translation.key].msgid_plural = translation.msgid_plural;
        }
      } else {
        translations[translation.key] = translation;
      }
    });
  });

  return translations;
}

/**
 * Write translation to array with pot format.
 *
 * @param  {object} buffer
 *
 * @return {array}
 */
function translationToPot(translations) {
  // Write translation rows.
  var output = [];

  if (translations) {
    for (var el in translations) {
      if (translations.hasOwnProperty(el)) {

        // Unify paths for Unix and Windows
        output.push('#: ' + translations[el].info.replace(/\\/g, '/'));

        if (translations[el].msgctxt) {
          output.push('msgctxt "' + translations[el].msgctxt + '"');
        }

        if (/\n/.test(translations[el].msgid)) {
          output.push('msgid ""');
          var rows = translations[el].msgid.split(/\n/);
          for (var rowId = 0; rowId < rows.length; rowId++) {
            var lineBreak = rowId === (rows.length - 1) ? '' : '\\n';
            output.push('"' + rows[rowId] + lineBreak + '"');
          }
        } else {
          output.push('msgid "' + translations[el].msgid + '"');
        }

        if (translations[el].msgid_plural) {
          output.push('msgid_plural "' + translations[el].msgid_plural + '"');
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
 * @return {bool}
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

  var translationsBuffer   = [];
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
      var fileTranslations = findTranslations(file, options.domain);
      if (fileTranslations.length > 0) {
        translationsBuffer.push(fileTranslations);
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

    contents += '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"\n';

    // Contents.
    var translations = uniqueTranslations(translationsBuffer);
    var translationLines = translationToPot(translations);

    contents += translationLines.join('\n');

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
