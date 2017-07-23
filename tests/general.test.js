/**
 * Nekocurl test general
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const assert = require('assert');
const path = require('path');

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
