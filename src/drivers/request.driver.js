/**
 * Nekocurl driver request
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const mimetypes = require('mime-types');
const request = require('request');

function makeFilesObject(files) {
    if(files.length === 0) {
        return undefined;
    }

    const obj = { };
    for(let i = 0; i < files.length; i++) {
        obj[files[i].name] = {
            value: files[i].data
        };
        
        if(files[i].filename) {
            obj[files[i].name].options = {
                filename: files[i].filename,
                contentType: mimetypes.contentType(files[i].filename)
            };
        }
    }
    
    return obj;
}

const driverRequest = (options, driverOptions) => {
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
        request(Object.assign({ uri: options.url, method: options.method, headers: options.headers, form: makeFilesObject(options.files), body: (options.data ? options.data : undefined), json: options.json }, driverOptions), (err, res) => {
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
