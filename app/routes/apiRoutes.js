var express = require('express');
var apiAuth = require('../lib/apiAuth');
var authMiddleware = require('../middlewares/authMiddleware');

module.exports = function (app) {

    var apiRoutes = express.Router();

    apiRoutes.post('/authenticate', function(req, res) {
        if(!req.body.email || !req.body.password) {
            return res.json({ success: false, message: 'Authentication failed. Missing fields.'});
        }

        apiAuth.authenticate(req.body.email, req.body.password, function (err, token) {
            if(err) {
                return res.json({ success: false, message: err});
            }

            res.json({
                success: true,
                message: 'ok',
                token: token
            });
        });
    });

    apiRoutes.post('/test', authMiddleware.hasValidToken, function (req, res) {
        res.json(['Hello World!', req.user.email]);
    });

    return apiRoutes;
};
