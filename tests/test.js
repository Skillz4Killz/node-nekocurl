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

describe('Nekocurl testing', () => {
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('https://curl.neko.run/testHEAD.php', { method: 'HEAD', json: true })).setDriver('nekocurl').setHeader('User-Agent', 'Neko.run HEAD test').send().then((req) => {
                assert.deepStrictEqual('HEAD', req['x-request-method']);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with params', () => {
        it('should return true if returned args are equal to passed GET params', () => {
            const params = { But: 'will it blend?', Nekocurl: 'is amazing' };
            return (new Nekocurl('https://httpbin.org/get?'+querystring.stringify(params), { json: true })).setDriver('nekocurl').send().then((json) => {
                assert.deepStrictEqual(params, json.args);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with headers', () => {
        it('should return true if returned headers are equal to specified ones', () => {
            const headers = { 'Accept': 'application/json', 'Accept-Encoding': 'gzip, deflate', 'Connection': 'close', 'Content-Type': 'application/json', 'Host': 'httpbin.org', 'User-Agent': 'Nekocurl Unit-Testing', 'X-Userlimit': '500' };
            return (new Nekocurl('https://httpbin.org/headers', { json: true })).setDriver('nekocurl').setHeader('Accept', 'application/json').setHeaders(headers).send().then((json) => {
                assert.deepStrictEqual(headers, json.headers);
                return undefined;
            });
        });
    });
    
    describe('Simple POST', () => {
        it('should return true if returned post params are equal to specified ones', () => {
            const params = [{ test: 'hahaha' }];
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('nekocurl').setMethod('POST').attachFile(Object.keys(params[0])[0], params[0][Object.keys(params[0])[0]]).send().then((json) => {
                assert.deepStrictEqual(params[0], json.form);
                return undefined;
            });
        });
    });
    
    describe('JSON POST', () => {
        it('should return true if returned json data is equal to specified data', () => {
            const data = { test: 'is this a joke' };
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('nekocurl').setMethod('POST').setData(JSON.stringify(data)).send().then((json) => {
                assert.deepStrictEqual(data, json.json);
                return undefined;
            });
        });
    });
    
    describe('POST upload', function () {
        this.timeout(20000); // eslint-disable-line no-invalid-this
        
        it('should return true if returned file data is equal to specified data', async () => {
            const image = await (new Nekocurl(undefined, { autoString: false, driver: 'nekocurl', method: 'GET', driverOptions: {} })).setURL('https://i.imgur.com/1sDDaC2.png').send();
            const files = [{ name: 'image', data: image, filename: 'image.png' }];
            const assertion = { image: 'data:[object Object];base64,'+image.toString('base64') };
            
            return await (new Nekocurl('https://httpbin.org/post', { autoString: false, json: true })).setDriver('nekocurl').setMethod('POST').attachFiles(files).send().then((json) => {
                assert.deepStrictEqual(assertion, json.files);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw error', () => {
        it('should throw 405 Method Not Allowed error (GET to POST endpoint request)', () => {
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('nekocurl').send(true).catch((req) => Promise.resolve(req)).then((req) => {
                assert.strictEqual(405, req.status);
                return undefined;
            });
        });
    });
});

describe('Nekocurl testing with snekfetch', () => {
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('https://curl.neko.run/testHEAD.php', { method: 'HEAD', json: true })).setDriver('snekfetch').setHeader('User-Agent', 'Neko.run HEAD test').send().then((req) => {
                assert.deepStrictEqual('HEAD', req['x-request-method']);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with params', () => {
        it('should return true if returned args are equal to passed GET params', () => {
            const params = { But: 'will it blend?', Nekocurl: 'is amazing' };
            return (new Nekocurl('https://httpbin.org/get?'+querystring.stringify(params), { json: true })).setDriver('snekfetch').send().then((json) => {
                assert.deepStrictEqual(params, json.args);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with headers', () => {
        it('should return true if returned headers are equal to specified ones', () => {
            const headers = { 'Accept': 'application/json', 'Accept-Encoding': 'gzip, deflate', 'Connection': 'close', 'Content-Type': 'application/json', 'Host': 'httpbin.org', 'User-Agent': 'Nekocurl Unit-Testing', 'X-Userlimit': '500' };
            return (new Nekocurl('https://httpbin.org/headers', { json: true })).setDriver('snekfetch').setHeader('Accept', 'application/json').setHeaders(headers).send().then((json) => {
                assert.deepStrictEqual(headers, json.headers);
                return undefined;
            });
        });
    });
    
    describe('Simple POST', () => {
        it('should return true if returned post params are equal to specified ones', () => {
            const params = [{ test: 'hahaha' }];
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('snekfetch').setMethod('POST').attachFile(Object.keys(params[0])[0], params[0][Object.keys(params[0])[0]]).send().then((json) => {
                assert.deepStrictEqual(params[0], json.form);
                return undefined;
            });
        });
    });
    
    describe('JSON POST', () => {
        it('should return true if returned json data is equal to specified data', () => {
            const data = { test: 'is this a joke' };
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('snekfetch').setMethod('POST').setData(JSON.stringify(data)).send().then((json) => {
                assert.deepStrictEqual(data, json.json);
                return undefined;
            });
        });
    });
    
    describe('POST upload', function () {
        this.timeout(20000); // eslint-disable-line no-invalid-this
        
        it('should return true if returned file data is equal to specified data', async () => {
            const image = await (new Nekocurl(undefined, { autoString: false, driver: 'snekfetch', method: 'GET', driverOptions: {} })).setURL('https://i.imgur.com/1sDDaC2.png').send();
            const files = [{ name: 'image', data: image, filename: 'image.png' }];
            const assertion = { image: 'data:[object Object];base64,'+image.toString('base64') };
            
            return await (new Nekocurl('https://httpbin.org/post', { autoString: false, json: true })).setDriver('snekfetch').setMethod('POST').attachFiles(files).send().then((json) => {
                assert.deepStrictEqual(assertion, json.files);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw error', () => {
        it('should throw 405 Method Not Allowed error (GET to POST endpoint request)', () => {
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('snekfetch').send(true).catch((req) => Promise.resolve(req)).then((req) => {
                assert.strictEqual(405, req.status);
                return undefined;
            });
        });
    });
});

describe('Nekocurl testing with request', () => {
    describe('Simple HEAD', () => {
        it('should return true if returned method is HEAD', () => {
            return (new Nekocurl('https://curl.neko.run/testHEAD.php', { method: 'HEAD', json: true })).setDriver('request').setHeader('User-Agent', 'Neko.run HEAD test').send(true).then((req) => {
                assert.deepStrictEqual('HEAD', req.headers['x-request-method']);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with params', () => {
        it('should return true if returned args are equal to passed GET params', () => {
            const params = { But: 'will it blend?', Nekocurl: 'is amazing' };
            return (new Nekocurl('https://httpbin.org/get?'+querystring.stringify(params), { json: true })).setDriver('snekfetch').send().then((json) => {
                assert.deepStrictEqual(params, json.args);
                return undefined;
            });
        });
    });
    
    describe('Simple GET with headers', () => {
        it('should return true if returned headers are equal to specified ones', () => {
            const headers = { 'Accept': 'application/json', 'Accept-Encoding': 'gzip, deflate', 'Connection': 'close', 'Content-Type': 'application/json', 'Host': 'httpbin.org', 'User-Agent': 'Nekocurl Unit-Testing', 'X-Userlimit': '500' };
            return (new Nekocurl('https://httpbin.org/headers', { headers: headers, json: true })).setDriver('request').setHeader('Accept', 'application/json').send().then((json) => {
                assert.deepStrictEqual(headers, json.headers);
                return undefined;
            });
        });
    });
    
    describe('Simple POST', () => {
        it('should return true if returned post params are equal to specified ones', () => {
            const params = [{ name: 'test', data: 'hahaha' }];
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('request').setMethod('POST').attachFile(params[0].name, params[0].data).send().then((json) => {
                assert.deepStrictEqual({ 'test[value]': 'hahaha' }, json.form);
                return undefined;
            });
        });
    });
    
    describe('JSON POST', () => {
        it('should return true if returned json data is equal to specified data', () => {
            const data = { test: 'is this a joke' };
            return (new Nekocurl('https://httpbin.org/post', { data: JSON.stringify(data), json: true })).setDriver('request').setMethod('POST').send().then((json) => {
                assert.deepStrictEqual(data, json.json);
                return undefined;
            });
        });
    });
    
    describe('POST upload', function () {
        this.timeout(20000); // eslint-disable-line no-invalid-this
        
        it('should return true if returned file data is equal to specified data', async () => {
            const image = await (new Nekocurl('https://i.imgur.com/1sDDaC2.png', { autoString: false, driver: 'request', method: 'GET' })).setDriverOptions({ encoding: null }).send();
            const files = [{ name: 'image', data: image, filename: 'image.png' }];
            const assertion = { image: 'data:image/png;base64,'+image.toString('base64') };
            
            return await (new Nekocurl('https://httpbin.org/post', { autoString: false, files: files, json: true })).setDriver('request').setMethod('POST').send().then((json) => {
                assert.deepStrictEqual(assertion, json.files);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw error', () => {
        it('should throw 405 Method Not Allowed error (GET to POST endpoint request)', () => {
            return (new Nekocurl('https://httpbin.org/post', { json: true })).setDriver('request').send(true).catch((req) => Promise.resolve(req)).then((req) => {
                assert.strictEqual(405, req.status);
                return undefined;
            });
        });
    });
    
    describe('Make driver throw driver error', () => {
        it('should throw due to invalid url passed as driver option', () => {
            return (new Nekocurl('https://httpbin.org/get', { json: true })).setDriver('request').setDriverOptions({ uri: 'nekocurl' }).send(true).catch((req) => {
                assert.throws(() => {
                    throw req;
                }, Error);
            });
        });
    });
});
