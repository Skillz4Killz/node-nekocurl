/**
 * Nekocurl driver snekfetch
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const Snekfetch = require('snekfetch');

function driverSnekfetch(options, driverOptions) {
    if(!driverOptions || !(driverOptions instanceof Object)) {
        driverOptions = { };
    }

    const request = new Snekfetch(options.method, options.url, Object.assign({ headers: options.headers, data: options.data }, driverOptions));
    
    for(let i = 0; i < options.files.length; i++) {
        request.attach(options.files[i].name, options.files[i].data, options.files[i].filename);
    }
    
    return request;
}

module.exports = {
    multiple: false,
    driver: driverSnekfetch
};
