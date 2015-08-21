module.exports = function(key, value) {
  return function(id) {
    return id === key ? value : undefined;
  };
}
