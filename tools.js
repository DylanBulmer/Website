var privileges = require("./config.json")["privileges"];

module.exports = {
    userTest: function userTest() {
        let req = arguments[0];
        let privilege = null;
        if (arguments.length > 2) privilege = arguments[1];
        let callback = arguments[arguments.length - 1];

        let user = req.user || req.session.user;

        if (privilege) {
            if (user && user.privilege >= Math.pow(2, privilege)) {
                callback(user);
            } else {
                callback(false);
            }
        } else {
            if (user) {
                callback(user);
            } else {
                callback(false);
            }
        }
    },
    getUser: function getUser(req) {
        if (req.user) {
            return req.user;
        } else if (req.session.user) {
            return req.session.user;
        } else return null;
    },
    logoutUser: function logoutUser(req, callback) {
        if (req.user || req.session.user) {
            req.session.destroy(function (err) {
                callback();
            });
        } else {
            callback();
        }
    },
    getPrivileges: function getPrivileges(user) {

        let priv = user.privilege;
        let allowed = [];

        for (i = privileges.length - 1; i >= 0; i--) {
            let num = Math.pow(2, privileges[i].level);
            if (num <= priv) {
                priv = priv - num;
                allowed[allowed.length] = privileges[i];
            }
        }

        return allowed;
    }
};