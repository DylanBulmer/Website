'use strict';
var express = require('express');
var app = express();
var data = process.env;
var tools = require('../tools');
var path = require('path');
var db = require('../modules/database').get();
var moment = require('moment');

// setup to upload images

var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
        });
    }
});
var upload = multer({ storage: storage });

var Calendar = require('../public/js/calendar');

// Markdown setup

var hljs = require('highlight.js'); // https://highlightjs.org/
var md = require('markdown-it')({
    html: false,
    breaks: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (e) {
                // console.log(e);
            }
        }

        return ''; // use external default escaping
    }
});

/* GET users listing. */
app.get('/', function (req, res, next) {
    let user = tools.getUser(req);
    let sql = "SELECT blogs.*, users.name_first, users.name_last FROM blogs LEFT JOIN(SELECT name_first, name_last, id FROM users) as users on author_id = users.id ORDER BY blogs.date DESC, blogs.id DESC LIMIT 10";
    db.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            let blogs = rows;
            let user = tools.getUser(req);

            for (let i = 0; i < blogs.length; i++) {
                let date = new Calendar(blogs[i].date).today;
                blogs[i].subtitle = blogs[i].name_first + " " + blogs[i].name_last + " | " + date.getMonthShort() + " " + date.getDate() + ", " + date.getYear();
            }
            
            res.render('blog/index', { title: 'Blog', blogs: blogs, config: data, user: user });
        }
    });
});

