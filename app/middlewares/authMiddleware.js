var apiAuth = require('../lib/apiAuth');

exports = {};

//route middleware to make sure a user is logged in
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
};

exports.hasValidToken = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    apiAuth.validateToken(token, function (err, user) {
        if(err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
        }

        req.user = user;
        next();
    });
};


module.exports = exports;