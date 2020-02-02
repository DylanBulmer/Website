'use strict';

var mysql = require('mysql');
var Store = require('./store');
var store = new Store();

class Database {

  constructor() {

    this.data = store.get("mysql");

    this.connect();

    console.log(this.isConnected());
  }

  // Connect to database
  connect() {

    if (typeof this.data === 'undefined')
      this.data = store.get('mysql');

    this.db = mysql.createConnection(this.data);

    let self = this;

    /* Create Error handlers first */

    this.db.on('error', function (err) {
      console.log('MySQL Error: ', err.message);
    });

    this.db.on('end', function (err) {
      console.log('MySQL: Ended with message "'+ err.message + '"');
      console.log('MySQL: Reconnecting...');
      self.connect();
    });

    /* Now connect to database */
    
    this.db.connect(function (err) {
      if (err) {
        console.log('MySQL: Couldn\'t connect to the server');
      } else {
        if (self.data.database === "") {
          console.log("Please enter a database in the config.json file!");
        } else {
          console.log();
          console.log("MySQL Connection Established");
          //self.verifyDataBase();
        }
      }
    });
  }

  isConnected() {
    return (this.db.state === 'disconnected') ? false : true;
  }

  async restart() {
    return new Promise(resolve => {
      this.db.end((err) => {
        if (err) console.error(err.message);

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
    return this.db;
  }

}

module.exports = new Database();