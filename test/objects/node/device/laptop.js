function Laptop(keyboard, cpu) {
  this.keyboard = keyboard;
  this.cpu = cpu;
}
Laptop['@require'] = ['device/input/keyboard', 'device/cpu/x86'];

module.exports = Laptop;
