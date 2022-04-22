const uuid = require("uuid").v4;

const { readJSONFile } = require("./json_util");

function createLockedComponent(component) {
  return {
    uuid: uuid(),
    title: component,
    htmlFilePath: `${component}/index.html`,
  };
}

function createLockedExperiment(title, dirName) {
  return {
    uuid: uuid(),
    title,
    dirName,
    componentList: [],
  };
}

module.exports.createLockFile = function (experiment_name, slug, entries) {
  const validate_uuid = (uuid) =>
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(uuid);

  let lock_file = readJSONFile("jatos-lock.json", false);
  let changed = false;

  if (!lock_file) {
    // No lock file exists so we create one with information from json file
    lock_file = createLockedExperiment(experiment_name, slug);
    lock_file.componentList = entries.map(createLockedComponent);
    changed = true;
  } else {
    // A lock file exists so we compare the values for changes
    // Experiment Name
    if (lock_file.title !== experiment_name) {
      lock_file.title = experiment_name;
      lock_file.dirName = slug;
      changed = true;
    }

    const new_list = [];

    for (let entry of entries) {
      const existing_component = lock_file.componentList.find(
        (item) => entry === item.title
      );
      if (existing_component) {
        if (validate_uuid(existing_component.uuid)) {
          new_list.push(existing_component);
          continue;
        }
      }
      new_list.push(createLockedComponent(entry));
      changed = true;
    }

    if (lock_file.componentList.length !== new_list.length || changed) {
      lock_file.componentList = new_list;
      changed = true;
    }
  }

  return [lock_file, changed];
};
