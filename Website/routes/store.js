'use strict';
var express = require('express');
var router = express.Router();
var data = require('../config.json');
var tools = require('../tools');

/* GET users listing. */
router.get('/', function (req, res) {
    let user = tools.getUser(req);
    res.render('store/index', { title: 'Store', url: data.url, user: user });
});

module.exports = router;