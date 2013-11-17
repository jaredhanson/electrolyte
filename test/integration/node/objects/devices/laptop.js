function Laptop(keyboard, cpu) {
  this.keyboard = keyboard;
  this.cpu = cpu;
}
Laptop['@require'] = ['devices/input/keyboard', 'devices/cpu/x86'];

module.exports = Laptop;
