function Desktop(keyboard, cpu, hdd) {
  this.keyboard = keyboard;
  this.cpu = cpu;
  this.hdd = hdd;
}
Desktop['@require'] = ['devices/input/numerickeyboard', 'devices/cpu/x86', './storage/hdd'];

module.exports = Desktop;
