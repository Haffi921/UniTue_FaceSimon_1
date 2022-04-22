const { series } = require("gulp");

const clean = require("./clean");
const build = require("./build");
const serve = require("./devServer");

const BUILD_DIR = "dist";
const SERVER_DIR = `${BUILD_DIR}/.server`;

module.exports.build = series(clean(`${BUILD_DIR}/*`), build);
module.exports.serve = serve;
