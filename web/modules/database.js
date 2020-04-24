'use strict';

var mysql = require('mysql');

class Database {

  constructor() {

    let host = process.env.DATABASE_HOST || '127.0.0.1';

    this.data = {
      host,
      database: process.env.MySQL_DATABASE,
      user:     process.env.MySQL_USERNAME,
      password: process.env.MySQL_PASSWORD
    };

    this.limit = 5;
    this.count = 0;

    this.connect();
  }

  // Connect to database
  connect() {
    this.db = mysql.createConnection(this.data);

    let self = this;

    /* Create Error handlers first */

    this.db.on('error', function (err) {
      console.log('MySQL Error: ', err.message);
    });

    this.db.on('end', function (err) {
      console.log('MySQL: Ended with message "'+ err.message + '"');
      console.log('MySQL: Reconnecting...');
      if (self.count < self.limit) {
        self.count++;

        setTimeout(() => {
          self.connect();
        }, 15000);
      } else {
        console.log('MySQL: Reached defined limit of reconnections.')
      }
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

          self.count = 0;
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

        this.data = process.env;
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