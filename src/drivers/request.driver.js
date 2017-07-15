/**
 * Nekocurl driver request
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const mimetypes = require('mime-types');
const request = require('request');

const driverRequest = (options, driverOptions) => {
    let files = null;
    if(options.files.length > 0) {
        files = { };
        for(let i = 0; i < options.files.length; i++) {
            files[options.files[i].name] = {
                value: options.files[i].data
            };
            
            if(options.files[i].filename) {
                files[options.files[i].name].options = {
                    filename: options.files[i].filename,
                    contentType: mimetypes.contentType(options.files[i].filename)
                };
            }
        }
    }
    
    try {
        if(options.json === true && typeof options.data === 'string' && options.data.length > 0) {
            options.data = JSON.parse(options.data);
        }
    } catch(e) {
        /* continue regardless of error */
    }
    
    if(!driverOptions || !(driverOptions instanceof Object)) {
        driverOptions = { };
    }
    
    return new Promise((resolve, reject) => {
        request(Object.assign({ uri: options.url, method: options.method, headers: options.headers, form: (files ? files : undefined), body: (options.data ? options.data : undefined), json: options.json }, driverOptions), (err, res) => {
            if(err) {
                return reject(err);
            }
            
            return resolve(res);
        });
    });
};

module.exports = {
    multiple: false,
    driver: driverRequest
};
