var Utils = function() {

  var _removeUndefined = function(obj) {
    var newObj = {}
    for(var i in obj) {
      var t = obj[i];
      if(typeof t !== 'undefined' && t)
        newObj[i] = obj[i];
    }
    return newObj;
  };

  var _removeAllUndefinedInArray = function(arr) {
    var result = [];
    for(var i = 0; i <= arr.length; i++) {
      var item = arr[i];
      if(item)
        result.push(item);
    }
    return result;
  };

  function _isLocalMachine(ip_addr, callback){
    var Network = require('network');
    Network.get_public_ip(function(err, ip){
      if(ip_addr === ip)
        callback();
      else
        callback(new InvalidOperationException('access denied!'));
    });
  };

  function _isNullOrUndefined(obj) {
    return !obj || typeof obj == 'undefined'
  };

  String.prototype.format = function() {
    var s = this,
    i = arguments.length;
    while (i--)
      s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    return s;
  };

  function _collapseArray(array) {
    return array.filter(function(e, i) {
      return array.indexOf(e) === i;
    });
  }

  function _moveForward(arr, i) {
    if(i >= 0 && i < arr.length-1) {
      var item = arr[i];
      arr.splice(i,1);
      arr.splice(i+1, 0, item);
      return true;
    }
    return false;
  }

  function _moveBackward(arr, i) {
    if(i > 0 && i < arr.length) {
      var item = arr[i];
      arr.splice(i,1);
      arr.splice(i-1, 0, item);
      return true;
    }
    return false;
  }

  function _removeAt(arr, i) {
    if(i >= 0 && i < arr.length) {
      return arr.splice(i, 1);
    }
    return false;
  }

  function _keepDataIfNoField(obj, data, field) {
    return data.hasOwnProperty(field)? data[field] : obj[field];
  };

  return {
    removeUndefined: _removeUndefined,
    removeAllUndefinedInArray: _removeAllUndefinedInArray,
    isLocalMachine: _isLocalMachine,
    isNullOrUndefined: _isNullOrUndefined,
    collapseArray: _collapseArray,
    moveForward: _moveForward,
    moveBackward: _moveBackward,
    removeAt: _removeAt,
    keepDataIfNoField: _keepDataIfNoField
  };

}();

module.exports = Utils;