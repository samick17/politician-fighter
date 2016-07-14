var Config = function() {
  var format = require('util').format;

  var _accountIdMinLength = 10;
  var _accountIdMaxLength = 10;
  var _accountIdFormat = /^[a-zA-Z0-9]{6,20}$/;

  var _passwordMinLength = 8;
  var _passwordMaxLength = 50;
  var _passwordFormat = format("((?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*(_|[^\\w]))(?=.{%d,%d}$).+)", _passwordMinLength, _passwordMaxLength);

  var _emailFormat = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$";
  //app name
  var _appName = 'AppName';
  var _onAppNameChangeCallback;
  function _getAppName() {
    return _appName;
  }
  function _setAppName(name) {
    _appName = name || 'AppName';
    if(_onAppNameChangeCallback)
      _onAppNameChangeCallback(_appName);
  }
  function _onAppNameChange(callback) {
    _onAppNameChangeCallback = callback;
  }
  //app description
  var _description = 'AppDescription';
  function _getAppDescription() {
    return _description;
  }
  function _setAppDescription(description) {
    _description = description;
  }
  //app keywords
  var _keywords = '';
  function _getAppKeywords() {
    return _keywords;
  }
  function _setAppKeywords(keywords) {
    _keywords = keywords;
  }
  //app url
  var _url = '';
  function _getAppUrl() {
    return _url;
  }
  function _setAppUrl(url) {
    _url = url;
  }
  //app cover image url
  var _coverImageUrl = '';
  function _getAppCoverImageUrl() {
    return _coverImageUrl;
  }
  function _setAppCoverImageUrl(coverImageUrl) {
    _coverImageUrl = coverImageUrl;
  }
  function _getAppMeta() {
    return {
      description: _description,
      keywords: _keywords,
      url: _url,
      imageUrl: _coverImageUrl
    };
  }
  function _getFullMetaData() {
    return {
      title: _appName,
      description: _description,
      keywords: _keywords,
      metaUrl: _url,
      metaTitle: _appName,
      metaDescription: _description,
      metaImageUrl: _coverImageUrl
    };
  }

  return {
    db: {
      mongodb: "mongodb://127.0.0.1/gameunnamed"
    },
    server: {
      accountIdMinLength: _accountIdMinLength,
      accountIdMaxLength: _accountIdMaxLength,
      accountIdFormat: _accountIdFormat,
      passwordMinLength: _passwordMinLength,
      passwordMaxLength: _passwordMaxLength,
      passwordFormat: _passwordFormat,
      emailFormat: _emailFormat,
      //app name
      getAppName: _getAppName,
      setAppName: _setAppName,
      onAppNameChangeCallback: _onAppNameChangeCallback,
      //app description
      getAppDescription: _getAppDescription,
      setAppDescription: _setAppDescription,
      //app keywords
      getAppKeywords: _getAppKeywords,
      setAppKeywords: _setAppKeywords,
      //app url
      getAppUrl: _getAppUrl,
      setAppUrl: _setAppUrl,
      //app cover image url
      getAppCoverImageUrl: _getAppCoverImageUrl,
      setAppCoverImageUrl: _setAppCoverImageUrl,
      getAppMeta: _getAppMeta,
      getFullMetaData: _getFullMetaData
    },
    game: {
      velocity: 1,
      maxCoinCount: 30,
      FPS: 64,
      INTERVAL: 15.625,
      GameItemSize: 64,
      HorizontalUnit: 32,
      VerticakUnit: 8,
      DepthUnit: 16,
      MinMoveSpd: 0.1,
      MinAtkSpd: 0.1,
      BaseBuildQuota: 5
    }
  }
}();

module.exports = Config;