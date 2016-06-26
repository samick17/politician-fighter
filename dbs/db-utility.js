var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var _uploadImageField = function(model, imgField, imgId, callback) {
  if(model) {
    var setImage = function() {
      model[imgField] = imgId;
      model.save(callback);
    };
    if(model[imgField]) {
      DB.getInstance().gfs.remove({_id: model[imgField]}, setImage);
    }
    else {
      setImage();
    }
  }
  else
    callback(new Error('invalid operation'));
};

function _loadOrCreate(name, schema) {
  return mongoose.model(name, schema);
};

var _toObjectId = function(id) {
  if((typeof id) === 'string' && ObjectId.isValid(id))
    id = new ObjectId(id);
  return id;
};

module.exports = {
  loadOrCreate: _loadOrCreate,
  uploadImageField: _uploadImageField,
  toObjectId: _toObjectId
};