'use strict';
var express = require('express');
var app = express();
var data = require('../config.json');
var tools = require('../tools');
var fs = require('fs');

var hljs = require('highlight.js'); // https://highlightjs.org/

// Actual default values
var md = require('markdown-it')({
    html: false,
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) { }
        }

        return ''; // use external default escaping
    }
});

/* GET users listing. */
app.get('/', function (req, res) {
    let user = tools.getUser(req);
    res.render('blog/index', { title: 'Blog', config: data, user: user });
});

app.get('/:id', (req, res) => {
    let user = tools.getUser(req);
    fs.readFile(app.get('views') + "\\blog\\test.md", 'utf8', function (err, contents) {
        res.render('blog/blog', {
            title: 'Blog Test',
            config: data,
            user: user,
            body: md.render(contents)
        });
    });
});

app.get('/:id/edit', (req, res) => {
    let user = tools.getUser(req);
    let date = Date.now();
    date.toString();
    res.render('blog/edit', {
        title: 'Blog Test',
        config: data,
        user: user,
        date: date
    });
});

app.post('/:id/edit', (req, res) => {
    let user = tools.getUser(req);
    let date = Date.now();
    date.toString();
    res.render('blog/edit', {
        title: 'Blog Test',
        config: data,
        user: user,
        date: date
    });
});

module.exports = app;