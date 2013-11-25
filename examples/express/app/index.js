/**
 * Module dependencies.
 */
var http = require('http')
  , express = require('express')
  , bootable = require('bootable');


/**
 * Initialize a bootable Express application.
 */
var app = bootable(express());

// load environment-specific settings, if any
app.phase(require('bootable-environment')());
// execute initializers
app.phase(bootable.initializers('etc/init', app));
// draw routes
app.phase(bootable.routes(__dirname + '/routes.js', app));
// listen for HTTP requests
app.phase(function listen(done) {
  http.createServer(app).listen(3000, function(err) {
    if (err) { return done(err); }
    
    var addr = this.address();
    console.log('server listening on http://' + addr.address + ':' + addr.port);
    done();
  });
});

/**
 * Expose application.
 */
module.exports = app;
