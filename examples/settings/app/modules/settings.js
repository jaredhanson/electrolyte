function Settings() {
  this._hash = {};
}

Settings.prototype.get = function(key) {
  return this._hash[key];
};

Settings.prototype.set = function(key, val) {
  this._hash[key] = val;
};

module.exports = Settings;
