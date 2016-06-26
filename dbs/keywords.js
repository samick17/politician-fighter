var Keyword = function() {

  var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = mongoose.Types.ObjectId,
  loadOrCreate = require('./db-utility').loadOrCreate;

  var KeywordSchema = new Schema({
    keyword: { type: String, required: true },
    url: { type: String, required: true },
    createDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now }
  });

  var _model = loadOrCreate('Keyword', KeywordSchema);

  var _create = function(data, callback) {
    //check user and category, then upload images
    var kwData = {
      keyword: data.keyword,
      url: data.url
    };
    _model.create(kwData, callback);
  };

  var _getAll = function(callback) {
    _model.find({}, callback);
  };

  var _findById = function(id, callback) {
    if((typeof id) === 'string' && ObjectId.isValid(id)) {
      id = new ObjectId(id);
    }
    _model.findOne({ _id: id }, callback);
  };

  var _update = function(data, callback) {
    _findById(data.id, function(err, keyword) {
      if(err)
        callback(err);
      else if(keyword) {
        keyword.keyword = data.keyword;
        keyword.url = data.url;
        keyword.updateDate = Date.now();
        keyword.save(callback);
      }
      else
        callback(new Error('invalid operation'));
    });
  };
  
  var _removeById = function(id, callback) {
    _findById(id, function(err, keyword) {
      if(err)
        callback(err);
      else if(keyword) {
        keyword.remove(callback);
      }
      else
        callback(new Error('invalid operation'));
    });
  };

  _model.prototype.toPublicJson = function() {
    var jsonModel = {
      url: this.url,
      keyword: this.keyword
    };
    return jsonModel;
  };

  _model.prototype.toPrivateJson = function() {
    var jsonModel = {
      id: this.id,
      url: this.url,
      keyword: this.keyword,
      lastUpdate: this.updateDate
    };
    return jsonModel;
  };

  return {
    create: _create,
    getAll: _getAll,
    findById: _findById,
    update: _update,
    removeById: _removeById
  };

}();

module.exports = Keyword;