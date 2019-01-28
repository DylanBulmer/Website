'use strict';
var express = require('express');
var app = express();
var data = require('../config.json');
var mysql = require('mysql');
var passport = require('passport');
var bcrypt = require('bcrypt');
var tools = require('../tools');
var db = require('../modules/database').get();

/* Add headers */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

// Setup Passport

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Setup Local

var LocalStrategy = require('passport-local').Strategy;

passport.use('local-signup', new LocalStrategy(
    { passReqToCallback: true },
    function (req, username, password, done) {
        let profile = {
            username: username,
            password: [password, req.body.password2],
            email: req.body.email,
            name: {
                first: req.body.fname,
                last: req.body.lname,
                full: req.body.fname + ' ' + req.body.lname
            }
        };
        signup("local", profile, function (data) {
            if (data.err) {
                return done(data.err);
            } else {
                return done(null, data.result);
            }
        });
    }
));

// Setup Google

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    clientID: data.google.clientID,
    clientSecret: data.google.clientSecret,
    callbackURL: "/signin/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            login("google", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

passport.use('google-signup', new GoogleStrategy({
    clientID: data.google.clientID,
    clientSecret: data.google.clientSecret,
    callbackURL: "/signup/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            signup("google", profile, function (data) {
                if (data.err) {
                    return done(data.err, null);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

// Setup Facebook

var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: data.facebook.clientID,
    clientSecret: data.facebook.clientSecret,
    callbackURL: "/signin/facebook/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            login("facebook", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

passport.use('facebook-signup', new FacebookStrategy({
    clientID: data.facebook.clientID,
    clientSecret: data.facebook.clientSecret,
    callbackURL: "/signup/facebook/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            signup("facebook", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

// Setup Twitter

var TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
    consumerKey: data.twitter.clientID,
    consumerSecret: data.twitter.clientSecret,
    callbackURL: "/signin/twitter/callback"
},
    function (token, tokenSecret, profile, done) {
        process.nextTick(function () {
            login("twitter", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

passport.use('twitter-signup', new TwitterStrategy({
    consumerKey: data.twitter.clientID,
    consumerSecret: data.twitter.clientSecret,
    callbackURL: "/signup/twitter/callback"
},
    function (token, tokenSecret, profile, done) {
        process.nextTick(function () {
            signup("twitter", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

// Setup Discord

var DiscordStrategy = require('passport-discord').Strategy;

passport.use(new DiscordStrategy({
    clientID: data.discord.clientID,
    clientSecret: data.discord.clientSecret,
    callbackURL: "/signin/discord/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            login("discord", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

passport.use('discord-signup', new DiscordStrategy({
    clientID: data.discord.clientID,
    clientSecret: data.discord.clientSecret,
    callbackURL: "/signup/discord/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            signup("discord", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

// Setup Steam

var SteamStrategy = require('passport-steam').Strategy;

passport.use(new SteamStrategy({
    returnURL: (data.https ? 'https://' : 'http://') + 'account.' + data.url + '/signin/steam/callback',
    realm: (data.https ? 'https://' : 'http://') + 'account.' + data.url + '/',
    apiKey: data.steam.key
},
    function (identifier, profile, done) {
        process.nextTick(function () {
            login("steam", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

passport.use('steam-signup', new SteamStrategy({
    returnURL: (data.https ? 'https://' : 'http://') + 'account.' + data.url + '/signup/steam/callback',
    realm: (data.https ? 'https://' : 'http://') + 'account.' + data.url + '/',
    apiKey: data.steam.key
},
    function (identifier, profile, done) {
        process.nextTick(function () {
            signup("steam", profile, function (data) {
                if (data.err) {
                    return done(data.err);
                } else {
                    return done(null, data.result);
                }
            });
        });
    }
));

// Basic Web Routes
app.get('/', function (req, res) {
    tools.userTest(req, function (test) {
        if (test) {
            let user = tools.getUser(req);

            let socialLogins = {
                'google': user['google_id'] && user['google_id'] !== '' ? true : false,
                'facebook': user['facebook_id'] && user['facebook_id'] !== '' ? true : false,
                'twitter': user['twitter_id'] && user['twitter_id'] !== '' ? true : false,
                'steam': user['steam_id'] && user['steam_id'] !== '' ? true : false,
                'discord': user['discord_id'] && user['discord_id'] !== '' ? true : false
            };

            res.render('account/index', { title: 'Account', config: data, user: user, logins: socialLogins });
        } else {
            res.redirect('/signin');
        }
    });
});

app.post('/', function (req, res) {
    tools.userTest(req, function (test) {
        if (test) {
            let user = tools.getUser(req);
            db.query('SELECT * FROM users WHERE id = ' + user.id, (err, rows, fields) => {
                let profile = rows[0];

                let socialLogins = {
                    'google': user['google_id'] && user['google_id'] !== '' ? true : false,
                    'facebook': user['facebook_id'] && user['facebook_id'] !== '' ? true : false,
                    'twitter': user['twitter_id'] && user['twitter_id'] !== '' ? true : false,
                    'steam': user['steam_id'] && user['steam_id'] !== '' ? true : false,
                    'discord': user['discord_id'] && user['discord_id'] !== '' ? true : false
                };

                switch (req.body.form) {
                    case 'man_pass':        // Change Password
                        if (bcrypt.compareSync(req.body['password_current'], profile.password)) {
                            if (req.body.password === req.body.password_confirm) {
                                bcrypt.hash(req.body.password, 10, function (err, hash) {
                                    // Store hash in database
                                    db.query('UPDATE users SET password="' + hash + '" where id=' + user.id);
                                });
                                res.render('account/index', { title: 'Account', config: data, pass: "Password Reset!", user: user, logins: socialLogins });
                            } else {
                                res.render('account/index', { title: 'Account', config: data, err: "Passwords do not match!", user: user, logins: socialLogins });
                            }
                        } else {
                            res.render('account/index', { title: 'Account', config: data, err: "Current password is incorrect!", user: user, logins: socialLogins });
                        }
                        break;
                    case 'deact-google':    // Deactivate Google
                        db.query('UPDATE users SET google_id ="" where id=' + user.id);
                        break;
                    case 'deact-twitter':   // Deactivate Twitter
                        db.query('UPDATE users SET twitter_id ="" where id=' + user.id);
                        break;
                    case 'deact-facebook':  // Deactivate Facebook
                        db.query('UPDATE users SET facebook_id ="" where id=' + user.id);
                        break;
                    case 'deact-steam':     // Deactivate Steam
                        db.query('UPDATE users SET steam_id ="" where id=' + user.id);
                        break;
                    default:
                        res.render('account/index', { title: 'Account', config: data, user: user });
                }
            });
        } else {
            res.redirect('/signin');
        }
    });
});


// Local Routes

app.get('/logout', (req, res) => {
    tools.logoutUser(req, () => {
        res.redirect('/signin');
    });
});

app.get('/signin', function (req, res) {
    tools.userTest(req, function (test) {
        if (!test) {
            res.render('signin', { title: 'Sign In', error: '', config: data });
        } else {
            res.redirect('/');
        }
    });
});

app.post('/signin', function (req, res, next) {
    tools.userTest(req, function (test) {
        if (!test) {
            login('local', {
                "username": req.body.username,
                "password": req.body.password
            }, function (result) {
                if (result.err) { res.render('signin', { title: 'Sign In', error: result.err, config: data }); }
                else {
                    req.session.user = result.result;
                    return res.redirect('/');
                }
            });
        } else {
            res.redirect('/');
        }
    });
});

app.get('/signup', function (req, res) {
    tools.userTest(req, function (test) {
        if (!test) {
            res.render('signup', { title: 'Sign Up', error: '', config: data });
        } else {
            res.redirect('/');
        }
    });
});

app.post('/signup', function (req, res, next) {
    tools.userTest(req, function (test) {
        if (!test) {
            passport.authenticate('local-signup', function (err, user, info) {
                if (err) {
                    return res.render('signup', { title: 'Sign Up', error: err, config: data });
                } else {
                    req.login(user, function (err) {
                        if (err) { return next(err); }
                        return res.redirect('/');
                    });
                }
            })(req, res, next);
        } else {
            return res.redirect('/');
        }
    });
});

// All signin provider callbacks

app.get('/signin/:provider/', function (req, res, next) {
    let provider = req.params.provider;

    switch (provider) {
        case 'google':
            passport.authenticate(provider, { scope: ['profile', 'email'] })(req, res, next);
            break;
        case 'discord':
            passport.authenticate(provider, { scope: ['identity', 'email'] })(req, res, next);
            break;
        case 'facebook':
            passport.authenticate(provider, { scope: ['public_profile', 'email'] })(req, res, next);
            break;
        case 'twitter':
        case 'steam':
            passport.authenticate(provider)(req, res, next);
            break;
    }
});

app.get('/signin/:provider/callback', function (req, res, next) {
    let provider = req.params.provider;
    passport.authenticate(provider, (err, user, info) => {
        if (err) return res.render('signin', { title: 'Sign In', error: err, config: data });
        else if (!user) return res.redirect('/signin');
        else {
            req.login(user, function (err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        }
    })(req, res, next);
});

// All signup provider callbacks

app.get('/signup/:provider/', function (req, res, next) {
    let provider = req.params.provider;

    switch (provider) {
        case 'google':
            passport.authenticate(provider + '-signup', { scope: ['profile', 'email'] })(req, res, next);
            break;
        case 'discord':
            passport.authenticate(provider + '-signup', { scope: ['identity', 'email'] })(req, res, next);
            break;
        case 'facebook':
            passport.authenticate(provider + '-signup', { scope: ['public_profile', 'email'] })(req, res, next);
            break;
        case 'twitter':
        case 'steam':
            passport.authenticate(provider + '-signup')(req, res, next);
            break;
    }
});

app.get('/signup/:provider/callback', function (req, res, next) {
    let provider = req.params.provider;
    passport.authenticate(provider + '-signup', (err, user, info) => {
        if (err) return res.render('signup', { title: 'Sign Up', error: err, config: data });
        else if (!user) return res.redirect('/signup');
        else {
            req.login(user, function (err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        }
    })(req, res, next);
});

// Data Base signin Requests

const login = (provider, profile, callback) => {
    if (provider === "local") {
        if (isEmail(profile.username)) {
            // check for email
            db.query("SELECT * FROM users WHERE email = '" + profile.username + "'", function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    if (bcrypt.compareSync(profile.password, result[0].password)) {
                        callback({
                            "result": result[0],
                            "err": ''
                        });
                    } else {
                        callback({
                            "err": "Incorrect password"
                        });
                    }
                } else {
                    callback({
                        "err": "That email is not in our database."
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
                    }
                } else {
                    callback({
                        "err": "That username is not in our database."
                    });
                }
            });
        }
    } else {
        // universal provider login
        db.query("SELECT * FROM users WHERE " + provider + "_id = '" + profile.id + "'", function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                let user = result[0];
                if (user !== null) {
                    return callback({
                        "result": user,
                        "err": ""
                    });
                }
            } else {
                return callback({
                    "err": "That " + provider + ' account is not in our system'
                });
            }
        });
    }
};

const isEmail = (username) => {
    return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(username);
};

var signup = function (provider, profile, callback) {
    if (provider === "local") {
        isAvailable('username', profile.username, (result) => {
            if (result) {
                isAvailable('email', profile.email, (result) => {
                    if (result) {
                        if (profile.password[0] === profile.password[1]) {
                            bcrypt.hash(profile.password[1], 10, function (err, hash) {
                                let data = {
                                    'name_first': profile.name.first,
                                    'name_last': profile.name.last,
                                    'username': profile.username,
                                    'email': profile.email,
                                    'password': hash
                                };
                                db.query("INSERT INTO users SET ?", data, (err, rows) => {
                                    if (err) throw err;
                                    else {
                                        db.query("SELECT * FROM users WHERE id = " + rows.insertId, (err, rows) => {
                                            if (err) throw err;
                                            else {
                                                return callback({
                                                    err: '',
                                                    result: rows[0]
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        } else {
                            return callback({
                                err: "The passwords do not match!"
                            });
                        }
                    } else {
                        return callback({
                            err: "That email has been taken!"
                        });
                    }
                });
            } else {
                return callback({
                    err: "That username has been taken!"
                });
            }
        });
    } else {
        // Setting up data to enter

        let data = null;

        switch (provider) {
            case 'google':
                data = {
                    'name_first': profile.name['givenName'],
                    'name_last': profile.name['familyName'],
                    'email': profile.email,
                    'nickname': profile.displayName,
                    'google_id': profile.id
                };
                break;
            case 'twitter':
                data = {
                    'name_first': profile.displayName.split(" ")[0],
                    'name_last': profile.displayName.split(" ")[profile.displayName.split(" ") - 1],
                    'nickname': profile.displayName,
                    'twitter_id': profile.id
                };
                break;
            case 'facebook':
                data = {
                    'name_first': profile.displayName.split(" ")[0],
                    'name_last': profile.displayName.split(" ")[profile.displayName.split(" ") - 1],
                    'facebook_id': profile.id
                };
                break;
            case 'steam':
                data = {
                    'name_first': profile['_json'].realname.split(" ")[0],
                    'name_last': profile['_json'].realname.split(" ")[profile['_json'].realname.split(" ") - 1],
                    'nickname': profile.displayName,
                    'steam_id': profile.id
                };
                break;
            case 'discord':
                data = {
                    'nickname': profile.username,
                    'email': profile.email,
                    'discord_id': profile.id
                };
                break;
        }

        if (data !== null) {
            // Insert new user into database

            db.query("SELECT * FROM users WHERE " + provider + "_id = " + profile.id, (err, result) => {
                if (err) throw err;
                else {
                    if (result[0]) {
                        return callback({
                            err: "That " + provider + " account is already in our database!",
                            result: null
                        });
                    } else {
                        db.query("INSERT INTO users SET ?", data, (err, rows) => {
                            if (err) throw err;
                            else {
                                db.query("SELECT * FROM users WHERE id = " + rows.insertId, (err, rows) => {
                                    if (err) throw err;
                                    else {
                                        return callback({
                                            err: '',
                                            result: rows[0]
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        } else {
            return callback({
                err: 'Something weird happened!'
            }); 
        }
    }
};

const isAvailable = (type, value, callback) => {
    db.query("SELECT * FROM users WHERE " + type + " = " + value, (err, result) => {
        if (err || !result) return callback(true);
        else if (result[0]) return callback(false);
    });
};

module.exports = app;