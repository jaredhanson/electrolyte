var pFilter = require('p-filter');

module.exports = function(components, filters) {
  return new Promise(function(resolve, reject) {
    var filteredComponents = components
      , i = 0;
  
    function next() {
      var filter = filters[i++];
      if (!filter) {
        return resolve(filteredComponents)
      }
      
      pFilter(components, filter)
        .then(function(components) {
          filteredComponents = components;
          next();
        });
        
      // TODO: error handing
    }
  
    next();
  });
};
