'use strict';

var path = require('path');
var testrun = require('testrun').mocha;

var cwd = process.cwd();
var winDrive = testrun.byPlatform({ win32: cwd.slice(0, 2), otherwise: '' });

var userHomeFile = require('./fixtures/fined/get_userhomefile');
var symlinkedFiles = require('./fixtures/fined/create_symlinks');


var fined = require('../');

function testfn(testcase) {
  return fined(testcase.pathObj, testcase.defaultObj);
}

testrun('fined:', testfn, [
  {
    name: 'About basic behaviors',
    cases: [
      {
        name: 'When target file exists',
        pathObj: {
          path: 'test/fixtures/fined',
          extensions: ['.json', '.js'],
        },
        defaultObj: {
          name: 'app',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When target file does not exist => null',
        pathObj: {
          path: 'test/fixtures/fined',
          extensions: ['.json', '.js'],
        },
        defaultObj: {
          name: 'aaa',
          cwd: cwd,
        },
        expected: null,
      },
    ],
  },
  {
    name: 'About that 2nd argument supplements 1st argument',
    cases: [
      {
        name: 'When 1st argument is full',
        pathObj: {
          name: 'package',
          path: 'test/fixtures/fined',
          extensions: ['.json', '.js'],
          cwd: cwd,
          findUp: false,
        },
        defaultObj: {},
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When 1st argument is empty and 2nd argument is null',
        pathObj: {},
        defaultObj: {
          name: 'package',
          path: 'test/fixtures/fined',
          extensions: ['.json', '.js'],
          cwd: cwd,
          findUp: false,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When 1st argument lacks some properties',
        pathObj: {
          name: 'app',
          cwd: path.resolve(cwd, 'test'),
        },
        defaultObj: {
          path: 'fixtures/fined',
          extensions: ['.json', '.js'],
          findUp: false,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When both 1st and 2nd arguments are full',
        pathObj: {
          name: 'README',
          path: '.',
          extensions: ['.md', '.txt'],
          findUp: true,
          cwd: path.resolve(cwd, 'test/fixtures'),
        },
        defaultObj: {
          path: 'fixtures/fined',
          extensions: ['.json', '.js'],
          findUp: false,
          name: 'app',
          cwd: path.resolve(cwd, 'test'),
        },
        expected: {
          path: path.resolve(cwd, 'README.md'),
          extension: '.md',
        },
      },
      {
        name: 'When both 1st and 2nd arguments are empty => null',
        pathObj: {},
        defaultObj: {},
        expected: null,
      },
      {
        name: 'When 1st argument is a string : 1st arg. is treated as ' +
              '{path: arg}',
        pathObj: 'test/fixtures/fined',
        defaultObj: {
          name: 'app',
          extensions: ['.json', '.js'],
          cwd: cwd,
          findUp: false,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When 1st arguments is null => null',
        pathObj: null,
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          extensions: ['.json', '.js'],
          cwd: cwd,
          findUp: false,
        },
        expected: null,
      },
      {
        name: 'When 2nd arguments is null : 2nd argument is ignored',
        pathObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          extensions: ['.json', '.js'],
          cwd: cwd,
          findUp: false,
        },
        defaultObj: null,
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When both 1st and 2nd arguments is null => null',
        pathObj: null,
        defaultObj: null,
        expected: null,
      },
      {
        name: 'When 1st argument is illegal type => null',
        pathObj: 123,
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          extensions: ['.json', '.js'],
          cwd: cwd,
          findUp: false,
        },
        expected: null,
      },
      {
        name: 'When 2nd argument is illegal type : 2nd argument is ignored',
        pathObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          extensions: ['.json', '.js'],
          cwd: cwd,
          findUp: false,
        },
        defaultObj: 123,
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When both 1st and 2nd arguments are illegal types => null',
        pathObj: function() {
          return {
            path: 'test/fixtures/fined',
            name: 'app',
            extensions: ['.json', '.js'],
            cwd: cwd,
            findUp: false,
          };
        },
        defaultObj: true,
        expected: null,
      },
    ],
  },
  {
    name: 'About property \'path\'',
    cases: [
      {
        name: 'When \'path\' is null => null',
        pathObj: {
          path: null,
        },
        defaultObj: {
          path: 'fixtures/fined',
          extensions: ['.json', '.js'],
          findUp: false,
          name: 'app',
          cwd: path.resolve(cwd, 'test'),
        },
        expected: null,
      },
      {
        name: 'When \'path\' is an empty string',
        pathObj: {
          path: '',
        },
        defaultObj: {
          extensions: ['.json', '.js'],
          findUp: false,
          name: 'package',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When \'path\' and \'name\' is an empty string',
        pathObj: {
          path: '',
          name: '',
        },
        defaultObj: {
          extensions: [''],
          findUp: false,
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd),
          extension: '',
        },
      },
      {
        name: 'When \'path\' is not a string => null',
        pathObj: {
          path: function() {
            return 'test/fixtures/fined';
          },
        },
        defaultObj: {
          extensions: ['.js', '.json'],
          findUp: false,
          name: 'app',
          cwd: cwd,
        },
        expected: null,
      },
      {
        name: 'When \'path\' is a String object',
        pathObj: new String('test/fixtures/fined'),
        defaultObj: {
          extensions: ['.js', '.json'],
          findUp: false,
          name: 'app',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'path\' is a String object (2)',
        pathObj: new String('test/fixtures/fined'),
        defaultObj: {
          extensions: ['', '.js', '.json'],
          findUp: false,
          name: null,
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined'),
          extension: '',
        },
      },
      {
        name: 'When \'path\' is \'~\' : expands \'~\' to homedir',
        pathObj: {
          path: '~',
        },
        defaultObj: {
          extensions: [userHomeFile.ext],
          findUp: false,
          name: userHomeFile.name,
          cwd: cwd,
        },
        expected: {
          path: userHomeFile.path,
          extension: userHomeFile.ext,
        },
      },
      {
        name: 'When \'path\' is \'~/xxx\' : expands \'~\' to homedir',
        pathObj: {
          path: '~/' + userHomeFile.name,
        },
        defaultObj: {
          extensions: [userHomeFile.ext],
          findUp: false,
          name: null,
          cwd: cwd,
        },
        expected: {
          path: userHomeFile.path,
          extension: userHomeFile.ext,
        },
      },
      {
        name: 'When \'path\' is \'~xxx\' : expands \'~\' to homedir',
        pathObj: {
          path: '~' + userHomeFile.name,
        },
        defaultObj: {
          extensions: [userHomeFile.ext],
          findUp: false,
          name: null,
          cwd: cwd,
        },
        expected: {
          path: userHomeFile.path,
          extension: userHomeFile.ext,
        },
      },
      {
        name: 'When \'path\' is \'~+\' : expands \'~+\' to process.cwd()',
        pathObj: {
          path: '~+',
        },
        defaultObj: {
          extensions: ['.json'],
          findUp: false,
          name: 'package',
          cwd: path.resolve(cwd, 'test/fixtures/fined'),
        },
        expected: {
          path: path.resolve(cwd, 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When \'path\' is \'~+/xxx\' : expands \'~+\' to process.cwd()',
        pathObj: {
          path: '~+/package',
        },
        defaultObj: {
          extensions: ['.json'],
          findUp: false,
          name: '',
          cwd: path.resolve(cwd, 'test/fixtures/fined'),
        },
        expected: {
          path: path.resolve(cwd, 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When \'path\' is \'~+xxx\' : expands \'~+\' to process.cwd()',
        pathObj: {
          path: '~+package',
        },
        defaultObj: {
          extensions: ['.json'],
          findUp: false,
          name: '',
          cwd: path.resolve(cwd, 'test/fixtures/fined'),
        },
        expected: {
          path: path.resolve(cwd, 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When \'path\' is absolute : not use \'cwd\' property',
        pathObj: {
          path: cwd,
          cwd: path.resolve(cwd, 'test/fixtures/fined'),
        },
        defaultObj: {
          extensions: ['.json'],
          findUp: false,
          name: 'package',
        },
        expected: {
          path: path.resolve(cwd, 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When \'path\' is \'C:xxx\' (for Windows)',
        pathObj: {
          path: winDrive + 'test\\fixtures\\fined',
        },
        defaultObj: {
          name: 'app',
          findUp: false,
          extensions: ['.js'],
        },
        expected: testrun.byPlatform({ otherwise: null, win32: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        }, }),
      },
    ],
  },
  {
    name: 'About property \'name\'',
    cases: [
      {
        name: 'When \'name\' is null : ignored and use only \'path\'',
        pathObj: {
          name: null,
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          extensions: [''],
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined'),
          extension: '',
        },
      },
      {
        name: 'When \'name\' is an empty string : ' +
              'ignored and use only \'path\'',
        pathObj: {
          name: '',
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          extensions: [''],
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined'),
          extension: '',
        },
      },
      {
        name: 'When \'name\' is not a string : ignored and use only \'path\'',
        pathObj: {
          name: 123,
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          extensions: [''],
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined'),
          extension: '',
        },
      },
      {
        name: 'When \'name\' is a String object',
        pathObj: {
          name: new String('app'),
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          extensions: ['.js'],
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'name\' is a String object (2)',
        pathObj: {
          name: new String('package'),
        },
        defaultObj: {
          path: '',
          extensions: ['.json'],
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'package.json'),
          extension: '.json',
        },
      },
      {
        name: 'When \'name\' indicates a directory',
        pathObj: {
          name: 'fined',
        },
        defaultObj: {
          path: 'test/fixtures',
          extensions: [''],
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures', 'fined'),
          extension: '',
        },
      },
      {
        name: 'When \'name\' is an absolute path and \'path\' is empty',
        pathObj: {
          name: path.resolve(cwd, 'test/fixtures/fined/app'),
        },
        defaultObj: {
          path: '',
          extensions: ['.js'],
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined/app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'name\' is an absolute path and \'path\' is not empty',
        pathObj: {
          name: path.resolve(cwd, 'test/fixtures/fined/app'),
          path: 'test/fixtures/fined',
        },
        defaultObj: {
          extensions: ['.js'],
          cwd: cwd,
        },
        expected: null,
      },
      {
        name: 'When \'name\' is an absolute path and \'path\' is empty (2)',
        pathObj: {
          name: path.join(userHomeFile.dir, userHomeFile.name),
        },
        defaultObj: {
          path: '',
          extensions: [userHomeFile.ext],
          cwd: cwd,
        },
        expected: {
          path: userHomeFile.path,
          extension: userHomeFile.ext,
        },
      },
      {
        name: 'When \'name\' has \'~\' : not expanded',
        pathObj: {
          name: '~/' + userHomeFile.name,
        },
        defaultObj: {
          path: '',
          extensions: [userHomeFile.ext],
          cwd: cwd,
        },
        expected: null,
      },
    ],
  },
  {
    name: 'About property \'extensions\'',
    cases: [
      {
        name: 'When \'extensions\' is a string',
        pathObj: {
          extensions: '.js',
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'extensions\' is an array',
        pathObj: {
          extensions: ['.json', '.txt', '.js'],
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'extensions\' is an object',
        pathObj: {
          extensions: {
            '.json': 1,
            '.js': 2,
            '.txt': 3,
            '.yml': 4,
          },
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: { '.js': 2 },
        },
      },
      {
        name: 'When multiple extensions hit : adopt first hitting extension',
        pathObj: {
          extensions: ['.json', '.js'],
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'appfile.json'),
          extension: '.json',
        },
      },
      {
        name: 'When multiple extensions hit (2) ',
        pathObj: {
          extensions: ['.js', '.json'],
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'extensions\' is null : treated as [\'\']',
        pathObj: {
          extensions: null,
        },
        defaultObj: {
          path: 'test/fixtures',
          name: 'fined',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures', 'fined'),
          extension: '',
        },
      },
      {
        name: 'When \'extensions\' is an empty string : treated as [\'\']',
        pathObj: {
          extensions: '',
        },
        defaultObj: {
          path: 'test/fixtures',
          name: 'fined',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures', 'fined'),
          extension: '',
        },
      },
      {
        name: 'When \'extensions\' is an empty array : treated as [\'\']',
        pathObj: {
          extensions: [],
        },
        defaultObj: {
          path: 'test/fixtures',
          name: 'fined',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures', 'fined'),
          extension: '',
        },
      },
      {
        name: 'When \'extensions\' is an empty object : ' +
              'treated as {\'\':null}',
        pathObj: {
          extensions: {},
        },
        defaultObj: {
          path: 'test/fixtures',
          name: 'fined',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures', 'fined'),
          extension: { '': null },
        },
      },
      {
        name: 'When \'extensions\' is illegal type : treated as [\'\']',
        pathObj: {
          extensions: 123,
        },
        defaultObj: {
          path: 'test/fixtures',
          name: 'fined',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures', 'fined'),
          extension: '',
        },
      },
      {
        name: 'When \'extensions\' elements are String objects',
        pathObj: {
          extensions: [new String('.json'), new String('.js')],
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'extensions\' property key are String objects',
        pathObj: {
          extensions: (function() {
            var exts = {};
            exts[new String('.json')] = 1;
            exts[new String('.js')] = 2;
            return exts;
          }()),
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'app',
          cwd: cwd,
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'app.js'),
          extension: { '.js': 2 },
        },
      },
    ],
  },
  {
    name: 'About property \'cwd\'',
    cases: [
      {
        name: 'When \'cwd\' is absolute',
        pathObj: {
          cwd: path.resolve('.'),
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          extensions: '.js',
        },
        expected: {
          path: path.resolve('.', 'test/fixtures/fined/appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'cwd\' is relative',
        pathObj: {
          cwd: '.',
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          extensions: '.js',
        },
        expected: {
          path: path.resolve('.', 'test/fixtures/fined/appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'cwd\' is relative (2)',
        pathObj: {
          cwd: 'test/fixtures',
        },
        defaultObj: {
          path: 'fined',
          name: 'appfile',
          extensions: '.js',
        },
        expected: {
          path: path.resolve('.', 'test/fixtures/fined/appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'cwd\' is null : treated as \'.\'',
        pathObj: {
          cwd: null,
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          extensions: '.js',
        },
        expected: {
          path: path.resolve('.', 'test/fixtures/fined/appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'cwd\' is empty string : treated as \'.\'',
        pathObj: {
          cwd: '',
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          extensions: '.js',
        },
        expected: {
          path: path.resolve('.', 'test/fixtures/fined/appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'cwd\' is not a string : treated as \'.\'',
        pathObj: {
          cwd: 123,
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          extensions: '.js',
        },
        expected: {
          path: path.resolve('.', 'test/fixtures/fined/appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'cwd\' is a String object',
        pathObj: {
          cwd: new String(cwd),
        },
        defaultObj: {
          path: 'test/fixtures/fined',
          name: 'appfile',
          extensions: '.js',
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined/appfile.js'),
          extension: '.js',
        },
      },
      {
        name: 'When \'cwd\' has \'~\' : expanded \'~\' to homedir',
        pathObj: {
          cwd: '~',
        },
        defaultObj: {
          path: '',
          name: userHomeFile.name,
          extensions: userHomeFile.ext,
        },
        expected: {
          path: userHomeFile.path,
          extension: userHomeFile.ext,
        },
      },
    ],
  },
  {
    name: 'About property \'findUp\'',
    cases: [
      {
        name: 'find up a file',
        pathObj: {
          path: '',
          findUp: true,
        },
        defaultObj: {
          name: 'README',
          extensions: ['.md'],
          cwd: 'test/fixtures/fined',
        },
        expected: {
          path: path.resolve(cwd, 'README.md'),
          extension: '.md',
        },
      },
      {
        name: 'find up a directory',
        pathObj: {
          path: '',
          findUp: true,
        },
        defaultObj: {
          name: 'test',
          extensions: ['.md', ''],
          cwd: 'fixtures/fined',
        },
        expected: {
          path: path.resolve(cwd, 'test'),
          extension: '',
        },
      },
      {
        name: 'target file exists current directory',
        pathObj: {
          path: '',
          extensions: '.json',
          findUp: true,
        },
        defaultObj: {
          name: 'package',
          cwd: 'test/fixtures/fined',
        },
        expected: {
          path: path.resolve(cwd, 'test/fixtures/fined', 'package.json'),
          extension: '.json',
        },
      },
      {
        name: '\'path\' is absolute : findup is disabled.',
        pathObj: {
          findUp: true,
          path: path.resolve(cwd, 'test'),
          extensions: '.md',
        },
        defaultObj: {
          name: 'README',
          cwd: path.resolve(cwd, 'test'),
        },
        expected: null,
      },
      {
        name: '\'cwd\' is \'C:xxx\\yyy\' (for Windows)',
        pathObj: {
          findUp: true,
          name: 'package',
          path: '',
          cwd: 'C:test\\fixtures',
          extensions: '.json',
        },
        defaultObj: {},
        expected: {
          path: path.resolve(cwd, 'package.json'),
          extension: '.json',
        },
      },
    ],
  },
  {
    name: 'About symbolic link',
    cases: [
      {
        name: 'When hit file is a symbolic link of a normal file',
        pathObj: {
          path: '.',
          name: symlinkedFiles[0].name,
          extensions: [symlinkedFiles[0].ext],
          cwd: symlinkedFiles[0].dir,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[0].path,
          extension: symlinkedFiles[0].ext,
        },
      },
      {
        name: 'When hit file is a symbolic link of a normal file (2)',
        pathObj: {
          path: '.',
          name: symlinkedFiles[1].name,
          extensions: [symlinkedFiles[1].ext],
          cwd: symlinkedFiles[1].dir,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[1].path,
          extension: symlinkedFiles[1].ext,
        },
      },
      {
        name: 'When hit file is a invalid symblic link => null',
        pathObj: {
          path: '.',
          name: symlinkedFiles[2].name,
          extensions: [symlinkedFiles[2].ext],
          cwd: symlinkedFiles[2].dir,
        },
        defaultObj: {},
        expected: null,
      },
      {
        name: 'When hit file is a invalid symblic link (2) => null',
        pathObj: {
          path: '.',
          name: symlinkedFiles[3].name,
          extensions: [symlinkedFiles[3].ext],
          cwd: symlinkedFiles[3].dir,
        },
        defaultObj: {},
        expected: null,
      },
      {
        name: 'When hit file is a symbolic link of a directory',
        pathObj: {
          path: '.',
          name: symlinkedFiles[4].name,
          extensions: [symlinkedFiles[4].ext],
          cwd: symlinkedFiles[4].dir,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[4].path,
          extension: symlinkedFiles[4].ext,
        },
      },
      {
        name: 'When hit file is a symbolic link of a directory (2)',
        pathObj: {
          path: '.',
          name: symlinkedFiles[5].name,
          extensions: [symlinkedFiles[5].ext],
          cwd: symlinkedFiles[5].dir,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[5].path,
          extension: symlinkedFiles[5].ext,
        },
      },
      {
        name: 'When finding up a symbolic link file',
        pathObj: {
          path: path.basename(symlinkedFiles[0].dir),
          name: symlinkedFiles[0].name,
          extensions: [symlinkedFiles[0].ext],
          cwd: symlinkedFiles[0].dir,
          findUp: true,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[0].path,
          extension: symlinkedFiles[0].ext,
        },
      },
      {
        name: 'When finding up a symbolic link file (2)',
        pathObj: {
          path: path.basename(symlinkedFiles[1].dir),
          name: symlinkedFiles[1].name,
          extensions: [symlinkedFiles[1].ext],
          cwd: symlinkedFiles[1].dir,
          findUp: true,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[1].path,
          extension: symlinkedFiles[1].ext,
        },
      },
      {
        name: 'When finding up an invalid symbolic link file => null',
        pathObj: {
          path: path.basename(symlinkedFiles[2].dir),
          name: symlinkedFiles[2].name,
          extensions: [symlinkedFiles[2].ext],
          cwd: symlinkedFiles[2].dir,
          findUp: true,
        },
        defaultObj: {},
        expected: null,
      },
      {
        name: 'When finding up an invalid symbolic link file (2) => null',
        pathObj: {
          path: path.basename(symlinkedFiles[3].dir),
          name: symlinkedFiles[3].name,
          extensions: [symlinkedFiles[3].ext],
          cwd: symlinkedFiles[3].dir,
          findUp: true,
        },
        defaultObj: {},
        expected: null,
      },
      {
        name: 'When finding up a symbolic link file to a directory',
        pathObj: {
          path: path.basename(symlinkedFiles[4].dir),
          name: symlinkedFiles[4].name,
          extensions: [symlinkedFiles[4].ext],
          cwd: symlinkedFiles[4].dir,
          findUp: true,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[4].path,
          extension: symlinkedFiles[4].ext,
        },
      },
      {
        name: 'When finding up a symbolic link file to a directory (2)',
        pathObj: {
          path: path.basename(symlinkedFiles[5].dir),
          name: symlinkedFiles[5].name,
          extensions: [symlinkedFiles[5].ext],
          cwd: symlinkedFiles[5].dir,
          findUp: true,
        },
        defaultObj: {},
        expected: {
          path: symlinkedFiles[5].path,
          extension: symlinkedFiles[5].ext,
        },
      },
    ],
  },
]);
