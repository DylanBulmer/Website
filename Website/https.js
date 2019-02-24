#!/usr/bin/env node

'use strict';

//
// My Secure Server
//

const config = require('./config.json');

var greenlock = require('greenlock-express').create({

    // Let's Encrypt v2 is ACME draft 11
    // Note: If at first you don't succeed, stop and switch to staging
    // https://acme-staging-v02.api.letsencrypt.org/directory
    server: 'https://acme-v02.api.letsencrypt.org/directory'
    , version: 'draft-11'
    // You MUST have write access to save certs
    , configDir: '~/.config/acme/'

    // The previous 'simple' example set these values statically,
    // but this example uses approveDomains() to set them dynamically
    //, email: 'none@see.note.above'
    //, agreeTos: false

    // approveDomains is the right place to check a database for
    // email addresses with domains and agreements and such
    , approveDomains: approveDomains

    , app: require('./app')

    // Auto-renew
    , renewWithin: 91 * 24 * 60 * 60 * 1000
    , renewBy: 90 * 24 * 60 * 60 * 1000

    // Get notified of important updates and help me make greenlock better
    , communityMember: false

    // Debug mode
    , debug: false

});

var server = greenlock.listen(80, 443);

server.on('listening', function () {
    console.info(server.type + " listening on", server.address());
});

//
// My Secure Database Check
//
function approveDomains(opts, certs, cb) {

    // The domains being approved for the first time are listed in opts.domains
    // Certs being renewed are listed in certs.altnames
    if (certs) {
        opts.domains = certs.altnames;
        opts.agreeTos = false;
        cb(null, { options: opts, certs: certs });
        return;
    }

    // Only one domain is listed with *automatic* registration via SNI
    // (it's an array because managed registration allows for multiple domains,
    //                                which was the case in the simple example)
    //console.log(opts.domains);

    checkDomain(opts, function (err, agree, email) {
        if (err) { cb(err); return; }

        // You MUST NOT build clients that accept the ToS without asking the user
        opts.agreeTos = agree;
        opts.email = email;

        // NOTE: you can also change other options such as `challengeType` and `challenge`
        // (this would be helpful if you decided you wanted wildcard support as a domain altname)
        // opts.challengeType = 'http-01';
        // opts.challenge = require('le-challenge-fs').create({});

        cb(null, { options: opts, certs: certs });
    });
}


//
// My User / Domain Database
//
/**
 * 
 * @param {{domains: string[]}} opts Options
 * @param {any} cb Callback
 */
function checkDomain(opts, cb) {
    // All of my subdomains that need to be certified...
    let domains = [
        config.url,
        'api.' + config.url,
        'www.' + config.url,
        'blog.' + config.url,
        'admin.' + config.url,
        'account.' + config.url,
        'gaming.' + config.url,
        'store.' + config.url,
        'mapgame.' + config.url,
        'thedocs.' + config.url
    ];
    let userEmail = 'dylanmbulmer@gmail.com';
    let userAgrees = true;

    let passCheck = opts.domains.every(function (domain) {
        // use subdomain + url in config from easy domain transitioning
        return -1 !== domains.indexOf(domain);
    });

    if (!passCheck) {
        cb(new Error('domain not allowed'));
    } else {
        cb(null, userAgrees, userEmail);
    }
}