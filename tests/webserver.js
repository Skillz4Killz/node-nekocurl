/**
 * Nekocurl webserver
 * Copyright 2017 Charlotte Dunois, All Rights Reserved
 *
 * Website: https://github.com/CharlotteDunois/node-nekocurl
*/

const compression = require('compression');
const express = require('express');
const querystring = require('querystring');

const app = express();

const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.set('Host', 'localhost:5001');
    next();
});

app.all('/redirect', (req, res) => {
    res.status(302);
    res.set('Location', 'http://localhost:5001/head');
    res.end();
});

app.all('/redirectRelative', (req, res) => {
    res.status(302);
    res.set('Location', '/head');
    res.end();
});

app.all('/redirectSeeOther', (req, res) => {
    res.status(303);
    res.set('Location', 'http://localhost:5001/seeOther');
    res.end();
});

app.all('/head', (req, res) => {
    res.set('X-Request-Method', req.method);
    res.end();
});

app.get('/get', (req, res) => {
    res.json({ args: req.query, headers: req.headers });
    res.end();
});

app.post('/post', upload.any(), (req, res) => {
    if(req.body instanceof Object) {
        req.json = req.body;
        req.body = { };
    }
    
    if(!req.body) {
        req.body = { };
    }
    
    if(!req.files) {
        req.files = [ ];
    }
    
    if(!req.json) {
        req.json = [ ];
    }
    
    const files = { };
    for(const item of req.files) {
        files[item.fieldname] = 'data:'+item.mimetype+';base64,'+item.buffer.toString('base64');
    }
    
    res.json({ form: req.body, files: files, json: req.json });
    res.end();
});

app.get('/compression-url', compression({ threshold: 0, filter: () => true }), (req, res) => {
    res.set('Content-Type', 'application/x-www-form-urlencoded');
    res.end(querystring.stringify(req.query));
});

app.all('/fail', (req, res) => {
    res.status(405);
    res.send('You failed.');
    res.end();
});

app.all('/seeOther', (req, res) => {
    res.status(204);
    res.end();
});

app.listen(5001, () => {
    console.log('Started up unit test web server listening on port 5001!');
});

module.exports = app;
