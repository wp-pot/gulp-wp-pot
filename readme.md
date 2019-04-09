# gulp-wp-pot

## Information

[![npm version](https://badge.fury.io/js/gulp-wp-pot.svg)](https://www.npmjs.com/package/gulp-wp-pot) [![CircleCI](https://circleci.com/gh/rasmusbe/gulp-wp-pot.svg?style=svg)](https://circleci.com/gh/rasmusbe/gulp-wp-pot) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/?branch=master) [![Code Coverage](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/rasmusbe/gulp-wp-pot/?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/rasmusbe/gulp-wp-pot.svg)](https://greenkeeper.io/)

| Package     | gulp-wp-pot                                          |
| ----------- | ---------------------------------------------------- |
| Description | Gulp wrapper for [wp-pot](https://github.com/rasmusbe/wp-pot). Generates pot files for WordPress plugins and themes. |

## Like my work and want to say thanks?
Do it here:  
<a href="https://www.buymeacoffee.com/rasmus" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

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
See available options in the wp-pot readme, https://github.com/rasmusbe/wp-pot#options  
All options except src and writeFile is passed to wp-pot.

## Related
- [wp-pot](https://github.com/rasmusbe/wp-pot) - API for this module
- [wp-pot-cli](https://github.com/rasmusbe/wp-pot-cli) - Run wp-pot via cli command

## License

MIT © [Rasmus Bengtsson](https://github.com/rasmusbe) | Initial work by [Willy Bahuaud](https://github.com/willybahuaud)
