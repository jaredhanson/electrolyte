function NumericKeyboard(keypad) {
  this.language = 'EN';
  this.keypad = keypad;
}
NumericKeyboard['@require'] = ['./keypad'];

NumericKeyboard.prototype.desc = function() {
  return this.language + '+' + this.keypad.layout;
}

module.exports = NumericKeyboard;
