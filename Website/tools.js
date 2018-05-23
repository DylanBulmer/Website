module.exports = {
    userTest: function userTest(req, callback) {
        if (req.user || req.session.user) {
            callback(true);
        } else {
            callback(false);
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
    }
};