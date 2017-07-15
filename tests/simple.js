/**
 * Nekocurl test simple
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const path = require('path');
const Nekocurl = require(path.join(__dirname, '..', 'index.js'));

const request = new Nekocurl(undefined, { json: true });

console.log('static', Nekocurl.defaultDriver, Nekocurl.availableDrivers, Nekocurl.defaultUseragent, Nekocurl.version, Nekocurl.hasDriver('request'));
console.log('instance', request.getDriver(), request.getDrivername());

request.setURL('https://curl.neko.run/test.json').setMethod('GET').setDriver('snekfetch');
request.setHeader('Referer', 'https://github.com').setHeaders({ 'Cache-Control': 'no-cache' });

request.send().then(console.log);
