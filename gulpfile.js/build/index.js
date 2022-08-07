const { src, dest, parallel, series } = require("gulp");

const gulpFile = require("gulp-file");
const gulpZip = require("gulp-zip");

const { createComponents } = require("./components");

const { experiment_title, slug, entries, jatos_config } = require("../jatos");

const BUILD_DIR = "dist";

const dest_path = `${BUILD_DIR}/source/${slug}`;

function additionalResources() {
  return src("./assets/**/*", { base: "./assets/" }).pipe(dest(dest_path));
}

function createJASFile() {
  return gulpFile(`${slug}.jas`, jatos_config, { src: true }).pipe(
    dest(`${BUILD_DIR}/source`)
  );
}

function zip() {
  return src(`${BUILD_DIR}/source/**/*`)
    .pipe(gulpZip(`${slug}.zip`))
    .pipe(dest(BUILD_DIR));
}

module.exports = series(
  parallel(
    createComponents(experiment_title, entries, dest_path),
    additionalResources,
    createJASFile
  ),
  zip
);
