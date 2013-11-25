/**
 * Module dependencies.
 */
var express = require('express');

/**
 * Initialize middleware.
 */
module.exports = function() {
  
  this.use(express.urlencoded());
  this.use(express.json());
  this.use(this.router);
  this.use(express.errorHandler());
  
}
