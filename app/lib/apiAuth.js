var jwt = require('jsonwebtoken');
var secrets = require('./secret');
var userModel = require('../models/user');

var exports = {};

exports.authenticate = function (email, password, callback) {
    if(!email || !password) {
        return callback('Authentication failed. Missing fields.');
    }

    userModel.findByEmail(email, function (err, user) {
        if (err) {
            throw err;
        }

        if(!user) {
            return callback('Authentication failed. User not found.');
        }

        if(!userModel.validatePassword(user, password)) {
            return callback('Authentication failed. Wrong password.');
        }

        var token = jwt.sign({id: user.id}, secrets.get('apiSecret'), { expiresIn: '24h' });

        return callback(null, token);
    });
};

exports.validateToken = function (token, callback) {
    if (!token) {
        return callback('No token provided');
    }

    jwt.verify(token, secrets.get('apiSecret'), function (err, data) {
        if (err) {
            return callback('Invalid token provided');
        }
        userModel.findById(data.id, function (err, user) {
            if(err) {
                throw err;
            }
            if(!user) {
                return callback('Invalid token provided. User not found');
            }
            return callback(null, user);
        });
    });
};

module.exports = exports;