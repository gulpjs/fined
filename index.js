import os from "node:os";
import fs from "node:fs";
import path from "node:path";

export default function fined(pathObj, defaultObj) {
  const expandedPath = expandPath(pathObj, defaultObj);
  return expandedPath ? findWithExpandedPath(expandedPath) : null;
}

function expandPath(pathObj, defaultObj) {
  if (isString(pathObj)) {
    pathObj = { path: pathObj };
  }

  pathObj = defaults(pathObj, defaultObj);

  let filePath;
  if (!isString(pathObj.path)) {
    return null;
  }
  // Execution of toString is for a String object.
  if (isString(pathObj.name) && pathObj.name) {
    if (pathObj.path) {
      filePath = expandTilde(pathObj.path.toString());
      filePath = path.join(filePath, pathObj.name.toString());
    } else {
      filePath = pathObj.name.toString();
    }
  } else {
    filePath = expandTilde(pathObj.path.toString());
  }

  let extArr = createExtensionArray(pathObj.extensions);
  const extMap = createExtensionMap(pathObj.extensions);

  let basedir = isString(pathObj.cwd) ? pathObj.cwd.toString() : ".";
  basedir = path.resolve(expandTilde(basedir));

  let findUp = !!pathObj.findUp;

  const parsed = path.parse(filePath);
  if (path.isAbsolute(filePath)) {
    filePath = filePath.slice(parsed.root.length);
    findUp = false;
    basedir = parsed.root;
  } else if (parsed.root) {
    // Expanded path has a drive letter on Windows.
    filePath = filePath.slice(parsed.root.length);
    basedir = path.resolve(parsed.root);
  }

  if (parsed.ext && extArr.includes(parsed.ext)) {
    filePath = filePath.slice(0, -parsed.ext.length);
    // This ensures that only the original extension is matched.
    extArr = [parsed.ext];
  }

  return {
    path: filePath,
    basedir: basedir,
    findUp: findUp,
    extArr: extArr,
    extMap: extMap,
  };
}

function findWithExpandedPath(expanded) {
  const found = expanded.findUp
    ? findUpFile(expanded.basedir, expanded.path, expanded.extArr)
    : findFile(expanded.basedir, expanded.path, expanded.extArr);

  if (!found) {
    return null;
  }

  if (expanded.extMap) {
    found.extension = pick(expanded.extMap, found.extension);
  }
  return found;
}

function findFile(basedir, relpath, extArr) {
  const noExtPath = path.resolve(basedir, relpath);
  for (const ext of extArr) {
    const filepath = noExtPath + ext;
    try {
      fs.statSync(filepath);
      return { path: filepath, extension: ext };
    } catch {
      // Ignore error
    }
  }

  return null;
}

function findUpFile(basedir, filepath, extArr) {
  let lastdir;
  do {
    const found = findFile(basedir, filepath, extArr);
    if (found) {
      return found;
    }

    lastdir = basedir;
    basedir = path.dirname(basedir);
  } while (lastdir !== basedir);

  return null;
}

function createExtensionArray(exts) {
  if (isString(exts)) {
    return [exts];
  }

  if (Array.isArray(exts)) {
    exts = exts.filter(isString);
    return exts.length > 0 ? exts : [""];
  }

  if (isObject(exts)) {
    exts = Object.keys(exts);
    return exts.length > 0 ? exts : [""];
  }

  return [""];
}

function createExtensionMap(exts) {
  if (!isObject(exts)) {
    return null;
  }

  if (isEmpty(exts)) {
    return { "": null };
  }

  return exts;
}

function defaults(userObj, defaultObj) {
  if (!isObject(userObj)) {
    userObj = {};
  }

  if (!isObject(defaultObj)) {
    defaultObj = {};
  }

  const filteredEntries = Object.entries(userObj).filter(
    ([, value]) => value != null,
  );
  const filteredObj = Object.fromEntries(filteredEntries);
  return Object.assign({}, defaultObj, filteredObj);
}

function pick(map, match) {
  const entries = Object.entries(map).filter(([key]) => key === match);
  return Object.fromEntries(entries);
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function isEmpty(object) {
  return !Object.keys(object).length;
}

function isString(value) {
  if (typeof value === "string") {
    return true;
  }

  if (Object.prototype.toString.call(value) === "[object String]") {
    return true;
  }

  return false;
}

/*
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */
function expandTilde(filepath) {
  const home = os.homedir();

  if (filepath.charCodeAt(0) === 126 /* ~ */) {
    if (filepath.charCodeAt(1) === 43 /* + */) {
      return path.join(process.cwd(), filepath.slice(2));
    }
    return home ? path.join(home, filepath.slice(1)) : filepath;
  }

  return filepath;
}
