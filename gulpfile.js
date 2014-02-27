var gulp = require('gulp');
var react = require('gulp-react');

gulp.task('default', function () {
    gulp.src('js/**.jsx')
        .pipe(react())
        .pipe(gulp.dest('js'));
});
