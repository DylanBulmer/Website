'use strict';
var express = require('express');
var app = express();
var data = require('../config.json');
var mysql = require('mysql');
var tools = require('../tools');
var dateformat = require('dateformat');
var net = require('net');
var http = require('http');

/* GET users listing. */
app.get('/', function (req, res) {
    let user = tools.getUser(req);
    getServers((servers) => {
        res.render('gaming/index.pug', {
            title: 'Gaming',
            servers: JSON.stringify(servers),
            config: data,
            user: user
        });
    });
});

app.get('/forums', function (req, res) {
    let user = tools.getUser(req);
    getThreads((err, forums) => {

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
            config: data,
            forums: JSON.stringify(forums),
            user: user
        });
    });
});

app.get('/forums/:subtopic', function (req, res) {
    let user = tools.getUser(req);
    getSubtopic(req.params.subtopic, (err, forums) => {

        /*if (user && user.joined) {
            try {
                let joined = new Date(user.joined);
                user.joined = dateformat(joined, "mmm dS, yyyy h:MM TT");
            } catch (e) {
                console.log(e);
            }
        }*/

        if (err) {
            res.send(err);
        } else {
            res.json(forums);
        }
    });
});

app.get('/forums/:subtopic/:thread_id', function (req, res) {
    let user = tools.getUser(req);
    if (req.params.thread_id === "new") {
        res.send('New');
    } else {
        getThread(req.params.thread_id, (err, forums) => {

            /*if (user && user.joined) {
                try {
                    let joined = new Date(user.joined);
                    user.joined = dateformat(joined, "mmm dS, yyyy h:MM TT");
                } catch (e) {
                    console.log(e);
                }
            }*/

            res.json(forums);
        });
    }
});

// Database Functions

var DBisConnected = false;
var db;

let getServers = (callback) => {
    db.query("SELECT * FROM servers", (err, rows, fields) => {
        let data = [];

        for (let i = 0; i < rows.length; i++) {
            let server = {
                game: rows[i].server,
                name: rows[i].name,
                version: rows[i].version,
                port: rows[i].port,
                host: rows[i].url,
                status: rows[i].status === 0 ? "Offline" : "Online"
            };

            switch (rows[i].service) {
                case "steam":
                    server.target = "_self";
                    server.url = "steam://connect/" + rows[i].url + ":" + rows[i].port;
                    break;
                default:
                    server.target = "_blank";
                    server.url = rows[i].url + ":" + rows[i].port;
                    break;
            }
            
            data.push(server);

            if (i === rows.length - 1) {
                callback(data);
            }

        }

    });
};

let checkStatus = (server, callback) => {
    switch (server.game) {
        case "Minecraft":
            /*
            getServerStatus(server, (status) => {
                callback(status);
            });
            */
            callback(server);
            break;
        case "Garry's Mod":
        case "Unturned":
            http.get({
                hostname: "api.steampowered.com",
                port: 80,
                path: "/ISteamApps/GetServersAtAddress/v0001?addr=" + server.host + ":" + server.port + "&format=json",
                timeout: 200
            }, (res) => {
                let rawData = "";

                res.resume();
                res.on('data', (chunk) => {
                    rawData += chunk;
                });
                res.on('error', (err) => {
                    console.log(err.message);
                    callback(server);
                });
                res.on('end', () => {
                    try {
                        let parsedData = JSON.parse(rawData);
                        if (parsedData.response.servers.length > 0) server.status = "Online";
                        callback(server);
                    } catch (e) {
                        console.log(e.message);
                        callback(server);
                    }
                });
            }).on("error", (err) => {
                console.log(err.message);
                callback(server);
            });
            break;
        default:
            callback(server);
            break;
    }
};

let getServerStatus = (server, callback) => {
    // Create Network call
    let client = net.connect(server.port, server.host, function (data) {
        let buff = new Buffer([0xFE, 0x01]);
        client.write(buff);
    });
    // set timeout with callback
    client.setTimeout(100, (data) => {
        server.status = "Offline";
        callback(server);
    });
    // on data
    client.on('data', function (data) {
        if (data !== null && data !== '') {
            // convert data to strings
            let server_info = data.toString().split("\x00\x00\x00");
            if (server_info !== null && server_info.length) {
                server.status = "Online";
                server.version = server_info[2].replace(/\u0000/g, '');
                server.motd = server_info[3].replace(/\u0000/g, '');
                server.current_players = server_info[4].replace(/\u0000/g, '');
                server.max_players = server_info[5].replace(/\u0000/g, '');

                // send back updated data
                callback(server);
            }
            else {
                server.status = "Offline";

                // send back data
                callback(server);
            }
        }
        client.end();
    });
    // on error
    client.on('error', (data) => {
        console.error(data.message);

        server.status = "Offline";
        callback(server);
    });
};

