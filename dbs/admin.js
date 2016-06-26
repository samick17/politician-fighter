var Admin = function() {

  var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  loadOrCreate = require('./db-utility').loadOrCreate,
  removeUndefined = require('../models/utils').removeUndefined,
  ServerConfig = require('../bin/config').server,
  User = require('./user'),
  InitialData = require('../bin/initial-data'),
  PasswordMatcher = require('../models/password-matcher');

  var adminSchema = new Schema({
    accountId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    avatarId: { type: Schema.ObjectId },
    indexUrl: { type: String },
    createDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now }
  });

  adminSchema.path('email').validate(function(value) {
    return value && typeof(value) === 'string' && value.match(ServerConfig.emailFormat);
  }, 'Invalid email format');

  var _model = loadOrCreate('Admin', adminSchema);

  var _processAdminData = function(adminData) {
    return {
      accountId: adminData.accountId,
      password: PasswordMatcher.processAdminPassword(adminData.password),
      email: adminData.email
    };
  };

  var _isValidAdminData = function(adminData) {
    return 'accountId' in adminData && InitialData.admin.accountId !== adminData.accountId &&
    'password' in adminData && InitialData.admin.password !== PasswordMatcher.processAdminPassword(adminData.password) &&
    'email' in adminData && InitialData.admin.email !== adminData.email;
  };

  var _create = function(adminData, callback) {
    _model.create(_processAdminData(adminData), function(err, admin) {
      if(err)
        callback(err);
      else
        callback(null, admin);
    });
  };

  var _findById = function(id, callback) {
    _model.findOne({ _id: id }, callback);
  };

  var _findByAccountId = function(accountId, callback) {
    _model.findOne({ accountId: accountId }, function(err, admin) {
      if(err || !admin) {
        callback(new Error('nothing was found'));
      }
      else {
        callback(null, admin);
      }
    });
  };

  var _isAccountAvailable = function(accountId, callback) {
    _findByAccountId(accountId, function(err, admin) {
      if(err) {
        callback(true);
      }
      else {
        callback(false);
      }
    });
  };

  var _update = function(adminData, callback) {
    var adminId = adminData.id;
    _findById(adminId, function(err, admin) {
      if(err)
        callback(err);
      else if(admin && _isValidAdminData(adminData)) {
        admin.accountId = adminData.accountId;
        admin.password = PasswordMatcher.processAdminPassword(adminData.password);
        admin.email = adminData.email;
        admin.updateDate = Date.now();
        admin.save(callback);
      }
      else
        callback(new Error('Invalid arguments'));
    });
  };

  var _uploadAvatar = function(id, fileId, callback) {
    _findById(id, function(err, admin) {
      if(err)
        callback(err);
      else if(admin) {
        var setAvatar = function() {
          admin.avatarId = fileId;
          admin.save(callback);
        };
        if(admin.avatarId) {
          DB.getInstance().gfs.remove({_id: admin.avatarId}, setAvatar);
        }
        else {
          setAvatar();
        }
      }
      else
        callback(new Error('invalid operation'));
    });
  };

  var _activateUser = function(adminId, userId, password, callback) {
    _findById(adminId, function(err, admin) {
      if(err)
        callback(err);
      else if(admin)
        User.activateAndSetPassword(userId, password, callback);
      else
        callback(new Error('Invalid admin'));
    });
  };

  var _blockUser = function(adminId, userId, callback) {
    _findById(adminId, function(err, admin) {
      if(err)
        callback(err);
      else if(admin)
        User.block(userId, callback);
      else
        callback(new Error('Invalid admin'));
    });
  };

  var _unblockUser = function(adminId, userId, callback) {
    _findById(adminId, function(err, admin) {
      if(err)
        callback(err);
      else if(admin)
        User.unblock(userId, callback);
      else
        callback(new Error('Invalid admin'));
    });
  };

  var _proceedUpdateAdmin = function(adminId, callback) {
    _findById(adminId, function(err, admin) {
      if(err)
        callback(err);
      else if(admin) {
        var proceedUpdate = admin.accountId === InitialData.admin.accountId || 
        admin.password === InitialData.admin.password ||
        admin.email === InitialData.admin.email;
        callback(null, proceedUpdate, admin);
      }
      else
        callback(new Error('Invalid admin'));
    });
  };

  var _uploadUserAvatar = function(adminId, userId, imgId, callback) {
    _findById(adminId, function(err, admin) {
      if(err)
        callback(err);
      else if(admin) {
        User.uploadAvatar(userId, imgId, callback);
      }
      else
        callback(new Error('Invalid admin'));
    });
  };

  _model.prototype.toPrivateJson = function() {
    var jsonModel = {
      accountId: this.accountId,
      email: this.email,
      lastUpdate: this.updateDate.getTime()
    };
    if(this.avatarId)
      jsonModel.avatarUrl = '/img/'+this.avatarId;
    return jsonModel;
  };

  return {
    create: _create,
    findById: _findById,
    findByAccountId: _findByAccountId,
    isAccountAvailable: _isAccountAvailable,
    update: _update,
    uploadAvatar: _uploadAvatar,
    activateUser: _activateUser,
    blockUser: _blockUser,
    unblockUser: _unblockUser,
    proceedUpdateAdmin: _proceedUpdateAdmin,
    uploadUserAvatar: _uploadUserAvatar
  };

}();

module.exports = Admin;