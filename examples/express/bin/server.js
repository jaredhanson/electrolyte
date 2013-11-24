var app = require('../app');

app.boot(function(err) {
  if (err) {
    console.log(err.message);
    console.log(err.stack);
    return process.exit(-1);
  }

  app.listen(3000, function(err) {
    if (err) { throw err; }
    
    var addr = this.address();
    console.log('App listening on http://' + addr.address + ':' + addr.port);
  });
});
