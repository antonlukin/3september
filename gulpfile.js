var gulp      = require('gulp');
var sass      = require('gulp-sass');
var concat    = require('gulp-concat');
var cleanCss  = require('gulp-clean-css');
var uglify    = require('gulp-uglify');
var plumber   = require('gulp-plumber');
var prefix    = require('gulp-autoprefixer');

var path = {
  source: 'src/',
  assets: 'app/assets/'
}

gulp.task('styles', function() {
  gulp.src([path.source + '/scss/app.scss'])
    .pipe(plumber())
    .pipe(sass({errLogToConsole: true}))
    .pipe(prefix({browsers: ['ie >= 10', 'ff >= 30', 'chrome >= 34', 'safari >= 7', 'opera >= 23', 'ios >= 7', 'android >= 4.4']}))
    .pipe(concat('styles.min.css'))
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest(path.assets))
})

gulp.task('scripts', function() {
  gulp.src([
      path.source + '/js/modernizr.custom.js',
      path.source + '/js/jquery.min.js',
      path.source + '/js/jquery.youtubebackground.js',
      path.source + '/js/jquery.bookblock.min.js',
      path.source + '/js/custom.js',
      path.source + '/js/flip.js'
    ])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(path.assets))
})

gulp.task('images', function() {
  gulp.src([path.source + '/images/**/*'])
    .pipe(gulp.dest(path.assets + '/images/'));
})

gulp.task('watch', function() {
  gulp.watch(path.source + '/**/*', ['styles', 'scripts']);
})

gulp.task('default', ['styles', 'scripts', 'images', 'watch']);
