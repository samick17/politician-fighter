var forward = function(url) {
  window.location = url;
};

var Utils = function() {
  return {
    clamp: function(c, min, max) {
      return c < min ? min: c > max ? max: c;
    },
    init: function(model, data) {
      var keys = data?Object.keys(data):[];
      for(var i in keys) {
        var key = keys[i];
        model[key] = data[key];
      }
    },
    randomInt: function(from, to) {
      return Math.floor(Math.random()*(to-from))+from;
    },
    inheritPrototype: function(childObject, parentObject) {
      var copyOfParent = Object.create(parentObject.prototype);
      copyOfParent.constructor = childObject;
      childObject.prototype = copyOfParent;
    },
    generateGUID: function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
    },
    generateHash: function(len) {
      var symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
      var hash = '';
      for (var i = 0; i < len; i++) {
        var symIndex = Math.floor(Math.random() * symbols.length);
        hash += symbols.charAt(symIndex);
      }
      return hash;
    },
    toCharCode: function(ch) {
      return ch.charCodeAt(0);
    },
    clone: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    moveForward: function(array, item) {
      var index = array.indexOf(item);
      if(index < array.length - 1) {
        array.splice(index, 1);
        array.splice(index+1, 0, item);
        return true;
      }
      return false;
    },
    moveBackward: function(array, item) {
      var index = array.indexOf(item);
      if(index >= 1) {
        array.splice(index, 1);
        array.splice(index-1, 0, item);
        return true;
      }
      return false;
    },
    intersect: function(a, b) {
      var d = {};
      var results = [];
      for (var i = 0; i < b.length; i++) {
        d[b[i]] = true;
      }
      for (var j = 0; j < a.length; j++) {
        if (d[a[j]]) 
          results.push(a[j]);
      }
      return results;
    },
    filter: function(items, propertyName, valueContains) {
      var results = {};
      for(var i in items) {
        var item = items[i];
        if(item[propertyName] && item[propertyName].indexOf(valueContains) >= 0)
          results[item.id] = item;
      }
      return results;
    },
    filterCount: function(items, startIndex, count) {
      var keys = Object.keys(items);
      var results = {};
      for(var i = startIndex; i < Math.min(startIndex + count, keys.length); i++) {
        var item = items[keys[i]];
        results[item.id] = item;
      }
      return results;
    },
    filterMField: function(items, field, propertyName, valueContains) {
      var results = {};
      for(var i in items) {
        var item = items[i];
        if(item[field]()[propertyName] && item[field]()[propertyName].indexOf(valueContains) >= 0)
          results[item.id] = item;
      }
      return results;
    },
    intersectItems: function(items, propertyName, collection) {
      var results = {};
      for(var i in items) {
        var item = items[i];
        if(collection.indexOf(item[propertyName]) >= 0)
          results[item.id] = item;
      }
      return results;
    },
    fadeIn: function(jElement, ms, callback) {
      ms = ms || 300;
      jElement.addClass('custom-fade-in');
      setTimeout(function() {
        jElement.removeClass('custom-fade-in');
        if(callback) {
          callback();
        }
      }, ms);
    },
    fadeOut: function(jElement, ms, keepElement, callback) {
      ms = ms || 300;
      var tElement = jElement;
      tElement.addClass('custom-fade-out');
      setTimeout(function() {
        if(!keepElement) {
          tElement.remove();
        }
        if(callback) {
          callback();
        }
        tElement.removeClass('custom-fade-out')
      }, ms);
    },
    dictToArray: function(dict) {
      var keys = Object.keys(dict);
      var arr = [];
      for(var k in keys)
        arr.push(dict[k]);
      return arr;
    },
    clamp: function(c, min, max) {
      return c < min ? min : c > max ? max : c;
    },
    downloadByUrl: function(url, contentType) {
      var downloadElement = $('<a/>');
      var ext = contentType.substring(contentType.indexOf('/')+1);
      downloadElement.attr('href', url);
      downloadElement.attr('download', 'download.{0}'.format(ext));
      downloadElement[0].click();
    },
    stopEventChain: function($event) {
      $event.preventDefault();
      $event.stopPropagation();
    },
    processTextIfDomainName: function(text, callback) {
      var domainNameRegxp = CommonRegExp.DomainName;
      var destUrl = '';
      var href = '';
      if(domainNameRegxp.test(text)) {
        destUrl = domainNameRegxp.exec(text)[2];
        destUrl = (destUrl.indexOf('http://') == 0 || destUrl.indexOf('https://') == 0) ? destUrl : 'http://'+destUrl;
        callback(destUrl);
      }
    },
    scrollToBottom: function(jElem) {
      jElem.scrollTop(jElem[0].scrollHeight - jElem.height());
    },
    setFavIcon: function(href) {
      var link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = href;
      document.getElementsByTagName('head')[0].appendChild(link);
    },
    setTitle: function(title) {
      document.title = title;
    },
    hashfy: function(text) {
      var shaObj = new jsSHA("SHA-256", "TEXT");
      shaObj.update(text);
      return shaObj.getHash("HEX");
    },
    zfill: function(text, width) {
      var result = text;
      for(var i = result.length; i < width; i++) {
        result = ' '+result;
      }
      return result;
    }
  }
}();

