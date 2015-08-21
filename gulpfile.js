var gulp = require('gulp');

var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('less', function() {
  gulp.src('./less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./css'));
  gulp.src('./css/*.css')
    .pipe(concat('pop.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('scripts', function() {
  gulp.src('./src/*.js')
    .pipe(concat('pop.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(rename('pop.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('default', function() {
  gulp.run('less', 'scripts');
  gulp.watch(['./src/*.js', './less/*.less'], function() {
    gulp.run('less', 'scripts');
  });
});
