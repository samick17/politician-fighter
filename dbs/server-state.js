var ServerState = function() {

  var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  dbUtils = require('./db-utility'),
  DB = require('./db');

  var ServerStateSchema = new Schema({
    name: { type: String },
    launchTimes: { type: Number, default: 0},
    coverImage: { type: Schema.ObjectId },
    indexImage: { type: Schema.ObjectId },
    chatMessageRecycleIntervalDate: { type: Number, default: 7 },
    registerable: { type: Boolean, default: false },
    oAuthOpening: { type: Boolean, default: false },
    canCreateOrg: { type: Boolean, default: false },
    createDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now }
  });

  var _model = dbUtils.loadOrCreate('ServerState', ServerStateSchema);

  var _launch = function(callback) {
    _model.findOne({}, function(err, serverState) {
      if(err)
        callback(null);
      else if(serverState) {
        serverState.launchTimes += 1;
        serverState.save(callback);
      }
      else {
        _model.create({}, function(err, serverState) {
          serverState.launchTimes += 1;
          serverState.save(callback);
        });
      }
    });
  };

  var _uploadImageField = function(imgField, imgId, callback) {
    _getState(function(err, serverState) {
      dbUtils.uploadImageField(serverState, imgField, imgId, callback);
    });
  };

  var _uploadCoverImage = function(imgId, callback) {
    _uploadImageField('coverImage', imgId, callback);
  };

  var _uploadIndexImage = function(imgId, callback) {
    _uploadImageField('indexImage', imgId, callback);
  };

  var _updateChatMessageRecycleIntervalDate = function(intervalDate, callback) {
    _getState(function(err, serverState) {
      if(err)
        callback(err);
      else if(serverState) {
        serverState.chatMessageRecycleIntervalDate = intervalDate;
        serverState.save(callback);
      }
      else
        callback(new Error('invalid arguments'));
    });
  };

  var _getState = function(callback) {
    _model.findOne({}, callback);
  };

  var _updateField = function(field, value, callback) {
    _getState(function(err, serverState) {
      if(err)
        callback(err);
      else if(serverState) {
        serverState[field] = value;
        serverState.save(callback);
      }
      else
        callback(new Error('invalid arguments'));
    });
  };

  var _setAppName = function(name, callback) {
    _updateField('name', name, callback);
  };

  var _setRegisterable = function(registerable, callback) {
    _updateField('registerable', registerable, callback);
  };

  var _setOAuthOpening = function(oAuthOpening, callback) {
    _updateField('oAuthOpening', oAuthOpening, callback);
  };

  var _setCanCreateOrg = function(canCreateOrg, callback) {
    _updateField('canCreateOrg', canCreateOrg, callback);
  };

  _model.prototype.toPublicJson = function() {
    var jsonModel = {
      name: this.name || 'AppName',
      registerable: this.registerable,
      oAuthOpening: this.oAuthOpening,
      canCreateOrg: this.canCreateOrg
    };
    if(this.coverImage)
      jsonModel.coverImageUrl = '/file/streaming/'+this.coverImage;
    if(this.indexImage)
      jsonModel.indexImageUrl = '/file/streaming/'+this.indexImage;
    return jsonModel;
  };

  _model.prototype.toPrivateJson = function() {
    var jsonModel = {
      launchTimes: this.launchTimes,
      name: this.name || 'AppName',
      registerable: this.registerable,
      oAuthOpening: this.oAuthOpening,
      canCreateOrg: this.canCreateOrg
    };
    if(this.coverImage)
      jsonModel.coverImageUrl = '/file/streaming/'+this.coverImage;
    if(this.indexImage)
      jsonModel.indexImageUrl = '/file/streaming/'+this.indexImage;
    return jsonModel;
  };

  return {
    launch: _launch,
    uploadCoverImage: _uploadCoverImage,
    uploadIndexImage: _uploadIndexImage,
    updateChatMessageRecycleIntervalDate: _updateChatMessageRecycleIntervalDate,
    getState: _getState,
    setAppName: _setAppName,
    setRegisterable: _setRegisterable,
    setOAuthOpening: _setOAuthOpening,
    setCanCreateOrg: _setCanCreateOrg
  };

}();

module.exports = ServerState;