String.prototype.format = function() {
  var s = this,
  i = arguments.length;
  while (i--)
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  return s;
};

var shake = function(element, count) {
  element.addClass('translate-right');
  setTimeout(function() {
    element.removeClass('translate-right');
    element.addClass('translate-left');
    setTimeout(function() {
      element.removeClass('translate-left');
      element.addClass('translate-left');
      setTimeout(function() {
        element.removeClass('translate-left');
        element.addClass('translate-right');
        setTimeout(function() {
          element.removeClass('translate-right');
          count = count - 1;
          if(count > 0)
            shake(element, count);
        });
      });
    }, 80);
  }, 80);
};

var displayDialog = function(name, scope, compile, ctrl) {
  var newScope = scope.$new(true);
  newScope.dialogCtrl = ctrl;
  var elemDialog = compile('<'+name+' control="dialogCtrl"/>')(newScope);
  $('body').append(elemDialog);
  return elemDialog;
};

var Request = function() {
  var _sendJSONRequest = function(url, type, onSuccess, onError, onProgress) {
    $.ajax({
      url: url,
      type: type,
      contentType: 'application/json',
      dataType: 'json',
      success: onSuccess,
      error: onError,
      xhr: function() {
        var xhr = $.ajaxSettings.xhr();
        xhr.onprogress = function(evt) {
          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            if(onProgress)
              onProgress(percentComplete);
          }
          else if(onProgress)
            onProgress(1);
        };
        return xhr;
      }
    });
  };
  var _sendJSONRequestWithData = function(url, type, data, onSuccess, onError, onProgress) {
    $.ajax({
      url: url,
      type: type,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(data),
      success: onSuccess,
      error: onError,
      xhr: function() {
        var xhr = $.ajaxSettings.xhr();
        xhr.onprogress = function(evt) {
          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            if(onProgress)
              onProgress(percentComplete);
          }
          else if(onProgress)
            onProgress(1);
        };
        return xhr;
      }
    });
  };
  var _get = function(url, onSuccess, onError, onProgress) {
    _sendJSONRequest(url, 'GET', onSuccess, onError, onProgress);
  };
  var _put = function(url, data, onSuccess, onError, onProgress) {
    _sendJSONRequestWithData(url, 'PUT', data, onSuccess, onError, onProgress);
  };
  var _post = function(url, data, onSuccess, onError, onProgress) {
    _sendJSONRequestWithData(url, 'POST', data, onSuccess, onError, onProgress);
  };
  var _delete = function(url, onSuccess, onError, onProgress) {
    _sendJSONRequest(url, 'DELETE', onSuccess, onError, onProgress);
  };
  var _postFormData = function(url, files, onSuccess, onError, onProgress) {
    var fd = new FormData();
    for(var i in files)
      fd.append( 'cf',  files[i]);
    $.ajax({
      url: url,
      data: fd,
      processData: false,
      contentType: false,
      type: 'POST',
      success: onSuccess,
      error: onError,
      xhr: function() {
        var xhr = $.ajaxSettings.xhr();
        xhr.upload.onprogress = function(evt) {
          var percentComplete = evt.loaded / evt.total;
          if(onProgress)
            onProgress(percentComplete);
        };
        return xhr;
      }
    });
  };
  return {
    get: _get,
    put: _put,
    post: _post,
    delete: _delete,
    postFormData: _postFormData
  };
}();

