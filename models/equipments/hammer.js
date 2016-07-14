var inherits = require('util').inherits;
var Weapon = require('./weapon');

function Hammer(data) {
  Weapon.call(this, data);
}
inherits(Hammer, Weapon);

Hammer.prototype.toJson = function() {
  var jsonModel = Weapon.prototype.toJson.apply(this);
  jsonModel.extraBuildQuota = this.extraBuildQuota;
  return jsonModel;
};

module.exports = Hammer;