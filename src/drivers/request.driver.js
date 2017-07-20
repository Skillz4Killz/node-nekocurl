/**
 * Nekocurl driver request
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const mimetypes = require('mime-types');
const request = require('request');

function makeFile(obj, file) {
    if(file.filename) {
        obj.formData[file.name] = {
            value: file.data,
            options: {
                filename: file.filename,
                contentType: mimetypes.contentType(file.filename)
            }
        };
    } else {
        obj.form[file.name] = {
            value: file.data
        };
    }
    
    return undefined;
}

function makeFilesObject(files) {
    if(files.length === 0) {
        return undefined;
    }

    const obj = { form: { }, formData: { } };
    for(let i = 0; i < files.length; i++) {
        makeFile(obj, files[i]);
    }
    
    if(Object.keys(obj.form).length === 0) {
        obj.form = undefined;
    }
    
    if(Object.keys(obj.formData).length === 0) {
        obj.formData = undefined;
    }
    
    return obj;
}

function driverRequest(options, driverOptions)  {
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
    
    const error = new Error();
    
    return new Promise((resolve, reject) => {
        request(Object.assign({ uri: options.url, method: options.method, headers: options.headers, body: (options.data ? options.data : undefined), json: options.json }, makeFilesObject(options.files), driverOptions), (err, res) => {
            if(err) {
                return reject(err);
            }
            
            res.status = res.statusCode;
            if(res.status >= 400) {
                error.message = res.status+' '+res.statusMessage;
                error.status = res.status;
                error.statusText = res.statusMessage;
                
                error.request = res;
                return reject(error);
            }
            
            return resolve(res);
        });
    });
}

module.exports = {
    multiple: false,
    driver: driverRequest
};
