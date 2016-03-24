/*
	Gulpfile to build Intercom.
*/

'use strict';

const gulp = require('gulp'),
	 vuecc = require('gulp-vuecc'),
	   tsc = require('gulp-typescript'),
	   zip = require('gulp-vinyl-zip'),
	insert = require('gulp-insert'),
  electron = require('gulp-atom-electron'),
	 clean = require('gulp-rimraf');

let header = [
	'/*', '\tIntercom.', '\tP2P chat application.', 
	'\tCopyright 2016 Sam Saint-Pettersen.',
	'\tReleased under the MIT/X11 License.', '*/'
];

let _import = [
	"\n\n'use strict';\n", 
	"const storage = require('electron-json-storage');\n\n"
];

gulp.task('vuecc', function() {
	return gulp.src('intercom.vue.ts', {read: false})
	.pipe(vuecc({
		header: true,
		verbose: false,
		inputExt: '.vue.ts',
		ouputExt: '.ts'
	}));
});

gulp.task('tsc', ['vuecc'], function() {
	return gulp.src('intercom.ts')
	.pipe(tsc({
		target: 'ES6',
		isolatedModules: true,
		removeComments: true
	}))
	.pipe(insert.prepend(_import.join('\n')))
	.pipe(insert.prepend(header.join('\n')))
	.pipe(gulp.dest('js'));
});

gulp.task('clean-build', ['tsc'], function() {
	return gulp.src(['intercom.ts', 'intercom.js'], {read: false})
	.pipe(clean());
});

gulp.task('dist-css', function() {
	return gulp.src([
		'node_modules/bootstrap/dist/css/bootstrap.css'
	])
	.pipe(gulp.dest('css/dist'));
});

gulp.task('dist-js', function() {
	return gulp.src([
		'node_modules/bootstrap/dist/js/bootstrap.min.js',
		'node_modules/bootbox/bootbox.min.js',
		'node_modules/vue/dist/vue.js'
	])
	.pipe(gulp.dest('js/dist'));
});

gulp.task('dist-win', function() {
	return gulp.src('css/**')
	.pipe(electron({
		version: '0.36.10', 
		platform: 'win32'
	}))
	.pipe(gulp.dest('app'));
});

gulp.task('clean', function() {
	return gulp.src(['css/dist','js/dist'], {read: false})
	.pipe(clean());
});

gulp.task('default', ['clean-build'], function(){});
gulp.task('dist', ['dist-css','dist-js'], function(){});
