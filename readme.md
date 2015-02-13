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



## Install

```
$ npm install --save-dev gulp-wp-pot
```


## Exemple usage with [Gulp](http://github.com/gulpjs/gulp)

```js
var gulp = require('gulp');
var wpPot = require('gulp-wp-pot');

gulp.task('default', function () {
	return gulp.src('src/file.php')
		.pipe(wpPot( {
			domain: 'domain',
			destFile:'file.pot',
			package: 'package_name',
			bugReport: 'http://example.com',
			lastTranslator: 'First Last <mail@example.com>',
			team: 'Team <mail@example.com>'
		} ))
		.pipe(gulp.dest('dist'));
});
```


## wpPot({options})

- `domain`

	Type: `string`  

	Domain to retrieve the translated text.

- `destFile` (optional)

	Type: `string`  
	Default: domain.pot

	Filename


- `package` (optional)

	Type: `string`  
	Default: same as domain

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
