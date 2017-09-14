const gutil = require('gulp-util');
const gulp = require('gulp');

const config = require('./config');

const prod = config.environment.type == 'prod';
process.env.NODE_ENV = prod ? 'production' : config.environment.type;

gulp.task('css', () => {
  const sass = require('gulp-sass');
  
  return gulp.src('./client/styles/style.css')
    .pipe(
      sass({ outputStyle: 'compressed' }).on('error', sass.logError)
    )
    .pipe(gulp.dest('./static/css'))
});

function buildJs(file) {
  const browserify = require('browserify');
  const streamify = require('gulp-streamify');
  const babelify = require('babelify');
  const uglify = require('gulp-uglify');
  const source = require('vinyl-source-stream');

  const extensions = ['.jsx', '.js'];
  
  const b = browserify(
    `./client/components/${file}.jsx`, {
      debug: true, extensions, paths: ['./client']
    }
  );
  b.transform(babelify.configure({
    extensions, presets: ['es2015', 'react']
  }));
  
  return b.bundle()
    .pipe(source(`${file}.js`))
    .pipe(
      prod ? streamify(uglify({
        mangle: false,
        compress: { unused: false }
      }))
      .on('error', gutil.log) : gutil.noop()
    )
    .pipe(gulp.dest('./static/js/'));
}

gulp.task('js:app', () => buildJs('App'));
gulp.task('js:info', () => buildJs('Info'));

gulp.task('favicons', () => {
  const favicons = require('gulp-favicons');

  return gulp.src('icon.png')
    .pipe(favicons({}))
    .on('error', gutil.log)
    .pipe(gulp.dest('./static/icons/'));
});