/**
 * Module dependencies.
 */
var fs = require('fs')

// constants
var CONF_FILE = 'etc/conf.json';


/**
 * Initialize settings.
 *
 * This component configures the application's settings.
 */
exports = module.exports = function() {
  var settings = new Settings();

  settings.set('env', process.env.NODE_ENV || 'development');
  settings.set('title', 'To Do List')

  if (fs.existsSync(CONF_FILE)) {
    var data = fs.readFileSync(CONF_FILE, 'utf8');
    var json = JSON.parse(data);
    if (json.title) { settings.set('title', json.title); }
  }

  if (settings.get('env') == 'production') {
    settings.set('db host', 'db.example.com');
  } else {
    settings.set('db host', '127.0.0.1');
  }

  return settings;
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;




function Settings() {
  this._hash = {};
}

Settings.prototype.get = function(key) {
  return this._hash[key];
}

Settings.prototype.set = function(key, val) {
  this._hash[key] = val;
}
