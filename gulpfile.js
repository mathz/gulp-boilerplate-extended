var level = {
	doNothing: 0,
	copy: 1,
	compress: 2,
	lossyCompress: 3 
}
/**
 * Settings
 * Turn on/off features
 */

var settings = {
	clean: true,
	scripts: true,
	polyfills: true,
	styles: true,
	svgs: level.compress,
	pngs: level.copy,
	jpgs: level.copy,
	gifs: level.copy,
	pngs: true,
	jpgs: true,
	copy: true,
	reload: true,
	nunjucks: true,
	minify: {
		scripts: false,
		styles: false,
		html: false
	},
	stripdebug: false
};

/**
 * Settings
 * Turn on/off build features (settins above are default)
 */

var buildSettings = {
	minify: {
		scripts: true,
		styles: true,
		html: true
	},
	pngs: level.lossyCompress,
	jpgs: level.lossyCompress,
	gifs: level.compress,
	stripdebug: true
}

/**
 * Paths to project folders
 */

var paths = {
	input: 'src/',
	output: 'dist/',
	data : 'src/data/',
	scripts: {
		input: 'src/js/*',
		polyfills: '.polyfill.js',
		output: 'dist/js/'
	},
	styles: {
		input: 'src/sass/**/*.{scss,sass}',
		output: 'dist/css/'
	},
	images: {
		input: 'src/images/**/*',
		output: 'dist/images/'
	},
	svgs: {
		input: 'src/images/**/*+(.svg)',
	},
	jpgs: {
		input: 'src/images/**/*.{jpeg,jpg}',
	},
	gifs: {
		input: 'src/images/**/*+(.gif)',
	},
	pngs: {
		input: 'src/images/**/*+(.png)',
	},
	copy: {
		input: 'src/copy/**/*',
		output: 'dist/'
	},
	nunjucks: {
		input_pages: 'src/pages/**/*+(.njk)',
		input_templates: 'src/templates/',
		output: 'dist/'
	},
	html: {
		input: 'src/html/**/*+(.html)',
		output: 'dist/'
	},
	reload: './dist/'
};

/**
 * Template for banner to add to file headers
 */

var banner = {
	main:
		'/*!' +
		' <%= package.name %> v<%= package.version %>' +
		' | (c) ' + new Date().getFullYear() + ' <%= package.author.name %>' +
		' | <%= package.license %> License' +
		' | <%= package.repository.url %>' +
		' */\n'
};


/**
 * Gulp Packages
 */

// General
var {gulp, src, dest, watch, series, parallel} = require('gulp');
var del = require('del');
var flatmap = require('gulp-flatmap');
var lazypipe = require('lazypipe');
var rename = require('gulp-rename');
var header = require('gulp-header');
var package = require('./package.json');
var gulpif = require('gulp-if');

// Scripts
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var uglify = require('gulp-terser');
var optimizejs = require('gulp-optimize-js');

// Styles
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var prefix = require('autoprefixer');
var minify = require('cssnano');

// SVGs
var svgmin = require('gulp-svgmin');

// Nunjucks
var nunjucksRender = require('gulp-nunjucks-render');

//Html
var htmlmin = require('gulp-htmlmin');

// BrowserSync
var browserSync = require('browser-sync');

//Strip console, alert, and debugger statements from JavaScript code with
var debugStrip = require('gulp-strip-debug');

//Images
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var imageminJpegtran = require('imagemin-jpegtran');
var imageminGifsicle = require('imagemin-gifsicle');

//Load and use json data
var data = require('gulp-data');
var fs = require('fs');

/**
 * Gulp Tasks
 */

 // Set build settings
var updateSettings = function (done) {
	Object.assign(settings, buildSettings);
	return done();
};

// Remove pre-existing content from output folders
var cleanDist = function (done) {

	// Make sure this feature is activated before running
	if (!settings.clean) return done();

	// Clean the dist folder
	del.sync([
		paths.output
	]);

	// Signal completion
	return done();

};

// Repeated JavaScript tasks
var jsTasks = lazypipe()
	.pipe(function () {
		return gulpif(settings.stripdebug, debugStrip())
	})
	.pipe(function () {
		return gulpif(!settings.minify.scripts, header(banner.main, {package: package}));
	})
	.pipe(optimizejs)
	.pipe(function () {
		return gulpif(settings.minify.scripts, uglify());
	})
	.pipe(function () {
		return gulpif(settings.minify.scripts, header(banner.main, {package: package}));
	})
	.pipe(dest, paths.scripts.output)

// Lint, minify, and concatenate scripts
var buildScripts = function (done) {

	// Make sure this feature is activated before running
	if (!settings.scripts) return done();

	// Run tasks on script files
	return src(paths.scripts.input)
		.pipe(flatmap(function(stream, file) {

			// If the file is a directory
			if (file.isDirectory()) {

				// Setup a suffix variable
				var suffix = '';

				// If separate polyfill files enabled
				if (settings.polyfills) {

					// Update the suffix
					suffix = '.polyfills';

					// Grab files that aren't polyfills, concatenate them, and process them
					src([file.path + '/*.js', '!' + file.path + '/*' + paths.scripts.polyfills])
						.pipe(concat(file.relative + '.js'))
						.pipe(jsTasks());

				}

				// Grab all files and concatenate them
				// If separate polyfills enabled, this will have .polyfills in the filename
				src(file.path + '/*.js')
					.pipe(concat(file.relative + suffix + '.js'))
					.pipe(jsTasks());

				return stream;

			}

			// Otherwise, process the file
			return stream.pipe(jsTasks());

		}));

};

