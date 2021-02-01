let gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  uglify = require('gulp-uglifyjs'),
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  babel = require('gulp-babel'),
  csso = require('gulp-csso'),
  rename = require('gulp-rename'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  cache = require('gulp-cache'),
  gsmq = require('gulp-group-css-media-queries'),
  autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
  return gulp
    .src(`scss/app.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(gsmq())
    .pipe(autoprefixer(['last 2 versions'], { cascade: true }))
    .pipe(csso())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`css`))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('scriptsBuild', function () {
  return browserify(`js/app.js`)
    .bundle()
    .pipe(source('app.min.js'))
    .pipe(gulp.dest(`js`));
});

gulp.task('scriptsMin', function () {
  return gulp
    .src([`js/app.min.js`])
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest(`js`))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('browser-sync', function () {
  browserSync({
    // add neccesary url to proxy for live time dev
    proxy: "bundle.local/",
    notify: false,
    open: false,
    // tunnel: true,
  });
});

gulp.task('img', function () {
  return gulp
    .src(`img/**/*`)
    .pipe(
      cache(
        imagemin({
          interlaced: true,
          progressive: true,
          use: [pngquant({
            quality: '70-90', // When used more then 70 the image wasn't saved
            speed: 1, // The lowest speed of optimization with the highest quality
            floyd: 1 // Controls level of dithering (0 = none, 1 = full).
        })],
        })
      )
    )
    .pipe(gulp.dest(`img`));
});

gulp.task('checkupdate', function () {
  gulp.watch('scss/**/*.scss', gulp.parallel('sass'));
  gulp.watch(['js/**/*.js', '!js/*.min.js'], gulp.series('scriptsBuild', 'scriptsMin'));
  gulp.watch('../**/*.php').on('change', browserSync.reload);
  gulp.watch('img/**/*.*', browserSync.reload({stream: true}));
});

gulp.task(
  'watch',
  gulp.parallel(
    'sass',
    gulp.series(
      'scriptsBuild',
      'scriptsMin'
      ),
    'browser-sync',
    'checkupdate'
  )
);

gulp.task(
  'build',
  gulp.parallel(
    'sass',
    gulp.series(
      'scriptsBuild',
      'scriptsMin'
    ),
  )
);
