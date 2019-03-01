'use strict';
var express = require('express');
var app = express();
var config = require('../config.json');
var tools = require('../tools');
var db = require("../modules/database").get();

app.get('/', (req, res, next) => {
    tools.userTest(req, 4, (result) => {
        if (result) {
            res.render('admin/index.pug', { 'title': 'Admin', config: config });
        } else {
            // redirect to sign in
            res.redirect((config.https ? "https://" : "http://") + "account." + config.url + "/signin");
        }
    });
});

app.get('/users', (req, res, next) => {
    tools.userTest(req, 4, (result) => {
        if (result) {
            db.query("SELECT id, name_first, name_last, username, email, privilege FROM users", (err, rows) => {
                if (err) throw err;

                res.render('admin/users.pug', { 'title': 'Admin Query Users', config: config, data: rows });
            });
        } else {
            // hiding url by passing 404
            next();
        }
    });
});

app.get('/users/:id/edit', (req, res, next) => {
    tools.userTest(req, 4, (result) => {
        if (result) {

            let id = req.params.id;

            let next = [];
            if (req.query.next) next = req.query.next.split(",");

            db.query("SELECT id, name_first, name_last, username, email, privilege, resetcode FROM users WHERE id = '" + id + "'", (err, rows) => {
                if (err) throw err;
                res.render('admin/edituser.pug', { 'title': 'Admin Edit User', config: config, user: rows[0], next: next, privileges: checkPrivileges(rows[0]) });
            });
        } else {
            // hiding url by passing 404
            next();
        }
    });
});

// functions

/**
 * @description Adds the "checked" paramater for checkboxes if user has the right privileges
 * @param {any} user The logged in user.
 * @returns {[{"level": string, "label": string, "short": string, "checked": boolean}]} Array of privileges
 */
const checkPrivileges = (user) => {

    let privileges = config.privileges;
    let priv = user.privilege;
    let allowed = [];

    for (let i = privileges.length - 1; i >= 0; i--) {
        let num = Math.pow(2, privileges[i].level);
        if (num <= priv) {
            priv = priv - num;
            allowed[allowed.length] = privileges[i];
            allowed[allowed.length - 1].checked = true;
        } else {
            allowed[allowed.length] = privileges[i];
            allowed[allowed.length - 1].checked = false;
        }
    }

    allowed.reverse();
    return allowed;
};

module.exports = app;