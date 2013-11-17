function Server(cpu, chassis) {
  this.cpu = cpu;
  this.chassis = chassis;
}


exports = module.exports = function(cpu, chassis) {
  return new Server(cpu, chassis);
}
exports['@require'] = ['./cpu/x86', './chassis/2u'];