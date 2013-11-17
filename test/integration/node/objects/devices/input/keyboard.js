function Keyboard() {
  this.language = 'EN';
}

Keyboard.prototype.desc = function() {
  return this.language;
};

module.exports = Keyboard;
