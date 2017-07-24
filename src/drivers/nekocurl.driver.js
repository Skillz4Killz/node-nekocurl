/**
 * Nekocurl driver nekocurl
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const http = require('http');
const https = require('https');
const path = require('path');
const querystring = require('querystring');
const { PassThrough } = require('stream');
const URL = require('url');
const zlib = require('zlib');

const FormData = require(path.join(__dirname, '..', 'formdata.js'));

function attachFile(options, form, name, data, filename) {
    form.append(name, data, filename);
    options.data = form;
}

function doRedirect(options, driverOptions, request, response, resolve) {
    if(driverOptions.followRedirects !== false && [ 301, 302, 303, 307, 308 ].includes(response.statusCode)) {
        let method = options.method;
        let data = options.data;
        
        if([ 301, 302, 303 ].includes(response.statusCode)) {
            if(response.statusCode === 303 || options.method !== 'HEAD') {
                method = 'GET';
            }
            
            data = null;
        }
        
        driverNekocurl(Object.assign(options, { url: getNewURL(response, URL.parse(options.url)), method: method, data: data }), driverOptions).then((resp) => resolve(resp)).catch((error) => request.emit('error', error)); // eslint-disable-line no-use-before-define
        return true;
    }
    
    return false;
}

function doShouldUnzip(response) {
    if(response.statusCode === 204 || response.statusCode === 304 || response.headers['content-length'] === '0') {
        return false;
    }
    
    return /^\s*(?:deflate|gzip)\s*$/.test(response.headers['content-encoding']);
}

function doUnzip(response, stream) {
    if(doShouldUnzip(response) === true) {
        response.pipe(zlib.createUnzip({ flush: zlib.Z_SYNC_FLUSH, finishFlush: zlib.Z_SYNC_FLUSH })).pipe(stream);
    } else {
        response.pipe(stream);
    }
}

function getNewURL(response, urlobj) {
    if(/^https?:\/\//i.test(response.headers.location)) {
        return response.headers.location;
    }
    
    return URL.resolve(URL.format(urlobj), response.headers.location);
}

function makeBody(response, buffer, text) {
    let body = buffer;
    
    const type = String(response.headers['content-type']).split(';')[0].trim();
    switch(type) {
        case 'application/json':
            try {
                body = JSON.parse(text);
            } catch(err) {
                /* continue regardless of error */
            }
        break; // eslint-disable-line indent
        case 'application/x-www-form-urlencoded':
            body = querystring.parse(text);
        break; // eslint-disable-line indent
        default:
            /* this comment is my body */
        break; // eslint-disable-line indent
    }
    
    return body;
}

function applyOptionsToRequest(options) {
    if(options.files.length > 0) {
        const form = new FormData();
        options.headers['content-type'] = 'multipart/form-data; boundary='+form.boundary;
        
        for(let i = 0; i < options.files.length; i++) {
            attachFile(options, form, options.files[i].name, options.files[i].data, options.files[i].filename);
        }
    }
    
    if(options.method !== 'HEAD') {
        options.headers['accept-encoding'] = 'gzip, deflate';
    }
    
    return undefined;
}

function driverNekocurl(options, driverOptions) {
    applyOptionsToRequest(options);
    
    const url = URL.parse(options.url);
    url.method = options.method;
    url.headers = options.headers;

    const error = new Error(); // just to get an useful stack trace, maybe
    return new Promise((resolve, reject) => {
        const request = (url.protocol.includes('https') === true ? https : http).request(url);
        
        const handleError = (err) => {
            if(!err) {
                err = error;
                err.message = 'An unknown error occured';
            }
            
            err.request = request;
            reject(err);
        };
        
        request.once('abort', handleError).once('aborted', handleError).once('error', handleError).once('response', (response) => {
            const stream = new PassThrough();
            doUnzip(response, stream);
            
            const dataChunks = [ ];
            
            stream.on('data', (chunk) => {
                dataChunks.push(chunk);
            });

            stream.once('end', () => {
                const body = Buffer.concat(dataChunks);
                const text = body.toString();
                
                const redirect = doRedirect(options, driverOptions, request, response, resolve);
                if(redirect === true) {
                    return;
                }
                
                const res = {
                    request: request,
                    body: makeBody(response, body, text),
                    text: text,
                    headers: response.headers,
                    status: response.statusCode,
                    statusText: (response.statusText || http.STATUS_CODES[response.statusCode])
                };
                
                if(response.statusCode >= 200 && response.statusCode < 300) {
                    return resolve(res);
                }
                
                error.message = (res.status+' '+res.statusText).trim();
                return reject(Object.assign(error, res));
            });
        });
        
        request.end((options.data ? (options.data.finalize ? options.data.finalize() : options.data) : undefined));
    });
}

module.exports = {
    multiple: false,
    driver: driverNekocurl
};
