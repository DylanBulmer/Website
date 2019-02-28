'use strict';

var mysql = require('mysql');
var Store = require('./store');
var store = new Store();

class database {

    constructor() {
        this.data = store.get("mysql");
        this.isConnected = false;
        this.db;

        this.connect();
    }

    // Connect to database
    connect() {
        let self = this;
        this.db = mysql.createConnection(this.data);

        this.db.connect(function (err) {
            if (err) {
                self.isConnected = false;
                console.log("MySQL ERROR: " + err.code);
                setTimeout(self.connect, 2000);
            } else {
                if (self.data.database === "") {
                    console.log("Please enter a database in the config.json file!");
                } else {
                    console.log();
                    console.log("MySQL Connection Established");
                    self.isConnected = true;
                    //self.verifyDataBase();
                }
            }

            self.db.on('error', function (err) {
                console.log('MySQL Error: ', err.message);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    self.isConnected = false;
                    self.connect();
                } else {
                    throw err;
                }
            });

            self.db.on('end', function (err) {
                console.log('MySQL Error: ', err.message);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    self.isConnected = false;
                    self.connect();
                } else {
                    throw err;
                }
            });
        });
    }

    async restart() {
        return new Promise(resolve => {
            this.db.end((err) => {
                if (err) console.error(err.message);

                this.isConnected = false;

                console.log("\nRestarting database connection!\n");

                this.data = store.get("mysql");
                this.connect();

                resolve(true);
            });
        });
    }

    verifyDataBase() {
        // POST: Checks to see if everything is set up correctly
        console.log();
        console.log("Checking tables...");
        console.log();

        // send sql file to test database?

    }

    get() {
        if (this.isConnected === false) this.connect();
        return this.db;
    }

}

module.exports = new database();