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
	  asar = require('asar'),
	    fs = require('fs'),
	startt = require('startt'),
     _exec = require('child_process').exec;

const ELECTRON = 'v0.36.12';
const platforms = [
	'win32-x64',
	'linux-x64'
];

let header = [
	'/*', '\tIntercom.', '\tP2P chat application.', 
	'\tCopyright 2016 Sam Saint-Pettersen.',
	'\tReleased under the MIT/X11 License.', '*/'
];

let _import = [
	"\n\n'use strict';\n", 
	"const storage = require('electron-json-storage');\n\n"
];

gulp.task('mkdirs', function() {
	if(!fs.existsSync('src')) {
		fs.mkdirSync('src');
	}
	if(!fs.existsSync('release')) {
		fs.mkdirSync('release');
	}
});

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
	return gulp.src([
		'main.js','index.html','package.json',
		'css/**/**/*','js/**/**/*'
	], {base: '.'})
	.pipe(gulp.dest('src'));
});

gulp.task('deps', ['bundle-src'], function() {
	console.log('Installing production dependencies via npm.');
	platforms.map(function(platform) {
		let d = `cd release/${ELECTRON}/${platform}/resources/app`;
		d += ' && npm install --production';
		_exec(d);
	});
});

gulp.task('electron', ['mkdirs'], function() {
	return electron({
		srcPath: './src',
		releasePath: './release',
		cachePath: './cache',
		version: `${ELECTRON}`,
		rebuild: false,
		platforms: platforms
	});
});

gulp.task('app', ['electron'], function() {
	platforms.map(function(platform) {
		gulp.src('license.txt')
		.pipe(gulp.dest(`release/${ELECTRON}/${platform}`));
	});
});

gulp.task('pkg', function() {
	platforms.map(function(platform) {
		asar.createPackage(`release/${ELECTRON}/${platform}/resources/app`,
		`release/${ELECTRON}/${platform}/resources/app.asar`, function() {
			console.log(`app.asar built for ${platform}.`);
		});
	});
});

gulp.task('nsis', function() {
	console.log('Building NSIS setup executable.');
	startt('makensis intercom.nsi');
});

gulp.task('clean', function() {
	return gulp.src(['css/dist','js/dist','src','release',
	'*.zip','*.7z'], {read: false})
	.pipe(clean());
});

gulp.task('default', ['clean-build'], function(){});
gulp.task('dist', ['dist-css','dist-js'], function(){});
