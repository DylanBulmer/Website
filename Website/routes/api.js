'use strict';
var express = require('express');
var app = express();
var config = require('../config.json');
var tools = require('../tools');
var bcrypt = require('bcrypt');
var db = require('../modules/database').get();
var Recaptcha = require("express-recaptcha").Recaptcha;
var url = require('url');

/* Add headers */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

var recaptcha = new Recaptcha(config.reCAPTCHA["sitekey"], config.reCAPTCHA["secretkey"]);

/* All GET and POST requests must check the project and API key to allow access */

// URL for testing
app.get('/', function (req, res, next) {
    let start = Date.now();

    // Check the keys with promise to see if they match a project
    checkKeys(req.query["client"], req.query["key"]).then(result => {
        return res.send("Project Found!<br><br>Time spent in backend: " + (Date.now() - start) / 1000 + " seconds");
    }).catch(reason => {
        return res.send(reason + "<br><br>Time spent in backend: " + (Date.now() - start) / 1000 + " seconds");
    });
});

app.get('/test/callback', (req, res, next) => {
    console.log(req.body);
    res.send(req.body);
});

// Auth login

/**
 * @param {Express.Request} req Request object
 * @param {Express.Response} res Response object
 */
app.get('/auth/', function (req, res, next) {
    let start = Date.now();

    let scopes = [];
    if (req.query.scopes) scopes = req.query.scopes.split(",");

    let redirectUri = null;
    if (req.query["redirect-uri"]) redirectUri = req.query["redirect-uri"];

    // Check the keys with promise to see if they match a project
    checkKeys(req.query["client"], req.query["key"]).then(result => {
        tools.userTest(req, result => {
            if (!result) {
                if (redirectUri) {
                    return res.render("api/signin", { title: "Sign In" });
                } else {
                    next(new Error("No redirect uri given."));
                }
            } else {
                if (redirectUri) {
                    runScopes(scopes, result).then(data => {
                        data["backend"] = (Date.now() - start) / 1000;

                        res.redirect(url.parse(redirectUri));
                    }).catch(reason => {
                        res.send(reason);
                    });
                } else {
                    next(new Error("No redirect uri given."));
                }
            }
        });
    }).catch(reason => {
        return res.send(reason + "<br><br>Time spent in backend: " + (Date.now() - start) / 1000 + " seconds");
    });
});

app.post('/auth/', function (req, res, next) {
    let start = Date.now();

    let scopes = [];
    if (req.query.scopes) scopes = req.query.scopes.split(",");

    let redirectUri = null;
    if (req.query["redirect-uri"]) redirectUri = req.query["redirect-uri"];

    checkKeys(req.query["client"], req.query["key"]).then(result => {
        tools.userTest(req, result => {
            if (!result) {
                runLogin(req, (err, result) => {
                    if (err) {
                        switch (err.type) {
                            case "login":
                                if (req.session["loginTries"] >= 5) {
                                    res.render('api/signin', { title: 'Sign In', error: err.message, config: config, captcha: recaptcha.render() });
                                } else {
                                    res.render('api/signin', { title: 'Sign In', error: err.message, config: config });
                                }
                                break;
                            case "server":
                                next(new Error(err.message));
                                break;
                            case "recapacha":
                                res.render('api/signin', { title: 'Sign In', error: err.message, config: config, captcha: recaptcha.render() });
                                break;
                        }
                    } else {
                        if (redirectUri) {
                            runScopes(scopes, result).then(data => {
                                data["backend"] = (Date.now() - start) / 1000;

                                res.redirect(redirectUri + "?token=");
                            }).catch(reason => {
                                res.send(reason);
                            });
                        } else {
                            res.send("No redirect uri given.");
                        }
                    }
                });
            } else {
                if (redirectUri) {
                    runScopes(scopes, result).then(data => {
                        data["backend"] = (Date.now() - start) / 1000;
                        res.json(data);
                    }).catch(reason => {
                        res.send(reason);
                    });
                } else {
                    res.send("No redirect uri given.");
                }
            }
        });
    }).catch(reason => {
        return res.send(reason + "<br><br>Time spent in backend: " + (Date.now() - start) / 1000 + " seconds");
    });
});

/* Functions */

/**
 * @description Checks to see if the client key is in the system and if the client secret matches
 * @param {String} client Client key
 * @param {String} secret Client secret
 * @param {Function} callback Returns true or false with error string
 * @returns {Promise} Returns the async promise
 */
