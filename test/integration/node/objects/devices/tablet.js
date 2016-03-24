
Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (cpu, screen) {
  return new Tablet(cpu, screen);
};

function Tablet(cpu, screen) {
  this.cpu = cpu;
  this.screen = screen;
}

exports['@require'] = ['devices/cpu/arm', 'devices/screen/touch'];

