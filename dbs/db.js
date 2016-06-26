var mongoose = require('mongoose'),
Grid = require('gridfs-stream'),
Schema = mongoose.Schema,
ObjectId = mongoose.Types.ObjectId,
findOrCreate = require('mongoose-findorcreate');
Grid.mongo = mongoose.mongo;
var GridStore = mongoose.mongo.GridStore;

var Database = function() {

  var _instance;

  function DBInstance(config, onOpen, onDisconnect, onError) {
    var instance = this;
    var conn = mongoose.connect(config.db.mongodb);
    instance.conn = mongoose.connection;
    instance.db = conn.connection.db;
    instance.conn.on('error', onError || console.error.bind(console, 'connection error:'));
    instance.conn.once('open', function(){
      instance.gfs = Grid(instance.db);
      if(onOpen)
        onOpen();
    });
    instance.conn.once('disconnected', onDisconnect || function() { console.log('DB default connection disconnected') });
  }

  DBInstance.prototype.dropCollection = function(name, callback) {
    this.db.dropCollection(name, function(err) {
      callback(err)
    });
  };

  DBInstance.prototype.dropAllCollection = function(callback) {
    var db = this;
    var async = require('async');

    db.db.collectionNames(function (err, names) {
      async.each(names, function(collection, callback){
        db.dropCollection(collection.name, function(err) {
          callback();
        });
      }, function(err) {
        callback(err);
      });
    });
  };

  DBInstance.prototype.finalize = function() {
    this.conn.close();
  };

  //file operation
  DBInstance.prototype.createWriteFileStream = function(contentType) {
    var fileMode = {mode: 'w'};
    if(contentType)
      fileMode.content_type = contentType;
    return this.gfs.createWriteStream(fileMode);
  };

  DBInstance.prototype.createReadFileStream = function(id) {
    return this.gfs.createReadStream({_id: id});
  };

    DBInstance.prototype.createReadFileStreamFT = function(id, from, to) {
    return this.gfs.createReadStream({
      _id: id,
      range: {
        startPos: from,
        endPos: to
      }
    });
  };

  DBInstance.prototype.getGFile = function(id, callback) {
    this.gfs.findOne({_id: id}, callback);
  };

  DBInstance.prototype.removeGFileById = function(id, callback) {
    this.gfs.remove({_id: id}, callback);
  };

  DBInstance.prototype.isFileExists = function(id, callback) {
    this.gfs.exist({_id: id}, callback);
  };

  var _getInstance = function() {
    return _instance;
  };

  var _initialize = function(config, onOpen, onDisconnect, onError) {
    _instance = new DBInstance(config, onOpen, onDisconnect, onError);
    return _instance;
  };

  return {
    initialize: _initialize,
    getInstance: _getInstance
  };
}();

module.exports = Database;