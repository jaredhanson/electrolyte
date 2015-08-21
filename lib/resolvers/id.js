module.exports = function() {
  
  return function(id) {
    if (/^[\w\-\.\/]+$/.test(id)) {
      return id;
    }
  };
}
