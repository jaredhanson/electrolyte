/**
 * Module dependencies.
 */
var express = require('express')
  , bootable = require('bootable');


/**
 * Initialize a bootable Express application.
 */
var app = bootable(express());
app.phase(require('bootable-environment')());
app.phase(bootable.initializers('etc/init', app));
app.phase(bootable.routes(__dirname + '/routes.js', app));

/**
 * Expose application.
 */
module.exports = app;
