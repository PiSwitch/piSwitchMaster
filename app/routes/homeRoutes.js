var path = require('path');
var express = require('express');
var authMiddleware = require('../middlewares/authMiddleware');

module.exports = function () {

    var homeRoutes = express.Router();

    homeRoutes.get('/', function(req, res){
        res.render('index')
    });

    homeRoutes.get('/profile', authMiddleware.isLoggedIn, function(req, res) {
        res.render('profile');
    });

    return homeRoutes;
};
