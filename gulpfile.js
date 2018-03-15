'use strict'

const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const fileinclude = require('gulp-file-include');
const combine = require('stream-combiner2');
const browserSync = require('browser-sync').create();
const rimraf = require('rimraf');

const ENV = {
	dev: $.environments.development,
	prod: $.environments.production
}

gulp.task('html', () => {
	let combined = combine.obj([
		gulp.src('./dev/*.html'),
		gulp.dest('./public/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('styles', () => {
	let combined = combine.obj([
		gulp.src('./dev/css/style.less'),
		ENV.dev($.sourcemaps.init()),
		$.less(),
		$.autoprefixer({ cascade: false }),
		$.csscomb(),
		$.cssnano(),
		ENV.dev($.sourcemaps.write()),
		gulp.dest('./public/css/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('libs', () => {
	let combined = combine.obj([
		gulp.src('./dev/js/libs.js'),
		fileinclude('@@'),
		$.uglify(),
		gulp.dest('./public/js/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('scripts', () => {
	let combined = combine.obj([
		gulp.src(['./dev/js/**/*.js', '!./dev/js/libs.js']),
		ENV.dev($.sourcemaps.init()),
		$.babel({
			presets: ['env'],
			plugins: ['transform-object-rest-spread']
		}),
		$.uglify(),
		ENV.dev($.sourcemaps.write()),
		gulp.dest('./public/js/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('img', () => {
	let combined = combine.obj([
		gulp.src('./dev/img/**/*.*'),
		$.imagemin(),
		gulp.dest('./public/img/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('pictures', () => {
	let combined = combine.obj([
		gulp.src('./dev/pictures/**/*.*'),
		$.imagemin(),
		gulp.dest('./public/pictures/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('icons', function () {
	return gulp
		.src('dev/icons/**/*.svg')
		.pipe($.svgmin(function (file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));
			
			return {
				plugins: [{
					cleanupIDs: {
					prefix: 'icon-' + prefix,
					minify: true
				}
			}]
		}
	}))
	.pipe($.cheerio({
		run: function ($, file) {
			$('style').remove();
		},
		parserOptions: { xmlMode: true }
	}))
	.pipe($.svgstore())
	.pipe(gulp.dest('public/img'));
});

gulp.task('fonts', () => {
	let combined = combine.obj([
		gulp.src('./dev/fonts/*.*'),
		gulp.dest('./public/fonts/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('video', () => {
	let combined = combine.obj([
		gulp.src('./dev/video/**/*.*'),
		gulp.dest('./public/video/')
	]);

	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('clean', (cb) => {
	rimraf('./public', cb);
});

gulp.task('build', [
	'html',
	'styles',
	'libs',
	'scripts',
	'img',
	'pictures',
	'icons',
	'fonts',
	'video'
]);

gulp.task('watch', () => {
	$.watch(['dev/**/*.html'], () => {
		gulp.start('html');
		browserSync.reload();
	});

	$.watch(['dev/css/**/*.*'], function() {
		gulp.start('styles');
		browserSync.reload();
	});

	$.watch(['dev/js/vendor/*.*', 'dev/js/libs.js'], function() {
		gulp.start('libs');
		browserSync.reload();
	});

	$.watch(['dev/js/**/*.js', '!dev/js/libs.js'], function() {
		gulp.start('scripts');
		browserSync.reload();
	});

	$.watch(['dev/img/**/*.*'], function() {
		gulp.start('img');
		browserSync.reload();
	});

	$.watch(['dev/pictures/**/*.*'], function() {
		gulp.start('pictures');
		browserSync.reload();
	});

	$.watch(['dev/icons/**/*.*'], function() {
		gulp.start('icons');
		browserSync.reload();
	});

	$.watch(['dev/fonts/**/*.*'], function() {
		gulp.start('fonts');
		browserSync.reload();
	});

	$.watch(['dev/video/**/*.*'], function() {
		gulp.start('video');
		browserSync.reload();
	});
});

gulp.task('server', () => {
	browserSync.init({
		server: { baseDir: "./public/" },
		port: 9000
	});
});

gulp.task('default', ['build', 'server', 'watch']);