'use strict';
var express = require('express');
var app = express();
var data = require('../config.json');
var tools = require('../tools');

/* GET users listing. */
app.get('/', function (req, res) {
    let user = tools.getUser(req);
    res.render('blog/index', { title: 'Blog', config: data, user: user });
});

module.exports = app;