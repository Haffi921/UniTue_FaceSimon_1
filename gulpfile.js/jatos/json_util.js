const fs = require("fs");

module.exports.readJSONFile = function (fileName, vital = true) {
  try {
    return JSON.parse(fs.readFileSync(fileName, "utf-8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    if (vital) {
      console.error(`File '${fileName}' not found`);
      process.exit(1);
    }
    return undefined;
  }
};

module.exports.saveJSONFile = function (fileName, content) {
  fs.writeFileSync(fileName, JSON.stringify(content, null, 4));
};
