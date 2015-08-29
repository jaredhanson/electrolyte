module.exports = function() {
  
  return function(id) {
    // TODO: Ignore things with dots and no slashes
    if (/^[\w\-\.\/]+$/.test(id)) {
      return id;
    }
  };
}
