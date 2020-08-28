# Gulp Boilerplate Extended

A boilerplate for building web projects with [Gulp](https://gulpjs.com/). Uses Gulp 4.x.
Original code by [cferdinandi](https://github.com/cferdinandi/gulp-boilerplate/commits?author=cferdinandi)
The major part of the code is still his, but my needs are in some regards quite different so I decided to create a separate repository

**Extended features**
- Possibility to select different watch and build settings (i use it to only minify ready builds)
- HTML Templating with nunjucks (file extension .njk is used). Pages, Templates, Macros and Partials and data-loading are all supported.
- Styles injection
- Strip debug used on javascript (strips console, alert, and debugger)
- Compress JPGs,GIFs and PNGs

**Features (base by cferdinadi)**
- Concatenate, minify, and lint JavaScript.
- Compile, minify, autoprefix, and lint Sass.
- Optimize SVGs.
- Copy static files and folders into your `dist` directory.
- Automatically add headers and project details to JS and CSS files.
- Create polyfilled and non-polyfilled versions of JS files.
- Watch for file changes, and automatically recompile build and reload webpages.

**Gulp Boilerplate Extended makes it easy to turn features on and off**, so you can reuse it for all of your projects without having to delete or modify tasks.


## Getting Started

### Dependencies

*__Note:__ if you've previously installed Gulp globally, run `npm rm --global gulp` to remove it. [Details here.](https://medium.com/gulpjs/gulp-sips-command-line-interface-e53411d4467)*

Make sure these are installed first.

- [Node.js](https://nodejs.org)
- [Gulp Command Line Utility](https://gulpjs.com) `npm install --global gulp-cli`

### Quick Start

1. In bash/terminal/command line, `cd` into your project directory.
2. Run `npm install` to install required files and dependencies.
3. When it's done installing, run one of the task runners to get going:
	- `gulp` manually compiles files with default settings
	- `gulp build`  manually compiles files with build settings
	- `gulp watch` automatically compiles files and applies changes using [BrowserSync](https://browsersync.io/) when you make changes to your source files.

**Try it out.** After installing, run `gulp` to compile some test files into the `dist` directory. Or, run `gulp watch` and make some changes to see them recompile automatically.



## Documentation

Add your source files to the appropriate `src` subdirectories. Gulp will process and and compile them into `dist`.

- JavaScript files in the `src/js` directory will be compiled to `dist/js`. Files in subdirectories under the `js` folder will be concatenated. For example, files in `js/detects` will compile into `detects.js`.
- Files in the `src/sass` directory will be compiled to `dist/css`.
- Images files placed in the `src/images` directory will be optimized with SVGO and imagemin and placed in `dist/images`.
- Files and folders placed in the `copy` directory will be copied as-is into the `dist` directory.

### package.json

The `package.json` file holds all of the details about your project.

Some information is automatically pulled in from it and added to a header that's injected into the top of your JavaScript and CSS files.

```json
{
	"name": "project-name",
	"version": "0.0.1",
	"description": "A description for your project.",
	"main": "./dist/your-main-js-file.js",
	"author": {
		"name": "YOUR NAME",
		"url": "https://link-to-your-website.com"
	},
	"license": "MIT",
	"repository": {
		"type": "git",
		"url": "https://link-to-your-git-repo.com"
	},
	"devDependencies": {}
}
```

*__Note:__ `devDependencies` are the dependencies Gulp uses. Don't change these or you'll break things. If any of the other fields are removed, make sure to remove reference to them in the Header (under `var banner` in `gulpfile.js`) or `gulp watch` won't run.*

### JavaScript

Put your JavaScript files in the `src/js` directory.

Files placed directly in the `js` folder will compile directly to `dist/js` as both minified and unminified files. Files placed in subdirectories under `src/js` will also be concatenated into a single file. For example, files in `js/detects` will compile into `detects.js`.

*__A note about polyfills:__ In subdirectories that contain files with the `.polyfill.js` suffix (for example, `_matches.polyfill.js`), two versions will be created: one with the polyfill files, and one without.*

### Sass

Put your [Sass](https://sass-lang.com/) files in the `src/sass` directory.

Gulp generates minified and unminified CSS files. It also includes [autoprefixer](https://github.com/postcss/autoprefixer), which adds vendor prefixes for you.

### Images

Place image files in the `src/images` directory.

SVG files will be optimized with [SVGO](https://github.com/svg/svgo) and compiled into `dist/images`.
JPG,PNG and GIF files will be optimized with [imagemin](https://www.npmjs.com/package/gulp-imagemin) and placed in `dist/images`.

In the settings you can choose with wich level the images should be comporess:
	level.doNothing - nothing is done
	level.copy: image is only copied
	level.compress: image is loslessy compressed
	level.lossyCompress: image is lossly compressed

The nature of the different formats prevents lossly comporesion of SVG and GIF.
It is recommended to only copy files during development to save time.

### Nunjuck
Place your pages in the `src/pages` directory.
Place your templates in the `src/templates` directory.
Place your partials in the `src/templates/partials` directory.

All nunjuck-files will be converted into html-files and copied into `dist`.

*BEWARE:__ If nunjuck is enabled the file `src/data/nunjuck.json` must exist, wether you use it or not.*

*BEWARE:__ Be carefule not to include nunjuck-pages with the same name as HTML-files in `src/copy`. This could lead to unexpected results.*

### Copy Files

Files and folders placed in the `src/copy` directory will be copied as-is into `dist`.

This is a great place to put HTML files, images, and pre-compiled assets.

*BEWARE:__ Be carefule not to HTML-files with he same name as nunjuck-pages  `src/pages`. This could lead to unexpected results.*

### Data
Files in `src/data` should be json-files with data.
At the moment only `nunjuck.json` is supported. This contains data for nunjuck-files.

*BEWARE:__ Dont remove `nunjuck.json` if you have nunjuck enabled.*

## Options & Settings

Gulp Boilerplate makes it easy to customize for projects without having to delete or modify tasks.

Options and settings are located at the top of the `gulpfile.js`.

### Settings
Default features for `gulp watch` is set under the `settings` variable to `true` to turn them on, and `false` to turn them off.

```js
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
```
Features for `gulp build` is set under the `buildSettings` variable to `true` to turn them on, and `false` to turn them off.
These settings will be merged with the default settings and therefore you only need to state the settings you want to change.

```js
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
```

### Paths

Adjust the `input` and `output` paths for all of the Gulp tasks under the `paths` variable. Paths are relative to the root project folder.

```js
/**
 * Paths to project folders
 */

var paths = {
	input: 'src/',
	output: 'dist/',
	scripts: {
		input: 'src/js/*',
		polyfills: '.polyfill.js',
		output: 'dist/js/'
	},
	styles: {
		input: 'src/sass/**/*.{scss,sass}',
		output: 'dist/css/'
	},
	svgs: {
		input: 'src/svg/*.svg',
		output: 'dist/svg/'
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
```

### Header

Gulp auto-injects a header into all of your JavaScript and CSS files with details from your `package.json` file.

You can change what's included under the `banner` variable.

```js
/**
 * Template for banner to add to file headers
 */

var banner = {
	full:
		'/*!\n' +
		' * <%= package.name %> v<%= package.version %>\n' +
		' * <%= package.description %>\n' +
		' * (c) ' + new Date().getFullYear() + ' <%= package.author.name %>\n' +
		' * <%= package.license %> License\n' +
		' * <%= package.repository.url %>\n' +
		' */\n\n',
	min:
		'/*!' +
		' <%= package.name %> v<%= package.version %>' +
		' | (c) ' + new Date().getFullYear() + ' <%= package.author.name %>' +
		' | <%= package.license %> License' +
		' | <%= package.repository.url %>' +
		' */\n'
};
```



## License

The code is available under the [MIT License](LICENSE.md).
