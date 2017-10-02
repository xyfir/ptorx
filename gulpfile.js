const gutil = require('gulp-util');
const gulp = require('gulp');

const config = require('./config');

const prod = config.environment.type == 'prod';
process.env.NODE_ENV = prod ? 'production' : config.environment.type;

function buildCSS(file) {
  const sass = require('gulp-sass');
  
  return gulp.src(`./client/styles/${file}.scss`)
    .pipe(sass({ outputStyle: 'compressed' })
    .on('error', sass.logError))
    .pipe(gulp.dest('./static/css'))
}

gulp.task('css:main', () => buildCSS('styles'));
gulp.task('css:admin', () => buildCSS('admin'));

function buildJS(file) {
  const browserify = require('browserify');
  const streamify = require('gulp-streamify');
  const babelify = require('babelify');
  const uglify = require('gulp-uglify');
  const source = require('vinyl-source-stream');

  const extensions = ['.jsx', '.js'];
  
  return browserify(
    `./client/components/${file}.jsx`, {
      debug: true, extensions, paths: ['./client']
    }
  )
  .transform(
    babelify.configure({
      extensions, presets: ['env', 'react']
    })
  )
  .bundle()
  .pipe(source(`${file}.js`))
  .pipe(prod
    ? streamify(
        uglify({ mangle: false, compress: { unused: false } })
      ).on('error', gutil.log)
    : gutil.noop()
  )
  .pipe(gulp.dest('./static/js/'));
}

gulp.task('js:app', () => buildJS('App'));
gulp.task('js:info', () => buildJS('Info'));
gulp.task('js:admin', () => buildJS('Admin'));

gulp.task('favicons', () => {
  const favicons = require('gulp-favicons');

  return gulp.src('icon.png')
    .pipe(favicons({}))
    .on('error', gutil.log)
    .pipe(gulp.dest('./static/icons/'));
});