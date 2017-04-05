var path = require('path');
var express = require('express');
var passport = require('passport');

module.exports = function () {

    var authRoutes = express.Router();

    authRoutes.get('/login', function(req, res){
        res.render('login', { message: req.flash('loginMessage') })
    });

    authRoutes.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/auth/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    authRoutes.get('/signup', function(req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    });

    authRoutes.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/auth/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    authRoutes.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });


    return authRoutes;
};
