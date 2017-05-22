var express = require('express');
var apiAuth = require('../lib/apiAuth');
var compatibility = require('../lib/compatibility');
var authMiddleware = require('../middlewares/authMiddleware');

module.exports = function () {

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


    apiRoutes.post('/test_setup', function(req, res) {
        apiAuth.authenticate(req.body.email, req.body.password, function (err, token) {
            res.json({
                portalVersion: compatibility.getPortalVersion(),
                supportedVersions: compatibility.getSupportedVersions(),
                isCompatible: compatibility.isCompatible(req.body.version),
                credentialCorrect: !err && token
            });
        });
    });

    apiRoutes.post('/test', authMiddleware.hasValidToken, function (req, res) {
        res.json(['Hello World!', req.user.email]);
    });

    return apiRoutes;
};
