const sass = require('node-sass');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const cssnano = require('cssnano');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const stripInlineComments = require('postcss-strip-inline-comments');

const gulpUtil = require('gulp-util');

const processors = [
  stripInlineComments,
  autoprefixer,
  cssnano
];

const CORE_SRC = 'lib/core/src/';
const CORE_DIST = 'build/core/';

const MANAGER_SRC = 'lib/manager/src/';
const MANAGER_DIST = 'build/manager/';

function writeStyleFile(file) {

  console.log(file);
  /** Create dir if not exists */
  if (!fs.existsSync(path.dirname(file.path))) {
    mkdirp.sync(path.dirname(file.path), function (err) {
      if (err) gulpUtil.log('[mkdir]:', err)
    });
  }

  /** Write css files to build dir */
  fs.writeFileSync(file.path, file.contents, function (err) {
    if (!err) {
      gulpUtil.log('[writeFileSync]:', err);
    }
  });
}


function start(startPath, filter, callback) {

  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  const files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      start(filename, filter, callback); //recurse
    }
    else if (filter.test(filename)) callback(filename);
  }
}

function sassTask(srcDir, distDir, filePath) {

  const theme = path.relative(srcDir, filePath);

  /** Compile scss to css */
  const sassObj = sass.renderSync({
    file: filePath
  });

  if (sassObj && sassObj.css) {
    const css = sassObj.css.toString('utf8');
    postcss(processors).process(css).then(function (result) {

      /** Log warnings if any exists */
      result.warnings().forEach(function (warn) {
        gulpUtil.log(warn.toString());
      });

      /** Create css file object */
      const file = {};
      file.contents = new Buffer(result.css);

      /** Write css files to button dir */
      file.path = gulpUtil.replaceExtension(distDir + theme, '.css');

      writeStyleFile(file);
      fs.createReadStream(filePath).pipe(fs.createWriteStream(distDir + theme));
    });
  }
}

// Compile core styles
start(CORE_SRC, /\.scss$/, function (filename) {
  sassTask(CORE_SRC, CORE_DIST, filename);
});

// Compile previewer styles
start(MANAGER_SRC, /\.scss$/, function (filename) {
  sassTask(MANAGER_SRC, MANAGER_DIST, filename);
});
