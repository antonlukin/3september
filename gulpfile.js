var gulp = require('gulp');
var concat = require('gulp-concat');
var cleanCss = require('gulp-clean-css');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var prefix = require('gulp-autoprefixer');
var flatten = require('gulp-flatten');
var connect = require('gulp-connect');


gulp.task('styles', function (done) {
  gulp.src(['./assets/styles/app.scss'])
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(prefix())
    .pipe(concat('styles.min.css'))
    .pipe(cleanCss({
      compatibility: 'ie9'
    }))
    .pipe(gulp.dest('./public/'))

  done();
})


gulp.task('scripts', function (done) {
  gulp.src(['./assets/scripts/*.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest('./public/'))

  done();
})


gulp.task('watch', function (done) {
  gulp.watch('./assets/**/*', gulp.series('styles', 'scripts'));

  done();
})


gulp.task('connect', function (done) {
  connect.server({
    root: './public'
  });

  done();
})


gulp.task('default', gulp.parallel('connect', 'styles', 'scripts', 'watch'));
