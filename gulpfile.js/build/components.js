const { resolve } = require("path");

// Gulp
const { parallel, src, dest } = require("gulp");
const uglify = require("gulp-uglify");
const replace = require("gulp-replace");
const rename = require("gulp-rename");

// Rollup
const rollup = require("gulp-better-rollup");
const { babel } = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");

// SCSS/CSS
const concatCss = require("gulp-concat-css");
const cssNano = require("gulp-cssnano");
const sass = require("gulp-sass")(require("node-sass"));
const tildeImporter = require("node-sass-tilde-importer");

function javascript(file_path, dest_path) {
  return function javascript() {
    return src(file_path)
      .pipe(
        rollup(
          {
            plugins: [
              typescript(),
              babel({
                babelHelpers: "bundled",
                exclude: [/node_modules/],
              }),
              nodeResolve(),
              commonjs(),
            ],
          },
          "umd"
        )
      )
      .pipe(uglify())
      .pipe(rename("index.js"))
      .pipe(dest(dest_path));
  };
}

function css(dest_path) {
  return function css() {
    return src("public/*.scss")
      .pipe(
        sass({
          outputStyle: "compressed",
          includePaths: ["node_modules"],
          sourceMap: true,
          importer: tildeImporter,
        })
      )
      .pipe(concatCss("style.css"))
      .pipe(cssNano())
      .pipe(dest(dest_path));
  };
}

function html(title, entry_name, dest_path) {
  return function html() {
    return src("public/index.html")
      .pipe(replace(/(style.css|index.js)/g, entry_name + "/$1"))
      .pipe(replace(/<title>\w+<\/title>/g, `<title>${title}</title>`))
      .pipe(dest(dest_path));
  };
}

function createComponent(title, entry_name, entry_path, dest_path) {
  const component_path = resolve(dest_path, entry_name);
  return parallel(
    javascript(entry_path, component_path),
    css(component_path),
    html(title, entry_name, component_path)
  );
}

function createComponents(title, entries, dest_path) {
  const tasks = [];
  const entryList = Object.entries(entries);
  for (let [entry_name, entry_path] of entryList) {
    tasks.push(createComponent(title, entry_name, entry_path, dest_path));
  }
  return parallel(...tasks);
}

module.exports = {
  createComponent,
  createComponents,
};
