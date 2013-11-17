function Phone(screen, cpu) {
  this.screen = screen;
  this.cpu = cpu;
}
Phone['@require'] = ['devices/screen/touch', 'devices/cpu/arm'];

Phone.prototype.dial = function(number) {
  return 'Dialing ' + number + '...';
}

module.exports = Phone;
