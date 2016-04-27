# gulp-wp-pot

## Information

[![npm version](https://badge.fury.io/js/gulp-wp-pot.svg)](https://www.npmjs.com/package/gulp-wp-pot) [![Build Status](https://travis-ci.org/rasmusbe/gulp-wp-pot.svg?branch=master)](https://travis-ci.org/rasmusbe/gulp-wp-pot) [![Dependency Status](https://www.versioneye.com/user/projects/55c46add6537620020002f3c/badge.svg?style=flat)](https://www.versioneye.com/user/projects/55c46add6537620020002f3c) [![Code Climate](https://codeclimate.com/github/rasmusbe/gulp-wp-pot/badges/gpa.svg)](https://codeclimate.com/github/rasmusbe/gulp-wp-pot)

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
<td>>= 0.10</td>
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

- `domain`

    Type: `string`  

    Domain to retrieve the translated text. All textdomains is included if missing.

- `destFile`

    Type: `string`  
    Default: *domain.pot* or translations.pot if domain is missing

    Filename for template file


- `package`

    Type: `string`  
    Default: *domain* or *unnamed project* if domain is missing

    Package name

- `bugReport`

    Type: `URL`  

    URL translatation support

- `lastTranslator`

    Type: `string`  

    Name and email address of the last translator (ex: `John Doe <me@example.com>`)

- `team`

    Type: `string`  

    Name and email address of the translation team (ex: `Team <team@example.com>`)

- `headers`

    Type: `object|bool`  
    Default: Headers used by Poedit

    Object containing extra POT-file headers. Set to false to not generate the default extra headers for Poedit.


## License

MIT © [Rasmus Bengtsson](https://github.com/rasmusbe) | Initial work by [Willy Bahuaud](https://github.com/willybahuaud)
