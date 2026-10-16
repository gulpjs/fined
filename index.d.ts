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
 * Find a file given configuration and defaults describing lookup behavior.
 *
 * @param {LookupConfig | string} [pathObj] The user-provided configuration for file lookup.
 * @param {LookupConfig} [defaultObj] Default configuration for file lookup.
 * @returns {Found | null} Information about the found file or `null` if it cannot be found.
 */
export default function fined(
  pathObj?: LookupConfig | string,
  defaultObj?: LookupConfig,
): Found | null;
/**
 * Object mapping of extensions to some value.
 */
export type ExtensionMap = {
  [extension: string]: any;
};
/**
 * Configuration used to lookup a file.
 */
export type LookupConfig = {
  /**
   * The base path to search within.
   */
  path?: string | null | undefined;
  /**
   * The name of the file without an extension.
   */
  name?: string | null | undefined;
  /**
   * The extensions the file being looked up may have.
   */
  extensions?: string | string[] | ExtensionMap | null | undefined;
  /**
   * The current working directory that `path + name` is resolved against.
   */
  cwd?: string | null | undefined;
  /**
   * Whether file lookup should recurse up the directory structure.
   */
  findUp?: boolean | null | undefined;
};
/**
 * Information about the found file.
 */
export type Found = {
  /**
   * The absolute path of the found file.
   */
  path: string;
  /**
   * The extension that matched from configured extensions.
   */
  extension: string | ExtensionMap;
};
/**
 * The expanded configuration after joining config & defaults and applying normalization.
 */
export type ExpandedConfig = {
  /**
   * The file basename to resolve.
   */
  path: string;
  /**
   * The root directory to resolve from.
   */
  basedir: string;
  /**
   * Whether file lookup should recurse up the directory structure.
   */
  findUp: boolean;
  /**
   * Array of extensions to lookup
   */
  extArr: string[];
  /**
   * Object mapping of extensions if provided by user.
   */
  extMap: ExtensionMap | null;
};
/**
 * Information about the found file without the {@link ExtensionMap} mapping.
 */
export type FoundFile = {
  /**
   * The absolute path of the found file.
   */
  path: string;
  /**
   * The extension that matched from configured extensions.
   */
  extension: string;
};
//# sourceMappingURL=index.d.ts.map
