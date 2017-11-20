'use strict';
var express = require('express');
var router = express.Router();
var data = require('../config.json');
var tools = require('../tools');

/* GET home page. */
router.get('/', function (req, res) {
    let user = tools.getUser(req);
    res.render('index', { title: 'Home', url: data.url, user: user });
});

module.exports = router;
