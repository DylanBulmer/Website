'use strict';
var express = require('express');
var app = express();
var config = require('../config.json');
var tools = require('../tools');
var db = require('../modules/database').get();

/* All GET and POST requests must check the project and API key to allow access */

// URL for testing
app.get('/', function (req, res, next) {
    let start = Date.now();

    // Check the keys to see if they match a project
    checkKeys(req.query["client"], req.query["key"], (err, result) => {
        if (result) {
            return res.send(result + "<br><br>Time spent in backend: " + (Date.now() - start)/1000 + " seconds");
        } else {
            return res.send(err + "<br><br>Time spent in backend: " + (Date.now() - start)/1000 + " seconds");
        }
    });
});

/* Functions */

/**
 * @description Checks to see if the client key is in the system and if the client secret matches
 * @param {String} client Client key
 * @param {String} secret Client secret
 * @param {Function} callback Returns true or false with error string
 */
const checkKeys = function (client, secret, callback) {
    if (client && secret) {
        db.query("SELECT * FROM projects WHERE client_key = '" + client + "' LIMIT 1", (err, rows) => {
            if (err) {
                console.error(err.message);
                return callback("Database error.");
            }
            else {
                // if no projects, return go away (well pretty much)
                if (rows === 0) return callback("Invalid client.");

                else if (rows[0]["client_secret"] === secret) {
                    return callback(null, true);
                } else {
                    return callback("Invalid key.");
                }
            }
        });
    } else {
        callback("Invalid client or key.");
    }
};

module.exports = app;