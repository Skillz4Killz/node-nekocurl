/**
 * Nekocurl test
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const assert = require('assert');
const path = require('path');
const querystring = require('querystring');

const Nekocurl = require(path.join(__dirname, '..', 'index.js'));
const pkg = require(path.join(__dirname, '..', 'package.json'));

const webserver = require(path.join(__dirname, 'webserver.js')); // eslint-disable-line no-unused-vars

describe('Nekocurl general testing', () => {
    describe('Has drivers nekocurl & snekfetch & request', () => {
        it('should return true', () => {
            assert.strictEqual(true, (Nekocurl.hasDriver('nekocurl') && Nekocurl.hasDriver('snekfetch') && Nekocurl.hasDriver('request')));
        });
    });
    
    describe('Make new instance with no explicit driver', () => {
        it('should return true if equal to default driver', () => {
            assert.strictEqual(Nekocurl.defaultDriver, (new Nekocurl()).getDrivername());
        });
    });
    
    describe('Default useragent is equal to null (defaults to default ua)', () => {
        it('should return true', () => {
            assert.strictEqual(null, Nekocurl.defaultUseragent);
        });
    });
    
    describe('Is nekocurl version equal to package.json', () => {
        it('should return true', () => {
            assert.strictEqual(pkg.version, Nekocurl.version);
        });
    });
    
    describe('Passing valid url to Nekocurl#isValidURL', () => {
        it('should return true', () => {
            assert.strictEqual(true, Nekocurl.isValidURL('https://curl.neko.run'));
        });
    });
    
    describe('Passing invalid url to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).setURL('https://curlneko'); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing invalid driver to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).setDriver('curl'); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing invalid method to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).setMethod(5); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing invalid header to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).setHeader(); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing invalid headers to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).setHeaders(); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing an object of invalid headers to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).setHeaders({ test: undefined }); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing invalid data to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).setData({ }); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing invalid file to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).attachFile(); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing invalid files to Nekocurl', () => {
        it('should throw', () => {
            assert.throws(() => {
                const nk = (new Nekocurl()).attachFiles(); // eslint-disable-line no-unused-vars
            }, Error);
        });
    });
    
    describe('Passing no url to Nekocurl and trying to send', () => {
        it('should throw', () => {
            return (new Nekocurl()).send().catch((error) => {
                assert.throws(() => {
                    throw error;
                }, Error);
            });
        });
    });
});

describe('Nekocurl testing', function () {
    this.timeout(10000); // eslint-disable-line no-invalid-this
    
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('http://localhost:5001/head', { method: 'HEAD', json: true })).setDriver('nekocurl').send().then((req) => {
                assert.deepStrictEqual(req['x-request-method'], 'HEAD');
                return undefined;
            });
        });
    });
    
    describe('Simple GET with params', () => {
        it('should return true if returned args are equal to passed GET params', () => {
            const params = { But: 'will it blend?', Nekocurl: 'is amazing' };
            return (new Nekocurl('http://localhost:5001/get?'+querystring.stringify(params), { json: true })).setDriver('nekocurl').send().then((json) => {
                assert.deepStrictEqual(json.args, params);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with headers', () => {
        it('should return true if returned headers are equal to specified ones', () => {
            const headers = { 'accept': 'application/json', 'accept-encoding': 'gzip, deflate', 'connection': 'close', 'content-type': 'application/json', 'x-userlimit': '500' };
            return (new Nekocurl('http://localhost:5001/get', { json: true })).setDriver('nekocurl').setHeader('Accept', 'application/json').setHeaders(headers).send().then((json) => {
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
            return (new Nekocurl('http://localhost:5001/post', { json: true })).setDriver('nekocurl').setMethod('POST').attachFile(Object.keys(params[0])[0], params[0][Object.keys(params[0])[0]]).send().then((json) => {
                assert.deepStrictEqual(json.form, params[0]);
                return undefined;
            });
        });
    });
    
    describe('JSON POST', () => {
        it('should return true if returned json data is equal to specified data', () => {
            const data = { test: 'is this a joke' };
            return (new Nekocurl('http://localhost:5001/post', { json: true })).setDriver('nekocurl').setMethod('POST').setData(JSON.stringify(data)).send().then((json) => {
                assert.deepStrictEqual(json.json, data);
                return undefined;
            });
        });
    });
    
    describe('POST upload', function () {
        this.timeout(30000); // eslint-disable-line no-invalid-this
        
        it('should return true if returned file data is equal to specified data', async () => {
            const image = await (new Nekocurl(undefined, { autoString: false, driver: 'nekocurl', method: 'GET' })).setURL('https://i.imgur.com/1sDDaC2.png').send();
            const files = [{ name: 'image', data: image, filename: 'image.png' }];
            const assertion = { image: 'data:image/png;base64,'+image.toString('base64') };
            
            return await (new Nekocurl('http://localhost:5001/post', { autoString: false, json: true })).setDriver('nekocurl').setMethod('POST').attachFiles(files).send().then((json) => {
                assert.deepStrictEqual(json.files, assertion);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw error', () => {
        it('should throw 405 Method Not Allowed error (GET to POST endpoint request)', () => {
            return (new Nekocurl('http://localhost:5001/fail', { json: true })).setDriver('nekocurl').send(true).catch((req) => Promise.resolve(req)).then((req) => {
                assert.strictEqual(req.status, 405);
                return undefined;
            });
        });
    });
    
    describe('Redirection Following', () => {
        it('should follow to /head', () => {
            return (new Nekocurl('http://localhost:5001/redirect', { method: 'HEAD', json: true })).setDriver('nekocurl').send().then((req) => {
                assert.deepStrictEqual(req['x-request-method'], 'HEAD');
                return undefined;
            });
        });
    });
    
    describe('Redirection Following Relative', () => {
        it('should follow to /head', () => {
            return (new Nekocurl('http://localhost:5001/redirectRelative', { method: 'GET', json: true })).setDriver('nekocurl').send(true).then((req) => {
                assert.deepStrictEqual(req.headers['x-request-method'], 'GET');
                return undefined;
            });
        });
    });
    
    describe('Redirection Following Disabled', () => {
        it('should not follow to /head and return with HTTP 301', () => {
            return (new Nekocurl('http://localhost:5001/redirect', { method: 'HEAD', json: true })).setDriver('nekocurl').setDriverOptions({ followRedirects: false }).send().catch((req) => Promise.resolve(req)).then((req) => {
                assert.deepStrictEqual(req.status, 302);
                return undefined;
            });
        });
    });
    
    describe('Redirection Following 303', () => {
        it('should follow to /seeOther and return with HTTP 204', () => {
            return (new Nekocurl('http://localhost:5001/redirectSeeOther', { method: 'HEAD', json: true })).setDriver('nekocurl').send(true).catch((req) => Promise.resolve(req)).then((req) => {
                assert.deepStrictEqual(req.status, 204);
                return undefined;
            });
        });
    });
    
    describe('Compression with a GET request', () => {
        it('should return the sent query string back - compressed', () => {
            const params = { Nekocurl: 'is amazing' };
            return (new Nekocurl('http://localhost:5001/compression-url?'+querystring.stringify(params), { json: true })).setDriver('nekocurl').send().catch((req) => Promise.resolve(req)).then((req) => {
                assert.deepStrictEqual(req, params);
                return undefined;
            });
        });
    });
});

describe('Nekocurl testing with snekfetch', function () {
    this.timeout(10000); // eslint-disable-line no-invalid-this
    
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('http://localhost:5001/head', { method: 'HEAD', json: true })).setDriver('snekfetch').send().then((req) => {
                assert.deepStrictEqual(req['x-request-method'], 'HEAD');
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
            const assertion = { image: 'data:[objectobject];base64,'+image.toString('base64') };
            
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

describe('Nekocurl testing with request', function () {
    this.timeout(10000); // eslint-disable-line no-invalid-this
    
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('http://localhost:5001/head', { method: 'HEAD', json: true })).setDriver('request').send(true).then((req) => {
                assert.deepStrictEqual(req.headers['x-request-method'], 'HEAD');
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
