/*
	Gulpfile to build Intercom.
*/

'use strict';

const gulp = require('gulp'),
	 vuecc = require('gulp-vuecc'),
	   tsc = require('gulp-typescript'),
	   zip = require('gulp-zip'),
	insert = require('gulp-insert'),
	rename = require('gulp-rename'),
  electron = require('gulp-atom'),
	 clean = require('gulp-rimraf'),
     _exec = require('child_process').exec;

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
	return gulp.src(['intercom.ts','intercom.js'], {read: false})
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

gulp.task('bundle-src', ['dist-css','dist-js'], function() {
	return gulp.src(['main.js','index.html','package.json',
	'css/**/**/*','js/**/**/*'], {base: '.'})
	.pipe(gulp.dest('src'));
});

gulp.task('bundle-app', ['bundle-src'], function() {
	return electron({
		srcPath: './src',
		releasePath: './release',
		cachePath: './cache',
		version: 'v0.36.10',
		rebuild: false,
		platforms: ['win32-ia32']
	});
});

gulp.task('sign-app', ['bundle-app'], function() {
	// TODO
});

gulp.task('app', ['sign-app'], function() {
	return gulp.src('release/**/*')
	.pipe(zip('intercom.zip'))
	.pipe(gulp.dest('.'));
});

gulp.task('nsis', ['app'], function() {
	_exec('makensis intercom.nsis');
	// TODO in NSIS script: npm install --production
});

gulp.task('clean', function() {
	return gulp.src(['css/dist','js/dist','src','release'], {read: false})
	.pipe(clean());
});

gulp.task('default', ['clean-build'], function(){});
gulp.task('dist', ['dist-css','dist-js'], function(){});
