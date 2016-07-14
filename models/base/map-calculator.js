var Vector = require('./vector');
var GameConfig = require('../../bin/config').game;

module.exports = {
  coordToPos: function(coord) {
    //TODO imp coord to Pos
    return new Vector(coord.x*GameConfig.HorizontalUnit, coord.y*GameConfig.VerticakUnit, coord.z*GameConfig.DepthUnit);
  }
};