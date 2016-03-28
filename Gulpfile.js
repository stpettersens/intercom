/*
	Gulpfile to build Intercom.
*/

'use strict';

const gulp = require('gulp'),
      data = require('gulp-data'),
	 vuecc = require('gulp-vuecc'),
	   tsc = require('gulp-typescript'),
	   zip = require('gulp-zip'),
  sequence = require('gulp-sequence'),
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
	'win32-ia32',
	'win32-x64',
	'linux-x64'
];

let metadata = {};

let header = [
	'/*', '\tIntercom.', '\tP2P chat application.', 
	'\tCopyright 2016 Sam Saint-Pettersen.',
	'\tReleased under the MIT/X11 License.', '*/'
];

let _import = [
	"\n\n'use strict';\n", 
	"const storage = require('electron-json-storage');",
	"const fs = require('fs');\n\n"
];

gulp.task('metadata', function() {
	return gulp.src('package.json')
	.pipe(data(function(pkg) {
		let p = JSON.parse(pkg.contents.toString());
		metadata = {
			name: p.name,
			author: p.author,
			version: p.version,
			description: p.description
		};
	}));
});

gulp.task('mkdirs', function() {
	if(!fs.existsSync('src')) {
		fs.mkdirSync('src');
	}
	if(!fs.existsSync('release')) {
		fs.mkdirSync('release');
	}
	if(!fs.existsSync('dist')) {
		fs.mkdirSync('dist');
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
		if(/linux|darwin/.test(platform)) {
			gulp.src('fonts/install_font.sh')
			.pipe(gulp.dest(`release/${ELECTRON}/${platform}`));
		}
		else {
			gulp.src('fonts/install_font.cmd')
			.pipe(gulp.dest(`release/${ELECTRON}/${platform}`));
		}
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

gulp.task('zip', ['mkdirs'], function() {
	platforms.map(function(platform) {
		gulp.src(`release/${ELECTRON}/${platform}/*`)
		.pipe(zip(`intercom_${platform}.zip`))
		.pipe(gulp.dest('dist'));
	});
});

gulp.task('deb', ['metadata','mkdirs'], function() {
	console.log('Building Debian package.');
	let deb = {
		Package: metadata.name,
		Version: `${metadata.version.substr(0, 3)}-1`,
		Section: 'base',
		Priority: 'optional',
		Architecture: 'i386',
		Maintainer: metadata.author,
		Description: metadata.description
	};
	let _opath = `../release/${ELECTRON}`;
	let _ipath = 'opt/intercom';
	let target = platforms.filter(function(platform) {
		if(!platform.indexOf('linux')) return platform;
	});
	let ctrl = [];
	let build = [
		'#!/bin/sh',
		`mkdir -p ${deb.Package}_${deb.Version}/${_ipath}`,
		`cp -r -v ${_opath}/${target[0]}/* ${deb.Package}_${deb.Version}/${_ipath}`,
		`dpkg-deb --build ${deb.Package}_${deb.Version}`
	];
	for(let key in deb) {
		ctrl.push(`${key}: ${deb[key]}`);
	}
	ctrl.push('');
	if(!fs.existsSync(`dist/intercom_${deb.Version}`)) {
		fs.mkdir(`dist/intercom_${deb.Version}`);
	}

	if(!fs.existsSync(`dist/intercom_${deb.Version}/DEBIAN`)) {
		fs.mkdir(`dist/intercom_${deb.Version}/DEBIAN`);
	}

	fs.writeFileSync(`dist/intercom_${deb.Version}/DEBIAN/control`, ctrl.join('\n'), 'utf-8');
	fs.writeFileSync('dist/deb-build.sh', build.join('\n'), 'utf-8');
	//_exec('sh dist/deb-build.sh');
});

gulp.task('nsis', function() {
	console.log('Building NSIS setup executable.');
	let winbuilds = platforms.filter(function(platform) {
		if(!platform.indexOf('win')) return platform;
	});
	winbuilds.map(function(lp) {
		let sp = lp.split('-')[1].replace('ia32', 'x86');
		startt(`makensis intercom.nsi /DELECTRON_VERSION=${ELECTRON}`
		+ ` /DLPLATFORM=${lp} /DSPLATFORM=${sp}`);
	});
});

gulp.task('clean', function() {
	return gulp.src(['css/dist','js/dist','src','release','dist',
	'*.zip','*.7z'], {read: false})
	.pipe(clean());
});

gulp.task('default', ['clean-build'], function(){});
gulp.task('setup', ['dist-css','dist-js'], function(){});
gulp.task('build', sequence('app','deps'));
gulp.task('build-all', sequence('default','build'));
