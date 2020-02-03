'use strict';
var md = require('markdown-it')({
    html: true,
    xhtmlOut: true,
    breaks: true,
    linkify: true,
    typographer: true,
    quotes: '“”‘’'
});
var express = require('express');
var app = express();
var config = require('../config.json');
var tools = require('../tools');
var fs = require('fs');
var path = require('path');

app.use(express.static(path.join(__dirname, '..', 'public')));

/* GET home page. */
app.get('/', function (req, res) {
    let user = tools.getUser(req);
    res.render('index', { title: 'Home', config: config, user: user });
});

app.get('/sitemap', function (req, res) {
    var options = {
        root: path.join(__dirname, '../public/sitemaps'),
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile("home.xml", options, function (err) { });
});

app.get('/policy/terms', (req, res) => {
    let user = tools.getUser(req);
    fs.readFile("./files/terms.md", 'utf8', (err, data) => {
        if (err) throw err;
        let body = md.render(data);
        res.render('policy', { title: 'Terms of Services', config: config, user: user, body: body });
    });
});

app.get('/policy/privacy', (req, res) => {
    let user = tools.getUser(req);
    fs.readFile("./files/privacy.md", 'utf8', (err, data) => {
        if (err) throw err;
        let body = md.render(data);
        res.render('policy', { title: 'Privacy Policy', config: config, user: user, body: body });
    });
});

app.get('/policy/cookies', (req, res) => {
    let user = tools.getUser(req);
    fs.readFile("./files/cookies.md", 'utf8', (err, data) => {
        if (err) throw err;
        let body = md.render(data);
        res.render('policy', { title: 'Cookie Policy', config: config, user: user, body: body });
    });
});

module.exports = app;
