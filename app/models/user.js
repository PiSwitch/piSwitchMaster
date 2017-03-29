var db = require('../lib/sqlPool');
var bcrypt = require('bcrypt-nodejs');
var isEmail = require('isemail');
var exports = {};
module.exports = exports;

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

exports.validatePassword = function(user, password) {
    if(!user || !password) {
        return false;
    }

    return bcrypt.compareSync(password, user.password);
};

exports.findById = function (id, callback) {
    if(!id) {
        return callback('No id!');
    }

    db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], function (error, results) {
        if(results[0]) {
            return callback(error, results[0]);
        }
        return callback(error, null);
    });
};

exports.findByEmail = function (email, callback) {
    if(!email) {
        return callback('No email!');
    }

    db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], function (error, results) {
        if(results[0]) {
            return callback(error, results[0]);
        }
        return callback(error, null);
    });
};

exports.createNewUser = function (email, password, callback) {
    if(!isEmail.validate(email)) {
        return callback('Invalid email');
    }

    var hashedPassword = generateHash(password);
    db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (error, results) {
        if(error) {
            return callback(error);
        }
        console.log(email);
        console.log(hashedPassword);
        return callback(error, results.insertId);
    });
};