const checkKeys = function (client, secret) {
    return new Promise((resolve, reject) => {
        if (client && secret) {
            db.query("SELECT * FROM projects WHERE client_key = '" + client + "' LIMIT 1", (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return reject("Database error.");
                } else {
                    // if no project, return go away (well pretty much)
                    if (!rows[0]) return reject("Invalid client.");
                    // same thing if secret is missing
                    else if (rows[0]["client_secret"] === secret) {
                        return resolve(rows[0]);
                    } else {
                        return reject("Invalid key.");
                    }
                }
            });
        } else {
            reject("Invalid client or key.");
        }
    });
};

/**
 * @description Runs a check to see if scopes were given and returns the wanted data.
 * @param {String[]} scopes Information requested from user
 * @param {JSON} user User's data
 * @returns {Promise} Returns new async promise
 */
const runScopes = function (scopes, user) {
    return new Promise((resolve, reject) => {
        if (scopes.length > 0) {
            let result = checkScopes(scopes, user);

            if (result.message) {
                reject(result.message);
            } else {
                resolve(result);
            }
        } else {
            return reject("No scopes were given.");
        }
    });
};

const checkScopes = (scopes, user, index, data, err) => {
    if (!index) index = 0;
    if (!data) data = {};
    if (!err) err = null;

    if (index === scopes.length) {
        // Checking is done.
        if (!err) {
            return data;
        } else {
            return {
                message: err,
                result: data
            };
        }
    } else {
        // Continue checking
        if (scopes[index] === "profile") {
            data["user"] = {
                "id": user.id,
                "name": {
                    "first": user["name_first"],
                    "last": user["name_last"]
                },
                "nickname": user["nickname"]
            };
        } else if (scopes[index] === "email") {
            data["email"] = user.email;
        } else {
            err = "Invalid scope given: " + scopes[index];
        }

        return checkScopes(scopes, user, ++index, data, err);
    }
};


/**
 * 
 * @param {Express.Request} req Express request
 * @param {any} callback Callback function
 */
const runLogin = (req, callback) => {
    if (req.session["loginTries"]) req.session["loginTries"] += 1;
    else req.session["loginTries"] = 1;

    if (req.session["loginTries"] > 5) {
        // do captcha check
        recaptcha.verify(req, function (error, info) {
            if (!error) {
                login({
                    "username": req.body.username,
                    "password": req.body.password
                }, function (result) {
                    if (result.err)
                        callback({
                            type: "login",
                            message: result.err
                        });
                    else {
                        req.login(result.result, (err) => {
                            if (err) {
                                callback({
                                    type: "server",
                                    message: err
                                });
                            } else {
                                req.session["loginTries"] = 0;
                                callback(false), result.result;
                            }
                        });
                    }
                });
            } else {
                callback({
                    type: "recaptcha",
                    message: "Please click the reCAPTCHA box."
                });
            }
        });
    } else {
        login({
            "username": req.body.username,
            "password": req.body.password
        }, function (result) {
            if (result.err)
                callback({
                    type: "login",
                    message: result.err
                });
            else {
                req.login(result.result, (err) => {
                    if (err) {
                        callback({
                            type: "server",
                            message: err
                        });
                    } else {
                        req.session["loginTries"] = 0;
                        callback(false, result.result);
                    }
                });
            }
        });
    }
};

const login = (profile, callback) => {
    if (isEmail(profile.username)) {
        // check for email
        db.query("SELECT * FROM users WHERE email = '" + profile.username + "'", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                if (result[0].password && bcrypt.compareSync(profile.password, result[0].password)) {
                    callback({
                        "result": result[0],
                        "err": ''
                    });
                } else {
                    callback({
                        "err": "Incorrect Username or Password"
                    });
                }
            } else {
                callback({
                    "err": "Incorrect Username or Password"
                });
            }
        });
    } else {
        // check for username
        db.query("SELECT * FROM users WHERE username = '" + profile.username + "'", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                if (bcrypt.compareSync(profile.password, result[0].password)) {
                    callback({
                        "result": result[0],
                        "err": ''
                    });
                } else {
                    return callback({
                        "err": "Incorrect Username or Password"
                    });
                }
            } else {
                callback({
                    "err": "Incorrect Username or Password"
                });
            }
        });
    }
};

const isEmail = (username) => {
    return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(username);
};

module.exports = app;