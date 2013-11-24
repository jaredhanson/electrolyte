exports = module.exports = function() {
  var db = new Database();
  return db;
}

exports['@singleton'] = true;




var records = [
  { id: '1', description: 'Buy groceries' },
  { id: '2', description: 'Wash car' }
];

function Database() {
}

Database.prototype.findAll = function(cb) {
  process.nextTick(function() {
    return cb(null, records);
  });
}

Database.prototype.add = function(item, cb) {
  process.nextTick(function() {
    var id = records.length + 1;
    item.id = id;
    records.push(item);
    return cb(null);
  });
}
