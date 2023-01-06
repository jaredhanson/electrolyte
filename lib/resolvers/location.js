exports = module.exports = function(C, comp) {
  
  console.log('*** ATTEMPTING LOCATIION LOOKUP ****');
  
  return C.create('http://i.bixbyjs.org/ns')
    .then(function(ns) {
      return new Promise(function(resolve, reject) {
        var name = comp.a['@name'];
        ns.resolve(name, 'SRV', function(err, addresses) {
          // hardcoded success
          //return resolve({ name: 'localhost', port: 6379 });
        
          if (err) { return reject(err); }
          // TODO: weighting and prio
          var address = addresses[0];
          return resolve(address);
        });
      });
    })
    
    /*
    .then(function() {
      // TODO: Catch error where bixby-ns is not available
      return Promise.reject('location unsupported');
    })
    */
  
  
  //return Promise.reject('location unsupported');
  
}