app.get('/sitemap', function (req, res, next) {
    var options = {
        root: path.join(__dirname, '../public/sitemaps'),
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile("blog.xml", options, function (err) { });
});

app.get('/new', (req, res, next) => {
    let user = tools.getUser(req);
    let date = new Calendar().today;

    if (user) {
        res.render('blog/new', {
            title: 'Blog Test',
            config: data,
            user: user,
            date: date.getMonthShort() + " " + date.getDate() + ", " + date.getYear()
        });
    } else {
        res.redirect('/');
    }
});

app.post('/new', upload.single('upload'), (req, res, next) => {
    let user = tools.getUser(req);

    if (user) {
        let date = new Calendar().today;
        let file = req.file;
        let body = req.body;

        db.query(
            "INSERT INTO blogs SET ?",
            {
                'title': body.title,
                'author_id': user.id,
                'date': moment(date.date).format('YYYY-MM-DD HH:mm:ss'),
                'body': body.body,
                'image_path': file ? file.filename : null,
                'published': body.type !== "draft"
            },
            (err, rows) => {

                if (err) {
                    console.error(err.message);
                    res.render('blog/new', {
                        title: 'Blog Test',
                        config: data,
                        user: user,
                        date: date.getMonthShort() + " " + date.getDate() + ", " + date.getYear()
                    });
                } else {
                    if (body.type !== "draft") {
                        res.redirect('/' + rows.insertId);
                    } else {
                        res.redirect('/');
                    }
                }

        });
    } else {
        res.redirect('/');
    }
});

app.get('/:id', (req, res, next) => {
    let user = tools.getUser(req);

    try {
        db.query("SELECT blogs.*, users.name_first, users.name_last FROM blogs LEFT JOIN(SELECT name_first, name_last, id FROM users) as users on author_id = users.id WHERE blogs.id = ?", [req.params.id], (err, rows) => {
            if (err) {
                console.error(err);
                let error = new Error('Not Found');
                error['status'] = 404;
                next(error);
            } else {
                if (rows[0]) {
                    let blog = rows[0];

                    let buffer = new Buffer(blog.body, 'binary');
                    let date = new Calendar(blog.date).today;
                    let body;
                    if (blog.image_path) {
                        body = "![](/uploads/" + blog.image_path + ") \n# " + blog.title + "\n### " + blog.name_first + " " + blog.name_last + " | " + date.getMonthShort() + " " + date.getDate() + ", " + date.getYear() + "\n___\n\n\n" + buffer.toString();
                    } else {
                        body = "# " + blog.title + "\n### " + blog.name_first + " " + blog.name_last + " | " + date.getMonthShort() + " " + date.getDate() + ", " + date.getYear() + "\n___\n\n\n" + buffer.toString();
                    }

                    if (blog.published !== 0) {
                        res.render('blog/blog', {
                            blog: blog,
                            title: blog.title,
                            config: data,
                            user: user,
                            body: md.render(body),
                            id: req.params.id
                        });
                    } else {
                        let err = new Error('Not Found');
                        err['status'] = 404;
                        next(err);
                    }
                } else {
                    let err = new Error('Not Found');
                    err['status'] = 404;
                    next(err);
                }
            }
        });
    } catch (e) {
        let err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    }
});

app.get('/:id/edit', (req, res, next) => {
    let user = tools.getUser(req);

    try {
        db.query("SELECT blogs.*, users.name_first, users.name_last FROM blogs LEFT JOIN(SELECT name_first, name_last, id FROM users) as users on author_id = users.id WHERE blogs.id = ?", [req.params.id], (err, rows) => {
            if (err) {
                console.error(err);
                let error = new Error('Not Found');
                error['status'] = 404;
                next(error);
            } else {
                if (rows[0] && user.id === rows[0].author_id) {
                    let blog = rows[0];

                    let buffer = new Buffer(blog.body, 'binary');

                    let date;

                    if (blog.published === 1) {
                        date = new Calendar(blog.date).today;
                    } else {
                        date = new Calendar().today;
                    }
                    
                    if (user) {
                        res.render('blog/edit', {
                            blog: blog,
                            title: blog.title,
                            image: blog.image_path,
                            config: data,
                            user: user,
                            subtitle: blog.name_first + " " + blog.name_last + " | " + date.getMonthShort() + " " + date.getDate() + ", " + date.getYear(),
                            body: buffer.toString()
                        });
                    } else {
                        res.redirect('/');
                    }
                } else {
                    let err = new Error('Not Found');
                    err['status'] = 404;
                    next(err);
                }
            }
        });
    } catch (e) {
        let err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    }
});

app.post('/:id/edit', upload.single('upload'), (req, res, next) => {
    let user = tools.getUser(req);

    if (user) {
        let file = req.file;
        let body = req.body;
        let today = new Calendar().today;

        // setup data
        let data = {
            'title': body.title,
            'body': body.body,
            'published': body.type !== "draft"
        };

        // add extra data if necessary
        if (file) data["image_path"] = file.filename;
        if (body.type === "draft") data["date"] = moment(today.date).format('YYYY-MM-DD HH:mm:ss');

        db.query(
            "UPDATE blogs SET ? WHERE id = " + req.params.id, data,
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                    db.query("SELECT blogs.*, users.name_first, users.name_last FROM blogs LEFT JOIN(SELECT name_first, name_last, id FROM users) as users on author_id = users.id WHERE blogs.id = ?", [req.params.id], (err, rows) => {
                        if (err) {
                            console.error(err);
                            let error = new Error('Not Found');
                            error['status'] = 404;
                            next(error);
                        } else {
                            if (rows[0]) {
                                let blog = rows[0];

                                let buffer = new Buffer(blog.body, 'binary');
                                let date = new Calendar(blog.date).today;

                                if (user) {
                                    res.render('blog/edit', {
                                        blog: blog,
                                        title: blog.title,
                                        image: blog.image_path,
                                        config: data,
                                        user: user,
                                        subtitle: blog.name_first + " " + blog.name_last + " | " + date.getMonthShort() + " " + date.getDate() + ", " + date.getYear(),
                                        body: buffer.toString()
                                    });
                                } else {
                                    res.redirect('/');
                                }
                            } else {
                                let err = new Error('Not Found');
                                err['status'] = 404;
                                next(err);
                            }
                        }
                    });
                } else {
                    if (body.type === "publish") {
                        res.redirect('/' + req.params.id);
                    } else {
                        res.redirect('/');
                    }
                }
            });
    } else {
        res.redirect('/' + req.params.id);
    }
});

app.get('/:id/delete', (req, res, next) => {
    let user = tools.getUser(req);

    if (user) {
        db.query("SELECT blogs.*, users.name_first, users.name_last FROM blogs LEFT JOIN(SELECT name_first, name_last, id FROM users) as users on author_id = users.id WHERE blogs.id = ?", [req.params.id], (err, rows) => {
            if (err) {
                console.error(err);
                let error = new Error('Not Found');
                error['status'] = 404;
                next(error);
            } else {
                let blog = rows[0];
                if (user.id === blog.author_id || user.privilege >= 8) {
                    // delete blog post
                    db.query("DELETE FROM blogs WHERE id = " + req.params.id, (err, rows, fields) => {
                        if (err) {
                            let err = new Error('Could not delete blog #' + req.params.id);
                            err['status'] = 500;
                            next(err);
                        } else {
                            res.redirect('/');
                        }
                    });
                } else {
                    let err = new Error('Unauthorized');
                    err['status'] = 401;
                    next(err);
                }
            }
        });
    } else {
        let err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    }
});

module.exports = app;