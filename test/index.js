"use strict";

var os = require("os");
var path = require("path");
var assert = require("node:assert");
var { describe, it } = require("node:test");

var cwd = process.cwd();
var isWindows = os.platform() === "win32";

var userHomeFile = require("./utils/get-userhome-file");
var symlinkedFiles = require("./utils/create-symlinks");

var fined = require("../");

if (isWindows) {
  // Workaround for differnce between path.resolve(winDrive) and process.cwd()
  process.chdir(process.cwd());
}

describe("Basic behaviors", function () {
  it("returns object when target file exists", function () {
    var pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    var defaultObj = {
      name: "app",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when target file does not exist", function () {
    var pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    var defaultObj = {
      name: "aaa",
      cwd: cwd,
    };

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("normalizes a string as 1st argument to an object", function () {
    var pathObj = "test/fixtures/fined";

    var defaultObj = {
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when both arguments are empty", function () {
    var pathObj = {};

    var defaultObj = {};

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when both arguments are null", function () {
    var pathObj = null;

    var defaultObj = null;

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats 1st argument as an empty object when it is invalid", function () {
    var pathObj = 123;

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when both arguments are invalid", function () {
    var pathObj = function () {
      return {
        path: "test/fixtures/fined",
        name: "app",
        extensions: [".json", ".js"],
        cwd: cwd,
        findUp: false,
      };
    };

    var defaultObj = true;

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("accepts paths with extensions already", function () {
    var pathObj = {
      path: "test/fixtures/fined/app.js",
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });

  it("only matches the extension specified in path", function () {
    var pathObj = {
      path: "test/fixtures/fined/appfile.js",
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });

  it("accepts name with extensions already", function () {
    var pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    var defaultObj = {
      name: "app.js",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("only matches the extension specified in name", function () {
    var pathObj = {
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
    };

    var defaultObj = {
      name: "appfile.js",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("only ignores the extension at the end of the path", function () {
    var pathObj = {
      path: "test/fixtures/fined/.js/app.js",
      cwd: cwd,
      extensions: [".json", ".js"],
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined/.js", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Argument defaulting", function () {
  it("does not default when 2nd argument is empty", function () {
    var pathObj = {
      name: "package",
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var defaultObj = {};

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults all properties when 1st argument is empty", function () {
    var pathObj = {};

    var defaultObj = {
      name: "package",
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults missing properties in 1st argument", function () {
    var pathObj = {
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    var defaultObj = {
      path: "fixtures/fined",
      extensions: [".json", ".js"],
      findUp: false,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults null properties in the 1st argument", function () {
    var pathObj = {
      name: null,
      path: null,
      extensions: null,
      cwd: null,
      findUp: null,
    };

    var defaultObj = {
      name: "package",
      path: "test/fixtures/fined",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not default when both arguments are complete", function () {
    var pathObj = {
      name: "README",
      path: ".",
      extensions: [".md", ".txt"],
      findUp: true,
      cwd: path.resolve(cwd, "test/fixtures"),
    };

    var defaultObj = {
      path: "fixtures/fined",
      extensions: [".json", ".js"],
      findUp: false,
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    var expected = {
      path: path.resolve(cwd, "README.md"),
      extension: ".md",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("defaults everything if 1st argument is null", function () {
    var pathObj = null;

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores 2nd argument if it is null", function () {
    var pathObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var defaultObj = null;

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores 2nd argument if it is invalid", function () {
    var pathObj = {
      path: "test/fixtures/fined",
      name: "app",
      extensions: [".json", ".js"],
      cwd: cwd,
      findUp: false,
    };

    var defaultObj = 123;

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Properties: `path`", function () {
  it("defaults `path` when it is null", function () {
    var pathObj = {
      path: null,
    };

    var defaultObj = {
      path: "fixtures/fined",
      extensions: [".json", ".js"],
      findUp: false,
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when `path` is null after defaulting", function () {
    var pathObj = {
      path: null,
    };

    var defaultObj = {
      path: null,
      extensions: [".json", ".js"],
      findUp: false,
      name: "app",
      cwd: path.resolve(cwd, "test"),
    };

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to cwd + name + extension when `path` is an empty string", function () {
    var pathObj = {
      path: "",
    };

    var defaultObj = {
      extensions: [".json", ".js"],
      findUp: false,
      name: "package",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to cwd when `path` and `name` are empty strings", function () {
    var pathObj = {
      path: "",
      name: "",
    };

    var defaultObj = {
      extensions: [""],
      findUp: false,
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("returns null when `path` is an invalid type", function () {
    var pathObj = {
      path: function noop() {},
    };

    var defaultObj = {
      extensions: [".js", ".json"],
      findUp: false,
      name: "app",
      cwd: cwd,
    };

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves properly when `path` is a String object", function () {
    var pathObj = {
      path: new String("test/fixtures/fined"),
    };

    var defaultObj = {
      extensions: [".js", ".json"],
      findUp: false,
      name: "app",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      path: new String("test/fixtures/fined"),
    };

    var defaultObj2 = {
      extensions: ["", ".js", ".json"],
      findUp: false,
      name: null,
      cwd: cwd,
    };

    var expected2 = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("resolves `~` to homedir", function () {
    // ~
    var pathObj = {
      path: "~",
    };

    var defaultObj = {
      extensions: [userHomeFile.ext],
      findUp: false,
      name: userHomeFile.name,
      cwd: cwd,
    };

    var expected = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    // ~/xxx
    var pathObj2 = {
      path: "~/" + userHomeFile.name,
    };

    var defaultObj2 = {
      extensions: [userHomeFile.ext],
      findUp: false,
      name: null,
      cwd: cwd,
    };

    var expected2 = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);

    // ~xxx
    var pathObj3 = {
      path: "~" + userHomeFile.name,
    };

    var defaultObj3 = {
      extensions: [userHomeFile.ext],
      findUp: false,
      name: null,
      cwd: cwd,
    };

    var expected3 = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    var result3 = fined(pathObj3, defaultObj3);

    assert.deepStrictEqual(result3, expected3);
  });

  it("resolves `~+` to process.cwd()", function () {
    // ~+
    var pathObj = {
      path: "~+",
    };

    var defaultObj = {
      extensions: [".json"],
      findUp: false,
      name: "package",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    var expected = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    // ~+/xxx
    var pathObj2 = {
      path: "~+/package",
    };

    var defaultObj2 = {
      extensions: [".json"],
      findUp: false,
      name: "",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    var expected2 = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);

    // ~+xxx
    var pathObj3 = {
      path: "~+package",
    };

    var defaultObj3 = {
      extensions: [".json"],
      findUp: false,
      name: "",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    var expected3 = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    var result3 = fined(pathObj3, defaultObj3);

    assert.deepStrictEqual(result3, expected3);
  });

  it("ignores `cwd` when `path` is absolute", function () {
    var pathObj = {
      path: cwd,
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    var defaultObj = {
      extensions: [".json"],
      findUp: false,
      name: "package",
    };

    var expected = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores `cwd` when `path` has a drive letter (Windows only)", function () {
    if (!isWindows) {
      this.skip();
      return;
    }

    var winDrive = cwd.slice(0, 2);

    var pathObj = {
      path: winDrive + "test\\fixtures\\fined",
    };

    var defaultObj = {
      name: "app",
      findUp: false,
      extensions: [".js"],
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Properties: `name`", function () {
  it("ignores `name` when null", function () {
    var pathObj = {
      name: null,
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      extensions: [""],
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores `name` when it is an empty string", function () {
    var pathObj = {
      name: "",
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      extensions: [""],
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("ignores `name` when it is an invalid type", function () {
    var pathObj = {
      name: 123,
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      extensions: [""],
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("searches for file with `name` when it is a String object", function () {
    var pathObj = {
      name: new String("app"),
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      extensions: [".js"],
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      name: new String("package"),
    };

    var defaultObj2 = {
      path: "",
      extensions: [".json"],
      cwd: cwd,
    };

    var expected2 = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("resolves `name` even when it is a directory", function () {
    var pathObj = {
      name: "fined",
    };

    var defaultObj = {
      path: "test/fixtures",
      extensions: [""],
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves `name` when it is an absolute path and `path` is empty", function () {
    var pathObj = {
      name: path.resolve(cwd, "test/fixtures/fined/app"),
    };

    var defaultObj = {
      path: "",
      extensions: [".js"],
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined/app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      name: path.join(userHomeFile.dir, userHomeFile.name),
    };

    var defaultObj2 = {
      path: "",
      extensions: [userHomeFile.ext],
      cwd: cwd,
    };

    var expected2 = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns null when `name` is an absolute path but `path` is not empty", function () {
    var pathObj = {
      name: path.resolve(cwd, "test/fixtures/fined/app"),
      path: "test/fixtures/fined",
    };

    var defaultObj = {
      extensions: [".js"],
      cwd: cwd,
    };

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("will not expand `~` as part of `name`", function () {
    var pathObj = {
      name: "~/" + userHomeFile.name,
    };

    var defaultObj = {
      path: "",
      extensions: [userHomeFile.ext],
      cwd: cwd,
    };

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Properties: `extensions`", function () {
  it("resolves to the extension if it is a string", function () {
    var pathObj = {
      extensions: ".js",
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to the first found extension if it is an array", function () {
    var pathObj = {
      extensions: [".json", ".txt", ".js"],
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to the first found extension if it is an object", function () {
    var pathObj = {
      extensions: {
        ".json": 1,
        ".js": 2,
        ".txt": 3,
        ".yml": 4,
      },
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: { ".js": 2 },
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("resolves to the first found extension if multiple match", function () {
    var pathObj = {
      extensions: [".json", ".js"],
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      extensions: [".js", ".json"],
    };

    var defaultObj2 = {
      path: "test/fixtures/fined",
      name: "appfile",
      cwd: cwd,
    };

    var expected2 = {
      path: path.resolve(cwd, "test/fixtures/fined", "appfile.js"),
      extension: ".js",
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("treats a null value as an empty array", function () {
    var pathObj = {
      extensions: null,
    };

    var defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty string value as an empty array", function () {
    var pathObj = {
      extensions: "",
    };

    var defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty array as an empty array", function () {
    var pathObj = {
      extensions: [],
    };

    var defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty object as an object with only key being an empty string", function () {
    var pathObj = {
      extensions: {},
    };

    var defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: { "": null },
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an invalid type as an empty array", function () {
    var pathObj = {
      extensions: 123,
    };

    var defaultObj = {
      path: "test/fixtures",
      name: "fined",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures", "fined"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("supports String objects", function () {
    var pathObj = {
      extensions: [new String(".json"), new String(".js")],
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: new String(".js"),
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    var exts = {};
    exts[new String(".json")] = 1;
    exts[new String(".js")] = 2;

    var pathObj2 = {
      extensions: exts,
    };

    var defaultObj2 = {
      path: "test/fixtures/fined",
      name: "app",
      cwd: cwd,
    };

    var expected2 = {
      path: path.resolve(cwd, "test/fixtures/fined", "app.js"),
      extension: { ".js": 2 },
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });
});

describe("Properties: `cwd`", function () {
  it("can be absolute", function () {
    var pathObj = {
      cwd: path.resolve("."),
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    var expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("can be relative", function () {
    var pathObj = {
      cwd: ".",
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    var expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      cwd: "test/fixtures",
    };

    var defaultObj2 = {
      path: "fined",
      name: "appfile",
      extensions: ".js",
    };

    var expected2 = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    var result2 = fined(pathObj2, defaultObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("treats a null value as `.`", function () {
    var pathObj = {
      cwd: null,
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    var expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an empty string as `.`", function () {
    var pathObj = {
      cwd: "",
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    var expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("treats an invalid type as `.`", function () {
    var pathObj = {
      cwd: 123,
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    var expected = {
      path: path.resolve(".", "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("supports String objects", function () {
    var pathObj = {
      cwd: new String(cwd),
    };

    var defaultObj = {
      path: "test/fixtures/fined",
      name: "appfile",
      extensions: ".js",
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined/appfile.js"),
      extension: ".js",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("expands `~` to homedir", function () {
    var pathObj = {
      cwd: "~",
    };

    var defaultObj = {
      path: "",
      name: userHomeFile.name,
      extensions: userHomeFile.ext,
    };

    var expected = {
      path: userHomeFile.path,
      extension: userHomeFile.ext,
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Properties: `findUp`", function () {
  it("finds a file up in the tree", function () {
    var pathObj = {
      path: "",
      findUp: true,
    };

    var defaultObj = {
      name: "README",
      extensions: [".md"],
      cwd: "test/fixtures/fined",
    };

    var expected = {
      path: path.resolve(cwd, "README.md"),
      extension: ".md",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("finds a directory up in the tree", function () {
    var pathObj = {
      path: "",
      findUp: true,
    };

    var defaultObj = {
      name: "test",
      extensions: [".md", ""],
      cwd: "fixtures/fined",
    };

    var expected = {
      path: path.resolve(cwd, "test"),
      extension: "",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not search up the tree if file exists in cwd", function () {
    var pathObj = {
      path: "",
      extensions: ".json",
      findUp: true,
    };

    var defaultObj = {
      name: "package",
      cwd: "test/fixtures/fined",
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined", "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not search up the tree if `path` is absolute", function () {
    var pathObj = {
      findUp: true,
      path: path.resolve(cwd, "test"),
      extensions: ".md",
    };

    var defaultObj = {
      name: "README",
      cwd: path.resolve(cwd, "test"),
    };

    var expected = null;

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not search up the tree if `cwd` has a drive letter (Windows only)", function () {
    if (!isWindows) {
      this.skip();
      return;
    }

    var winDrive = cwd.slice(0, 2);

    var pathObj = {
      findUp: true,
      name: "package",
      path: "",
      cwd: winDrive + "test\\fixtures",
      extensions: ".json",
    };

    var defaultObj = {};

    var expected = {
      path: path.resolve(cwd, "package.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });

  it("does not search up the tree any more if file with another extension candidate exists", function () {
    var pathObj = {
      findUp: true,
      path: ".",
      extensions: [".js", ".json"],
    };

    var defaultObj = {
      name: "index",
      cwd: path.resolve(cwd, "test/fixtures/fined"),
    };

    var expected = {
      path: path.resolve(cwd, "test/fixtures/fined/index.json"),
      extension: ".json",
    };

    var result = fined(pathObj, defaultObj);

    assert.deepStrictEqual(result, expected);
  });
});

describe("Symbolic links", function () {
  it("returns symlink path when found link points to a file", function () {
    var pathObj = {
      path: ".",
      name: symlinkedFiles[0].name,
      extensions: [symlinkedFiles[0].ext],
      cwd: symlinkedFiles[0].dir,
    };

    var expected = {
      path: symlinkedFiles[0].path,
      extension: symlinkedFiles[0].ext,
    };

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      path: ".",
      name: symlinkedFiles[1].name,
      extensions: [symlinkedFiles[1].ext],
      cwd: symlinkedFiles[1].dir,
    };

    var expected2 = {
      path: symlinkedFiles[1].path,
      extension: symlinkedFiles[1].ext,
    };

    var result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns symlink path when found link points to a directory", function () {
    var pathObj = {
      path: ".",
      name: symlinkedFiles[4].name,
      extensions: [symlinkedFiles[4].ext],
      cwd: symlinkedFiles[4].dir,
    };

    var expected = {
      path: symlinkedFiles[4].path,
      extension: symlinkedFiles[4].ext,
    };

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      path: ".",
      name: symlinkedFiles[5].name,
      extensions: [symlinkedFiles[5].ext],
      cwd: symlinkedFiles[5].dir,
    };

    var expected2 = {
      path: symlinkedFiles[5].path,
      extension: symlinkedFiles[5].ext,
    };

    var result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns null when found link is an invalid symlink", function () {
    var pathObj = {
      path: ".",
      name: symlinkedFiles[2].name,
      extensions: [symlinkedFiles[2].ext],
      cwd: symlinkedFiles[2].dir,
    };

    var expected = null;

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      path: ".",
      name: symlinkedFiles[3].name,
      extensions: [symlinkedFiles[3].ext],
      cwd: symlinkedFiles[3].dir,
    };

    var expected2 = null;

    var result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns symlink path during findUp when symlink points to a file", function () {
    var pathObj = {
      path: path.basename(symlinkedFiles[0].dir),
      name: symlinkedFiles[0].name,
      extensions: [symlinkedFiles[0].ext],
      cwd: symlinkedFiles[0].dir,
      findUp: true,
    };

    var expected = {
      path: symlinkedFiles[0].path,
      extension: symlinkedFiles[0].ext,
    };

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      path: path.basename(symlinkedFiles[1].dir),
      name: symlinkedFiles[1].name,
      extensions: [symlinkedFiles[1].ext],
      cwd: symlinkedFiles[1].dir,
      findUp: true,
    };

    var expected2 = {
      path: symlinkedFiles[1].path,
      extension: symlinkedFiles[1].ext,
    };

    var result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns symlink path during findUp when symlink points to a directory", function () {
    var pathObj = {
      path: path.basename(symlinkedFiles[4].dir),
      name: symlinkedFiles[4].name,
      extensions: [symlinkedFiles[4].ext],
      cwd: symlinkedFiles[4].dir,
      findUp: true,
    };

    var expected = {
      path: symlinkedFiles[4].path,
      extension: symlinkedFiles[4].ext,
    };

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      path: path.basename(symlinkedFiles[5].dir),
      name: symlinkedFiles[5].name,
      extensions: [symlinkedFiles[5].ext],
      cwd: symlinkedFiles[5].dir,
      findUp: true,
    };

    var expected2 = {
      path: symlinkedFiles[5].path,
      extension: symlinkedFiles[5].ext,
    };

    var result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });

  it("returns null during findUp when symlink is invalid", function () {
    var pathObj = {
      path: path.basename(symlinkedFiles[2].dir),
      name: symlinkedFiles[2].name,
      extensions: [symlinkedFiles[2].ext],
      cwd: symlinkedFiles[2].dir,
      findUp: true,
    };

    var expected = null;

    var result = fined(pathObj);

    assert.deepStrictEqual(result, expected);

    var pathObj2 = {
      path: path.basename(symlinkedFiles[3].dir),
      name: symlinkedFiles[3].name,
      extensions: [symlinkedFiles[3].ext],
      cwd: symlinkedFiles[3].dir,
      findUp: true,
    };

    var expected2 = null;

    var result2 = fined(pathObj2);

    assert.deepStrictEqual(result2, expected2);
  });
});
