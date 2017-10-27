﻿'use strict';
var express = require('express');
var router = express.Router();
var data = require('../config.json');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Home', url: data.url });
});

module.exports = router;
