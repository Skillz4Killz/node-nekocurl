# nekoclient
A HTTP client that uses plug-in drivers to do HTTP requests. Default driver, if available, is snekfetch.

# Installation
```
npm install nekoclient
``` 

# How to use
```js
const nekoclient = require('nekoclient');
const client = (new nekoclient('https://github.com/someJSONendpoint.json', { method: 'GET', json: true })).send().then((json) => {
    console.log(json);
});
```
