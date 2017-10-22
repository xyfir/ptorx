const gutil = require('gulp-util');
const gulp = require('gulp');

function buildCSS(file) {
  const sass = require('gulp-sass');
  
  return gulp.src(`./client/styles/${file}.scss`)
    .pipe(sass({ outputStyle: 'compressed' })
    .on('error', sass.logError))
    .pipe(gulp.dest('./static/css'))
}

gulp.task('css:main', () => buildCSS('styles'));
gulp.task('css:admin', () => buildCSS('admin'));

gulp.task('favicons', () => {
  const favicons = require('gulp-favicons');

  return gulp.src('icon.png')
    .pipe(favicons({}))
    .on('error', gutil.log)
    .pipe(gulp.dest('./static/icons/'));
});