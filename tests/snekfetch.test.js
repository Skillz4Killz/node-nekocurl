/**
 * Nekocurl test snekfetch
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const assert = require('assert');
const path = require('path');
const querystring = require('querystring');

const Nekocurl = require(path.join(__dirname, '..', 'index.js'));

describe('Nekocurl testing with snekfetch', function () {
    this.timeout(10000); // eslint-disable-line no-invalid-this
    
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('http://localhost:5001/head', { method: 'HEAD', json: true })).setDriver('snekfetch').send().then((req) => {
                assert.strictEqual(req['x-request-method'], 'HEAD');
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
            return (new Nekocurl('http://localhost:5001/get', { json: true })).setDriver('snekfetch').setHeader('Accept', 'application/json').setHeaders(headers).send().then((json) => {
                delete json.headers['user-agent'];
                delete json.headers['host'];
                
                assert.deepStrictEqual(json.headers, headers);
                return undefined;
            });
        });
    });
    
    describe('Simple POST', () => {
        it('should return true if returned post params are equal to specified ones', () => {
            const params = [{ test: 'hahaha' }];
            return (new Nekocurl('http://localhost:5001/post', { json: true })).setDriver('snekfetch').setMethod('POST').attachFile(Object.keys(params[0])[0], params[0][Object.keys(params[0])[0]]).send().then((json) => {
                assert.deepStrictEqual(json.form, params[0]);
                return undefined;
            });
        });
    });
    
    describe('JSON POST', () => {
        it('should return true if returned json data is equal to specified data', () => {
            const data = { test: 'is this a joke' };
            return (new Nekocurl('http://localhost:5001/post', { json: true })).setDriver('snekfetch').setMethod('POST').setData(JSON.stringify(data)).send().then((json) => {
                assert.deepStrictEqual(json.json, data);
                return undefined;
            });
        });
    });
    
    describe('POST upload', function () {
        this.timeout(30000); // eslint-disable-line no-invalid-this
        
        it('should return true if returned file data is equal to specified data', async () => {
            const image = await (new Nekocurl(undefined, { autoString: false, driver: 'snekfetch', method: 'GET', driverOptions: { } })).setURL('https://i.imgur.com/1sDDaC2.png').send();
            const files = [{ name: 'image', data: image, filename: 'image.png' }];
            const assertion = { image: 'data:image/png;base64,'+image.toString('base64') };
            
            return await (new Nekocurl('http://localhost:5001/post', { autoString: false, json: true })).setDriver('snekfetch').setMethod('POST').attachFiles(files).send().then((json) => {
                assert.deepStrictEqual(json.files, assertion);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw error', () => {
        it('should throw 405 Method Not Allowed error (GET to POST endpoint request)', () => {
            return (new Nekocurl('http://localhost:5001/fail', { json: true })).setDriver('snekfetch').send(true).catch((req) => Promise.resolve(req)).then((req) => {
                assert.strictEqual(req.status, 405);
                return undefined;
            });
        });
    });
});
