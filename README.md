# Nekocurl
[![Build Status](https://scrutinizer-ci.com/g/CharlotteDunois/node-nekocurl/badges/build.png?b=master)](https://scrutinizer-ci.com/g/CharlotteDunois/node-nekocurl/build-status/master) [![NPM version](https://img.shields.io/npm/v/nekocurl.svg?maxAge=3600)](https://www.npmjs.com/package/nekocurl) [![dependencies Status](https://david-dm.org/CharlotteDunois/node-nekocurl/status.svg)](https://david-dm.org/CharlotteDunois/node-nekocurl) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/CharlotteDunois/node-nekocurl/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/CharlotteDunois/node-nekocurl/?branch=master) [![Code Coverage](https://scrutinizer-ci.com/g/CharlotteDunois/node-nekocurl/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/CharlotteDunois/node-nekocurl/?branch=master)

A HTTP client class that uses plug-in drivers to do HTTP requests. Default driver is the native http/https module ("nekocurl"), unless you overwrite it.

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
        driver: 'nekocurl',
        method: 'GET',
        json: true
    }
)).send().then((json) => {
    console.log(json);
});

// or
Nekocurl.get('https://curl.neko.run/test.json', { json: true }).then((json) => {
    console.log(json);
});
```

Static methods (lowercase naming) are available for the following methods: GET, HEAD, POST, PUT, PATCH and DELETE.

# Documentation
https://charlottedunois.github.io/node-nekocurl/