var RequestWrapper = function() {
  return {
    requestGetField: function(host, field, callback, onProgressCallback) {
      function onSuccess(data) {
        if(field)
          callback(null, data[field]);
        else
          callback(null, data);
      }
      function onError(err) {
        callback(err);
      }
      Request.get(host, onSuccess, onError, onProgressCallback);
    },
    requestPutField: function(host, data, field, callback, onProgressCallback) {
      function onSuccess(data) {
        if(field)
          callback(null, data[field]);
        else
          callback(null, data);
      }
      function onError(err) {
        callback(err);
      }
      Request.put(host, data, onSuccess, onError, onProgressCallback);
    },
    requestPostField: function(host, data, field, callback, onProgressCallback) {
      function onSuccess(data) {
        if(field)
          callback(null, data[field]);
        else
          callback(null, data);
      }
      function onError(err) {
        callback(err);
      }
      Request.post(host, data, onSuccess, onError, onProgressCallback);
    },
    requestDelete: function(host, callback, onProgressCallback) {
      function onSuccess() {
        callback();
      }
      function onError(err) {
        callback(err);
      }
      Request.delete(host, onSuccess, onError, onProgressCallback);
    }
  };
}();

var VK = (function() {
  return {
    ENTER: 0x0D,
    ESC: 0x1B,
    COMMA: 0xBC,
    UP: 0x26,
    DOWN: 0x28,
    LEFT: 0x25,
    RIGHT: 0x27,
    SPACE: 32,
    Q: 81,
    E: 69,
    W: 87,
    S: 83,
    A: 65,
    D: 68,
    F5: 116,
    BACKSAPCE: 8
  };
})();

var OpType = (function() {
  return {
    refresh: 'a',
    addItem: 'b',
    removeItem: 'c',
    updateItem: 'd'
  };
})();

var UAC = function() {
  return {
    retrieveAppName: function(callback) {
      RequestWrapper.requestGetField('/api/uac/app/name', 'name', function(err, name) {
        if(!err) {
          AppManager.setAppName(name);
        }
        callback(name);
      });
    },
    retrieveAppMeta: function(callback) {
      RequestWrapper.requestGetField('/api/uac/app/meta', 'meta', callback);
    },
    getKeywords: function(callback) {
      RequestWrapper.requestGetField('/api/uac/keywords', 'keywords', callback);
    },
  };
}();

var ADMIN = function() {
  return {
    login: function(userData, callback) {
      RequestWrapper.requestPostField('/api/admin/login', userData, null, callback);
    },
    logout: function(callback) {
      RequestWrapper.requestGetField('/api/admin/logout', null, callback);
    },
    updateFavIcon: function(files, callback, updateProgressCallback) {
      var onSuccess = function(data) {
        callback(null, data);
      };
      var onError = function(err) {
        callback(err);
      };
      Request.postFormData('/api/admin/app/favIcon', files, onSuccess, onError, updateProgressCallback);
    },
    updateProfile: function(profileData, callback) {
      RequestWrapper.requestPutField('/api/admin/profile', profileData, null, callback);
    },
    setAppName: function(name, callback) {
      RequestWrapper.requestPutField('/api/admin/app/name', {name: name}, 'name', callback);
    },
    getOnlineUsersStatistics: function(callback) {
      RequestWrapper.requestGetField('/api/admin/onlineUsersStatistics', 'onlineUsers', callback);
    },
    /*keywords*/
    getKeywords: function(callback) {
      RequestWrapper.requestGetField('/api/admin/keywords', 'keywords', callback);
    },
    createKeyword: function(keyword, callback) {
      RequestWrapper.requestPostField('/api/admin/keywords', {keyword: keyword}, 'keyword', callback);
    },
    updateKeyword: function(keyword, callback) {
      RequestWrapper.requestPutField('/api/admin/keywords/{0}'.format(keyword.id), {keyword: keyword}, 'keyword', callback);
    },
    removeKeywordById: function(keywordId, callback) {
      RequestWrapper.requestDelete('/api/admin/keywords/{0}'.format(keywordId), callback);
    }
  };
}();

