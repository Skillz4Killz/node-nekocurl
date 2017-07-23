/**
 * Nekocurl test request
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const assert = require('assert');
const path = require('path');
const querystring = require('querystring');

const Nekocurl = require(path.join(__dirname, '..', 'index.js'));

describe('Nekocurl testing with request', function () {
    this.timeout(10000); // eslint-disable-line no-invalid-this
    
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('http://localhost:5001/head', { method: 'HEAD', json: true })).setDriver('request').send(true).then((req) => {
                assert.strictEqual(req.headers['x-request-method'], 'HEAD');
                return undefined;
            });
        });
    });
    
    describe('Simple GET with params', () => {
        it('should return true if returned args are equal to passed GET params', () => {
            const params = { But: 'will it blend?', Nekocurl: 'is amazing' };
            return (new Nekocurl('http://localhost:5001/get?'+querystring.stringify(params), { json: true })).setDriver('snekfetch').send().then((json) => {
                assert.deepStrictEqual(json.args, params);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with headers', () => {
        it('should return true if returned headers are equal to specified ones', () => {
            const headers = { 'accept': 'application/json', 'accept-encoding': 'gzip, deflate', 'connection': 'close', 'content-type': 'application/json', 'x-userlimit': '500' };
            return (new Nekocurl('http://localhost:5001/get', { headers: headers, json: true })).setDriver('request').setHeader('Accept', 'application/json').send().then((json) => {
                delete json.headers['user-agent'];
                delete json.headers['host'];
                
                assert.deepStrictEqual(json.headers, headers);
                return undefined;
            });
        });
    });
    
    describe('Simple POST', () => {
        it('should return true if returned post params are equal to specified ones', () => {
            const params = [{ name: 'test', data: 'hahaha' }];
            return (new Nekocurl('http://localhost:5001/post', { json: true })).setDriver('request').setMethod('POST').attachFile(params[0].name, params[0].data).send().then((json) => {
                assert.deepStrictEqual((Object.keys(json.form) > 0 ? json.form : json.json), { [params[0].name]: { value: params[0].data } });
                return undefined;
            });
        });
    });
    
    describe('JSON POST', () => {
        it('should return true if returned json data is equal to specified data', () => {
            const data = { test: 'is this a joke' };
            return (new Nekocurl('http://localhost:5001/post', { data: JSON.stringify(data), json: true })).setDriver('request').setMethod('POST').send().then((json) => {
                assert.deepStrictEqual(json.json, data);
                return undefined;
            });
        });
    });
    
    describe('POST upload', function () {
        this.timeout(30000); // eslint-disable-line no-invalid-this
        
        it('should return true if returned file data is equal to specified data', async () => {
            const image = await (new Nekocurl('https://i.imgur.com/1sDDaC2.png', { autoString: false, driver: 'request', method: 'GET' })).setDriverOptions({ encoding: null }).send();
            const files = [{ name: 'image', data: image, filename: 'image.png' }];
            const assertion = { image: 'data:image/png;base64,'+image.toString('base64') };
            
            return await (new Nekocurl('http://localhost:5001/post', { autoString: false, files: files, json: true })).setDriver('request').setMethod('POST').send().then((json) => {
                assert.deepStrictEqual(json.files, assertion);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw error', () => {
        it('should throw 405 Method Not Allowed error (GET to POST endpoint request)', () => {
            return (new Nekocurl('http://localhost:5001/fail', { json: true })).setDriver('request').send(true).catch((req) => Promise.resolve(req)).then((req) => {
                assert.strictEqual(req.status, 405);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw driver error', () => {
        it('should throw due to invalid url passed as driver option', () => {
            return (new Nekocurl('http://localhost:5001/get', { json: true })).setDriver('request').setDriverOptions({ uri: 'nekocurl' }).send(true).catch((req) => {
                assert.throws(() => {
                    throw req;
                }, Error);
            });
        });
    });
});
