var gulp	= require('gulp'),
	sass	= require('gulp-sass'),
	gluecss	= require('gulp-concat-css'),
	gluejs  = require('gulp-concat');
	clean	= require('gulp-clean-css'),
	plumber	= require('gulp-plumber'),
	flatten	= require('gulp-flatten'),
	uglify = require('gulp-uglify'),
	autoprefix = require('gulp-autoprefixer');

var path ={
	source:		'../source',
	assets:		'../public/assets',
};

gulp.task('scss', function() {
    gulp.src([path.source + '/scss/app.scss'])
        .pipe(plumber())
        .pipe(sass({
			errLogToConsole: true,
			outputStyle: 'compressed'
		}))
		.pipe(autoprefix({
			browsers: ['last 2 versions', 'ie 9']
		}))
        .pipe(gluecss('style.min.css'))
 		.pipe(clean({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(path.assets + '/'));
});

gulp.task('js', function() {
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
        .pipe(gluejs('script.min.js'))
        .pipe(gulp.dest(path.assets + '/'));
});

gulp.task('images', function() {
    gulp.src([path.source + '/images/**/*'])
		.pipe(flatten())
        .pipe(gulp.dest(path.assets + '/images/'));
});

gulp.task('watch', function() {
	gulp.watch(path.source + '/**/*', ['scss', 'js']);
});

gulp.task('default', ['scss', 'js', 'watch', 'images']);
