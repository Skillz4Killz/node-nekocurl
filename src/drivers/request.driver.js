/**
 * Nekocurl driver request
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const mimetypes = require('mime-types');
const request = require('request');

const driverRequest = (options) => {
    let files;
    if(options.files.length > 0) {
        files = { };
        for(let i = 0; i < options.files.length; i++) {
            files[options.files[i].name] = {
                value: options.files[i].data,
                options: {
                    filename: options.files[i].filename,
                    contentType: mimetypes.contentType(options.files[i].filename)
                }
            };
        }
    }
    
    try {
        if(options.json === true && typeof options.data === 'string' && options.data.length > 0) {
            options.data = JSON.parse(options.data);
        }
    } catch(e) {
        /* continue regardless of error */
    }
    
    return new Promise((resolve, reject) => {
        request({ uri: options.url, method: options.method, headers: options.headers, form: files, body: (options.data ? options.data : undefined), json: options.json, encoding: options.encoding }, (err, res, body) => {
            if(err) {
                return reject(err);
            }
            
            resolve(res);
        });
    });
};

module.exports = {
    multiple: false,
    driver: driverRequest
};
