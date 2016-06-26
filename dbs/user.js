var User = function() {

  var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  loadOrCreate = require('./db-utility').loadOrCreate,
  removeUndefined = require('../models/utils').removeUndefined,
  ServerConfig = require('../bin/config').server,
  AccountActivation = require('./account-activation'),
  TokenGenerator = require('../models/token-generator'),
  PasswordMatcher = require('../models/password-matcher'),
  DB = require('./db'),
  Async = require('async');

  const States = {
    unactivated: 'unactivated',
    activated: 'activated',
    blocked: 'blocked'
  };

  var UserSchema = new Schema({
    accountId: { type: String, unique: true, sparse: true },
    password: { type: String },
    email: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    activationCode: { type: String },//use this for account activation
    nickname: { type: String },
    state: { type: String, default: States.unactivated },
    avatarId: { type: Schema.ObjectId },
    createDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now },
    lastOnlineDate: { type: Date }
  });
  //
  UserSchema.path('accountId').validate(function(value) {
    return value && typeof(value) === 'string' && value.match(ServerConfig.accountIdFormat);
  }, 'Invalid id format');

  UserSchema.path('email').validate(function(value) {
    if(value)
      return typeof(value) === 'string' && value.match(ServerConfig.emailFormat);
    else
      return true;
  }, 'Invalid email format');

  UserSchema.path('state').validate(function(value) {
    return Object.keys(States).indexOf(value) >= 0;
  }, 'Invalid accountId format');

  var _model = loadOrCreate('User', UserSchema);

  var _generateActivationCode = function(code) {
    return TokenGenerator.generateWithoutTimeSeed(code+'@TectronixTecc');
  };

  var _processUserData = function(userData) {
    var uData  = {
      accountId: userData.accountId,
      name: userData.name,
      nickname: userData.nickname,
      email: userData.email
    };
    if(userData.activationCode)
      uData.activationCode = _generateActivationCode(userData.activationCode);
    uData = removeUndefined(uData);
    return uData;
  };

  var _isActivatedUser = function(user) {
    return user && user.state === States.activated;
  };

  var _isBlockedUser = function(user) {
    return user && user.state === States.blocked;
  };

  var _checkAccountIdAndEmailOptional = function(userData, callback) {
    _findByAccountId(userData.accountId, function(err, user) {
      if(err)
        callback(err);
      else if(!user) {
        if(userData.email) {
          _findByEmail(userData.email, function(err, user) {
            if(err)
              callback(err);
            else if(!user  || (user && user.id === userData.id))
              callback(null);
            else
              callback(new Error('duplicated email'));
          });
        }
        else
          callback(null);
      }
      else
        callback(new Error('duplicated accountId'));
    });
  };

  var _checkAccountIdAndEmail = function(userData, callback) {
    _findByAccountId(userData.accountId, function(err, user) {
      if(err)
        callback(err);
      else if(!user || (user && user.id === userData.id)) {
        _findByEmail(userData.email, function(err, user) {
          if(err)
            callback(err);
          else if(!user  || (user && user.id === userData.id) || !user.email)
            callback(null);
          else
            callback(new Error('duplicated email'));
        });
      }
      else
        callback(new Error('duplicated accountId'));
    });
  };

  var _create = function(userData, callback) {
    _checkAccountIdAndEmailOptional(userData, function(err) {
      if(err)
        callback(err);
      else {
        _model.create(_processUserData(userData), function(err, user) {
          if(err)
            callback(err);
          else
            callback(null, user);
        });
      }
    });
  };

  var _createWithFbParams = function(fbData, callback) {
    _model.create({facebookId: fbData.id, fbToken: fbData.accessToken, name: fbData.displayName}, callback);
  };

  var _createMultiple = function(userDataArr, callback) {
    var userDocs = [];
    for(var i in userDataArr) {
      var userData = userDataArr[i];
      userDocs.push(_processUserData(userData));
    }
    _model.collection.insert(userDocs, {}, callback);
  };

  var _findById = function(id, callback) {
    _model.findOne({ _id: id }, callback);
  };

  var _findByAccountId = function(accountId, callback) {
    if(!accountId) {
      callback();
    }
    else {
      var accountIdCaseInsensitiveRegex = {$regex: new RegExp('^' + accountId.toLowerCase(), 'i')};
      _model.findOne({ accountId: accountIdCaseInsensitiveRegex }, callback);
    }
  };

  var _findByEmail = function(email, callback) {
    _model.findOne({ email: email }, callback);
  };

  var _getAll = function(callback) {
    _model.find({}, callback);
  };

  var _getAllActived = function(callback) {
    _model.find({state: States.activated}, callback);
  };

  var _activateAndSetPassword = function(userId, password, callback) {
    _findById(userId, function(err, user) {
      if(err)
        callback(err);
      else if(user && user.state !== States.blocked){
        try {
          user.password = PasswordMatcher.processPassword(password);
          user.state = States.activated;
          user.save(callback);
        }
        catch(e) {
          callback(e);
        }
      }
      else
        callback(new Error('invalid operation'));
    });
  };

  var _activate = function(userId, callback) {
    _findById(userId, function(err, user) {
      user.state = States.activated;
      user.save(callback);
    });
  };

  var _block = function(userId, callback) {
    _findById(userId, function(err, user) {
      if(_isActivatedUser(user)){
        user.state = States.blocked;
        user.save(callback);
      }
      else
        callback(new Error('invalid state - unactivated user'));
    });
  };

  var _unblock = function(userId, callback) {
    _findById(userId, function(err, user) {
      if(_isBlockedUser(user)){
        user.state = States.activated;
        user.save(callback);
      }
      else
        callback(new Error('invalid state - unblocked user'));
    });
  };

  var _isAccountAvailable = function(accountId, callback) {
    _findByAccountId(accountId, function(err, user) {
      if(!user && (typeof accountId === 'string') && accountId.match(ServerConfig.accountIdFormat)) {
        callback(true);
      }
      else {
        callback(false);
      }
    })
  };

  var _update = function(userData, callback) {
    var userId = userData.id;
    _findById(userId, function(err, user) {
      if(err)
        callback(err);
      else if(user) {
        _checkAccountIdAndEmail(userData, function(err) {
          if(err)
            callback(err);
          else {
            user.accountId = userData.accountId || user.accountId;
            user.name = userData.name || user.name;
            user.password = userData.pw?PasswordMatcher.processPassword(userData.pw):user.password;
            user.email = userData.email?userData.email:undefined;
            user.nickname = userData.nickname || user.nickname;
            user.activationCode = userData.activationCode?_generateActivationCode(userData.activationCode):user.activationCode;
            user.updateDate = Date.now();
            user.save(callback);
          }
        });
        //
      }
      else
        callback(new Error('invalid operation'));
    });
    //
  };

  var _uploadAvatar = function(id, fileId, callback) {
    _findById(id, function(err, user) {
      if(err)
        callback(err);
      else if(user) {
        var setAvatar = function() {
          user.avatarId = fileId;
          user.save(callback);
        };
        if(user.avatarId) {
          DB.getInstance().gfs.remove({_id: user.avatarId}, setAvatar);
        }
        else {
          setAvatar();
        }
      }
      else
        callback(new Error('invalid operation'));
    });
  };

  //callback(err, true/false)
  var _isActiveUser =  function(userId, callback) {
    _findById(userId, function(err, user) {
      if(err)
        callback(err);
      else if(!user)
        callback(new Error('invalid arguments'));
      else {
        callback(null, user.state === States.activated);
      }
    });
  };

  var _resetPasswordByEmail = function(email, callback) {
    _findByEmail(email, function(err, user) {
      if(err)
        callback(err);
      else if(user && user.state === States.activated) {
        AccountActivation.isExpiredOrNotExists(user.id, function(err) {
          if(err)
            callback(err);
          else {
            user.state = States.unactivated;
            delete user.password;
            user.updateDate = Date.now();
            user.save(function(err, user) {
              if(err)
                callback(err);
              else
                AccountActivation.create(user.id, function(err, accountActivation) {
                  callback(err, accountActivation, user);
                });
            });
          }
        });
      }
      else
        callback(new Error('invalid arguments'));
    });
  };

  var _resetPasswordByAccountId = function(accountId, callback) {
    _findByAccountId(accountId, function(err, user) {
      if(err)
        callback(err);
      else if(user && user.state === States.activated) {
        AccountActivation.isExpiredOrNotExists(user.id, function(err) {
          if(err)
            callback(err);
          else {
            user.state = States.unactivated;
            delete user.password;
            user.updateDate = Date.now();
            user.save(function(err, user) {
              if(err)
                callback(err);
              else
                AccountActivation.create(user.id, function(err, accountActivation) {
                  callback(err, accountActivation, user);
                });
            });
          }
        });
      }
      else
        callback(new Error('invalid arguments'));
    });
  };

  var _activateAccountById = function(userId, callback) {
    _findById(userId, function(err, user) {
      if(err)
        callback(err);
      else if(user && user.state === States.unactivated && user.email) {
        AccountActivation.isExpiredOrNotExists(userId, function(err) {
          if(err)
            callback(err);
          else
            AccountActivation.create(userId, callback);
        });
      }
      else
        callback(new Error('invalid arguments'));
    });
  };

  var _activateAccountByIdWithActivationCode = function(userId, activationCode, callback) {
    _findById(userId, function(err, user) {
      if(err)
        callback(err);
      else if(user && user.state === States.unactivated && activationCode && user.activationCode === _generateActivationCode(activationCode)) {
        AccountActivation.isExpiredOrNotExists(userId, function(err, accountActivation) {
          if(err)
            callback(err);
          else if(!accountActivation)
            AccountActivation.create(userId, callback);
          else
            callback(null, accountActivation);
        });
      }
      else
        callback(new Error('invalid arguments'));
    });
  };

  var _activateAccountByToken = function(activationToken, password, callback) {
    AccountActivation.findByActivationToken(activationToken, function(err, accountActivation) {
      if(err)
        callback(err);
      else if(accountActivation) {
        _activateAndSetPassword(accountActivation.user, password, function(err, user) {
          if(err)
            callback(err);
          else if(user)
            accountActivation.remove(callback);
          else
            callback(new Error('Invalid operation'));
        });
      }
      else
        callback(new Error('Invalid arguments'));
    });
  };

  var _updateLastOnlineDate = function(id, callback) {
    _findById(id, function(err, user) {
      if(user) {
        user.lastOnlineDate = Date.now();
        user.save(callback);
      }
      else
        callback(err);
    });
  };

  _model.prototype.toPublicJson = function() {
    var jsonModel = {
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      nickname: this.nickname,
      email: this.email,
      state: this.state,
      hasActivationCode: this.activationCode !== undefined
    };
    if(this.avatarId)
      jsonModel.avatarUrl = '/file/streaming/' + this.avatarId;
    if(this.lastOnlineDate)
      jsonModel.lastOnlineDate = this.lastOnlineDate;
    return jsonModel;
  };

  _model.prototype.toPrivateJson = function() {
    var jsonModel = {
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      nickname: this.nickname,
      email: this.email,
      state: this.state,
      hasActivationCode: this.activationCode !== undefined
    };
    if(this.avatarId)
      jsonModel.avatarUrl = '/file/streaming/'+this.avatarId;
    if(this.lastOnlineDate)
      jsonModel.lastOnlineDate = this.lastOnlineDate;
    return jsonModel;
  };

  _model.prototype.isActive = function() {
    return this.state === States.activated;
  };

  return {
    States: States,
    create: _create,
    activateAndSetPassword: _activateAndSetPassword,
    block: _block,
    unblock: _unblock,
    uploadAvatar: _uploadAvatar
  };

}();

module.exports = User;