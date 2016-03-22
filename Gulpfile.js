/*
	Gulpfile to build intercom.
*/

'use strict';

const gulp = require('gulp'),
	 vuecc = require('gulp-vuecc'),
	 clean = require('gulp-rimraf');

gulp.task('vue', function() {
	return gulp.src('*.vue.js', {read: false})
	.pipe(vuecc({
		header: false,
		verbose: false,
		inputExt: '.vue.js',
		ouputExt: '.js'
	}));
});

gulp.task('dist-css', function() {
	gulp.src([
		'node_modules/bootstrap/dist/css/bootstrap.css'
	])
	.pipe(gulp.dest('css/dist'));
});

gulp.task('dist-js', function() {
	gulp.src([
		'node_modules/bootstrap/dist/js/bootstrap.min.js',
		'node_modules/bootbox/bootbox.min.js',
		'node_modules/vue/dist/vue.js'
	])
	.pipe(gulp.dest('js/dist'));
});

gulp.task('clean', function() {
	return gulp.src(['css/dist','js/dist'], {read: false})
	.pipe(clean());
});

gulp.task('default', ['vue'], function(){});
gulp.task('dist', ['dist-css','dist-js'], function(){});
