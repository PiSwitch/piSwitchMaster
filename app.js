var config = require('./config.json');

var path = require('path');
var express = require('express');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var http = require('http');
var socketio = require('socket.io');
var db = require('./app/lib/sqlPool');
var user = require('./app/models/user');
require('./app/config/passport')(passport);

var app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
    secret: 'thisissecret! :o',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});


app.get('/', function(req, res){
    res.render('index')
});

app.get('/login', function(req, res){
    res.render('login', { message: req.flash('loginMessage') })
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/signup', function(req, res) {
    res.render('signup', { message: req.flash('signupMessage') });
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile');
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/test_sql', function(req, res){
    db.query('SELECT * FROM `test` ', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
    });
});



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
}

// 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Server errors
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

var server = http.Server(app);
io = socketio(server);

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

server.listen(config.port, config.hostname, function(){
    var hostname = config.hostname ? config.hostname : '*';
    console.log('listening on ' + hostname + ':' + server.address().port);
});
