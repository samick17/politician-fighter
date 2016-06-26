var fs = require('fs');

//ssl license

var keyPath = 'ssl/privatekey.key';
var certPath = 'ssl/privatekey.crt';

var hskey = fs.readFileSync(keyPath);
var hscert = fs.readFileSync(certPath);

var options = {
  host: '02.tectronix.net',
  key: hskey,
  cert: hscert,
  ca: hscert,
  rejectUnauthorized: false,
  requestCert: true,
  agent: false
};

//ssl object

var ssl = {};

ssl.options = options;

module.exports = ssl;