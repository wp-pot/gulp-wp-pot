# gulp-wp-pot [![Build Status](https://travis-ci.org/willybahuaud/gulp-wp-pot.svg?branch=master)](https://travis-ci.org/willybahuaud/gulp-wp-pot)

> My Fancy gulp plugin


## Install

```
$ npm install --save-dev gulp-wp-pot
```


## Usage

```js
var gulp = require('gulp');
var wpPot = require('gulp-wp-pot');

gulp.task('default', function () {
	return gulp.src('src/file.php')
		.pipe(wpPot( {
			context: 'context',
			destFile:'file.pot',
			package: 'package_name',
			bugReport: 'http://example.com',
			lastTranslator: 'First Last <mail@example.com>',
			team: 'Team <mail@example.com>'
		} ))
		.pipe(gulp.dest('dist'));
});
```


## API

### wpPot({options})

#### context

Type: `string`  

String context to find

#### destFile (optional)

Type: `string`  
Default: `context`.pot

Filename


#### package (optional)

Type: `string`  
Default: `context`.pot

Package name

#### bugReport

#### lastTranslator

#### team

## License

MIT © [Willy Bahuaud](https://github.com/willybahuaud)
