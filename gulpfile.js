/*
 * @Author: Whzcorcd
 * @Date: 2020-05-08 09:47:27
 * @LastEditTime: 2020-05-08 14:44:00
 * @Description: Gulp file
 * @FilePath: /gdy-sentry-plugin/gulpfile.js
 */
const gulp = require('gulp')
const connect = require('gulp-connect')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const clean = require('gulp-clean')
const rename = require('gulp-rename')
const stripDebug = require('gulp-strip-debug')
const gutil = require('gulp-util')

gulp.task('connect', () => {
  connect.server({
    root: './',
    port: 8080,
    livereload: true
  })
})

gulp.task('babel', () => {
  gulp
    .src('./src/*.js')
    .pipe(
      babel({
        presets: ['env']
      })
    )
    .pipe(gulp.dest('./dist'))
})

gulp.task('watch', () => {
  gulp.watch(['./src/*.js'], ['babel'])
  gulp.watch(['./src/*.js'], ['html'])
})

gulp.task('default', gulp.series('connect', 'watch', 'babel', async () => {}))

gulp.task('build', () => {
  gulp
    .src('./src/*.js')
    .pipe(gulp.dest('./dist'))
    .pipe(stripDebug())
    .pipe(
      babel({
        presets: ['env']
      })
    )
    .pipe(uglify({ mangle: false }))
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString())
    })
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist'))
})
