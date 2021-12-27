const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const broserSync = require('browser-sync').create()

function style() {
    return gulp.src('./scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./css'))
    .pipe(broserSync.stream())
}

function watch() {
    broserSync.init({
        server: {
            baseDir: './'
        }
    })
    gulp.watch('./scss/**/*.scss', style)
    gulp.watch('./*.html').on('change', broserSync.reload);
    gulp.watch('./js/**/*.js').on('change', broserSync.reload);
}

exports.watch = watch
exports.style = style