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

app.head('/redirect', (req, res) => {
    res.status(301);
    res.set('Location', 'http://localhost:5001/HEAD');
    res.end();
});

app.head('/redirectRelative', (req, res) => {
    res.status(301);
    res.set('Location', '/HEAD');
    res.end();
});

app.head('/redirectSeeOther', (req, res) => {
    res.status(303);
    res.set('Location', 'http://localhost:5001//seeOther');
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
    
    res.json({ form: req.body, files: req.files, json: req.json });
    res.end();
});

app.get('/compression-url', compression(), (req, res) => {
    res.set('Content-Type', 'application/x-www-form-urlencoded');
    res.end(querystring.stringify(req.query));
});

app.all('/fail', (req, res) => {
    res.status(405);
    res.send('You failed.');
    res.end();
});

app.get('/seeOther', (req, res) => {
    res.status(204);
    res.end();
});

app.listen(5001, () => {
    console.log('Started up unit test web server listening on port 5001!');
});

module.exports = app;