// Lint scripts
var lintScripts = function (done) {

	// Make sure this feature is activated before running
	if (!settings.scripts) return done();

	// Lint scripts
	return src(paths.scripts.input)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));

};

// Process, lint, and minify Sass files
var buildStyles = function (done) {

	// Make sure this feature is activated before running
	if (!settings.styles) return done();

	// Run tasks on all Sass files
	return src(paths.styles.input)
		.pipe(sass({
			outputStyle: 'expanded',
			sourceComments: true
		}))
		.pipe(postcss([
			prefix({
				cascade: true,
				remove: true
			})
		]))
		.pipe(header(banner.main, {package: package}))
		.pipe(gulpif(settings.minify.styles,postcss([
			minify({
				discardComments: {
					removeAll: true
				}
			})
		])))
		.pipe(dest(paths.styles.output))
		.pipe(browserSync.stream());
};

// Optimize SVG files
var buildSVGs = function (done) {
	// Make sure this feature is activated before running
	if (settings.svgs == level.doNothing) return done();

	return src(paths.svgs.input)
		.pipe(gulpif(settings.svgs >= level.compress,svgmin()))
		.pipe(dest(paths.images.output));
};

// Optimize PNG files
var buildPNGs = function (done) {
	// Make sure this feature is activated before running
	if (settings.pngs == level.doNothing) return done();

	return src(paths.pngs.input)
		.pipe(gulpif(settings.pngs >= level.compress,imagemin([
			imagemin.optipng()
		])))
		.pipe(gulpif(settings.pngs >= level.lossyCompress,imagemin([
			imageminPngquant({quality:[0.9, 0.984]})
		])))
		.pipe(dest(paths.images.output));
};

// Optimize JPG files
var buildJPGs = function (done) {
	// Make sure this feature is activated before running
	if (settings.jpgs == level.doNothing) return done();

	return src(paths.jpgs.input)
		.pipe(gulpif(settings.jpgs >= level.compress,imagemin([
			imageminJpegtran()
		])))
		.pipe(gulpif(settings.jpgs >= level.lossyCompress,imagemin([
			imageminJpegRecompress()
		])))
		.pipe(dest(paths.images.output));
};

// Optimize GIF files
var buildGIFs = function (done) {
	// Make sure this feature is activated before running
	if (settings.gifs == level.doNothing) return done();

	return src(paths.gifs.input)
		.pipe(gulpif(settings.gifs >= level.compress,imagemin([
			imageminGifsicle()
		])))
		.pipe(dest(paths.images.output));
};

var buildImages =  
	series(
		parallel(
			buildSVGs,
			buildPNGs,
			buildGIFs,
			buildJPGs
		)
	);


// Copy static files into output folder
var copyFiles = function (done) {

	// Make sure this feature is activated before running
	if (!settings.copy) return done();

	// Copy static files
	return src(paths.copy.input)
		.pipe(dest(paths.copy.output));

};

// Copy and and minify HTML
var buildHTML = function (done) {
	return src(paths.html.input)
	  .pipe(gulpif(settings.minify.html,htmlmin({
		collapseWhitespace: true,
		removeComments: true
	  })))
	  .pipe(dest(paths.html.output));
};


// Copy static files into output folder
var buildNunjucks = function (done) {
	// Make sure this feature is activated before running
	if (!settings.nunjucks) return done();

	// Build html from nunjucks
	return src(paths.nunjucks.input_pages)
	.pipe(data(function(file) {
		return JSON.parse(fs.readFileSync(paths.data + 'nunjuck.json'));
	}))
	// Renders template with nunjucks
	.pipe(nunjucksRender({
		path: [paths.nunjucks.input_templates]
	  }))
	//Minify
	.pipe(gulpif(settings.minify.html,htmlmin({
		collapseWhitespace: true,
		removeComments: true
	})))
	.pipe(dest(paths.nunjucks.output))
};

// Watch for changes to the src directory
var startServer = function (done) {

	// Make sure this feature is activated before running
	if (!settings.reload) return done();

	// Initialize BrowserSync
	browserSync.init({
		server: {
			baseDir: paths.reload
		}
	});

	// Signal completion
	done();

};

// Reload the browser when files change
var reloadBrowser = function (done) {
	if (!settings.reload) return done();
	browserSync.reload();
	done();
};

// Watch for changes
var watchSource = function (done) {
	//watch(paths.input, series(exports.default, reloadBrowser));
	watch(paths.scripts.input, series(buildScripts, reloadBrowser));
	watch(paths.styles.input, series(buildStyles));
	watch(paths.images.input, series(buildImages, reloadBrowser));
	watch(paths.nunjucks.input_pages, series(buildNunjucks, reloadBrowser));
	watch(paths.nunjucks.input_templates, series(buildNunjucks, reloadBrowser));
	watch(paths.data, series(buildNunjucks, reloadBrowser));
	watch(paths.copy.input, series(reloadBrowser));
	done();
};


/**
 * Export Tasks
 */

// Default task
// gulp
exports.default = series(
	cleanDist,
	parallel(
		buildScripts,
		lintScripts,
		buildStyles,
		buildImages,
		buildNunjucks,
		copyFiles,
		buildHTML
	)
);

 // Build task
// gulp
exports.build = series(
	updateSettings,
	exports.default
);

// Watch and reload
// gulp watch
exports.watch = series(
	exports.default,
	startServer,
	watchSource
);
