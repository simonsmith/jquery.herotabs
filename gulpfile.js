const gulp = require('gulp');
const uglify = require('gulp-uglify');
const webpack = require('gulp-webpack');
const rename = require('gulp-rename');
const header = require('gulp-header');

const pkg = require('./package.json');
const banner = [
  '/*!',
  ' * <%= pkg.name %>',
  ' * version <%= pkg.version %>',
  ' * Requires jQuery 1.9.0 or higher',
  ' * <%= pkg.repository.url %>',
  ' * @blinkdesign',
  ' */\n'
].join('\n');

gulp.task('default', () => {
  return gulp.src('src/index.js')
    .pipe(webpack({
      output: {
        libraryTarget: 'umd'
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel'
          }
        ]
      },
      externals: {
        'jquery': {
          commonjs: 'jquery',
          commonjs2: 'jquery',
          amd: 'jquery',
          root: 'jQuery'
        }
      }
    }))
    .pipe(rename('jquery.herotabs.js'))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(header(banner, {pkg: pkg}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch('src/*.js', ['default']);
});
