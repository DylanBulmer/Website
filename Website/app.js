'use strict';
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var subdomain = require('subdomain');
var passport = require('passport');
var compression = require('compression');
var rfs = require('rotating-file-stream');
var moment = require('moment');
var fs = require('fs');
var proxy = require('http-proxy-middleware');

var data = require('./config.json');

// Route Files
var www = require('./routes/index');
var account = require('./routes/account');
var blog = require('./routes/blog');
var gaming = require('./routes/gaming');
var store = require('./routes/store');
var admin = require('./routes/admin');
var api = require('./routes/api');

// setup access log storage
var logDirectory = path.join(__dirname, 'log');

logger.token('subdomain', function getId(req) {
    if (req.baseUrl !== undefined) {
        let parts = req.baseUrl.split('/');

        if (parts[1] && parts[1] === 'subdomain') {
            return parts[2];
        } else {
            return 'www';
        }
    } else {
        return null;
    }
});

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating access write stream
var accessLogStream = rfs(moment(new Date()).format("YYYY-MM-DD") + '.log', {
    interval: '1d', // rotate daily
    path: path.join(logDirectory, "access")
});

// create a rotating error write stream
var errorLogStream = rfs(moment(new Date()).format("YYYY-MM-DD") + '.log', {
    interval: '1d', // rotate daily
    path: path.join(logDirectory, "error")
});

var app = express();

app.use(compression());

app.use(require('express-session')({
    secret: data.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        domain: data.url
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
app.set('env', data.env);

/* loggers 
 
   1. Access log to console
   2. Access log to file
   3. Error log to file
 
 */

app.use(logger(':remote-addr :method :subdomain :url :status :response-time ms'));
app.use(logger(':remote-addr :method :subdomain :url :status :response-time ms', { stream: accessLogStream }));
app.use(logger(':remote-addr :method :subdomain :url :status :response-time ms', {
    stream: errorLogStream,
    skip: function (req, res) { return res.statusCode < 400; }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set Up Subdomains
app.use(subdomain({ base: data.url, removeWWW: true }));
app.use('/subdomain/blog/', blog);
app.use('/subdomain/gaming/', gaming);
app.use('/subdomain/account/', account);
app.use('/subdomain/store/', store);
app.use('/subdomain/admin/', admin);
app.use('/subdomain/api/', api);

// adding in reverse proxy
for (let i = 0; i < data.routes.length; i++) {
    let route = data.routes[i];

    app.use(route.route,
        proxy({
            target: route.address,
            changeOrigin: true,
            ws: true,
            pathRewrite: (path, req) => {
                return path.split('/').slice(1).join('/'); // Could use replace, but take care of the leading '/'
            }
        })
    );
}

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
app.get('/subdomain/*/fonts/:file', function (req, res) {
    var options = {
        root: __dirname + '/public/fonts',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(req.params.file, options, function (err) { });
});
app.get('/subdomain/*/favicon.ico', function (req, res) {
    var options = {
        root: __dirname + '/public',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile('favicon.ico', options, function (err) { });
});
app.get('/subdomain/*/images/:file', function (req, res) {
    var options = {
        root: __dirname + '/public/images',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(req.params.file, options, function (err) { });
});
app.get('/subdomain/*/uploads/:file', function (req, res) {
    var options = {
        root: __dirname + '/uploads',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    if (req.params.file === "null") {
        res.send(false);
    } else {
        res.sendFile(req.params.file, options, function (err) { });
    }
});
app.get('/subdomain/*/manifest/:file', function (req, res) {
    var options = {
        root: __dirname + '/public/manifest',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(req.params.file, options, function (err) { });
});
app.get('/subdomain/*/sitemap', function (req, res) {
    var options = {
        root: __dirname + '/public/sitemaps',
        dotfiles: 'deny',
        index: false,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(req.subdomains[0] + ".xml", options, function (err) { });
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

app.get('/mapgame', function (req, res) {
    res.redirect('http://mapgame.' + data.url);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

if (app.get('env') === 'development') {
    // development error handler
    // will print stacktrace
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            config: data
        });
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {},
            config: data
        });
    });
}


if (data.https) {
    // HTTPS Settings
    app.set('port', 443);

} else {
    // HTTP Settings
    app.set('port', 80);

    app.listen(app.get('port'));
}

module.exports = app;