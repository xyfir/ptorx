const gutil = require("gulp-util");
const gzip = require("gulp-gzip");
const gulp = require("gulp");

const isDev = require("./config").environment.type;

/*
	css
	- imports css files
    - scss -> css
	- autoprefixer
	- minifies / gzip
*/
gulp.task("css", function() {
    const postcss = require("gulp-postcss");
    const precss = require("precss");
    const nano = require("cssnano");
    const ap = require("autoprefixer");
    
    return gulp.src("./client/styles/style.css")
        .pipe(postcss([
            precss({}),
            ap({browsers: "last 1 version, > 10%"}),
            nano({ autoprefixer: false, zindex: false })
        ]))
		//.pipe(!isDev ? gzip() : gutil.noop())
		.pipe(gulp.dest("./static/css"));
});

/*
	client
    - convert es2015 -> es5
    - converts JSX -> plain JS
	- bundles React components
	- minifies / gzip
*/
gulp.task("client", function() {
    const browserify = require("browserify");
    const streamify = require("gulp-streamify");
    const babelify = require("babelify");
    const uglify = require("gulp-uglify");
    const source = require("vinyl-source-stream");

    const extensions = [".jsx", ".js"];
    
    const b = browserify(
        "./client/components/App.jsx", {
            debug: true, extensions, paths: ["./client"]
        }
    );
    b.transform(babelify.configure({
        extensions: extensions, presets: ["es2015", "react"]
    }));
    
    return b.bundle()
		.pipe(source("App.js"))
        .pipe(streamify(uglify({
            mangle: false,
            compress: { unused: false }
        }))
        .on("error", gutil.log))
		//.pipe(!isDev ? gzip() : gutil.noop())
		.pipe(gulp.dest("./static/js/"));
});

/*
	favicons
    - generate favicons from icon.png
    - place in static/icons
*/
gulp.task("favicons", function() {
    const favicons = require("gulp-favicons");

    return gulp.src("icon.png")
    .pipe(favicons({}))
    .on("error", gutil.log)
    .pipe(gulp.dest("./static/icons/"));
});

/*
	fontello
    - get font and css files from fontello
    - place in ./static/fontello
*/
gulp.task("fontello", function() {
    return gulp.src("fontello.json")
        .pipe(require("gulp-fontello")())
        .pipe(gulp.dest("./static/fontello"));
});