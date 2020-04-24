'use strict';
var express = require('express');
var app = express();
var data = process.env;
var passport = require('passport');
var bcrypt = require('bcryptjs');
var tools = require('../tools');
var Recaptcha = require("express-recaptcha").Recaptcha;
var nodemailer = require('nodemailer');
var db = require('../modules/database').get();

/* Add headers */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

var recaptcha = new Recaptcha(data.RECAPTCHA_SITE_KEY, data.RECAPTCHA_SECRET);

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

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: data.GOOGLE_CLIENT_ID,
    clientSecret: data.GOOGLE_CLIENT_SECRET,
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
    clientID: data.GOOGLE_CLIENT_ID,
    clientSecret: data.GOOGLE_CLIENT_SECRET,
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

passport.use('google-connect', new GoogleStrategy({
    clientID: data.GOOGLE_CLIENT_ID,
    clientSecret: data.GOOGLE_CLIENT_SECRET,
    callbackURL: "/connect/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// Setup Facebook

var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: data.FACEBOOK_CLIENT_ID,
    clientSecret: data.FACEBOOK_CLIENT_SECRET,
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
    clientID: data.FACEBOOK_CLIENT_ID,
    clientSecret: data.FACEBOOK_CLIENT_SECRET,
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

passport.use('facebook-connect', new FacebookStrategy({
    clientID: data.FACEBOOK_CLIENT_ID,
    clientSecret: data.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/connect/facebook/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// Setup Twitter

var TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
    consumerKey: data.TWITTER_CLIENT_ID,
    consumerSecret: data.TWITTER_CLIENT_SECRET,
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
    consumerKey: data.TWITTER_CLIENT_ID,
    consumerSecret: data.TWITTER_CLIENT_SECRET,
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

passport.use('twitter-connect', new TwitterStrategy({
    consumerKey: data.TWITTER_CLIENT_ID,
    consumerSecret: data.TWITTER_CLIENT_SECRET,
    callbackURL: "/connect/twitter/callback"
},
    function (token, tokenSecret, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// Setup Discord

var DiscordStrategy = require('passport-discord').Strategy;

passport.use(new DiscordStrategy({
    clientID: data.DISCORD_CLIENT_ID,
    clientSecret: data.DISCORD_CLIENT_SECRET,
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
    clientID: data.DISCORD_CLIENT_ID,
    clientSecret: data.DISCORD_CLIENT_SECRET,
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

passport.use('discord-connect', new DiscordStrategy({
    clientID: data.DISCORD_CLIENT_ID,
    clientSecret: data.DISCORD_CLIENT_SECRET,
    callbackURL: "/connect/discord/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// Setup Steam

var SteamStrategy = require('passport-steam').Strategy;

passport.use(new SteamStrategy({
    returnURL: (data.HTTPS ? 'https://' : 'http://') + 'account.' + data.URL + '/signin/steam/callback',
    realm: (data.HTTPS ? 'https://' : 'http://') + 'account.' + data.URL + '/',
    apiKey: data.STEAM_KEY
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
    returnURL: (data.HTTPS ? 'https://' : 'http://') + 'account.' + data.URL + '/signin/steam/callback',
    realm: (data.HTTPS ? 'https://' : 'http://') + 'account.' + data.URL + '/',
    apiKey: data.STEAM_KEY
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

passport.use('steam-connect', new SteamStrategy({
    returnURL: (data.HTTPS ? 'https://' : 'http://') + 'account.' + data.URL + '/signin/steam/callback',
    realm: (data.HTTPS ? 'https://' : 'http://') + 'account.' + data.URL + '/',
    apiKey: data.STEAM_KEY
},
    function (identifier, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

// Basic Web Routes
app.get('/', function (req, res) {
    tools.userTest(req, function (test) {
        if (test) {
            let user = tools.getUser(req);

            let socialLogins = {
                'google':   user['google_id']   && user['google_id']    !== '' ? true : false,
                'facebook': user['facebook_id'] && user['facebook_id']  !== '' ? true : false,
                'twitter':  user['twitter_id']  && user['twitter_id']   !== '' ? true : false,
                'steam':    user['steam_id']    && user['steam_id']     !== '' ? true : false,
                'discord':  user['discord_id']  && user['discord_id']   !== '' ? true : false
            };

            res.render('account/index', { title: 'Account', config: data, user: user, logins: socialLogins });
        } else {
            res.redirect('/signin');
        }
    });
});

app.post('/', function (req, res, next) {
    tools.userTest(req, function (test) {
        if (test) {
            let user = tools.getUser(req);
            db.query('SELECT * FROM users WHERE id = ' + user.id, (err, rows, fields) => {
                if (err) return console.error(err);

                let profile = rows[0];

                let socialLogins = {
                    'google':   user['google_id']   && user['google_id']    !== '' ? true : false,
                    'facebook': user['facebook_id'] && user['facebook_id']  !== '' ? true : false,
                    'twitter':  user['twitter_id']  && user['twitter_id']   !== '' ? true : false,
                    'steam':    user['steam_id']    && user['steam_id']     !== '' ? true : false,
                    'discord':  user['discord_id']  && user['discord_id']   !== '' ? true : false
                };

                switch (req.body.form) {
                    case 'man_pass':        // Change Password
                        if (bcrypt.compareSync(req.body['password_current'], profile.password)) {
                            if (req.body.password === req.body.password_confirm) {
                                bcrypt.hash(req.body.password, 10, function (err, hash) {
                                    // Store hash in database
                                    db.query('UPDATE users SET password="' + hash + '" where id=' + user.id, (err, results, fields) => {
                                        if (err) return next(new Error(err.message));
                                        user.password = true;
                                        req.login(user, (err) => {
                                            if (err) return next(new Error('Password was updated, but could not re-login.'));
                                            else return res.render('account/index', { title: 'Account', config: data, pass: "Password Reset!", user: user, logins: socialLogins });
                                        });
                                    });
                                });
                            } else {
                                res.render('account/index', { title: 'Account', config: data, err: "Passwords do not match!", user: user, logins: socialLogins });
                            }
                        } else {
                            res.render('account/index', { title: 'Account', config: data, err: "Current password is incorrect!", user: user, logins: socialLogins });
                        }
                        break;
                    case 'create_pass':        // Create Password
                        if (req.body.password === req.body.password_confirm) {
                            bcrypt.hash(req.body.password, 10, function (err, hash) {
                                // Store hash in database
                                db.query('UPDATE users SET password="' + hash + '" where id=' + user.id, (err, results, fields) => {
                                    if (err) return res.render('account/index', { title: 'Account', config: data, err: "Couldn't reset password!", user: user, logins: socialLogins });
                                    user.password = true;
                                    req.login(user, (err) => {
                                        if (err) return next(new Error('Password was updated, but could not re-login.'));
                                        else return res.render('account/index', { title: 'Account', config: data, pass: "Password Reset!", user: user, logins: socialLogins });
                                    });
                                });
                            });
                        } else {
                            res.render('account/index', { title: 'Account', config: data, err: "Passwords do not match!", user: user, logins: socialLogins });
                        }
                        break;
                    case 'deact-google':    // Deactivate Google
                        db.query('UPDATE users SET google_id = null where id=' + user.id);
                        break;
                    case 'deact-twitter':   // Deactivate Twitter
                        db.query('UPDATE users SET twitter_id = null where id=' + user.id);
                        break;
                    case 'deact-facebook':  // Deactivate Facebook
                        db.query('UPDATE users SET facebook_id = null where id=' + user.id);
                        break;
                    case 'deact-steam':     // Deactivate Steam
                        db.query('UPDATE users SET steam_id = null where id=' + user.id);
                        break;
                    case 'deact-discord':     // Deactivate Steam
                        db.query('UPDATE users SET discord_id = null where id=' + user.id);
                        break;
                    default:
                        res.render('account/index', { title: 'Account', config: data, user: user, logins: socialLogins });
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
            if (req.session["loginTries"] >= 5) {
                res.render('signin', { title: 'Sign In', error: '', config: data, captcha: recaptcha.render() });
            } else {
                res.render('signin', { title: 'Sign In', error: '', config: data });
            }
        } else {
            res.redirect('/');
        }
    });
});

app.post('/signin', function (req, res, next) {
    tools.userTest(req, function (test) {
        if (!test) {
            if (req.session["loginTries"]) req.session["loginTries"] += 1;
            else req.session["loginTries"] = 1;

            if (req.session["loginTries"] > 5) {
                // do captcha check
                recaptcha.verify(req, function (error, info) {
                    if (!error) {
                        login('local', {
                            "username": req.body.username,
                            "password": req.body.password
                        }, function (result) {
                            if (result.err) {
                                if (req.session["loginTries"] >= 5) {
                                    res.render('signin', { title: 'Sign In', error: result.err, config: data, captcha: recaptcha.render() });
                                } else {
                                    res.render('signin', { title: 'Sign In', error: result.err, config: data });
                                }
                            }
                            else {
                                req.login(result.result, (err) => {
                                    if (err) {
                                        return next(new Error(err));
                                    } else {
                                        req.session["loginTries"] = 0;
                                        return res.redirect('/');
                                    }
                                });
                            }
                        });
                    } else {
                        res.render('signin', { title: 'Sign In', error: "Please click the reCAPTCHA box.", config: data, captcha: recaptcha.render() });
                    }
                });
            } else {
                login('local', {
                    "username": req.body.username,
                    "password": req.body.password
                }, function (result) {
                    if (result.err) {
                        if (req.session["loginTries"] >= 5) {
                            res.render('signin', { title: 'Sign In', error: result.err, config: data, captcha: recaptcha.render() });
                        } else {
                            res.render('signin', { title: 'Sign In', error: result.err, config: data });
                        }
                    }
                    else {
                        req.login(result.result, (err) => {
                            if (err) {
                                return next(new Error(err));
                            } else {
                                req.session["loginTries"] = 0;
                                return res.redirect('/');
                            }
                        });
                    }
                });
            }
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

// Forgot Password Routes

// Gives form for forgot password
app.get('/forgot-password', function (req, res, next) {
    tools.userTest(req, (test) => {
        if (test) {
            res.redirect('/');
        } else {
            res.render('account/emailRequest', { title: 'Forgot Password', config: data });
        }
    });
});

// Tests for username/email and generates code
app.post('/forgot-password', function (req, res, next) {
    tools.userTest(req, (test) => {
        if (test) {
            res.redirect('/');
        } else {
            // do database query for email
            db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'", (err, results, fields) => {
                if (err) return next(new Error(err.message));
                else {
                    let user = results[0];

                    if (user) {

                        // generate code and save it
                        let code = [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

                        db.query('UPDATE users SET ? WHERE id = ' + user.id, { resetcode: code }, (err, result) => {
                            if (err) return next(new Error("Database Error"));
                            else {
                                // send email with verification code
                                let transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: data.email
                                });
                                transporter.sendMail({
                                    'to': user.email,
                                    'from': 'support@bulmersolutions.com',
                                    'subject': 'Password Reset | Bulmer Solutions',
                                    'text': 'Click the following link to reset your password: \n\n https://account.' + data.url + '/forgot-password/verify/' + code
                                }, (err, info) => {
                                    if (err) res.render('account/emailRequest', { title: 'Forgot Password', config: data, error: err });
                                    else {
                                        res.render('account/emailSent', { title: 'Forgot Password', config: data });
                                    }
                                });
                            }
                        });

                    } else {
                        res.render('account/emailRequest', { title: 'Forgot Password', config: data, error: 'We could not find that email!' });
                    }
                }
            });
        }
    });
});

// automatic verification, render form / handle reset
app.get('/forgot-password/verify/:code', (req, res, next) => {
    tools.userTest(req, (test) => {
        if (test) {
            res.redirect('/');
        } else {
            // render reset password view
            let code = req.params.code;
            db.query('SELECT * FROM users WHERE resetcode = "' + code + '"', (err, result) => {
                if (err) throw err;
                else {
                    //let user = result[0];
                    res.render('account/resetPassword', {title: 'Reset Password', config: data});
                }
            });
        }
    });
});

app.post('/forgot-password/verify/:code', (req, res, next) => {
    tools.userTest(req, (test) => {
        if (test) {
            res.redirect('/');
        } else {
            if (req.body && req.body.password) {
                if (req.body.password === req.body.password_confirm) {
                    // reset password and set reset code to null
                    let code = req.params.code;
                    db.query('SELECT * FROM users WHERE resetcode = "' + code + '"', (err, result) => {
                        if (err) throw err;
                        else {
                            bcrypt.hash(req.body.password, 10, (err, hash) => {
                                let user = result[0],
                                    data = {
                                        'resetcode': null,
                                        'password': hash
                                    };

                                db.query('UPDATE users SET ? WHERE id = ' + user.id, data, (err, result) => {
                                    if (err) throw err;
                                    else {
                                        req.login(user, (err) => {
                                            if (err) return next(new Error('User was updated, but could not login.'));
                                            else return res.redirect('/');
                                        });
                                    }
                                });
                            });
                        }
                    });
                } else {
                    res.render('account/resetPassword', { title: 'Reset Password', config: data, error: 'Passwords do not match!' });
                }
            }
        }
    });
});

// All provider callbacks

app.get('/:type/:provider/', function (req, res, next) {
    let provider = req.params.provider;
    let type = req.params.type;

    switch (type) {
        case "signin":
        case "signup":
            switch (provider) {
                case 'google':
                    passport.authenticate(provider + (type === "signup" ? "-signup" : ""), { scope: ['profile', 'email'] })(req, res, next);
                    break;
                case 'discord':
                    passport.authenticate(provider + (type === "signup" ? "-signup" : ""), { scope: ['identify', 'email'] })(req, res, next);
                    break;
                case 'facebook':
                    passport.authenticate(provider + (type === "signup" ? "-signup" : ""), { scope: ['public_profile', 'email'] })(req, res, next);
                    break;
                case 'twitter':
                case 'steam':
                    passport.authenticate(provider + (type === "signup" ? "-signup" : ""))(req, res, next);
                    break;
                default:
                    next();
            }
            break;
        case "connect":
            tools.userTest(req, function (test) {
                if (test) {
                    switch (provider) {
                        case 'google':
                            passport.authenticate(provider + "-connect", { scope: ['profile', 'email'] })(req, res, next);
                            break;
                        case 'discord':
                            passport.authenticate(provider + "-connect", { scope: ['identify', 'email'] })(req, res, next);
                            break;
                        case 'facebook':
                            passport.authenticate(provider + "-connect", { scope: ['public_profile', 'email'] })(req, res, next);
                            break;
                        case 'twitter':
                        case 'steam':
                            passport.authenticate(provider + "-connect")(req, res, next);
                            break;
                        default:
                            next();
                    }
                } else {
                    res.redirect('/signin');
                }
            });
            break;
        default:
            next();

    }
});

app.get('/:type/:provider/callback', function (req, res, next) {
    let provider = req.params.provider;
    let type = req.params.type;

    switch (type) {
        case "signin":
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
            break;
        case "signup":
            passport.authenticate(provider + "-signup", (err, user, info) => {
                if (err) return res.render('signup', { title: 'Sign Up', error: err, config: data });
                else if (!user) return res.redirect('/signup');
                else {
                    req.login(user, function (err) {
                        if (err) { return next(err); }
                        return res.redirect('/');
                    });
                }
            })(req, res, next);
            break;
        case "connect":
            passport.authenticate(provider + "-connect", (err, profile, info) => {
                if (err) return res.render('acconut/index', { title: 'Account', error: err, config: data });
                else if (!profile) return res.redirect('/signup');
                else {
                    addConnection(provider, tools.getUser(req), profile, (data) => {
                        if (data.err) {
                            return next(new Error(data.err));
                        } else {
                            req.login(data.result, (err) => {
                                if (err) next(new Error(err));
                                else return res.redirect('/');
                            });
                        }
                    });
                }
            })(req, res, next);
            break;
        default:
            next();
    }
});

// Data Base signin Requests

const login = (provider, profile, callback) => {
    if (provider === "local") {
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
    return /^[a-zA-Z0-9.!#$%&�*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(username);
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

const addConnection = (provider, user, profile, callback) => {
    db.query("SELECT * FROM users WHERE " + provider + "_id = " + profile.id, (err, result) => {
        if (err) throw err;
        else {
            if (result[0]) {
                return callback({
                    err: "That " + provider + " account is already in our database!",
                    result: null
                });
            } else {
                let data = {};
                data[provider + "_id"] = profile.id;

                db.query("UPDATE users SET ? WHERE id = " + user.id, data, (err, rows) => {
                    if (err) throw err;
                    else {
                        user[provider + "_id"] = profile.id;
                        return callback({
                            err: '',
                            result: user
                        });
                    }
                });
            }
        }
    });
};

const isAvailable = (type, value, callback) => {
    db.query("SELECT * FROM users WHERE " + type + " = " + value, (err, result) => {
        if (err || !result) return callback(true);
        else if (result[0]) return callback(false);
    });
};

module.exports = app;