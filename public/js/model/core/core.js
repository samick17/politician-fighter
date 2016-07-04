const ArenaSettings = {
  BackgroundScale: 5,
  BaseLineHeight: 1,
  MIN_BASELINE: 0,
  MAX_BASELINE: 896,
  NextInputThreshold: 20,
  DOUBLE_KEYDOWN_THRESHOLD: 200,
};

const UserDevice = {
  PC: 0,
  Mobile: 1
};

function indexOfArrayProperty(arr, property, val) {
  for(var i in arr) {
    if(arr[i][property] === val)
      return i;
  }
  return -1;
}

function useDefault(v, d) {
  return (typeof v !== 'undefined' && v !== null) ? v : d
}

function genValue(range) {
  return Math.floor(Math.random()*range);
}

function getUserDevice() {
  var ua = navigator.userAgent;
  if(/Android/.test(ua) || /mobile/.test(ua) || /iPhone/.test(ua) || /iPad/.test(ua)) {
    return UserDevice.Mobile;
  }
  else if(/Windows NT/.test(ua)) {
    return UserDevice.PC;
  }
  else {
    return UserDevice.PC;
  }
};

//--begin utils
var idIndex = 0;
function genId() {
  var idx = idIndex;
  idIndex++;
  return idx;
}

function lerp(a, b, t) {
  return (1-t)*(b-a)+a;
}

function toHex(num) {
  return num.toString(16);
}

function randomRange(from, to) {
  return parseInt(Math.round(Math.random()*(to-from)))+from;
}