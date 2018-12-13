var syntax = 'sass'; // Syntax: sass or scss;

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	jade = require('gulp-jade'),
	sass = require('gulp-sass'),
	browsersync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleancss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	notify = require("gulp-notify"),
	rsync = require('gulp-rsync');

gulp.task('browser-sync', function () {
	browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('jade', function () {
	return gulp.src('app/jade/*.jade')
		.pipe(jade({
			pretty: true
		}).on("error", notify.onError()))
		.pipe(gulp.dest('app'))
		.pipe(browsersync.reload({
			stream: true
		}));
});

gulp.task('styles', function () {
	return gulp.src('app/' + syntax + '/**/*.' + syntax + '')
		.pipe(sass({
			outputStyle: 'expand'
		}).on("error", notify.onError()))
		.pipe(rename({
			suffix: '.min',
			prefix: ''
		}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleancss({
			level: {
				1: {
					specialComments: 0
				}
			}
		})) // Opt., comment out when debugging
		.pipe(gulp.dest('app/css'))
		.pipe(browsersync.reload({
			stream: true
		}))
});

gulp.task('js', function () {
	return gulp.src([
			'app/libs/jquery/dist/jquery.min.js',
		])
		.pipe(concat('scripts.min.js'))
		.pipe(uglify()) // Mifify js (opt.)
		.pipe(gulp.dest('app/js'))
		.pipe(browsersync.reload({
			stream: true
		}))
});

gulp.task('rsync', function () {
	return gulp.src(["app/**/*", "!app/libs/**/*"])
		.pipe(rsync({
			root: 'app/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
});

gulp.task('watch', function () {
	gulp.watch('app/' + syntax + '/**/*.' + syntax + '', gulp.parallel('styles'));
	gulp.watch('app/js/*.js', browsersync.reload);
	gulp.watch('app/jade/**/*.jade', gulp.parallel('jade'));
	//gulp.watch('app/*.html', browsersync.reload)
});

gulp.task('default', gulp.parallel('watch', 'jade', 'styles', 'js', 'browser-sync'));