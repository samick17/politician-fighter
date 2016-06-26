var crypto = require('crypto');

function genId() {
  return crypto.randomBytes(20).toString('hex');
}

function generateHash(len) {
  var symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var hash = '';
  for (var i = 0; i < len; i++) {
    var symIndex = Math.floor(Math.random() * symbols.length);
    hash += symbols.charAt(symIndex);
  }
  return hash;
}

function genValue(range) {
  return Math.floor(Math.random() * range)
}

function genRandomPos(width, height) {
  return new Position(genValue(config.width), genValue(config.height))
}

function genRotation() {
  return Math.random() * (Math.PI * 2)
}

function genRandomColor() {
  var color = '#' + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6);
  var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  var r = (parseInt(c[1], 16) - 32) > 0 ? (parseInt(c[1], 16) - 32) : 0;
  var g = (parseInt(c[2], 16) - 32) > 0 ? (parseInt(c[2], 16) - 32) : 0;
  var b = (parseInt(c[3], 16) - 32) > 0 ? (parseInt(c[3], 16) - 32) : 0;

  return {
    fill: color,
    border: '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  };
}

function clamp(c, min, max) {
  return c < min ? min : c > max ? max : c
}

function useDefault(v, d) {
  return (typeof v !== 'undefined' && v !== null) ? v : d
}

String.prototype.format = function() {
  var s = this,
  i = arguments.length;
  while (i--)
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  return s;
};

var OpType = {
  create: 'a',
  update: 'b',
  remove: 'c'
};

module.exports = {
  genId: genId,
  generateHash: generateHash,
  genValue: genValue,
  genRandomPos: genRandomPos,
  genRotation: genRotation,
  genRandomColor: genRandomColor,
  clamp: clamp,
  useDefault: useDefault,
  OpType: OpType
};