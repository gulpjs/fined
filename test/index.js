"use strict";

const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert");
const { describe, it } = require("node:test");

const cwd = process.cwd();
const isWindows = os.platform() === "win32";

const userHomeFile = require("./utils/get-userhome-file");
const symlinkedFiles = require("./utils/create-symlinks");

const fined = require("../");

if (isWindows) {
  // Workaround for differnce between path.resolve(winDrive) and process.cwd()
  process.chdir(process.cwd());
}

describe("Basic behaviors", function () {
  it("returns object when target file exists", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    const defaultObj = {
      name: "app",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when target file does not exist", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    const defaultObj = {
      name: "aaa",
      cwd: cwd,
    };

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("normalizes a string as 1st argument to an object", function () {
    const pathObj = "test/fixtures/fined";

    const defaultObj = {
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when both arguments are empty", function () {
    const pathObj = {};

    const defaultObj = {};

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when both arguments are null", function () {
    const pathObj = null;

    const defaultObj = null;

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats 1st argument as an empty object when it is invalid", function () {
    const pathObj = 123;

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when both arguments are invalid", function () {
    const pathObj = function () {
      return {
        path: "test/fixtures/fined",
        name: "app",
        extensions: [".json", ".js"],
        cwd: cwd,
        findUp: false,
      };
    };

    const defaultObj = true;

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("accepts paths with extensions already", function () {
    const pathObj = {
      path: "test/fixtures/fined/app.js",
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });

  it("only matches the extension specified in path", function () {
    const pathObj = {
      path: "test/fixtures/fined/appfile.js",
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });

  it("accepts name with extensions already", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    const defaultObj = {
      name: "app.js",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("only matches the extension specified in name", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    const defaultObj = {
      name: "appfile.js",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("only ignores the extension at the end of the path", function () {
    const pathObj = {
      path: "test/fixtures/fined/.js/app.js",
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/.js", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });

  it("appends extensions to path if path contains an extension not in the extensions array", function () {
    const pathObj = {
      path: "test/fixtures/fined/app.config",
    };

    const defaultObj = {
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/app.config.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("appends extensions to name if name contains an extension not in the extensions array", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      name: "app.config",
    };

    const defaultObj = {
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/app.config.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("matches a specific path even without extensions provided without extracting extension", function () {
    const pathObj = {
      path: "test/fixtures/fined/app.js",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/app.js"),
      extension: "",
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });

  it("matches a specific name even without extensions provided without extracting extension", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      name: "app.js",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/app.js"),
      extension: "",
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Argument defaulting", function () {
  it("does not default when 2nd argument is empty", function () {
    const pathObj = {
      name: "package",
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const defaultObj = {};

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults all properties when 1st argument is empty", function () {
    const pathObj = {};

    const defaultObj = {
      name: "package",
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults missing properties in 1st argument", function () {
    const pathObj = {
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    const defaultObj = {
      path: "fixtures/fined",
      extensions: [".json", ".js"],
      findUp: false,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults null properties in the 1st argument", function () {
    const pathObj = {
      name: null,
      path: null,
      extensions: null,
      cwd: null,
      findUp: null,
    };

    const defaultObj = {
      name: "package",
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not default when both arguments are complete", function () {
    const pathObj = {
      name: "README",
      path: ".",
      extensions: [".md", ".txt"],
      findUp: true,
      cwd: path.resolve(cwd, "test/fixtures"),
    };

    const defaultObj = {
      path: "fixtures/fined",
      extensions: [".json", ".js"],
      findUp: false,
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    const expected = {
      path: path.resolve(cwd, "README.md"),
      extension: ".md",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults everything if 1st argument is null", function () {
    const pathObj = null;

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores 2nd argument if it is null", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const defaultObj = null;

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores 2nd argument if it is invalid", function () {
    const pathObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    const defaultObj = 123;

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Properties: `path`", function () {
  it("defaults `path` when it is null", function () {
    const pathObj = {
      path: null,
    };

    const defaultObj = {
      path: "fixtures/fined",
      extensions: [".json", ".js"],
      findUp: false,
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when `path` is null after defaulting", function () {
    const pathObj = {
      path: null,
    };

    const defaultObj = {
      path: null,
      extensions: [".json", ".js"],
      findUp: false,
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to cwd + name + extension when `path` is an empty string", function () {
    const pathObj = {
      path: "",
    };

    const defaultObj = {
      extensions: [".json", ".js"],
      findUp: false,
      name: "package",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to cwd when `path` and `name` are empty strings", function () {
    const pathObj = {
      path: "",
      name: "",
    };

    const defaultObj = {
      extensions: [""],
      findUp: false,
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when `path` is an invalid type", function () {
    const pathObj = {
      path: function noop() {},
    };

    const defaultObj = {
      extensions: [".js", ".json"],
      findUp: false,
      name: "app",
      cwd: cwd,
    };

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves properly when `path` is a String object", function () {
    const pathObj = {
      path: new String("test/fixtures/fined"),
    };

    const defaultObj = {
      extensions: [".js", ".json"],
      findUp: false,
      name: "app",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      path: new String("test/fixtures/fined"),
    };

    const defaultObj2 = {
      extensions: ["", ".js", ".json"],
      findUp: false,
      name: null,
      cwd: cwd,
    };

    const expected2 = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("resolves `~` to homedir", function () {
    // ~
    const pathObj = {
      path: "~",
    };

    const defaultObj = {
      extensions: [userHomeFile.ext],
      findUp: false,
      name: userHomeFile.name,
      cwd: cwd,
    };

    const expected = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    // ~/xxx
    const pathObj2 = {
      path: "~/" + userHomeFile.name,
    };

    const defaultObj2 = {
      extensions: [userHomeFile.ext],
      findUp: false,
      name: null,
      cwd: cwd,
    };

    const expected2 = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);

    // ~xxx
    const pathObj3 = {
      path: "~" + userHomeFile.name,
    };

    const defaultObj3 = {
      extensions: [userHomeFile.ext],
      findUp: false,
      name: null,
      cwd: cwd,
    };

    const expected3 = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    const result3 = fined(pathObj3, defaultObj3);

    assert.deepStrictEqual(result3, expected3);
  });

  it("resolves `~+` to process.cwd()", function () {
    // ~+
    const pathObj = {
      path: "~+",
    };

    const defaultObj = {
      extensions: [".json"],
      findUp: false,
      name: "package",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    const expected = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    // ~+/xxx
    const pathObj2 = {
      path: "~+/package",
    };

    const defaultObj2 = {
      extensions: [".json"],
      findUp: false,
      name: "",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    const expected2 = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);

    // ~+xxx
    const pathObj3 = {
      path: "~+package",
    };

    const defaultObj3 = {
      extensions: [".json"],
      findUp: false,
      name: "",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    const expected3 = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    const result3 = fined(pathObj3, defaultObj3);

    assert.deepStrictEqual(result3, expected3);
  });

  it("ignores `cwd` when `path` is absolute", function () {
    const pathObj = {
      path: cwd,
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    const defaultObj = {
      extensions: [".json"],
      findUp: false,
      name: "package",
    };

    const expected = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it(
    "ignores `cwd` when `path` has a drive letter (Windows only)",
    { skip: !isWindows },
    function () {
      const winDrive = cwd.slice(0, 2);

      const pathObj = {
        path: winDrive + "test\\fixtures\\fined",
      };

      const defaultObj = {
        name: "app",
        findUp: false,
        extensions: [".js"],
      };

      const expected = {
        path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
        extension: ".js",
      };

      const result = fined(pathObj, defaultObj);

      assert.deepStrictEqual(result, expected);
    },
  );
});

describe("Properties: `name`", function () {
  it("ignores `name` when null", function () {
    const pathObj = {
      name: null,
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      extensions: [""],
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores `name` when it is an empty string", function () {
    const pathObj = {
      name: "",
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      extensions: [""],
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores `name` when it is an invalid type", function () {
    const pathObj = {
      name: 123,
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      extensions: [""],
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("searches for file with `name` when it is a String object", function () {
    const pathObj = {
      name: new String("app"),
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      extensions: [".js"],
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      name: new String("package"),
    };

    const defaultObj2 = {
      path: "",
      extensions: [".json"],
      cwd: cwd,
    };

    const expected2 = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("resolves `name` even when it is a directory", function () {
    const pathObj = {
      name: "fined",
    };

    const defaultObj = {
      path: "test/fixtures",
      extensions: [""],
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves `name` when it is an absolute path and `path` is empty", function () {
    const pathObj = {
      name: path.resolve(cwd, "test/fixtures/fined/app"),
    };

    const defaultObj = {
      path: "",
      extensions: [".js"],
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      name: path.join(userHomeFile.dir, userHomeFile.name),
    };

    const defaultObj2 = {
      path: "",
      extensions: [userHomeFile.ext],
      cwd: cwd,
    };

    const expected2 = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns null when `name` is an absolute path but `path` is not empty", function () {
    const pathObj = {
      name: path.resolve(cwd, "test/fixtures/fined/app"),
      path: "test/fixtures/fined",
    };

    const defaultObj = {
      extensions: [".js"],
      cwd: cwd,
    };

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("will not expand `~` as part of `name`", function () {
    const pathObj = {
      name: "~/" + userHomeFile.name,
    };

    const defaultObj = {
      path: "",
      extensions: [userHomeFile.ext],
      cwd: cwd,
    };

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Properties: `extensions`", function () {
  it("resolves to the extension if it is a string", function () {
    const pathObj = {
      extensions: ".js",
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to the first found extension if it is an array", function () {
    const pathObj = {
      extensions: [".json", ".txt", ".js"],
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to the first found extension if it is an object", function () {
    const pathObj = {
      extensions: {
        ".json": 1,
        ".js": 2,
        ".txt": 3,
        ".yml": 4,
      },
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: { ".js": 2 },
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to the first found extension if multiple match", function () {
    const pathObj = {
      extensions: [".json", ".js"],
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      extensions: [".js", ".json"],
    };

    const defaultObj2 = {
      path: "test/fixtures/fined",
      name: "appfile",
      cwd: cwd,
    };

    const expected2 = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.js"),
      extension: ".js",
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("treats a null value as an empty array", function () {
    const pathObj = {
      extensions: null,
    };

    const defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty string value as an empty array", function () {
    const pathObj = {
      extensions: "",
    };

    const defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty array as an empty array", function () {
    const pathObj = {
      extensions: [],
    };

    const defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty object as an object with only key being an empty string", function () {
    const pathObj = {
      extensions: {},
    };

    const defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: { "": null },
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an invalid type as an empty array", function () {
    const pathObj = {
      extensions: 123,
    };

    const defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("supports String objects", function () {
    const pathObj = {
      extensions: [new String(".json"), new String(".js")],
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: new String(".js"),
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    const exts = {};
    exts[new String(".json")] = 1;
    exts[new String(".js")] = 2;

    const pathObj2 = {
      extensions: exts,
    };

    const defaultObj2 = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    const expected2 = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: { ".js": 2 },
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });
});

describe("Properties: `cwd`", function () {
  it("can be absolute", function () {
    const pathObj = {
      cwd: path.resolve("."),
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    const expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("can be relative", function () {
    const pathObj = {
      cwd: ".",
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    const expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      cwd: "test/fixtures",
    };

    const defaultObj2 = {
      path: "fined",
      name: "appfile",
      extensions: ".js",
    };

    const expected2 = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    const result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("treats a null value as `.`", function () {
    const pathObj = {
      cwd: null,
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    const expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty string as `.`", function () {
    const pathObj = {
      cwd: "",
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    const expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an invalid type as `.`", function () {
    const pathObj = {
      cwd: 123,
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    const expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("supports String objects", function () {
    const pathObj = {
      cwd: new String(cwd),
    };

    const defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("expands `~` to homedir", function () {
    const pathObj = {
      cwd: "~",
    };

    const defaultObj = {
      path: "",
      name: userHomeFile.name,
      extensions: userHomeFile.ext,
    };

    const expected = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Properties: `findUp`", function () {
  it("finds a file up in the tree", function () {
    const pathObj = {
      path: "",
      findUp: true,
    };

    const defaultObj = {
      name: "README",
      extensions: [".md"],
      cwd: "test/fixtures/fined",
    };

    const expected = {
      path: path.resolve(cwd, "README.md"),
      extension: ".md",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("finds a directory up in the tree", function () {
    const pathObj = {
      path: "",
      findUp: true,
    };

    const defaultObj = {
      name: "test",
      extensions: [".md", ""],
      cwd: "fixtures/fined",
    };

    const expected = {
      path: path.resolve(cwd, "test"),
      extension: "",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not search up the tree if file exists in cwd", function () {
    const pathObj = {
      path: "",
      extensions: ".json",
      findUp: true,
    };

    const defaultObj = {
      name: "package",
      cwd: "test/fixtures/fined",
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not search up the tree if `path` is absolute", function () {
    const pathObj = {
      findUp: true,
      path: path.resolve(cwd, "test"),
      extensions: ".md",
    };

    const defaultObj = {
      name: "README",
      cwd: path.resolve(cwd, "test"),
    };

    const expected = null;

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it(
    "does not search up the tree if `cwd` has a drive letter (Windows only)",
    { skip: !isWindows },
    function () {
      const winDrive = cwd.slice(0, 2);

      const pathObj = {
        findUp: true,
        name: "package",
        path: "",
        cwd: winDrive + "test\\fixtures",
        extensions: ".json",
      };

      const defaultObj = {};

      const expected = {
        path: path.resolve(cwd, "package.json"),
        extension: ".json",
      };

      const result = fined(pathObj, defaultObj);

      assert.deepStrictEqual(result, expected);
    },
  );

  it("does not search up the tree any more if file with another extension candidate exists", function () {
    const pathObj = {
      findUp: true,
      path: ".",
      extensions: [".js", ".json"],
    };

    const defaultObj = {
      name: "index",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    const expected = {
      path: path.resolve(cwd, "test/fixtures/fined/index.json"),
      extension: ".json",
    };

    const result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Symbolic links", function () {
  it("returns symlink path when found link points to a file", function () {
    const pathObj = {
      path: ".",
      name: symlinkedFiles[0].name,
      extensions: [symlinkedFiles[0].ext],
      cwd: symlinkedFiles[0].dir,
    };

    const expected = {
      path: symlinkedFiles[0].path,
      extension: symlinkedFiles[0].ext,
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      path: ".",
      name: symlinkedFiles[1].name,
      extensions: [symlinkedFiles[1].ext],
      cwd: symlinkedFiles[1].dir,
    };

    const expected2 = {
      path: symlinkedFiles[1].path,
      extension: symlinkedFiles[1].ext,
    };

    const result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns symlink path when found link points to a directory", function () {
    const pathObj = {
      path: ".",
      name: symlinkedFiles[4].name,
      extensions: [symlinkedFiles[4].ext],
      cwd: symlinkedFiles[4].dir,
    };

    const expected = {
      path: symlinkedFiles[4].path,
      extension: symlinkedFiles[4].ext,
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      path: ".",
      name: symlinkedFiles[5].name,
      extensions: [symlinkedFiles[5].ext],
      cwd: symlinkedFiles[5].dir,
    };

    const expected2 = {
      path: symlinkedFiles[5].path,
      extension: symlinkedFiles[5].ext,
    };

    const result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns null when found link is an invalid symlink", function () {
    const pathObj = {
      path: ".",
      name: symlinkedFiles[2].name,
      extensions: [symlinkedFiles[2].ext],
      cwd: symlinkedFiles[2].dir,
    };

    const expected = null;

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      path: ".",
      name: symlinkedFiles[3].name,
      extensions: [symlinkedFiles[3].ext],
      cwd: symlinkedFiles[3].dir,
    };

    const expected2 = null;

    const result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns symlink path during findUp when symlink points to a file", function () {
    const pathObj = {
      path: path.basename(symlinkedFiles[0].dir),
      name: symlinkedFiles[0].name,
      extensions: [symlinkedFiles[0].ext],
      cwd: symlinkedFiles[0].dir,
      findUp: true,
    };

    const expected = {
      path: symlinkedFiles[0].path,
      extension: symlinkedFiles[0].ext,
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      path: path.basename(symlinkedFiles[1].dir),
      name: symlinkedFiles[1].name,
      extensions: [symlinkedFiles[1].ext],
      cwd: symlinkedFiles[1].dir,
      findUp: true,
    };

    const expected2 = {
      path: symlinkedFiles[1].path,
      extension: symlinkedFiles[1].ext,
    };

    const result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns symlink path during findUp when symlink points to a directory", function () {
    const pathObj = {
      path: path.basename(symlinkedFiles[4].dir),
      name: symlinkedFiles[4].name,
      extensions: [symlinkedFiles[4].ext],
      cwd: symlinkedFiles[4].dir,
      findUp: true,
    };

    const expected = {
      path: symlinkedFiles[4].path,
      extension: symlinkedFiles[4].ext,
    };

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      path: path.basename(symlinkedFiles[5].dir),
      name: symlinkedFiles[5].name,
      extensions: [symlinkedFiles[5].ext],
      cwd: symlinkedFiles[5].dir,
      findUp: true,
    };

    const expected2 = {
      path: symlinkedFiles[5].path,
      extension: symlinkedFiles[5].ext,
    };

    const result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns null during findUp when symlink is invalid", function () {
    const pathObj = {
      path: path.basename(symlinkedFiles[2].dir),
      name: symlinkedFiles[2].name,
      extensions: [symlinkedFiles[2].ext],
      cwd: symlinkedFiles[2].dir,
      findUp: true,
    };

    const expected = null;

    const result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    const pathObj2 = {
      path: path.basename(symlinkedFiles[3].dir),
      name: symlinkedFiles[3].name,
      extensions: [symlinkedFiles[3].ext],
      cwd: symlinkedFiles[3].dir,
      findUp: true,
    };

    const expected2 = null;

    const result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });
});
