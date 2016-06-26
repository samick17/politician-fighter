/*multimap-server*/
//const mapServerConfig = require('./launch-config.json');
/*single map-server*/
const mapServerConfig = require('./single-launch-config.json');
const fork = require('child_process').fork;

for(var i in mapServerConfig.mapServer) {
  var mapServerData = mapServerConfig.mapServer[i]
  fork('./bin/www', [JSON.stringify(mapServerData)]);
  console.log('start map server at '+mapServerData.port)
}