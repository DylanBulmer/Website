'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var subdomain = require('subdomain');
var passport = require('passport');

var data = require('./config.json');

// Route Files
var www = require('./routes/index');
var account = require('./routes/account');
var blog = require('./routes/blog');
var gaming = require('./routes/gaming');
var store = require('./routes/store');

var app = express();

app.use(require('express-session')({
    secret: data.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        domain: data.url,
        maxAge: 1000 * 60 * 24 // 24 hours
    }
}));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set Up Subdomains
app.use(subdomain({ base: data.url, removeWWW: true }));
app.use('/subdomain/blog/', blog);
app.use('/subdomain/gaming/', gaming);
app.use('/subdomain/account/', account);
app.use('/subdomain/store/', store);

// Set subdomain directories

app.get('/subdomain/*/css/:file', function (req, res) {
    var options = {
        root: __dirname + '/public/css',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(req.params.file, options, function (err) { });
});
app.get('/subdomain/*/js/:file', function (req, res) {
    var options = {
        root: __dirname + '/public/js',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(req.params.file, options, function (err) { });
});

app.use('/', www);

// Create Redirects
app.get('/blog', function (req, res) {
    res.redirect('http://blog.' + data.url);
});

app.get('/account', function (req, res) {
    res.redirect('http://account.' + data.url);
});

app.get('/gaming', function (req, res) {
    res.redirect('http://gaming.' + data.url);
});

app.get('/store', function (req, res) {
    res.redirect('http://store.' + data.url);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            url: data.url
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        url: data.url
    });
});


if (data.https) {
    // HTTPS Settings
    app.set('port', 443);

    // returns an instance of node-greenlock with additional helper methods
    var lex = require('greenlock-express').create({
        // set to https://acme-v01.api.letsencrypt.org/directory in production
        server: 'staging',

        // If you wish to replace the default plugins, you may do so here
        //
        challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '/tmp/acme-challenges' }) },
        store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' }),

        // You probably wouldn't need to replace the default sni handler
        // See https://git.daplie.com/Daplie/le-sni-auto if you think you do
        //, sni: require('le-sni-auto').create({})

        approveDomains: approveDomains,

        renewWithin: (91 * 24 * 60 * 60 * 1000),
        renewBy: (90 * 24 * 60 * 60 * 1000),
        debug: true
    });

    require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
        console.log("Listening for ACME http-01 challenges on", this.address());
    });

    require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
        console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
    });

    //require('greenlock-express').create({

    //    server: 'staging',
    //    email: 'piggahbro@gmail.com',
    //    agreeTos: true,
    //    approvedDomains: ['piggahbrostudios.com', 'www.piggahbrostudios.com', 'blog.piggahbrostudios.com', 'account.piggahbrostudios.com', 'gaming.piggahbrostudios.com', 'store.piggahbrostudios.com'],
    //    app: app,
    //    renewWithin: (91 * 24 * 60 * 60 * 1000),
    //    renewBy: (90 * 24 * 60 * 60 * 1000),
    //    debug: true

    //}).listen(80, 443);
} else {
    // HTTP Settings
    app.set('port', 80);

    app.listen(app.get('port'));
}

function approveDomains(opts, certs, cb) {
    // This is where you check your database and associated
    // email addresses with domains and agreements and such


    // The domains being approved for the first time are listed in opts.domains
    // Certs being renewed are listed in certs.altnames
    if (certs) {
        opts.domains = certs.altnames;
    }
    else {
        opts.email = 'piggahbro@gmail.com';
        opts.agreeTos = true;
    }

    // NOTE: you can also change other options such as `challengeType` and `challenge`
    // opts.challengeType = 'http-01';
    // opts.challenge = require('le-challenge-fs').create({});

    cb(null, { options: opts, certs: certs });
}