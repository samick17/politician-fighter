function createRenderer() {
  const path = require('path');
  return function(res, name, json) {
    res.sendFile(path.join(__dirname, '../views', name+'.html'), json);
  };
}

module.exports = {
  render: createRenderer()
};