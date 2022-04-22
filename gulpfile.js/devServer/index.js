const { argv } = require("yargs");

const { src, series, parallel, watch, dest } = require("gulp");
const connect = require("gulp-connect");

const clean = require("../clean");
const { createComponent } = require("../build/components");

const { experiment_title, entries } = require("../jatos");

function devServer() {
  connect.server({
    root: "dist/.server",
    livereload: true,
  });
}

function getComponent(name) {
  return Object.entries(entries).reduce((file, [entry, path]) => {
    if (entry === name) file = path;
    return file;
  }, "");
}

function serveComponent() {
  return createComponent(
    experiment_title,
    getComponent("experiment"),
    "dist/.server"
  );
}

function additionalResources() {
  return src("./assets/**/*", { base: "./assets/" }).pipe(dest("dist/.server"));
}

function fileWatch() {
  return watch(
    ["src/**/*", "public/**/*", "assets/**/*"],
    {
      events: "change",
      delay: 1000,
    },
    refresh
  );
}

const refresh = series(
  clean("dist/.server/*"),
  parallel(additionalResources, serveComponent()),
  function restart() {
    return src("dist/.server/*").pipe(connect.reload());
  }
);

const serve = series(
  clean("dist/.server/*"),
  parallel(additionalResources, serveComponent()),
  parallel(devServer, fileWatch)
);

module.exports = serve;
