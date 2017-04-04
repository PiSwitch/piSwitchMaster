var express = require('express');
var jwt = require('jsonwebtoken');
var secrets = require('../lib/secret');
var userModel = require('../models/user');

module.exports = function (app) {

    var apiRoutes = express.Router();

    apiRoutes.post('/authenticate', function(req, res) {
        if(!req.body.email || !req.body.password) {
            return res.json({ success: false, message: 'Authentication failed. Missing fields.'});
        }

        userModel.findByEmail(req.body.email, function (err, user) {
            if (err) throw err;

            if(!user) {
                return res.json({ success: false, message: 'Authentication failed. User not found.'});
            }

            if(!userModel.validatePassword(user, req.body.password)) {
                return res.json({ success: false, message: 'Authentication failed. Wrong password.'});
            }

            var token = jwt.sign({id: user.id}, secrets.get('apiSecret'), { expiresIn: '24h' });

            res.json({
                success: true,
                message: 'Ok',
                token: token
            });
        });
    });

    // Everything under this middleware requires a token!
    apiRoutes.use(function (req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (!token) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }

        jwt.verify(token, secrets.get('apiSecret'), function (err, data) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            }
            userModel.findById(data.id, function (err, user) {
                if(err) {
                    throw err;
                }
                if(!user) {
                    return res.json({ success: false, message: 'Failed to authenticate token. Invalid user.' });
                }
                req.user = user;
                next();
            });
        });
    });

    apiRoutes.post('/test', function (req, res) {
        res.json(['Hello World!', req.user.email]);
    });

    return apiRoutes;
};
