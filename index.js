import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Find a file given configuration and defaults describing lookup behavior.
 *
 * @param {LookupConfig | string} [pathObj] The user-provided configuration for file lookup.
 * @param {LookupConfig} [defaultObj] Default configuration for file lookup.
 * @returns {Found | null} Information about the found file or `null` if it cannot be found.
 */
export default function fined(pathObj, defaultObj) {
  const expandedPath = expandPath(pathObj, defaultObj);
  return expandedPath ? findWithExpandedPath(expandedPath) : null;
}

/**
 * @typedef {{ [extension: string]: * }} ExtensionMap Object mapping of extensions to some value.
 */

/**
 * @typedef {object} LookupConfig Configuration used to lookup a file.
 * @property {string | null} [path] The base path to search within.
 * @property {string | null} [name] The name of the file without an extension.
 * @property {string | Array<string> | ExtensionMap | null} [extensions] The extensions the file being looked up may have.
 * @property {string | null} [cwd] The current working directory that `path + name` is resolved against.
 * @property {boolean | null} [findUp] Whether file lookup should recurse up the directory structure.
 */

/**
 * @typedef {object} Found Information about the found file.
 * @property {string} path The absolute path of the found file.
 * @property {string | ExtensionMap} extension The extension that matched from configured extensions.
 */

/**
 * Creates an expanded config by joining config & defaults and applying normalization.
 *
 * @param {LookupConfig | string} [pathObj] The user-provided configuration for file lookup.
 * @param {LookupConfig} [defaultObj] Default configuration for file lookup.
 * @returns Information about the found file or `null` if not found.
 */
function expandPath(pathObj, defaultObj) {
  if (isString(pathObj)) {
    pathObj = { path: pathObj };
  }

  pathObj = defaults(pathObj, defaultObj);

  /** @type string */
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

  /** @type string */
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

/**
 * Resolves an expanded configuration to a file.
 *
 * @param {NonNullable<ReturnType<typeof expandPath>>} expanded The expanded configuration to lookup.
 * @returns {Found | null} Information about the found file or `null` if it cannot be found.
 */
function findWithExpandedPath(expanded) {
  const found = expanded.findUp
    ? findUpFile(expanded.basedir, expanded.path, expanded.extArr)
    : findFile(expanded.basedir, expanded.path, expanded.extArr);

  if (!found) {
    return null;
  }

  if (expanded.extMap) {
    return {
      ...found,
      extension: pick(expanded.extMap, found.extension),
    };
  }
  return found;
}

/**
 * Non-recursive lookup of file + each extension.
 *
 * @param {string} basedir The directory to resolve against.
 * @param {string} filename The filename (without extension) to resolve.
 * @param {Array<string>} extArr The extensions to resolve against the filename.
 * @returns Information about the found file or `null` if not found.
 */
function findFile(basedir, filename, extArr) {
  const noExtPath = path.resolve(basedir, filename);
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

/**
 * Recursive lookup of file + each extension.
 *
 * @param {string} basedir The directory to resolve against.
 * @param {string} filename The filename (without extension) to resolve.
 * @param {Array<string>} extArr The extensions to resolve against the filename.
 * @returns Information about the found file or `null` if not found.
 */
function findUpFile(basedir, filename, extArr) {
  let lastdir;
  do {
    const found = findFile(basedir, filename, extArr);
    if (found) {
      return found;
    }

    lastdir = basedir;
    basedir = path.dirname(basedir);
  } while (lastdir !== basedir);

  return null;
}

/**
 * Builds an array of extensions to match against. Will always contain `[""]` at minimum.
 *
 * @param {string | Array<string> | ExtensionMap | null} [exts] The configured extensions.
 * @returns {Array<string>} All extensions to lookup.
 */
function createExtensionArray(exts) {
  if (isString(exts)) {
    return [exts];
  }

  if (Array.isArray(exts)) {
    const filteredExts = exts.filter(isString);
    return filteredExts.length > 0 ? filteredExts : [""];
  }

  if (isObject(exts)) {
    const extKeys = Object.keys(exts);
    return extKeys.length > 0 ? extKeys : [""];
  }

  return [""];
}

/**
 * Builds an object mapping of extensions to match against if provided as configuration.
 * Will always contain `{ "": null }` if an empty object is provided.
 *
 * @param {?} exts The configured extensions.
 * @returns {ExtensionMap | null} Object mapping of extensions if provided or `null` otherwise.
 */
function createExtensionMap(exts) {
  if (!isObject(exts)) {
    return null;
  }

  if (isEmpty(exts)) {
    return { "": null };
  }

  return exts;
}

/**
 * Creates a new object with values defaulted if not provided by `userObj`.
 *
 * @param {LookupConfig} [userObj] The user-provided object.
 * @param {LookupConfig} [defaultObj] An object providing default values.
 * @returns {LookupConfig} The new object with values defaulted.
 */
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

/**
 * Creates a new object by extracting exactly the matched key, or an empty object if no match.
 *
 * @param {{ [s: string]: *; }} map The original object to pick from.
 * @param {string} match The key to pick.
 * @returns {{ [s: string]: *; }} The new object with only the matched key, otherwise an empty object if no match.
 */
function pick(map, match) {
  const entries = Object.entries(map).filter(([key]) => key === match);
  return Object.fromEntries(entries);
}

/**
 * Determines in a value is a non-null, non-array object.
 *
 * @param {?} value The value to check.
 * @returns {value is {}} `true` if the value is a non-null, non-array object.
 */
function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Determines if an object has no keys.
 *
 * @param {object} object The object to check.
 * @returns {boolean} `true` if the object has no keys, otherwise `false`.
 */
function isEmpty(object) {
  return !Object.keys(object).length;
}

/**
 * Determines if a vale is a string or String object.
 *
 * @param {?} value The value to check.
 * @returns {value is string | String} `true` if the value is a string or String object, otherwise `false`.
 */
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
/**
 * Expands `~` and `~+` at the start of a file path to home or pwd respectively.
 *
 * @param {string} filepath The file path to expand.
 * @returns {string} A file path with `~` and `~+` expanded.
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
