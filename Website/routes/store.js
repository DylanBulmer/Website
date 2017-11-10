'use strict';
var express = require('express');
var router = express.Router();
var data = require('../config.json');

/* GET users listing. */
router.get('/', function (req, res) {
    res.render('store/index', { title: 'Store', url: data.url });
});

module.exports = router;