/*
 * @Author: Whzcorcd
 * @Date: 2020-05-08 09:47:27
 * @LastEditTime: 2020-05-09 17:12:22
 * @Description: Gulp file
 * @FilePath: /gdy-sentry-plugin/gulpfile.js
 */
const { task, src, dest } = require('gulp')
const babel = require('gulp-babel') // es6 语法解析为 es5
const terser = require('gulp-terser') //压缩
const rename = require('gulp-rename')
const stripDebug = require('gulp-strip-debug')

task('babel', () => {
  return src('./src/*.js')
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(dest('./dist'))
})

const build = task('build', () => {
  return src('./src/*.js')
    .pipe(dest('./dist'))
    .pipe(stripDebug())
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./dist'))
})

exports.build = build
