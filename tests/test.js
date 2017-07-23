/**
 * Nekocurl test
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const path = require('path');
const webserver = require(path.join(__dirname, 'webserver.js')); // eslint-disable-line no-unused-vars

//Nekocurl general testing
require(path.join(__dirname, 'general.test.js'));

//Nekocurl driver test nekocurl
require(path.join(__dirname, 'nekocurl.test.js'));

//Nekocurl driver test snekfetch
require(path.join(__dirname, 'snekfetch.test.js'));

//Nekocurl driver test request
require(path.join(__dirname, 'request.test.js'));
