var gulp =       require('gulp');
var uglify =     require('gulp-uglify');
var jshint =     require('gulp-jshint');
var webpack =    require('gulp-webpack');
var rename =     require('gulp-rename');
var header =     require('gulp-header');
                 require('gulp-grunt')(gulp);

var pkg = require('./package.json');
var banner = [
  '/*!',
  ' * <%= pkg.name %>',
  ' * version <%= pkg.version %>',
  ' * Requires jQuery 1.7.0 or higher',
  ' * <%= pkg.repository.url %>',
  ' * @blinkdesign',
  ' */\n'
].join('\n');

gulp.task('default', function() {
  return gulp.src('src/main.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(webpack({
      output: {
        libraryTarget: 'umd'
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

gulp.task('watch', function() {
  gulp.watch('src/main.js', function() {
    gulp.run('default');
  });
});

gulp.task('test', function() {
  gulp.run('grunt-jasmine');
});
