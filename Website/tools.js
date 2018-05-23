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
    logoutUser: function logoutUser(req) {
        if (req.user) {
            delete req.user;
        }
        if (req.session.user) {
            delete req.session.user;
        }
    }
};