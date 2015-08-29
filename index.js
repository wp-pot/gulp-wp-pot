'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var path = require('path');
var PluginError = gutil.PluginError;

function keyChain(key, functionArgs) {
    switch (key) {
        case '__':
        case '_e':
        case 'esc_attr__':
        case 'esc_attr_e':
        case 'esc_html__':
        case 'esc_html_e':
            return 'simple_' + functionArgs[0];
        case '_x':
        case '_ex':
        case 'esc_attr_x':
        case 'esc_html_x':
            return 'context_' + functionArgs[1] + functionArgs[0];
        case '_n':
        case '_n_noop':
            return 'multiple_' + functionArgs[1] + functionArgs[0];
        case '_nx':
        case '_nx_noop':
            return 'multiple_' + functionArgs[2] + functionArgs[1] + functionArgs[0];
    }
}

function findTranslations(file, domain) {
    var lines = file.contents.toString().split('\n');
    var patternFunctionCalls = /(__|_e|esc_attr__|esc_attr_e|esc_html__|esc_html_e|_x|_ex|esc_attr_x|esc_html_x|_n|_n_noop|_nx|_nx_noop)\s*\(/g;
    var translations = [];
    var functionCall;

    lines.forEach(function (line, lineNumber) {
        while ((functionCall = patternFunctionCalls.exec(line))) {
            if (functionCall[0]) {
                var functionArgs = [];
                var openParentheses = 1;
                var escaped = false;
                var quote = '';

                var currentArgument = '';

                for (var i = functionCall.index + functionCall[0].length, len = line.length; i < len; i++) {
                    var currentChar = line[i];

                    if (quote === '' && currentChar === ' ') {
                        escaped = false;
                        continue;
                    }

                    if (!escaped && quote && currentChar === quote) {
                        quote = '';
                        continue;
                    }

                    if (!escaped && currentChar === '\\') {
                        escaped = true;
                    }

                    if (!escaped && !quote && (currentChar === '\"' || currentChar === '\'')) {
                        quote = currentChar;
                        continue;
                    }

                    if (!quote && currentChar === '(') {
                        openParentheses++;
                    }

                    if (!quote && currentChar === ')') {
                        openParentheses--;
                    }

                    if (!quote && currentChar === ',') {
                        functionArgs.push(currentArgument);
                        currentArgument = '';
                        continue;
                    }

                    if (escaped) {
                        escaped = false;
                    }

                    if (openParentheses > 0) {
                        currentArgument = currentArgument + currentChar;
                    }

                    if (openParentheses === 0) {
                        functionArgs.push(currentArgument);
                        break;
                    }
                }

                if (functionArgs.length <= 1) {
                    continue;
                }

                var filePath = file.path === undefined ? domain + '.pot' : file.path;

                if (!domain || domain === functionArgs[functionArgs.length - 1]) {
                    translations.push({
                        key: functionCall[1],
                        functionArgs: functionArgs,
                        info: path.relative('./', filePath) + ':' + (lineNumber + 1),
                        keyChain: keyChain(functionCall[1], functionArgs),
                    });
                }
            }
        }
    });

    return translations;
}

function transToPot(orig) {
    // Merge duplicate
    var buffer = {};

    orig.forEach(function (file) {
        file.forEach(function (translation) {
            if (buffer[translation.keyChain]) {
                buffer[ translation.keyChain ].info += ', ' + translation.info;
            } else {
                buffer[ translation.keyChain ] = translation;
            }
        });
    });

    // Write
    var output = [];
    if (buffer) {
        for (var el in buffer) {
            if (buffer.hasOwnProperty(el)) {
                switch (buffer[el].key) {
                    case '__':
                    case '_e':
                    case 'esc_attr__':
                    case 'esc_attr_e':
                    case 'esc_html__':
                    case 'esc_html_e':
                        output.push('#: ' + buffer[el].info);
                        output.push('msgid "' + buffer[el].functionArgs[0] + '"');
                        output.push('msgstr ""\n');
                        break;
                    case '_x':
                    case '_ex':
                    case 'esc_attr_x':
                    case 'esc_html_x':
                        output.push('#: ' + buffer[el].info);
                        output.push('msgctxt "' + buffer[el].functionArgs[1] + '"');
                        output.push('msgid "' + buffer[el].functionArgs[0] + '"');
                        output.push('msgstr ""\n');
                        break;
                    case '_n':
                    case '_n_noop':
                        output.push('#: ' + buffer[el].info);
                        output.push('msgid "' + buffer[el].functionArgs[0] + '"');
                        output.push('msgid_plural "' + buffer[el].functionArgs[1] + '"');
                        output.push('msgstr[0] ""');
                        output.push('msgstr[1] ""\n');
                        break;
                    case '_nx':
                    case '_nx_noop':
                        output.push('#: ' + buffer[el].info);
                        output.push('msgctxt "' + buffer[el].functionArgs[3] + '"');
                        output.push('msgid "' + buffer[el].functionArgs[0] + '"');
                        output.push('msgid_plural "' + buffer[el].functionArgs[1] + '"');
                        output.push('msgstr[0] ""');
                        output.push('msgstr[1] ""\n');
                        break;
                }
            }
        }
    }

    return output;
}

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function gulpWPpot(options) {
    if (options === undefined || !isObject(options)) {
        throw new PluginError('gulp-wp-pot', 'Require a argument of type object.');
    }

    if (!options.domain) {
        throw new PluginError('gulp-wp-pot', 'Domain option is required.');
    }

    if (!options.destFile) {
        options.destFile = options.domain + '.pot';
    }

    if (!options.package) {
        options.package = options.domain;
    }

    var buffer = [];
    var destFile = options.destFile;
    var destDir = path.dirname(destFile);

    // creating a stream through which each file will pass
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

        //Headers
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
            contents += '"Language-Team: ' + options.team + '\\n"\n\n';
        }

        if (options.poEdit) {

            // If keywordsList not set, use defaults
            if (options.poEdit.keywordsList) {
                contents += '"X-Poedit-KeywordsList: ' + options.poEdit.keywordsList + '\\n"\n';
            } else {
                contents += '"X-Poedit-KeywordsList: __;_e;esc_attr__;esc_attr_e;esc_html__;esc_html_e;_x;_ex;esc_attr_x;esc_html_x;_n;_n_noop;_nx;_nx_noop\\n"\n';
            }

            if (options.poEdit.basePath) {
                contents += '"X-Poedit-Basepath: ' + options.poEdit.basePath + '\\n"\n';
            }

            if (options.poEdit.searchPath) {
                contents += '"X-Poedit-SearchPath-0: ' + options.poEdit.searchPath + '\\n"\n\n';
            }
        }

        contents += '"Plural-Forms: nplurals=2; plural=(n != 1);\\n\\n"\n\n';

        //Contents
        buffer = transToPot(buffer);
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
