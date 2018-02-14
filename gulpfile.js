const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const rsync = require('gulp-rsync');
const sequence = require('run-sequence');
const zip = require('gulp-zip');
const pages = require('gulp-gh-pages');
const browserSync = require('browser-sync').create();

gulp.task('prepare', () => {

	const shower = gulp.src([
		'**',
		'!docs{,/**}',
		'!node_modules{,/**}',
		'!prepared{,/**}',
		'!CONTRIBUTING.md',
		'!LICENSE.md',
		'!README.md',
		'!gulpfile.js',
		'!package.json',
		'!package-lock.json'
	])
		.pipe(replace(
			/(<link rel="stylesheet" href=")(node_modules\/tinkoff-shower)([^\/]*)\/(.*\.css">)/g,
			'$1shower/themes/tinkoff$3/$4', {skipBinary: true}
		))
		.pipe(replace(
			/(<link rel="stylesheet" href=")(node_modules\/shower-)([^\/]*)\/(.*\.css">)/g,
			'$1shower/themes/$3/$4', {skipBinary: true}
		))
		.pipe(replace(
			/(<script src=")(node_modules\/shower-core\/)(shower.min.js"><\/script>)/g,
			'$1shower/$3', {skipBinary: true}
		))
		.pipe(replace(
			/(<script src=")(node_modules\/rxjs\/bundles\/)(Rx.min.js"><\/script>)/g,
			'$1dist/$3', {skipBinary: true}
		));


	const core = gulp.src([
		'shower.min.js'
	], {
		cwd: 'node_modules/shower-core'
	})
		.pipe(rename((path) => {
			path.dirname = 'shower/' + path.dirname;
		}));

	const rx = gulp.src([
		'Rx.min.js'
	], {
		cwd: 'node_modules/rxjs/bundles'
	})
		.pipe(rename((path) => {
			path.dirname = 'dist/' + path.dirname;
		}));

	const material = gulp.src([
		'**', '!package.json'
	], {
		cwd: 'node_modules/shower-material'
	})
		.pipe(rename((path) => {
			path.dirname = 'shower/themes/material/' + path.dirname;
		}))

	const ribbon = gulp.src([
		'**', '!package.json'
	], {
		cwd: 'node_modules/shower-ribbon'
	})
		.pipe(rename((path) => {
			path.dirname = 'shower/themes/ribbon/' + path.dirname;
		}));

	const tinkoff = gulp.src([
		'**', '!package.json'
	], {
		cwd: 'node_modules/tinkoff-shower'
	})
		.pipe(rename((path) => {
			path.dirname = 'shower/themes/tinkoff/' + path.dirname;
		}));

	const themes = merge(tinkoff)
		.pipe(replace(
			/(<script src=")(\/shower-core\/)(shower.min.js"><\/script>)/,
			'$1../../$3', {skipBinary: true}
		));

	return merge(shower, rx, core, themes)
		.pipe(gulp.dest('prepared'));

});

gulp.task('zip', () => {
	return gulp.src('prepared/**')
		.pipe(zip('archive.zip'))
		.pipe(gulp.dest('.'));
});

gulp.task('upload', () => {
	return gulp.src('prepared/**')
		.pipe(pages())
});

gulp.task('archive', (callback) => {
	sequence(
		'prepare',
		'zip',
		'clean', callback
	)
});

gulp.task('publish', (callback) => {
	sequence(
		'prepare',
		'upload',
		'clean', callback
	)
});

gulp.task('clean', () => {
	return del('prepared/**');
});

gulp.task('serve', () => {
	browserSync.init({
		ui: false,
		notify: false,
		port: 3000,
		server: {
			baseDir: '.'
		}
	});
	gulp.watch('index.html').on('change', () => {
		browserSync.reload();
	});
});

gulp.task('default', ['serve']);
