const execSync = require('child_process').execSync,
  packages = [
    'core',
    'manager'
  ];

packages.map(function (package) {
  const packagePath = `${__dirname}/../build/${package}`;
  execSync(`cd ${packagePath} && npm publish`);
});
