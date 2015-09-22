var loopback = require('loopback');
var loopbackConsole = require('../../..');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  if (loopbackConsole.activated()) {
    loopbackConsole.start(app, {
      prompt: 'sample-app > ',
      // other REPL or loopback-console config goes here
    }, function (err, ctx) {
      // Perform post-boot operations here
    });
  } else if (require.main === module) {
    app.start();
  }
});
