import fs from 'fs';
import del from 'del';
import path from 'path';
import gulp from 'gulp';
import colors from 'colors';
import browserSync from 'browser-sync';
import layouts from 'handlebars-layouts';
import helpers from 'handlebars-helpers';
import bufferReplace from 'buffer-replace';

const $ = require('gulp-load-plugins')();

const { reload } = browserSync;
const src = path.join(__dirname, 'src');
const blocks = path.join(src, 'blocks');

browserSync({
  notify: false,
  // Customize the Browsersync console logging prefix
  logPrefix: 'WSK',
  // Allow scroll syncing across breakpoints
  scrollElementMapping: ['main', '.mdl-layout'],
  // Run as an https by uncommenting 'https: true'
  // Note: this uses an unsigned certificate which on first access
  //       will present a certificate warning in the browser.
  // https: true,
  server: ['dist'],
  open: false,
  port: 3000,
});

function getPaths(dir, ext) {
  return fs.readdirSync(dir)
    .filter(item => fs.lstatSync(path.join(dir, item)).isDirectory())
    .map(block => path.join(dir, block, block + ext))
    .filter((file) => {
      if (fs.existsSync(file)) return fs.lstatSync(file).isFile();
      return false;
    });
}

function comment(filePath) {
  const block = path.basename(filePath).replace(path.extname(filePath), '');
  return (block === 'global') ? '' : `/* .${block}\n---------------------------------------------------------------------- */\n`;
}

gulp.task('templates', () => {
  const partials = {};

  getPaths(blocks, '.hbs').forEach((file) => {
    const partial = path.basename(file).replace('.hbs', '');
    partials[partial] = `{{>${partial}/${partial}}}`;
  });

  return gulp.src('src/*.hbs')
    .pipe($.hb()
      .partials('src/blocks/**/*.hbs')
      .partials(partials)
      .helpers(helpers())
      .helpers(layouts))
    .on('error', function(err) { // eslint-disable-line
      console.log(err.fileName.underline); // eslint-disable-line
      console.log(colors.grey(' Error:') + '  ✖  '.red + err.message + '\n'); // eslint-disable-line
      this.emit('end');
    })
    .pipe($.rename(file => file.extname = '.html')) // eslint-disable-line
    .pipe($.htmlmin({
      collapseWhitespace: true,
      removeEmptyAttributes: false,
      removeEmptyElements: false
    }))
    .pipe($.htmlPrettify({
      indent_char: ' ',
      indent_size: 2
    }))
    .pipe(gulp.dest('dist'))
    .pipe($.htmllint({}, (filepath, issues) => {
      issues.forEach((issue) => {
        console.log('\n' + filepath.underline); // eslint-disable-line
        console.log(colors.grey(' ' + issue.line + ':' + issue.column) + '  ✖  '.red + issue.msg + colors.grey('\t' + issue.code + '\n')); // eslint-disable-line
      });
    }))
    .on('end', () => reload());
});

gulp.task('libs', () => gulp.src('src/global/libs/**/*')
  .pipe(gulp.dest('dist/sources/libs')));

gulp.task('styles', ['libs'], (done) => {
  const sources = getPaths(blocks, '.scss');
  sources.unshift(path.join(src, 'global/global.scss'));

  return gulp.src(sources)
    .pipe($.sourcemaps.init())
    .pipe($.stylelint({
      failAfterError: false,
      reporters: [{ formatter: 'string', console: true }],
      syntax: 'scss',
      configOverrides: {
        plugins: [
          'stylelint-scss',
        ],
        rules: {
          'property-no-vendor-prefix': true,
          'value-no-vendor-prefix': true,
          'at-rule-no-vendor-prefix': true
        },
      },
    }))
    .pipe($.tap((file) => {
      const patternSrc = ':host';
      const block = path.basename(file.path).replace('.scss', '');
      const checkRoot = file.contents.toString().indexOf(patternSrc);
      const patternDest = `.${block}`;

      if (block === 'global') return;

      if (checkRoot === 0) {
        file.contents = bufferReplace(Buffer.from(file.contents), patternSrc, patternDest); // eslint-disable-line
      } else {
        console.log('\n' + path.basename(file.path).underline); // eslint-disable-line
        console.log(colors.grey(' 1:1') + '  ✖  '.red + 'Missing the \':host\' selector at the first line.'); // eslint-disable-line
      }
    }))
    .pipe($.insert.transform(function(contents, file) {
      return comment(file.path) + contents;
    }))
    .pipe(gulp.dest('dist/sources'))
    .pipe($.concat('main.scss', { newLine: '\n' }))
    .pipe($.sass({ outputStyle: 'expanded' })
      .on('error', $.sass.logError))
    .pipe($.stylelint({
      failAfterError: false,
      reporters: [{ formatter: 'string', console: true }],
    }))
    .pipe($.rename(file => file.extname = '.css')) // eslint-disable-line
    .pipe($.autoprefixer([
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 34',
      'safari >= 7',
      'opera >= 23',
      'ios >= 7',
      'android >= 4.4',
      'bb >= 10',
    ]))
    .pipe($.stylelint({
      failAfterError: false,
      fix: true,
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/assets/styles'))
    .pipe(browserSync.stream());
});


gulp.task('scripts', () => {
  const sources = getPaths(blocks, '.js');
  sources.unshift(path.join(src, 'global/global.js'));

  return gulp.src(sources)
    .pipe($.sourcemaps.init())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.indent({
      tabs: false,
      amount: 2,
    }))
    .pipe($.if(file => path.basename(file.path) !== 'global.js', $.insert.prepend('$(\':host\').exists( function() {')))
    .pipe($.if(file => path.basename(file.path) !== 'global.js', $.insert.append('\n});\n')))
    .pipe($.tap((file) => {
      const block = path.basename(file.path).replace('.js', '');
      const patternSrc = '$(\':host\').exists( function() {';
      const patternDest = patternSrc.replace(':host', `.${block}`);

      if (block == 'global') return;

      file.contents = bufferReplace(Buffer.from(file.contents), patternSrc, patternDest); // eslint-disable-line
    }))
    .pipe($.insert.transform(function(contents, file) {
      return comment(file.path) + contents;
    }))
    .pipe($.eslint({ fix: true }))
    .pipe(gulp.dest('dist/sources'))
    .pipe($.concat('main.js', { newLine: '\n' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/assets/scripts'))
    .on('end', () => reload());
});

gulp.task('images', () => gulp.src('src/images/**/*')
  .pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true,
  })))
  .pipe(gulp.dest('dist/assets/images')))
  .on('end', () => reload());

gulp.task('vendor', ['build'], () => gulp.src('src/vendor/**/*')
  .pipe(gulp.dest('dist/assets/vendor')))
  .on('end', () => reload());

gulp.task('reload', () => reload());

gulp.task('clean', () => del(['dist/*'], { dot: true }));

gulp.task('build', ['clean'], () => gulp.start(['vendor', 'images', 'templates', 'styles', 'scripts']));

gulp.task('default', ['build'], () => {
  $.watch(['src/*.hbs', 'src/blocks/**/*.hbs'], () => gulp.start(['templates']));
  $.watch(['src/global/**/*.{scss,css}', 'src/blocks/**/*.{scss,css}'], () => gulp.start(['styles']));
  $.watch(['src/global/**/*.js', 'src/blocks/**/*.js'], () => gulp.start(['scripts']));
  $.watch(['src/images/**/*'], () => gulp.start(['images']));
  $.watch(['src/vendor/**/*'], () => gulp.start(['vendor']));
});
