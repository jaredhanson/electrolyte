/**
 * Module dependencies.
 */
var express = require('express');

module.exports = function() {
  
  this.use(express.bodyParser());
  this.use(this.router);
  this.use(express.errorHandler());
  
}
