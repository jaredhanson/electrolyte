exports = module.exports = function CheckEnvironment(settings, action2) {
  return {
    check: function() {
      console.log('Your environment is: ' + settings.get('env'));
      console.log('Your app is called: ' + settings.get('title'));
    }
  };
};

exports['@singleton'] = true;
exports['@require'] = ['settings'];
