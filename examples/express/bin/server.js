var app = require('../app');

app.boot(function(err) {
  if (err) {
    console.log(err.message);
    console.log(err.stack);
    return process.exit(-1);
  }
});
