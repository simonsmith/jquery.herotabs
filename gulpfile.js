var gulp   = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var header = require('gulp-header');

var pkg    = require('./package.json');
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
     gulp.src('src/main.js')
        .pipe(jshint('.jshintrc'))
        .pipe(rename('jquery.herotabs.js'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({suffix: '.herotabs.min'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/main.js', function() {
        gulp.run('default');
    });
});