/**
 * @param {number} thread Thread ID
 * @param {Function} callback Callback function
 */
let getThread = (thread, callback) => {
    db.query("SELECT forum_topics.topic, forum_topics.subtopic, forum_threads.*, posts.content, posts.author_id, posts.created, posts.last_modified, posts.post_id, users.name_first, users.name_last, users.nickname, users.joined FROM forum_topics LEFT JOIN forum_threads ON forum_threads.topic_id =forum_topics.topic_id LEFT JOIN( SELECT content, thread_id as id, author_id, created, last_modified, post_id FROM forum_posts ORDER BY last_modified DESC LIMIT 1) AS posts ON posts.id = forum_threads.thread_id LEFT JOIN users ON posts.author_id = users.id WHERE forum_threads.thread_id = \"" + thread + "\" ORDER BY forum_threads.thread_id;", (err, rows) => {
        if (err) throw err;
        if (rows.length !== 0) {
            // array for merging the topics
            let data = [];

            for (let i = 0; i < rows.length; i++) {
                let author = rows[i]['nickname'] ? rows[i]['nickname'] : rows[i]['name_first'] ? rows[i]['name_first'] + " " + rows[i]['name_last'] : null;

                let timestamp;
                if (rows[i]['last_modified']) {
                    timestamp = new Date(rows[i]['last_modified']);
                    timestamp = dateformat(timestamp, "ddd, mmm dS, yyyy") + " at " + dateformat(timestamp, "h:MM TT");
                } else {
                    timestamp = "";
                }

                // Test to see if topic is already in the data array
                let test = { bool: false, index: 0 };
                for (let r = 0; r < data.length; r++) {
                    if (data[r]['topic'] === rows[i]['topic']) {
                        test = {
                            bool: true,
                            index: r
                        };
                    }
                }

                if (!test.bool) { // if not in the array, add the topic and subtopic
                    data[data.length] = {
                        'topic': rows[i]['topic'],
                        'id': rows[i]['topic_id'],
                        'subtopics': [{
                            'subtopic': rows[i]['subtopic'],
                            'thread': {
                                'title': rows[i]['title'],
                                'id': rows[i]['thread_id'],
                                'created': timestamp,
                                'author': {
                                    'id': rows[i]['author_id'],
                                    'name': author
                                },
                                'privilege': rows[i]['privilege']
                            }
                        }]
                    };
                } else { // else add the subtopic to the already created topic
                    data[test.index].subtopics.push({
                        'subtopic': rows[i]['subtopic'],
                        'id': rows[i]['thread_id'],
                        'thread': {
                            'title': rows[i]['title'],
                            'id': rows[i]['post_id'],
                            'created': timestamp,
                            'author': {
                                'id': rows[i]['author_id'],
                                'name': author
                            },
                            'privilege': rows[i]['privilege']
                        }
                    });
                }

            }

            // send back error = false and the data
            callback(false, data);
        } else {
            callback("No thread with id: '" + thread + "' was found!");
        }
    });
};

/**
 * @param {string} subtopic Thread ID
 * @param {Function} callback Callback function
 */
let getSubtopic = (subtopic, callback) => {
    db.query("SELECT forum_topics.topic, forum_topics.subtopic, forum_threads.*, posts.content, posts.author_id, posts.created, posts.last_modified, posts.post_id, users.name_first, users.name_last, users.nickname, users.joined FROM forum_topics LEFT JOIN forum_threads ON forum_threads.topic_id =forum_topics.topic_id LEFT JOIN( SELECT content, thread_id as id, author_id, created, last_modified, post_id FROM forum_posts ORDER BY last_modified DESC LIMIT 1) AS posts ON posts.id = forum_threads.thread_id LEFT JOIN users ON posts.author_id = users.id WHERE forum_topics.subtopic = \"" + subtopic + "\" ORDER BY forum_threads.thread_id;", (err, rows) => {
        if (err) throw err;
        if (rows.length !== 0) {
            // array for merging the topics
            let data = [];

            for (let i = 0; i < rows.length; i++) {
                let author = rows[i]['nickname'] ? rows[i]['nickname'] : rows[i]['name_first'] ? rows[i]['name_first'] + " " + rows[i]['name_last'] : null;

                let timestamp;
                if (rows[i]['last_modified']) {
                    timestamp = new Date(rows[i]['last_modified']);
                    timestamp = dateformat(timestamp, "ddd, mmm dS, yyyy") + " at " + dateformat(timestamp, "h:MM TT");
                } else {
                    timestamp = "";
                }

                // Test to see if topic is already in the data array
                let test = { bool: false, index: 0 };
                for (let r = 0; r < data.length; r++) {
                    if (data[r]['topic'] === rows[i]['topic']) {
                        test = {
                            bool: true,
                            index: r
                        };
                    }
                }

                if (!test.bool) { // if not in the array, add the topic and subtopic
                    data[data.length] = {
                        'topic': rows[i]['topic'],
                        'id': rows[i]['topic_id'],
                        'subtopics': [{
                            'subtopic': rows[i]['subtopic'],
                            'thread': {
                                'title': rows[i]['title'],
                                'id': rows[i]['thread_id'],
                                'created': timestamp,
                                'author': {
                                    'id': rows[i]['author_id'],
                                    'name': author
                                },
                                'privilege': rows[i]['privilege']
                            }
                        }]
                    };
                } else { // else add the subtopic to the already created topic
                    data[test.index].subtopics.push({
                        'subtopic': rows[i]['subtopic'],
                        'id': rows[i]['thread_id'],
                        'thread': {
                            'title': rows[i]['title'],
                            'id': rows[i]['post_id'],
                            'created': timestamp,
                            'author': {
                                'id': rows[i]['author_id'],
                                'name': author
                            },
                            'privilege': rows[i]['privilege']
                        }
                    });
                }

            }

            // send back error = false and the data
            callback(false, data);
        } else {
            callback("No Subtopic '" + subtopic + "' was found!");
        }
    });
};

