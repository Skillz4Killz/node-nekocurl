# Nekocurl
A HTTP client class that uses plug-in drivers to do HTTP requests. Default driver, if available, is snekfetch.

# Installation
```
npm install nekocurl
``` 

# How to use
```js
const Nekocurl = require('nekocurl');
(new Nekocurl('https://github.com/some/JSON/endpoint.json', { method: 'GET', json: true })).send().then((json) => {
    console.log(json);
});
```
