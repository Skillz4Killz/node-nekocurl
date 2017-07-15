/**
 * Nekocurl test upload
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const path = require('path');
const Nekocurl = require(path.join(__dirname, '..', 'index.js'));

(new Nekocurl('https://i.imgur.com/11Q0gz8.jpg')).setMethod('GET').setHeaders({ 'Cache-Control': 'no-cache' }).send().then((image) => {
    const request = new Nekocurl(undefined, { json: true });

    request.setURL('https://httpbin.org/post')
            .setMethod('POST')
            .setHeader('Referer', 'https://github.com')
            .attachFile('image', image, 'image.png')
            .attachFiles([{ name: 'postdata', data: 'some post data' }]);

    request.send().then((json) => {
        console.log(json);
    }).catch(console.error);
});

(new Nekocurl('https://i.imgur.com/11Q0gz8.jpg')).setMethod('GET').setDriver('request').setHeaders({ 'Cache-Control': 'no-cache' }).send().then((image) => {
    const request = new Nekocurl(undefined, { json: true });

    request.setURL('https://httpbin.org/post')
            .setDriver('request')
            .setMethod('POST')
            .setHeader('Referer', 'https://github.com')
            .attachFile('image', image, 'image.png')
            .attachFiles([{ name: 'postdata', data: 'some post data' }]);

    request.send().then((json) => {
        console.log(json);
    }).catch(console.error);
});
