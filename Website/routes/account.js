'use strict';
var express = require('express');
var app = express();
var data = require('../config.json');
var mysql = require('mysql');
var passport = require('passport');
var bcrypt = require('bcrypt');
var tools = require('../tools');

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
                    return done(data.err);
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
    }));

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

// Setup Discord

var DiscordStrategy = require('passport-discord').Strategy;

passport.use(new DiscordStrategy({
    clientID: data.discord.clientID,
    clientSecret: data.discord.clientSecret,
    callbackURL: "/signin/discord/callback"
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            console.log(profile);
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

// Setup Steam

var SteamStrategy = require('passport-steam').Strategy;

passport.use(new SteamStrategy({
        returnURL: 'http://account.' + data.url + '/signin/steam/callback',
        realm: 'http://account.' + data.url + '/',
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
    }));

// Basic Web Routes
app.get('/', function (req, res) {
    tools.userTest(req, function ( test ) {
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
    tools.userTest( req, function ( test ) {
        if (test) {
            let user = tools.getUser(req);
            db.query('SELECT * FROM users WHERE id = ' + req.user.id, (err, rows, fields) => {
                let profile = rows[0];

                let socialLogins = {
                    'google': user['google_id'] && user['google_id'] !== '' ? true : false,
                    'facebook': user['facebook_id'] && user['facebook_id'] !== '' ? true : false,
                    'twitter': user['twitter_id'] && user['twitter_id'] !== '' ? true : false,
                    'steam': user['steam_id'] && user['steam_id'] !== '' ? true : false,
                    'discord': user['discord_id'] && user['discord_id'] !== '' ? true : false
                };

                switch (req.body.form) {
                    case 'man_pass': // Change Password
                        if (profile.password === req.body['password_current']) {
                            if (req.body.password === req.body.password_confirm) {
                                bcrypt.hash(req.body.password, 10, function (err, hash) {
                                    // Store hash in database
                                    db.query('UPDATE users SET password="' + hash + '" where id=' + req.user.id);
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
                        db.query('UPDATE users SET google_id ="" where id=' + req.user.id);
                        break;
                    case 'deact-twitter':   // Deactivate Twitter
                        db.query('UPDATE users SET twitter_id ="" where id=' + req.user.id);
                        break;
                    case 'deact-facebook':  // Deactivate Facebook
                        db.query('UPDATE users SET facebook_id ="" where id=' + req.user.id);
                        break;
                    case 'deact-steam':     // Deactivate Steam
                        db.query('UPDATE users SET steam_id ="" where id=' + req.user.id);
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

// I FORGOT A LOGOUT!!!! AHHHH.... I have this extensive signin/sign up system... but no logout... Time to fix that!
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
                    res.render('signup', { title: 'Sign Up', error: err, config: data });
                } else {
                    return res.redirect('/');
                }
            })(req, res, next);
        } else {
            res.redirect('/');
        }
    });
});

// Google Routes

app.get('/signin/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/signin/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/signin'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/signup/google',
    passport.authenticate('google-signup', { scope: ['profile', 'email'] })
);

app.get('/signup/google/callback',
    passport.authenticate('google-signup', {
        failureRedirect: '/signup'
    }),
    function (req, res) {
        res.redirect('/');
    });

// Facebook Routes

app.get('/signin/facebook',
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

app.get('/signin/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/signup/facebook',
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

app.get('/signup/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/signup'
    }),
    function (req, res) {
        res.redirect('/');
    });

// Twitter Routes

app.get('/signin/twitter',
    passport.authenticate('twitter')
);

app.get('/signin/twitter/callback',
    passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/signup/twitter',
    passport.authenticate('twitter')
);

app.get('/signup/twitter/callback',
    passport.authenticate('twitter', {
        failureRedirect: '/signup'
    }),
    function (req, res) {
        res.redirect('/');
    });

// Discord Routes

app.get('/signin/discord',
    passport.authenticate('discord')
);

app.get('/signin/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: '/signin'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/signup/discord',
    passport.authenticate('discord')
);

app.get('/signup/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: '/signup'
    }),
    function (req, res) {
        res.redirect('/');
    });

// Steam Routes

app.get('/signin/steam',
    passport.authenticate('steam')
);

app.get('/signin/steam/callback',
    passport.authenticate('steam', {
        failureRedirect: '/signin'
    }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/signup/steam',
    passport.authenticate('steam')
);

app.get('/signup/steam/callback',
    passport.authenticate('steam', {
        failureRedirect: '/signup'
    }),
    function (req, res) {
        res.redirect('/');
    });

module.exports = app;

// Data Base signin Requests

// new login function.
const login = (provider, profile, callback) => {
    if (DBisConnected) {
        if (provider === "local") {
            let usernameOrEmail = isEmail(profile.username);
            if (usernameOrEmail) {
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
                } else if (i === result.length) {
                    return callback({
                        "err": "That " + provider + ' id is not in our system'
                    });
                }
            });
        }
    } else {
        callback({
            "err": "No database connected!"
        });
    }
};

const isEmail = (username) => {
    return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(username);
};

var signin = function (provider, profile, callback) {
    if (DBisConnected) {
        let user = null;
        db.query("SELECT * FROM users", function (err, result) {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
                if (provider === "local") {
                    if (result[i].username === profile.username || result[i].email === profile.username) {
                        // Tests to see if passwords match
                        bcrypt.compare(profile.password, result[i].password, function (err, pass) {
                            if (pass) {
                                user = result[i];
                                if (user !== null) {
                                    return callback({
                                        "result": result[i],
                                        "err": ''
                                    });
                                }
                            } else {
                                return callback({
                                    "err": "Invalid password"
                                });
                            }
                        });
                    } else if (i === result.length) {
                        return callback({
                            "err": "Invaild Username/Email"
                        });
                    }
                } else {
                    // universal provider login
                    if (result[i][provider + "_id"] === profile.id) {
                        user = result[i];
                        if (user !== null) {
                            return callback({
                                "result": user,
                                "err": ""
                            });
                        }
                    } else if (i === result.length) {
                        return callback({
                            "err": "That " + provider + ' id is not in our system'
                        });
                    }
                }
            }
        });
    } else {
        return callback({
            "err": "No database connected!"
        });
    }
};

// Database Functions

var DBisConnected = false;
var db;

function handleDisconnect() {
    db = mysql.createConnection({
        host: data.mysql.url,
        user: data.mysql.user,
        password: data.mysql.password,
        database: data.mysql.database
    });

    db.connect(function (err) {
        if (err) {
            DBisConnected = false;
            console.log("MySQL ERROR: " + err.code);
            setTimeout(handleDisconnect, 2000);
        } else {
            if (data.mysql.database === "") {
                console.log("Please enter a database in the config.json file!");
            } else {
                console.log("MySQL Connection Established");
                DBisConnected = true;
            }
        }

        db.on('error', function (err) {
            console.log('MySQL Error: ', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                DBisConnected = false;
                handleDisconnect();
            } else {
                throw err;
            }
        });
    });
}

handleDisconnect();