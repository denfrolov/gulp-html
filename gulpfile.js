var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	browsersync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleancss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	notify = require("gulp-notify");

gulp.task('browser-sync', function () {
	browsersync({
		server: {
			baseDir: '.'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('code', function() {
	return gulp.src('*.html')
		.pipe(browsersync.reload({
			stream: true
		}))
});

gulp.task('styles', function () {
	return gulp.src('css/main.scss')
		.pipe(sass({
			outputStyle: 'expand'
		}).on("error", notify.onError()))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleancss({
			level: {
				1: {
					specialComments: 0
				}
			}
		})) // Opt., comment out when debugging
		.pipe(gulp.dest('css'))
		.pipe(browsersync.reload({
			stream: true
		}))
});

gulp.task('libs-styles', function () {
	return gulp.src([
		'libs/bootstrap/dist/css/bootstrap.min.css'
	])
		.pipe(concat('libs.min.css'))
		.pipe(cleancss({
			level: {
				1: {
					specialComments: 0
				}
			}
		})) // Opt., comment out when debugging
		.pipe(gulp.dest('libs'))
});

gulp.task('js', function () {
	return gulp.src([
		'libs/jquery/dist/jquery.min.js'
	])
		.pipe(concat('scripts.min.js'))
		.pipe(uglify()) // Mifify js (opt.)
		.pipe(gulp.dest('libs'))
		.pipe(browsersync.reload({
			stream: true
		}))
});

gulp.task('watch', function () {
	gulp.watch('css/*.scss', gulp.parallel('styles'));
	gulp.watch('js/common.js', gulp.parallel('code'));
	gulp.watch('*.html', gulp.parallel('code'))
});

gulp.task('default', gulp.series('libs-styles', 'styles', 'js', gulp.parallel('browser-sync', 'watch')));