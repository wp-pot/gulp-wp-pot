# gulp-wp-pot [![Build Status](https://travis-ci.org/willybahuaud/gulp-wp-pot.svg?branch=master)](https://travis-ci.org/willybahuaud/gulp-wp-pot)

> My Fancy gulp plugin


## Install

```
$ npm install --save-dev gulp-wp-pot
```


## Usage

```js
var gulp = require('gulp');
var WPpot = require('gulp-wp-pot');

gulp.task('default', function () {
	return gulp.src('src/file.php')
		.pipe(WPpot( {
			destFile:'file.pot',
			context: 'context',
			package: 'package_name',
			bugReport: 'http://example.com',
			lastTranslator: 'First Last <mail@example.com>',
			team: 'Team <mail@example.com>'
		} ))
		.pipe(gulp.dest('dist'));
});
```


## API

### WPpot(options)

#### options

##### foo

Type: `boolean`  
Default: `false`

Lorem ipsum.


## License

MIT © [Willy Bahuaud](https://github.com/willybahuaud)
