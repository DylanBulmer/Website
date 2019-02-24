'use strict';
var express = require('express');
var app = express();
var config = require('../config.json');
var tools = require('../tools');
var db = require('../modules/database').get();

app.get('/', (req, res, next) => {
    tools.userTest(req, (result) => {
        if (result) {
            res.render('admin/index.pug', { 'title': 'Admin', config: config });
        } else {
            // redirect to sign in
            res.redirect((config.https ? "https://" : "http://") + "account." + config.url + "/signin");
        }
    });
});

app.get('/users', (req, res, next) => {
    tools.userTest(req, (result) => {
        if (result) {
            res.render('admin/users.pug', { 'title': 'Admin Query Users', config: config });
        } else {
            // hiding url by passing 404
            next();
        }
    });
});

module.exports = app;