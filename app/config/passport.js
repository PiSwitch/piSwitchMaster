var LocalStrategy = require('passport-local').Strategy;
var isEmail = require('isemail');
var User = require('../models/user');

module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                if(!isEmail.validate(email))
                    return done(null, false, req.flash('signupMessage', 'This email is not valid.'));

                User.findByEmail(email, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        User.createNewUser(email, password, function (err, userId) {
                            if (err)
                                return done(err);

                            User.findById(userId, function(err, user) {
                                return done(null, user);
                            });
                        });
                    }
                });
            });
        })
    );

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, email, password, done) {
            User.findByEmail(email, function (err, user) {
                if(err)
                    return done(err);
                if(!user || !User.validatePassword(user, password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password.'));

                return done(null, user);
            })
        }
    ));
};