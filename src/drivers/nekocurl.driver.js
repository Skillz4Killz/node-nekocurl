/**
 * Nekocurl driver nekocurl
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const http = require('http');
const https = require('https');
const path = require('path');
const qs = require('querystring');
const Stream = require('stream');
const URL = require('url');
const util = require('util');
const zlib = require('zlib');

const FormData = require(path.join(__dirname, '..', 'FormData'));

function attachFile(options, form, name, data, filename) {
    form.append(name, data, filename);
    options.data = form;
}

function doUnzip(response) {
    if(response.statusCode === 204 || response.statusCode === 304 || response.headers['content-length'] === '0') {
        return false;
    }
    
    return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
}

function getNewURL(response) {
    if(/^https?:\/\//i.test(response.headers.location)) {
        return response.headers.location;
    }
    
    return URL.resolve(URL.format({
        protocol: (request.connection.encrypted ? 'https:' : 'http:'),
        hostname: request.getHeader('host'),
        pathname: request.path.split('?')[0],
        query: request.query
    }), response.headers.location);
}

function makeBody(response, text) {
    let body = text;
    
    const type = response.headers['content-type'];
    if(type && type.includes('application/json')) {
        try {
            body = JSON.parse(text);
        } catch (err) {
            /* continue regardless of error */
        }
    } else if (type && type.includes('application/x-www-form-urlencoded')) {
        body = qs.parse(text);
    }
    
    return body;
}

function makeRequest(options, driverOptions, Nekocurl) { // eslint-disable-line complexity
    if(!driverOptions || !(driverOptions instanceof Object)) {
        driverOptions = { };
    }
    
    const url = URL.parse(options.url);
    url.method = options.method;
    url.headers = options.headers;
    
    const error = new Error();
    const request = (options.protocol.replace(':', '') === 'https' ? https : http).request(url);
    
    return new Promise((resolve, reject) => {
        const handleError = (err) => {
            if (!err) {
                err = error;
                err.message = 'An unknown error occured';
            }
            
            err.request = request;
            reject(err);
        };
        
        request.once('abort', handleError).once('aborted', handleError).once('error', handleError).once('response', (response) => {
            const stream = new Stream.PassThrough();
            
            if(doUnzip(response)) {
                response.pipe(zlib.createUnzip({
                    flush: zlib.Z_SYNC_FLUSH,
                    finishFlush: zlib.Z_SYNC_FLUSH
                })).pipe(stream);
            } else {
                response.pipe(stream);
            }
            
            const body = [ ];
            
            stream.on('data', (chunk) => {
                if(!this.push(chunk)) { // eslint-disable-line no-invalid-this
                    this.pause(); // eslint-disable-line no-invalid-this
                }
              
                body.push(chunk);
            });
    
            stream.once('end', () => {
                this.push(null); // eslint-disable-line no-invalid-this
                const concated = Buffer.concat(body);
                
                if(driverOptions.followRedirects !== false && [ 301, 302, 303, 307, 308 ].includes(response.statusCode)) {
                    if([ 301, 302 ].includes(response.statusCode)) {
                        if(options.method !== 'HEAD') {
                            options.method = 'GET';
                        }
                        
                        options.data = null;
                    } else if(response.statusCode === 303) {
                        options.method = 'GET';
                    }
                    
                    return resolve(driverNekocurl(Object.assign(options, { url: getNewURL(response) }), driverOptions, Nekocurl)); // eslint-disable-line no-use-before-define
                }
      
                const res = {
                    request: request,
                    body: makeBody(response, concated.toString()),
                    text: concated.toString(),
                    headers: response.headers,
                    status: response.statusCode,
                    statusText: (response.statusText || http.STATUS_CODES[response.statusCode])
                };
      
                if(response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(res);
                } else {
                    error.message = (res.status+' '+res.statusText).trim();
                    Object.assign(error, res);
                    reject(error);
                }
            });
        });
        
        if(options.files.length > 0) {
            const form = new FormData();
            Nekocurl.setHeader('Content-Type', 'multipart/form-data; boundary='+form.boundary);
            
            for(let i = 0; i < options.files.length; i++) {
                attachFile(options, form, options.files[i].name, options.files[i].data, options.files[i].filename);
            }
        }
        
        request.end((options.data ? (options.data.finalize ? options.data.finalize() : options.data) : undefined));
    });
}

util.inherits(makeRequest, Stream.Readable);

const driverNekocurl = (...options) => {
    return (new makeRequest(...options));
};

module.exports = {
    multiple: false,
    driver: driverNekocurl
};