var displayProgressBar = function(scope, compile) {
  var newScope = scope.$new(true);
  newScope.progressCtrl = {};
  var progressElement = compile('<progressdialog control="progressCtrl"/>')(newScope);
  $('body').append(progressElement);
  var _setProgress = function(rate) {
    newScope.progressCtrl.setProgress(rate);
  };
  var _setText = function(text) {
    newScope.progressCtrl.setText(text);
  };
  var _setColor = function(color) {
    newScope.progressCtrl.setColor(color);
  };
  var _dismiss = function() {
    progressElement.remove();
    delete newScope.progressCtrl;
  };
  return {
    setProgress: _setProgress,
    setText: _setText,
    setColor: _setColor,
    dismiss: _dismiss
  };
};

var InitNextInputCtrlHandler = function(element) {
  var nextInputControl = function($event, id) {
    if($event.keyCode === VK.ENTER) {
      if(id)
        $(element).find('#{0}'.format(id)).focus();
      else
        $(':focus').next('input, textarea').focus();
      return true;
    }
    return false;
  };
  return nextInputControl;
};

(function($) {
  $.fn.invisible = function() {
    return this.each(function() {
      $(this).css("visibility", "hidden");
    });
  };
  $.fn.visible = function() {
    return this.each(function() {
      $(this).css("visibility", "visible");
    });
  };
}(jQuery));

var CustomFileReader = function() {
  function selectFile(format, callback) {
    $('<input/>').
    attr('accept', format).
    attr('type', 'file').
    attr('multiple', '').
    change(function(e) {
      callback(e.target.files);
    }).
    click();
  }

  function selectSingleFile(format, callback) {
    $('<input/>').
    attr('accept', format).
    attr('type', 'file').
    change(function(e) {
      callback(e.target.files);
    }).
    click();
  }

  function _screenshotOfVideo(url, callback, error) {
    var video = $("<video/>");
    video.on("loadeddata", function() {
      var elem = _screenshot(this);
      callback(null, elem);
    });
    video.on("error", function (err) {
      this.src = '';
      callback(err);
    });
    video.attr('src', url).load();
  }
  function _screenshot(video) {
    var cvs = $('<canvas/>').
    attr('width', video.videoWidth || 450).
    attr('height', video.videoHeight || 360)[0];
    var ctx = cvs.getContext("2d");
    ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
    cvs.style.width = 'inherit';
    cvs.style.height = 'inherit';
    return cvs;
  }
  function fileToThumbnail(file, callback) {
    var url = window.URL.createObjectURL(file);
    console.log(file.type)
    if(file.type.indexOf('video') >= 0 || file.type.indexOf('audio') >= 0) {
      _screenshotOfVideo(url, callback);
    }
    else if(file.type.indexOf('image') >= 0) {
      var reader = new FileReader();
      var elem = $('<img/>').
      attr('src', url)[0];
      callback(null, elem);
    }
    else if(file.type.indexOf('html') >= 0 || file.type.indexOf('pdf') >= 0) {
      var elem = $('<object/>').
      attr('data', url)[0];
      callback(null, elem);
    }
  }
  return {
    selectFile: selectFile,
    selectSingleFile: selectSingleFile,
    fileToThumbnail: fileToThumbnail
  };
}();

var isFullScreen = false;
function toggleFullScreen() {
  function launchIntoFullscreen(element) {
    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    isFullScreen = true;
  }
  function exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    isFullScreen = false;

  }
  if(isFullScreen) {
    exitFullScreen();
  }
  else
    launchIntoFullscreen(document.documentElement);
}