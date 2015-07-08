# gulp-wp-pot

##Information

<table>
<tr> 
<td>Package</td><td>gulp-wp-pot</td>
</tr>
<tr>
<td>Description</td>
<td>Generate pot files for WordPress plugins and themes.</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.8</td>
</tr>
</table>

The package gulp-sort is recommended to prevent unnecessary changes in pot-file

## Install

```
$ npm install --save-dev gulp-sort gulp-wp-pot
```


## Example usage with [Gulp](http://github.com/gulpjs/gulp)

```js
var gulp = require('gulp');
var wpPot = require('gulp-wp-pot');
var sort = require('gulp-sort');

gulp.task('default', function () {
	return gulp.src('src/*.php')
		.pipe(sort())
		.pipe(wpPot( {
			domain: 'domain',
			destFile:'file.pot',
			package: 'package_name',
			bugReport: 'http://example.com',
			lastTranslator: 'John Doe <mail@example.com>',
			team: 'Team Team <mail@example.com>'
		} ))
		.pipe(gulp.dest('dist'));
});
```


## wpPot({options})

- `domain` (optional, required if destFile is missing)

	Type: `string`  

	Domain to retrieve the translated text. All textdomains is included if missing.

- `destFile` (optional, required if domain is missing)

	Type: `string`  
	Default: domain.pot

	Filename for template file


- `package` (optional, required if domain is missing)

	Type: `string`  
	Default: same as domain

	Package name

- `bugReport` (optional)

	Type: `URL`  

	URL translatation support

- `lastTranslator` (optional)

	Type: `string`  

	Name and email address of the last translator (ex: `John Doe <me@example.com>`)

- `team` (optional)

	Type: `string`  

	Name and email address of the translation team (ex: `Team <team@example.com>`)

## License

MIT © [Rasmus Bengtsson](https://github.com/rasmus) | Initial work by [Willy Bahuaud](https://github.com/willybahuaud)
