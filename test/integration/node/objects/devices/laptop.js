function Laptop(keyboard, cpu, hdd) {
  this.keyboard = keyboard;
  this.cpu = cpu;
  this.hdd = hdd;
}
Laptop['@require'] = ['devices/input/keyboard', 'devices/cpu/x86', './storage/hdd'];

module.exports = Laptop;
