/**
 * Nekoclient driver snekfetch
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekoclient
*/

const Snekfetch = require('snekfetch');

const driverSnekfetch = (options) => {
    const request = new Snekfetch(options.method, options.url, { headers: options.headers, data: options.data });
    
    if(options.files.length > 0) {
        for(let i = 0; i < options.files.length; i++) {
            request.attach(options.files[i].name, options.files[i].data, options.files[i].filename);
        }
    }
    
    return request;
};

module.exports = driverSnekfetch;
