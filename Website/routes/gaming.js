'use strict';
var express = require('express');
var app = express();
var data = require('../config.json');
var mysql = require('mysql');
var tools = require('../tools');
var dateformat = require('dateformat');

/* GET users listing. */
app.get('/', function (req, res) {
    let user = tools.getUser(req);
    res.render('gaming/index.pug', {
        title: 'Gaming',
        url: data.url,
        user: user
    });
});

app.get('/forums', function (req, res) {
    let user = tools.getUser(req);
    getThreads( (err, forums) => {

        if (user && user.joined) {
            try {
                let joined = new Date(user.joined);
                user.joined = dateformat(joined, "mmm dS, yyyy h:MM TT");
            } catch (e) {
                console.log(e);
            }
        }

        res.render('gaming/forum.pug', {
            title: 'Community Forums',
            url: data.url,
            forums: JSON.stringify(forums),
            user: user
        });
    });
});

// Database Functions

var DBisConnected = false;
var db;

let getThreads = (callback) => {
    // get the threads with the user attached to each one
    db.query("SELECT forum_threads.*, users.name_first, users.name_last, users.name_full, users.nickname, users.joined FROM forum_threads LEFT JOIN users ON forum_threads.author_id=users.id ORDER BY forum_threads.thread_id", (err, rows) => {
        if (err) throw err;
        if (rows.length !== 0) {
            // array for merging the topics
            let data = [];

            for (let i = 0; i < rows.length; i++) {
                let author = rows[i].nickname || rows[i].name_full;

                let timestamp = new Date(rows[i].created);
                timestamp = dateformat(timestamp, "ddd, mmm dS, yyyy") + " at " + dateformat(timestamp, "h:MM TT");

                // Test to see if topic is already in the data array
                let test = { bool: false, index: 0 };
                for (let r = 0; r < data.length; r++) {
                    if (data[r].topic === rows[i].topic) {
                        test = {
                            bool: true,
                            index: r
                        };
                    }
                }
                
                if (!test.bool) { // if not in the array, add the topic and subtopic
                    data[data.length] = {
                        'topic': rows[i].topic,
                        'subtopics': [{
                            'subtopic': rows[i].subtopic,
                            'thread': {
                                'title': rows[i].title,
                                'created': timestamp,
                                'author': {
                                    'id': rows[i].author_id,
                                    'name': author
                                },
                                'privilege': rows[i].privilege
                            }
                        }]
                    };
                } else { // else add the subtopic to the already created topic
                    data[test.index].subtopics.push({
                        'subtopic': rows[i].subtopic,
                        'thread': {
                            'title': rows[i].title,
                            'created': timestamp,
                            'author': {
                                'id': rows[i].author_id,
                                'name': author
                            },
                            'privilege': rows[i].privilege
                        }
                    });
                }

            }

            // send back error = false and the data
            callback(false, data);
        } else {
            // if no rows, send no threads were found.
            rows.error = 'No threads were found!';
            return callback(true, rows); // BTW to other developers, this doesn't do anything past here... most likely will cause errors.
        }
    });
};

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

module.exports = app;