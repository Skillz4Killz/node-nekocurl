# Nekocurl [![Code Climate](https://codeclimate.com/github/CharlotteDunois/node-nekocurl/badges/gpa.svg)](https://codeclimate.com/github/CharlotteDunois/node-nekocurl) [![NPM version](https://img.shields.io/npm/v/nekocurl.svg?maxAge=3600)](https://www.npmjs.com/package/nekocurl) [![dependencies Status](https://david-dm.org/CharlotteDunois/node-nekocurl/status.svg)](https://david-dm.org/CharlotteDunois/node-nekocurl) [![peerDependencies Status](https://david-dm.org/CharlotteDunois/node-nekocurl/peer-status.svg)](https://david-dm.org/CharlotteDunois/node-nekocurl?type=peer)

A HTTP client class that uses plug-in drivers to do HTTP requests. Default driver, if available, is snekfetch.

You need to install the packages for the drivers yourself (peer dependencies). Nekocurl comes with drivers for `snekfetch` and `request`.

# Installation
```
npm install nekocurl
```

# Example
```js
const Nekocurl = require('nekocurl');
(new Nekocurl(
    'https://curl.neko.run/test.json',
    {
        driver: 'snekfetch',
        method: 'GET',
        json: true
    }
)).send().then((json) => {
    console.log(json);
});
```

# Documentation
https://charlottedunois.github.io/node-nekocurl/
