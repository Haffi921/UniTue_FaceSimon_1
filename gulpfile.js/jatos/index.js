const { default: slugify } = require("slugify");

const { readJSONFile, saveJSONFile } = require("./json_util");
const { getEntries } = require("./entry_resolver");
const { createLockFile } = require("./lock_util");

const create_slug = (str) => slugify(str, { replacement: "_", lower: true });

function getJatosConfig(lock_file) {
  return JSON.stringify({
    version: "3",
    data: lock_file,
  });
}

const jatos_json = readJSONFile("jatos.json");

const experiment_title = jatos_json.title;
const slug = create_slug(experiment_title);
const entries = getEntries(jatos_json.components);

const [jatos_lock, save_lock] = createLockFile(
  experiment_title,
  slug,
  Object.keys(entries)
);

if (save_lock) {
  saveJSONFile("jatos-lock.json", jatos_lock);
}

module.exports = {
  experiment_title,
  slug,
  entries,
  jatos_config: getJatosConfig(jatos_lock),
};
