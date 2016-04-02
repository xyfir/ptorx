var gutil = require("gulp-util");
var gzip = require("gulp-gzip");
var gulp = require("gulp");

var isDev = require("./config").environment.development;

/*
	css
	- imports css files
    - scss -> css
	- autoprefixer
	- minifies / gzip
*/
gulp.task("css", function () {
    var postcss = require("gulp-postcss");
    var precss = require("precss");
    var nano = require("cssnano");
    var ap = require("autoprefixer");
    
    return gulp.src("./styles/style.css")
        .pipe(postcss([
            precss({}),
            ap({browsers: "last 1 version, > 10%"}),
            nano({ autoprefixer: false, zindex: false })
        ]))
		.pipe(!isDev ? gzip() : gutil.noop())
		.pipe(gulp.dest("./public/css"));
});

/*
	client
    - convert es2015 -> es5
    - converts JSX -> plain JS
	- bundles React componenents
	- minifies / gzip
*/
gulp.task("client", function () {
    var browserify = require("browserify");
    var streamify = require("gulp-streamify");
    var babelify = require("babelify");
    var uglify = require("gulp-uglify");
    var source = require("vinyl-source-stream");

    var extensions = [".jsx", ".js"];
    
    var b = browserify(
        './client/containers/App.jsx', { debug: true, extensions: extensions }
    );
    b.transform(babelify.configure({
        extensions: extensions, presets: ["es2015", "react"]
    }));
    
    return b.bundle()
		.pipe(source('App.js'))
        .pipe(streamify(uglify({
            mangle: false,
            compress: { unused: false }
        }))
        .on('error', gutil.log))
		.pipe(!isDev ? gzip() : gutil.noop())
		.pipe(gulp.dest('./public/js/'));
});