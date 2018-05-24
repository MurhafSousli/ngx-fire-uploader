const replaceExt = require('replace-ext');
const mkdirp = require('mkdirp');
const c = require('ansi-colors');
const path = require('path');

const {
  existsSync,
  writeFileSync,
  readdirSync,
  lstatSync,
  createWriteStream,
  createReadStream
} = require('fs');

const sass = require('node-sass');
const postcss = require('postcss');

// post css processors
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const stripInlineComments = require('postcss-strip-inline-comments');

const processors = [stripInlineComments, autoprefixer, cssnano];

function compileScss(startPath, filter, callback) {
  if (!existsSync(startPath)) {
    logError(startPath);
    return;
  }

  const files = readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    const fileName = path.join(startPath, files[i]);

    if (lstatSync(fileName).isDirectory()) {
      start(fileName, filter, callback); //recurse
    } else if (filter.test(fileName)) {
      callback(fileName);
    }
  }
}

function sassTask(srcDir, distDir, filePath) {
  const theme = path.relative(srcDir, filePath);

  // Compile scss to css
  const sassObj = sass.renderSync({ file: filePath });

  if (sassObj && sassObj.css) {
    const css = sassObj.css.toString('utf8');
    postcss(processors)
      .process(css)
      .then(result => {
        // Log warnings if any exists
        result.warnings().map(logError);

        cssContent = new Buffer(result.css);
        cssPath = replaceExt(distDir + theme, '.css');

        // Create dist directory if doest not exist
        if (!existsSync(path.dirname(filePath))) {
          mkdirp.sync(path.dirname(filePath), logError);
        }
        // Write css file to dist
        writeFileSync(cssPath, cssContent, logError);

        // Copy scss file to dist
        createReadStream(filePath).pipe(createWriteStream(distDir + theme));

        console.log(c.bgMagenta(path.basename(cssPath)), c.green(c.symbols.check));
      });
  }
}

const logError = err => console.log(c.bgRedBright('[Error]:'), c.red(err));

const MANAGER_SRC = 'lib/manager/src/';
const MANAGER_DIST = 'build/manager/';
// Compile manager styles
compileScss(MANAGER_SRC, /\.scss$/, fileName =>
  sassTask(MANAGER_SRC, MANAGER_DIST, fileName)
);
