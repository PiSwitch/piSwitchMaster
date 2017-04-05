exports = {};

//route middleware to make sure a user is logged in
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
};


module.exports = exports;