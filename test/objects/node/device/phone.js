function Phone(screen, cpu) {
  this.screen = screen;
  this.cpu = cpu;
}
Phone['@require'] = ['device/screen/touch', 'device/cpu/arm'];

Phone.prototype.dial = function(number) {
  return 'Dialing ' + number + '...';
}

module.exports = Phone;
