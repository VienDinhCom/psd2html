var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var colors = require('colors');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var bufferReplace = require('buffer-replace');
var config = require('./package.json').config;

function getPaths() {
  var root = __dirname;
  var src = path.join(root, config.src.base);
  var dist = path.join(root, config.dist.base);

  return {
    src: {
      base: src,
      pages: path.join(src, config.src.pages, '*.twig'),
      components: path.join(src, 'components'),
      images: path.join(src, 'images/**/*'),
      vendor: path.join(src, 'vendor/**/*'),
    },
    dist: {
      base: dist,
      assets: path.join(dist, config.dist.assets),
      images: path.join(dist, config.dist.assets, 'images'),
      vendor: path.join(dist, config.dist.assets, 'vendor'),
    },
  };
}

function getComponentPaths(ext) {
  var components = getPaths().src.components;
  var globalFile = path.join(getPaths().src.base, 'global/global' + ext);
  var files = fs
    .readdirSync(components)
    .filter(function(component) {
      return fs.lstatSync(path.join(components, component)).isDirectory();
    })
    .map(function(component) {
      return path.join(components, component, component + ext);
    })
    .filter(function(file) {
      return fs.existsSync(file) && fs.lstatSync(file).isFile();
    });

  if (fs.existsSync(globalFile) && fs.lstatSync(globalFile).isFile()) {
    files.unshift(globalFile);
  }

  return files;
}

gulp.task('templates', function() {
  return gulp
    .src(getPaths().src.pages)
    .pipe($.twig({}))
    .pipe(
      $.htmlPrettify({
        indent_char: ' ',
        indent_size: 2,
      })
    )
    .pipe(gulp.dest(getPaths().dist.base))
    .on('end', function() {
      browserSync.reload();
    });
});

gulp.task('styles', function() {
  return gulp
    .src(getComponentPaths('.scss'))
    .pipe($.sourcemaps.init())
    .pipe(
      $.tap(function(styleFile) {
        var component = path.basename(styleFile.path).replace('.scss', '');

        if (component === 'global') return null;

        if (styleFile.contents.toString().indexOf(':host') !== 0) {
          console.log('\n' + styleFile.path.underline); // eslint-disable-line
          console.log( // eslint-disable-line
            colors.grey(' 1:1') +
              '  ✖  '.red +
              "Missing the ':host' selector at the first line."
          );

          return null;
        }

        styleFile.contents = bufferReplace( // eslint-disable-line
          Buffer.from(styleFile.contents),
          ':host',
          '/* Component: .' +
            component +
            '\n--------------------------------------------------*/\n.' +
            component
        );

        return null;
      })
    )
    .pipe($.concat('main.scss', { newLine: '\n' }))
    .pipe($.sass({ outputStyle: 'expanded' }).on('error', $.sass.logError))
    .pipe(
      $.autoprefixer({
        browsers: ['>0.2%', 'not dead', 'not ie <= 11', 'not op_mini all'],
        cascade: false,
      })
    )
    .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(getPaths().dist.assets))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function scripts() {
  return gulp
    .src(getComponentPaths('.js'))
    .pipe($.sourcemaps.init())
    .pipe(
      $.if(function(file) {
        return path.basename(file.path) !== 'global.js';
      }, $.insert.prepend("$(':host').exists(function() {\n"))
    )
    .pipe(
      $.if(function(file) {
        return path.basename(file.path) !== 'global.js';
      }, $.insert.prepend(
        '/* Component: :host\n--------------------------------------------------*/\n'
      ))
    )
    .pipe(
      $.if(function(file) {
        return path.basename(file.path) !== 'global.js';
      }, $.insert.append('\n});\n'))
    )
    .pipe(
      $.tap(function(scriptFile) {
        var component = path.basename(scriptFile.path).replace('.js', '');

        if (component === 'global') return null;

        scriptFile.contents = bufferReplace( // eslint-disable-line
          Buffer.from(scriptFile.contents),
          ':host',
          '.' + component
        );

        return null;
      })
    )
    .pipe($.concat('main.js'))
    .pipe($.eslint({ fix: true }))
    .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(getPaths().dist.assets))
    .on('end', function() {
      browserSync.reload();
    });
});

gulp.task('images', function images() {
  return gulp
    .src(getPaths().src.images)
    .pipe(
      $.cache(
        $.imagemin({
          progressive: true,
          interlaced: true,
        })
      )
    )
    .pipe(gulp.dest(getPaths().dist.images))
    .on('end', function() {
      browserSync.reload();
    });
});

gulp.task('vendor', function() {
  return gulp
    .src(getPaths().src.vendor)
    .pipe(gulp.dest(getPaths().dist.vendor))
    .on('end', function() {
      browserSync.reload();
    });
});

gulp.task('clean', function() {
  return gulp.src(getPaths().dist.base + '/*').pipe($.clean({ force: true }));
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('templates', 'scripts', 'styles', 'images', 'vendor')
  )
);

gulp.task('serve', function() {
  browserSync({
    notify: false,
    logPrefix: ' https://github.com/maxvien ',
    server: getPaths().dist.base,
    open: false,
    port: 8080,
  });
});

gulp.task('watch', function() {
  var src = getPaths().src;

  $.watch([path.join(src.base, 'images/**/*')], gulp.parallel('images'));
  $.watch([path.join(src.base, 'vendor/**/*')], gulp.parallel('vendor'));

  $.watch(
    [src.pages, path.join(src.base, 'components/**/*.twig')],
    gulp.parallel('templates')
  );

  $.watch(
    [
      path.join(src.base, 'global/**/*.{scss,css}'),
      path.join(src.base, 'components/**/*.{scss,css}'),
    ],
    gulp.parallel('styles')
  );

  $.watch(
    [
      path.join(src.base, 'global/**/*.js'),
      path.join(src.base, 'components/**/*.js'),
    ],
    gulp.parallel('scripts')
  );
});

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'serve')));

// https://github.com/htanjo/css-bundling
// https://parceljs.org/getting_started.html
