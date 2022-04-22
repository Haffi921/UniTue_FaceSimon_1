const path = require("path");
const fs = require("fs");

function resolveEntry(entry) {
  let resolved_entry = false;
  try {
    if (!fs.lstatSync(entry).isFile()) {
      entry = path.resolve(entry, "index.ts");
    }
    if (fs.lstatSync(entry).isFile()) {
      resolved_entry = entry;
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      try {
        entry += ".ts";
        if (fs.lstatSync(entry).isFile()) {
          resolved_entry = entry;
        }
      } catch (e) {}
    }
  }
  return resolved_entry;
}

module.exports.getEntries = function (entryList) {
  function entryFilter(entries, item) {
    let entry = resolveEntry(path.resolve(entryList[item]));
    if (entry) entries[item] = entry;
    return entries;
  }
  return Object.keys(entryList).reduce(entryFilter, {});
};
