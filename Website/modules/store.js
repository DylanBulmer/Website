const path = require('path');
const fs = require('fs');

class Store {
    constructor(opts) {
        const userDataPath = path.join(__dirname, '../');                                                               // Appdata path
        this.path = path.join(userDataPath, opts ? opts.configName ? opts.configName : 'config.json' : 'config.json');  // Path to JSON file

        let DEFAULTS = {
            "https": false,
            "url": "localhost",
            "host": "0.0.0.0",
            "env": "development",
            "secret": "secert key",
            "cert": { "created": null, "renewBy": null },
            "mysql": {
                "url": "localhost", "database": "",
                "user": "", "password": ""
            },
            "google": { "clientID": "", "clientSecret": "" },
            "facebook": { "clientID": "", "clientSecret": "" },
            "twitter": { "clientID": "", "clientSecret": "" },
            "steam": { "key": "" },
            "discord": { "clientID": "", "clientSecret": "" }
        };
        this.defaults = opts ? opts.defaults ? opts.defaults : DEFAULTS : DEFAULTS;

        this.data = this.parseDataFile(this.path, this.defaults);                                       // Data stored in JSON file
    }

    // Get data
    /**
     * @description Grab any value by its name.
     * @param {String} key The name of the value you want to grab
     * @returns {any} Returns the value requested
     */
    get(key) {
        // reload data before grabbing key...
        // other instances may have saved data that another may not have internally
        // this happens often...
        this.reload();
        // grab key and send it back.
        return this.data[key];
    }

    // Set data
    /**
     * @param {String} key The name to store for the give value.
     * @param {any} val The value to store.
     */
    set(key, val) {
        // reload data before setting key...
        this.reload();
        // Now set the key.
        this.data[key] = val;
        this.saveFile();
    }
    /**
     * @param {String} filePath The path to the file.
     * @param {JSON} defaults Custom set default settings.
     * @returns {JSON} Returns the default settings for the app. 
     */
    parseDataFile(filePath, defaults) {
        try {
            return JSON.parse(fs.readFileSync(filePath).toString());
        } catch (error) {
            fs.writeFileSync(filePath, JSON.stringify(defaults));
            return defaults;
        }
    }
    /**
     * @description Saves new data to file.
     */
    saveFile() {
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    reload() {
        this.data = this.parseDataFile(this.path, this.defaults);
    }
}

module.exports = Store;