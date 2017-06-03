# gulp-wp-pot

## Information

[![npm version](https://badge.fury.io/js/gulp-wp-pot.svg)](https://www.npmjs.com/package/gulp-wp-pot) [![Build Status](https://travis-ci.org/rasmusbe/gulp-wp-pot.svg?branch=master)](https://travis-ci.org/rasmusbe/gulp-wp-pot) [![Dependency Status](https://www.versioneye.com/user/projects/584abc1adf01d500374be6b6/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/584abc1adf01d500374be6b6) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/?branch=master) [![Code Coverage](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/?branch=master)

| Package     | gulp-wp-pot                                          |
| ----------- | ---------------------------------------------------- |
| Description | Gulp wrapper for [wp-pot](https://github.com/rasmusbe/wp-pot). Generates pot files for WordPress plugins and themes. |


## Install

```
$ npm install --save-dev gulp-wp-pot
```


## Example usage with [Gulp](http://github.com/gulpjs/gulp)

```js
var gulp = require('gulp');
var wpPot = require('gulp-wp-pot');

gulp.task('default', function () {
    return gulp.src('src/*.php')
        .pipe(wpPot( {
            domain: 'domain',
            package: 'Example project'
        } ))
        .pipe(gulp.dest('file.pot'));
});
```


## wpPot({options})

*All options is optional*

- `bugReport`  
  Description: Header with URL for reporting translation bugs  
  Type: `string`  
  Default: undefined
- `commentKeyword`  
  Description: Keyword to trigger translator comment.  
  Type: `string`  
  Default: `translators:`
- `domain`  
  Description: Domain to retrieve the translated text. All textdomains is included if undefined.  
  Type: `string`   
  Default: undefined
- `headers`  
  Description: Object containing extra POT-file headers. Set to false to not generate the default extra headers for Poedit.  
  Type: `object|bool`  
  Default: Headers used by Poedit
- `gettextFunctions`  
  Description: Gettext functions used for finding translations.  
  Type: `object`  
  Default: WordPress translation functions
- `lastTranslator`  
  Description: Name and email address of the last translator (ex: `John Doe <me@example.com>`)  
  Type: `string`    
  Default: undefined
- `metadataFile`  
  Description: Path to file containing plugin/theme metadata header relative to `relativeTo`  
  Type: `string`  
- `package`  
  Description: Package name  
  Type: `string`  
  Default: `domain` or `unnamed project` if domain is undefined
- `relativeTo`  
  Description: Path to folder that file comments should be relative to  
  Type: `string`  
  Default: Current working directory
- `team`  
  Description: Name and email address of the translation team (ex: `Team <team@example.com> `)  
  Type: `string`    
  Default: undefined

## Related
- [wp-pot](https://github.com/rasmusbe/wp-pot) - API for this module
- [wp-pot-cli](https://github.com/rasmusbe/wp-pot-cli) - Run wp-pot via cli command

## License

MIT © [Rasmus Bengtsson](https://github.com/rasmusbe) | Initial work by [Willy Bahuaud](https://github.com/willybahuaud)
