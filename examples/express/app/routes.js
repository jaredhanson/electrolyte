module.exports = function routes() {

  this.get('/hello', function(req, res) {
    res.send('Hello!')
  });

}
