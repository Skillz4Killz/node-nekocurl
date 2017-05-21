# Nekocurl
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
    'https://github.com/some/JSON/endpoint.json',
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
