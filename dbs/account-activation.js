var AccountActivation = function() {

  var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  loadOrCreate = require('./db-utility').loadOrCreate,
  removeUndefined = require('../models/utils').removeUndefined,
  TokenGenerator = require('../models/token-generator'),
  DateUtils = require('../models/date-utils'),
  ServerConfig = require('../bin/config').server;

  var AccountActivationSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    activationToken: { type: String, required: true },
    createDate: { type: Date, default: Date.now }
  });

  var _model = loadOrCreate('AccountActivation', AccountActivationSchema);

  var _create = function(userId, callback) {
    _model.remove({user: userId}, function(err) {
      if(err)
        callback(err);
      else {
        _model.create({
          user: userId,
          activationToken: TokenGenerator.generate(userId)
        }, callback);
      }
    });
  };

  var _findById = function(id, callback) {
    _model.findOne({ _id: id }, callback);
  };

  var _findByUserId = function(userId, callback) {
    _model.findOne({ user: userId }, callback);
  };

  var _findByActivationToken = function(activationToken, callback) {
    _model.findOne({ activationToken: activationToken }, callback);
  };

  var _removeById = function(id, callback) {
    _findById(id, function(err, doc) {
      if(err)
        callback(err);
      else if(doc)
        doc.remove(callback);
      else
        callback();
    });
  };

  var _getAll = function(callback) {
    _model.find({}, callback);
  };

  var _isExpiredOrNotExists = function(userId, callback) {
    _findByUserId(userId, function(err, accountActivation) {
      if(err)
        callback(err);
      else if(accountActivation) {
        if(DateUtils.getDeltaDate(accountActivation.createDate) >= ServerConfig.ResetPasswordDay)
          _create(userId, callback);
        else
          callback(null, accountActivation);
      }
      else {
        _create(userId, callback);
      }
    });
  };

  _model.prototype.toPublicJson = function() {
    return {
      id: this.id,
      userId: this.user,
      url: '/user/activate/'+this.activationToken
    };
  };

  _model.prototype.toPrivateJson = function() {
    return {
      id: this.id,
      userId: this.user,
      url: '/user/activate/'+this.activationToken,
      createDate: this.createDate.getTime()
    };
  };

  return {
    create: _create,
    findById: _findById,
    findByUserId: _findByUserId,
    findByActivationToken: _findByActivationToken,
    removeById: _removeById,
    getAll: _getAll,
    isExpiredOrNotExists: _isExpiredOrNotExists
  };

}();

module.exports = AccountActivation;