var loopbackConsole = require('./console');

if (require.main === module) {
  var cwd = process.cwd();
  var appPath = process.argv[2] || 'server/server';

  var failBadPath = function () {
    console.error('Error: Loopback app not found at path '+appPath+'!');
    process.exit(1);
  };

  try {
    var app = require(cwd+'/'+appPath);
    if (!app.loopback) {
      failBadPath();
    }
    loopbackConsole.start(app);
  } catch(err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      failBadPath();
    } else {
      throw(err);
    }
  }
} else {
  module.exports = loopbackConsole;
}
