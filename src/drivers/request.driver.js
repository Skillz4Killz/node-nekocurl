/**
 * Nekocurl driver request
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const mimetypes = require('mime-types');
const request = require('request-promise');

const driverRequest = (options) => {
    let files = undefined;
    if(options.files.length > 0) {
        files = { };
        for(let i = 0; i < options.files.length; i++) {
            if(options.files[i].url) {
                files[options.files[i].name] = options.files[i].url;
            } else {
                files[options.files[i].name] = {
                    value: options.files[i].data,
                    options: {
                        filename: options.files[i].filename,
                        contentType: mimetypes.contentType(options.files[i].filename)
                    }
                };
            }
        }
    }
    
    try {
        if(options.json === true && typeof options.data === 'string' && options.data.length > 0) {
            options.data = JSON.parse(options.data);
        }
    } catch(e) {
        
    }
    
    return request({ uri: options.url, method: options.method, headers: options.headers, form: files, body: (options.data ? options.data : undefined), json: options.json, encoding: options.encoding, resolveWithFullResponse: true });
};

module.exports = driverRequest;
