# gulp-wp-pot

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

- `context`

	Type: `string`  

	String context to find

- `destFile` (optional)

	Type: `string`  
	Default: context.pot

	Filename


- `package` (optional)

	Type: `string`  
	Default: same as context

	Package name

- `bugReport` (optional)

	Type: `URL`  

	URL translatation support

- `lastTranslator` (optional)

	Type: `string`  

	Name and email address of the last translator (ex: `Willy Bahuaud <me@example.com>`)

- `team` (optional)

	Type: `string`  

	Name and email address of the translation team (ex: `Team <team@example.com>`)

## License

MIT © [Willy Bahuaud](https://github.com/willybahuaud)