let getThreads = (callback) => {
    // get the threads with the user attached to each one
    db.query("SELECT forum_topics.topic, forum_topics.subtopic, forum_threads.*, posts.content, posts.author_id, posts.created, posts.last_modified, posts.post_id, users.name_first, users.name_last, users.nickname, users.joined FROM forum_topics LEFT JOIN forum_threads ON forum_threads.topic_id =forum_topics.topic_id LEFT JOIN( SELECT content, thread_id as id, author_id, created, last_modified, post_id FROM forum_posts ORDER BY last_modified DESC LIMIT 1) AS posts ON posts.id = forum_threads.thread_id LEFT JOIN users ON posts.author_id = users.id ORDER BY forum_threads.thread_id;", (err, rows) => {
        if (err) throw err;
        if (rows.length !== 0) {
            // array for merging the topics
            let data = [];

            for (let i = 0; i < rows.length; i++) {
                let author = rows[i]['nickname'] ? rows[i]['nickname'] : rows[i]['name_first'] ? rows[i]['name_first'] + " " + rows[i]['name_last'] : null;

                let timestamp;
                if (rows[i]['last_modified']) {
                    timestamp = new Date(rows[i]['last_modified']);
                    timestamp = dateformat(timestamp, "ddd, mmm dS, yyyy") + " at " + dateformat(timestamp, "h:MM TT");
                } else {
                    timestamp = "";
                }

                // Test to see if topic is already in the data array
                let test = { bool: false, index: 0, isSub: false, subtopic: 0 };
                for (let r = 0; r < data.length; r++) {
                    if (data[r]['topic'] === rows[i]['topic']) {

                        test = {
                            bool: true,
                            index: r,
                            isSub: false,
                            subtopic: 0
                        };

                        for (let t = 0; t < data[r].subtopics.length; t++) {
                            console.log(rows[i]['subtopic'], data[r]['subtopics'][t].subtopic, rows[i]['subtopic'] === data[r]['subtopics'][t].subtopic);
                            if (rows[i]['subtopic'] === data[r]['subtopics'][t].subtopic) {
                                test = {
                                    bool: true,
                                    index: r,
                                    isSub: true,
                                    subtopic: t
                                };
                            }
                        }
                    }
                }
                
                if (!test.bool) { // if not in the array, add the topic and subtopic
                    data[data.length] = {
                        'topic': rows[i]['topic'],
                        'id': rows[i]['topic_id'],
                        'subtopics': [{
                            'subtopic': rows[i]['subtopic'],
                            'thread': {
                                'title': rows[i]['title'],
                                'id': rows[i]['thread_id'],
                                'created': timestamp,
                                'author': {
                                    'id': rows[i]['author_id'],
                                    'name': author
                                },
                                'privilege': rows[i]['privilege']
                            }
                        }]
                    };
                } else if (test.bool && test.isSub) {
                    data[test.index].subtopics[test.subtopic] = {
                        'subtopic': rows[i]['subtopic'],
                        'id': rows[i]['thread_id'],
                        'thread': {
                            'title': rows[i]['title'],
                            'id': rows[i]['post_id'],
                            'created': timestamp,
                            'author': {
                                'id': rows[i]['author_id'],
                                'name': author
                            },
                            'privilege': rows[i]['privilege']
                        }
                    };
                } else { // else add the subtopic to the already created topic
                    data[test.index].subtopics.push({
                        'subtopic': rows[i]['subtopic'],
                        'id': rows[i]['thread_id'],
                        'thread': {
                            'title': rows[i]['title'],
                            'id': rows[i]['post_id'],
                            'created': timestamp,
                            'author': {
                                'id': rows[i]['author_id'],
                                'name': author
                            },
                            'privilege': rows[i]['privilege']
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