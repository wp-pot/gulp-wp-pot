'use strict';
var gutil       = require('gulp-util');
var through     = require('through2');
var path        = require('path');
var PluginError = gutil.PluginError;

function findTrans( file, domain ) {
	var splited = file.contents.toString().split("\n");
	var pattern = /(__|_e|esc_attr__|esc_attr_e|esc_html__|esc_html_e|_x|_ex|esc_attr_x|esc_html_x|_n|_n_noop|_nx|_nx_noop)\(\s*(['|"]?.*['|"]?)+\s*\)/g;
	var t       = [];
	var m;

	splited.forEach( function (line, number) {
		while ((m = pattern.exec(line)) != null) {
			if (m.index === pattern.lastIndex) {
				pattern.lastIndex++;
			}
			if ( m[0] != null ) {
				var words = m[2].split(',');
				if ( ! Array.isArray( words ) ) {
					words = [ words ];
				}
				words = words.map( removeDot );
				if ( words[1] != undefined && domain == words[words.length - 1] ) {
					t.push( {
						found    : m[0],
						key      : m[1],
						words    : words,
						info     : path.relative( './', file.path ) + ':' + ( number + 1 ),
						keyChain : keyChain(m[1], words)
					} );
				}
			}
		}
	});
	return t;
}

function keyChain( key, words ) {
	switch( key ) {
		case '__':
		case '_e':
		case 'esc_attr__':
		case 'esc_attr_e':
		case 'esc_html__':
		case 'esc_html_e':
			return 'simple_' + words[0];
			break;
		case '_x':
		case '_ex':
		case 'esc_attr_x':
		case 'esc_html_x':
			return 'context_' + words[1] +  words[0];
			break;
		case '_n':
		case '_n_noop':
			return 'multiple_' + words[1] + words[0];
			break;
		case '_nx':
		case '_nx_noop':
			return 'multiple_' + words[2] + words[1] + words[0];
			break;
	}
}

function transToPot( orig ) {
	// Merge duplicate
	var buffer = {};
	orig.forEach( function( k ) {
		k.forEach( function( i ) {
			if ( buffer[i.keyChain] != undefined ) {
				buffer[ i.keyChain ].info += ', ' + i.info; 
			} else {
				buffer[ i.keyChain ] = i;
			}
		} );
	} );

	// Write
	var output = [];
	if ( buffer ) {
		for( var el in buffer ) {//buffer.forEach( function( el ) {
			switch( buffer[el].key ) {
				case '__':
				case '_e':
				case 'esc_attr__':
				case 'esc_attr_e':
				case 'esc_html__':
				case 'esc_html_e':
					output.push( '#: ' + buffer[el].info );
					output.push( 'msgid "' + buffer[el].words[0] + '"' );
					output.push( 'msgstr ""\n' );
					break;
				case '_x':
				case '_ex':
				case 'esc_attr_x':
				case 'esc_html_x':
					output.push( '#: ' + buffer[el].info );
					output.push( 'msgctxt "' + buffer[el].words[1] + '"' );
					output.push( 'msgid "' + buffer[el].words[0] + '"' );
					output.push( 'msgstr ""\n' );
					break;
				case '_n':
				case '_n_noop':
					output.push( '#: ' + buffer[el].info );
					output.push( 'msgid "' + buffer[el].words[0] + '"' );
					output.push( 'msgid_plural "' + buffer[el].words[1] + '"' );
					output.push( 'msgstr[0] ""' );
					output.push( 'msgstr[1] ""\n' );
					break;
				case '_nx':
				case '_nx_noop':
					output.push( '#: ' + buffer[el].info );
					output.push( 'msgctxt "' + buffer[el].words[3] + '"' );
					output.push( 'msgid "' + buffer[el].words[0] + '"' );
					output.push( 'msgid_plural "' + buffer[el].words[1] + '"' );
					output.push( 'msgstr[0] ""' );
					output.push( 'msgstr[1] ""\n' );
					break;
			}
		}
	}
	return output;
}

function removeDot( noDot ) {
	return noDot.replace(/^\s*['|"']|['|"']\s*$/g, '').replace(/\\\'/g, '\'').replace('/(?<!\\)"/g','\\\"');
}

function gulpWPpot(opt) {


	if ( ! opt.domain ) {
		this.emit('error', new PluginError('gulp-wp-pot', 'destFile needed !'));
	}

	if ( ! opt.destFile ) {
		opt.destFile = opt.domain + '.pot';
	}
	if ( ! opt.package ) {
		opt.package = opt.domain;
	}

	var buffer   = [];
	var destFile = opt.destFile;
	var destDir  = path.dirname(destFile);
	var firstFile;

	// creating a stream through which each file will pass
	var stream = through.obj(function(file, enc, cb) {
	  	if (file.isStream()) {
	  		this.emit('error', new PluginError('gulp-wp-pot', 'Streams are not supported!'));
	  		return cb();
	  	}

	  	if(!firstFile) {
			firstFile  = file;
		}

		if (file.isBuffer()) {
			buffer.push( findTrans(file, opt.domain ) );
		}

		cb();
	}, function( cb ) {

		//Headers
		var year = new Date().getFullYear();
		var contents = '# Copyright (C) ' + year + ' ' + opt.package + '\n';
		contents += '# This file is distributed under the same license as the ' + opt.package + ' package.\n';
		contents += 'msgid ""\n';
		contents += 'msgstr ""\n';
		contents += '"Project-Id-Version: ' + opt.package + '\\n"\n';
		if ( opt.bugReport ) {
			contents += '"Report-Msgid-Bugs-To: ' + opt.bugReport + '\\n"\n';
		}
		contents += '"MIME-Version: 1.0\\n"\n';
		contents += '"Content-Type: text/plain; charset=UTF-8\\n"\n';
		contents += '"Content-Transfer-Encoding: 8bit\\n"\n';
		contents += '"PO-Revision-Date: ' + year + '-MO-DA HO:MI+ZONE\\n"\n';
		contents += '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"\n';
		if ( opt.lastTranslator ) {
			contents += '"Last-Translator: ' + opt.lastTranslator + '\\n"\n';
		}
		if ( opt.team ) {
			contents += '"Language-Team: ' + opt.team + '\\n"\n\n';
		}

		//Contents
		buffer = transToPot(buffer);
		contents += buffer.join('\n');

		var concatenatedFile = new gutil.File({
			base: firstFile.base,
			cwd: firstFile.cwd,
			path: path.join(firstFile.base, destFile),
			contents: new Buffer(contents)
		});
		this.push(concatenatedFile);
		cb();
	} );

  return stream;
};

module.exports = gulpWPpot;
