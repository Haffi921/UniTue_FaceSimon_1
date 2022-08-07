const path = require("path");
const fs = require("fs");

function resolveEntry(entry) {
  const possible = {
    files: ["", "index"],
    endings: [".ts", ".js"],
  };

  for (const ending of possible.endings) {
    for (const file of possible.files) {
      const full_path = path.resolve(entry, file) + ending;
      try {
        if (fs.lstatSync(full_path).isFile()) return full_path;
      } catch (e) {}
    }
  }

  return false;
}

module.exports.getEntries = function (entryList) {
  function entryFilter(entries, item) {
    let entry = resolveEntry(path.resolve(entryList[item]));
    if (entry) entries[item] = entry;
    return entries;
  }
  return Object.keys(entryList).reduce(entryFilter, {});
};
