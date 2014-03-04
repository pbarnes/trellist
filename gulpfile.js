var gulp = require('gulp');
var react = require('gulp-react');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');

gulp.task('default', function () {
    watch({glob: 'js/**/*.jsx'}, function(files) {
        return files
          .pipe(plumber())
          .pipe(react())
          .pipe(gulp.dest('js'));
    });
});
